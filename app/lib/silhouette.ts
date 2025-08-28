// areaPixels = durect pixel count from the raster
// areaShoelace = geometric area from the extracted polygon boundary
// these two should be very close

// lib/silhouette.ts
export type SilhouetteResult = {
  silhouettePNG: Blob;
  areaPixels: number;
  polygon: Array<[number, number]>; // [x,y] contour in image coords
  areaShoelace: number;
  width: number;
  height: number;
};

type U8 = Uint8ClampedArray;

// Get RGBA image data from a canvas
export function getImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Convert RGBA to binary mask (0/255). Adjust threshold as needed.
export function toBinary(img: ImageData, threshold = 200): U8 {
  const { data, width, height } = img;
  const out = new Uint8ClampedArray(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    // luminance; your "ink" should be darker than background
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    out[p] = lum < threshold ? 255 : 0; // 255 = ink, 0 = bg
  }
  return out;
}

// 3x3 dilation to bridge small gaps
export function dilate1px(mask: U8, width: number, height: number): U8 {
  const out = new Uint8ClampedArray(mask.length);
  const idx = (x: number, y: number) => y * width + x;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let on = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (mask[idx(nx, ny)]) { on = 1; break; }
          }
        }
        if (on) break;
      }
      out[idx(x, y)] = on ? 255 : 0;
    }
  }
  return out;
}

// Flood-fill from borders to mark exterior; then invert => filled regions
export function fillInterior(mask: U8, width: number, height: number): U8 {
  const N = width * height;
  const visited = new Uint8ClampedArray(N);
  const out = mask.slice(); // 255=ink/solid, 0=bg
  const q: number[] = [];

  const pushIf = (x: number, y: number) => {
    const i = y * width + x;
    if (!visited[i] && out[i] === 0) { visited[i] = 1; q.push(i); }
  };

  // seed queue with background border pixels
  for (let x = 0; x < width; x++) { pushIf(x, 0); pushIf(x, height - 1); }
  for (let y = 0; y < height; y++) { pushIf(0, y); pushIf(width - 1, y); }

  // BFS on background
  while (q.length) {
    const i = q.pop()!;
    out[i] = 0; // exterior stays 0
    const x = i % width, y = (i / width) | 0;
    if (x > 0) {
      const j = i - 1; if (!visited[j] && out[j] === 0) { visited[j] = 1; q.push(j); }
    }
    if (x + 1 < width) {
      const j = i + 1; if (!visited[j] && out[j] === 0) { visited[j] = 1; q.push(j); }
    }
    if (y > 0) {
      const j = i - width; if (!visited[j] && out[j] === 0) { visited[j] = 1; q.push(j); }
    }
    if (y + 1 < height) {
      const j = i + width; if (!visited[j] && out[j] === 0) { visited[j] = 1; q.push(j); }
    }
  }

  // Any background we didn't reach is interior → set to 255 (filled)
  for (let i = 0; i < N; i++) if (out[i] !== 0) out[i] = 255;
  return out;
}

// Keep largest connected component
export function keepLargest(mask: U8, width: number, height: number): U8 {
  const N = width * height;
  const labels = new Int32Array(N).fill(-1);
  let label = 0, bestLabel = -1, bestSize = 0;
  const idxNbr = (i: number, dx: number, dy: number) => {
    const x = i % width, y = (i / width) | 0;
    const nx = x + dx, ny = y + dy;
    return (nx >= 0 && nx < width && ny >= 0 && ny < height) ? ny * width + nx : -1;
  };

  for (let i = 0; i < N; i++) {
    if (mask[i] === 255 && labels[i] === -1) {
      const stack = [i]; labels[i] = label; let size = 0;
      while (stack.length) {
        const s = stack.pop()!; size++;
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
          const j = idxNbr(s, dx, dy);
          if (j >= 0 && mask[j] === 255 && labels[j] === -1) { labels[j] = label; stack.push(j); }
        }
      }
      if (size > bestSize) { bestSize = size; bestLabel = label; }
      label++;
    }
  }

  const out = new Uint8ClampedArray(N);
  if (bestLabel === -1) return out; // all zeros
  for (let i = 0; i < N; i++) out[i] = labels[i] === bestLabel ? 255 : 0;
  return out;
}

// Marching Squares to extract outer contour; returns [x,y] list
export function marchingSquares(mask: U8, width: number, height: number): Array<[number, number]> {
  // Simple border-following: find first foreground pixel
  const idx = (x: number, y: number) => y * width + x;
  let sx = -1, sy = -1;
  outer: for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (mask[idx(x, y)]) { sx = x; sy = y; break outer; }
  }
  if (sx < 0) return [];

  // Moore-Neighbor tracing
  const contour: Array<[number, number]> = [];
  let x = sx, y = sy, px = sx, py = sy - 1; // previous background neighbor
  const dirs = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];

  do {
    contour.push([x, y]);
    // search start direction (from prev to current)
    let startDir = 0;
    for (let d = 0; d < 8; d++) {
      if (x + dirs[d][0] === px && y + dirs[d][1] === py) { startDir = (d + 1) % 8; break; }
    }
    let found = false, nx = x, ny = y, nbx = x, nby = y;
    for (let k = 0; k < 8; k++) {
      const d = (startDir + k) % 8;
      const vx = x + dirs[d][0], vy = y + dirs[d][1];
      const bx = x + dirs[(d + 7) % 8][0], by = y + dirs[(d + 7) % 8][1];
      if (vx >= 0 && vx < width && vy >= 0 && vy < height && mask[idx(vx, vy)]) {
        nx = vx; ny = vy; nbx = bx; nby = by; found = true; break;
      }
    }
    if (!found) break;
    px = nbx; py = nby; x = nx; y = ny;
  } while (!(x === sx && y === sy));

  return contour;
}

// Ramer–Douglas–Peucker (optional) to simplify contour
export function simplifyRDP(points: Array<[number, number]>, epsilon = 1.0): Array<[number, number]> {
  if (points.length < 3) return points.slice();
  const sq = (x: number) => x * x;
  const distSq = (p: [number,number], a: [number,number], b: [number,number]) => {
    const [x, y] = p, [x1, y1] = a, [x2, y2] = b;
    const A = x - x1, B = y - y1, C = x2 - x1, D = y2 - y1;
    const dot = A*C + B*D, len = C*C + D*D;
    const t = len ? Math.max(0, Math.min(1, dot/len)) : 0;
    const dx = x1 + t*C - x, dy = y1 + t*D - y;
    return dx*dx + dy*dy;
  };
  let dmax = 0, idx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = distSq(points[i], points[0], points[points.length - 1]);
    if (d > dmax) { idx = i; dmax = d; }
  }
  if (Math.sqrt(dmax) > epsilon) {
    const r1 = simplifyRDP(points.slice(0, idx + 1), epsilon);
    const r2 = simplifyRDP(points.slice(idx), epsilon);
    return r1.slice(0, -1).concat(r2);
  } else {
    return [points[0], points[points.length - 1]];
  }
}

// Shoelace area from contour
export function shoelaceArea(poly: Array<[number, number]>): number {
  const n = poly.length;
  if (n < 3) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % n];
    sum += x1 * y2 - y1 * x2;
  }
  return Math.abs(sum) / 2;
}

// Convert binary mask → PNG blob
export async function maskToPNG(mask: U8, width: number, height: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(width, height);
  for (let i = 0, p = 0; p < mask.length; p++, i += 4) {
    const v = mask[p]; // 0 or 255
    img.data[i] = img.data[i+1] = img.data[i+2] = v;
    img.data[i+3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
}

// Full pipeline
export async function silhouetteFromCanvas(canvas: HTMLCanvasElement): Promise<SilhouetteResult> {
  const { width, height } = canvas;
  const rgba = getImageData(canvas);
  const bin = toBinary(rgba, 200);
  const bridged = dilate1px(bin, width, height);
  const filled = fillInterior(bridged, width, height);
  const largest = keepLargest(filled, width, height);

  // area by pixels
  const areaPixels = largest.reduce((a, v) => a + (v ? 1 : 0), 0);

  // outer contour → simplified polygon → shoelace
  const contour = marchingSquares(largest, width, height);
  const polygon = simplifyRDP(contour, 1.5);
  const areaShoelace = shoelaceArea(polygon);

  const silhouettePNG = await maskToPNG(largest, width, height);
  return { silhouettePNG, areaPixels, polygon, areaShoelace, width, height };
}
