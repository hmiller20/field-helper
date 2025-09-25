// areaPixels = durect pixel count from the raster
// areaShoelace = geometric area from the extracted polygon boundary
// these two should be very close

// lib/silhouette.ts
export type SilhouetteResult = {
  silhouettePNG: Blob;
  areaPixels: number;
  width: number;
  height: number;
  verticality: number;
};

type U8 = Uint8ClampedArray;

// Get RGBA image data from a canvas
export function getImageData(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Convert RGBA to binary mask (0/255). Uses Tailwind bg-sky-100 as background.
export function toBinary(img: ImageData): U8 {
  const { data, width, height } = img;
  const out = new Uint8ClampedArray(width * height);
  
  // Tailwind bg-sky-100 is RGB(224, 242, 254)
  const SKY_100_R = 224;
  const SKY_100_G = 242; 
  const SKY_100_B = 254;
  
  console.log('Using Tailwind bg-sky-100 as background:', [SKY_100_R, SKY_100_G, SKY_100_B]);
  
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    
    // If pixel is transparent, treat as background
    if (a < 128) {
      out[p] = 0; // background
      continue;
    }
    
    // If pixel is very close to bg-sky-100
    const colorDist = Math.abs(r - SKY_100_R) + Math.abs(g - SKY_100_G) + Math.abs(b - SKY_100_B);
    if (colorDist < 20) { // Close to sky-100
      out[p] = 0; // background
      continue;
    }
    
    // Otherwise, it's drawing content
    out[p] = 255; // ink
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

// Morphological dilation with configurable radius
export function dilate(mask: U8, width: number, height: number, radius: number): U8 {
  const out = new Uint8ClampedArray(mask.length);
  const idx = (x: number, y: number) => y * width + x;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let on = 0;
      for (let dy = -radius; dy <= radius && !on; dy++) {
        for (let dx = -radius; dx <= radius && !on; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            // Use circular structuring element
            if (dx * dx + dy * dy <= radius * radius && mask[idx(nx, ny)]) {
              on = 1;
            }
          }
        }
      }
      out[idx(x, y)] = on ? 255 : 0;
    }
  }
  return out;
}

// Morphological erosion with configurable radius
export function erode(mask: U8, width: number, height: number, radius: number): U8 {
  const out = new Uint8ClampedArray(mask.length);
  const idx = (x: number, y: number) => y * width + x;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let allOn = 1;
      for (let dy = -radius; dy <= radius && allOn; dy++) {
        for (let dx = -radius; dx <= radius && allOn; dx++) {
          const nx = x + dx, ny = y + dy;
          // Use circular structuring element
          if (dx * dx + dy * dy <= radius * radius) {
            if (nx < 0 || nx >= width || ny < 0 || ny >= height || !mask[idx(nx, ny)]) {
              allOn = 0;
            }
          }
        }
      }
      out[idx(x, y)] = allOn ? 255 : 0;
    }
  }
  return out;
}

// Morphological closing (dilation followed by erosion)
export function morphologicalClose(mask: U8, width: number, height: number, radius: number): U8 {
  console.log(`Applying morphological closing with radius ${radius}`);
  const dilated = dilate(mask, width, height, radius);
  const closed = erode(dilated, width, height, radius);
  return closed;
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

// External contour tracing via border-following (Moore-Neighbor)
export function traceExternalContour(mask: U8, width: number, height: number): Array<[number, number]> {
  const idx = (x: number, y: number) => y * width + x;

  // Find a starting boundary pixel
  let sx = -1, sy = -1;
  outer: for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[idx(x, y)]) {
        // Check if it has a background neighbor => boundary
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || nx >= width || ny < 0 || ny >= height || !mask[idx(nx, ny)]) {
              sx = x; sy = y; break outer;
            }
          }
        }
      }
    }
  }
  if (sx < 0) return [];

  const contour: Array<[number, number]> = [];
  let cx = sx, cy = sy;
  // Prev direction; start looking from the pixel to the "west" (dx=-1,dy=0)
  let pdx = -1, pdy = 0;

  const neighbors = [
    [ 0, -1], [ 1, -1], [ 1,  0], [ 1,  1],
    [ 0,  1], [-1,  1], [-1, 0], [-1, -1]
  ];

  do {
    contour.push([cx, cy]);
    // Rotate search so we start from the neighbor just clockwise from where we came
    let start = neighbors.findIndex(([dx, dy]) => dx === pdx && dy === pdy);
    if (start < 0) start = 0;
    let found = false, ndx = 0, ndy = 0, nx = cx, ny = cy;
    for (let k = 0; k < 8; k++) {
      const [dx, dy] = neighbors[(start + 1 + k) % 8]; // Turn right and scan
      const tx = cx + dx, ty = cy + dy;
      if (tx >= 0 && tx < width && ty >= 0 && ty < height && mask[idx(tx, ty)]) {
        // Step to the *next* boundary pixel in that direction
        found = true; ndx = dx; ndy = dy; nx = tx; ny = ty; break;
      }
    }
    if (!found) break; // Degenerate
    // Next prev-direction is opposite of the step (so we search around the new edge correctly)
    pdx = -ndx; pdy = -ndy;
    cx = nx; cy = ny;
  } while (!(cx === sx && cy === sy) || contour.length === 1);

  return contour;
}

// Polygon area using shoelace formula
export function polygonArea(points: Array<[number, number]>): number {
  if (points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

// Extract all pixel coordinates from a binary mask
export function getPixelCoords(mask: U8, width: number, height: number): Array<[number, number]> {
  const coords: Array<[number, number]> = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (mask[y * width + x]) {
        coords.push([x, y]);
      }
    }
  }
  return coords;
}

// Compute convex hull using Graham scan algorithm
export function convexHull(points: Array<[number, number]>): Array<[number, number]> {
  if (points.length < 3) return points.slice();

  // Find the bottom-most point (or left-most in case of tie)
  let bottom = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i][1] < points[bottom][1] ||
        (points[i][1] === points[bottom][1] && points[i][0] < points[bottom][0])) {
      bottom = i;
    }
  }

  // Swap bottom point to first position
  [points[0], points[bottom]] = [points[bottom], points[0]];
  const pivot = points[0];

  // Sort points by polar angle with respect to pivot
  const sortedPoints = points.slice(1).sort((a, b) => {
    const angleA = Math.atan2(a[1] - pivot[1], a[0] - pivot[0]);
    const angleB = Math.atan2(b[1] - pivot[1], b[0] - pivot[0]);
    if (angleA !== angleB) return angleA - angleB;

    // If angles are equal, sort by distance
    const distA = (a[0] - pivot[0]) ** 2 + (a[1] - pivot[1]) ** 2;
    const distB = (b[0] - pivot[0]) ** 2 + (b[1] - pivot[1]) ** 2;
    return distA - distB;
  });

  // Graham scan
  const hull = [pivot];

  for (const point of sortedPoints) {
    // Remove points that make a clockwise turn
    while (hull.length >= 2) {
      const [x1, y1] = hull[hull.length - 2];
      const [x2, y2] = hull[hull.length - 1];
      const [x3, y3] = point;

      // Cross product to determine turn direction
      const cross = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
      if (cross <= 0) {
        hull.pop();
      } else {
        break;
      }
    }
    hull.push(point);
  }

  return hull;
}

// Fill convex hull polygon into a binary mask
export function fillConvexHull(hull: Array<[number, number]>, width: number, height: number): U8 {
  const mask = new Uint8ClampedArray(width * height);

  if (hull.length < 3) return mask;

  // For each row, find intersections with polygon edges
  for (let y = 0; y < height; y++) {
    const intersections: number[] = [];

    // Check each edge of the hull
    for (let i = 0; i < hull.length; i++) {
      const [x1, y1] = hull[i];
      const [x2, y2] = hull[(i + 1) % hull.length];

      // Skip horizontal edges
      if (y1 === y2) continue;

      // Check if scanline intersects this edge
      if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) {
        // Calculate intersection x-coordinate
        const x = x1 + (x2 - x1) * (y - y1) / (y2 - y1);
        intersections.push(x);
      }
    }

    // Sort intersections and fill between pairs
    intersections.sort((a, b) => a - b);
    for (let i = 0; i < intersections.length; i += 2) {
      if (i + 1 < intersections.length) {
        const startX = Math.max(0, Math.ceil(intersections[i]));
        const endX = Math.min(width - 1, Math.floor(intersections[i + 1]));
        for (let x = startX; x <= endX; x++) {
          mask[y * width + x] = 255;
        }
      }
    }
  }

  return mask;
}

// Convert binary mask → PNG blob
export async function maskToPNG(mask: U8, width: number, height: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(width, height);
  for (let i = 0, p = 0; p < mask.length; p++, i += 4) {
    const v = mask[p]; // 0 or 255
    // Invert colors: white background (255), black drawing (0)
    const invertedV = 255 - v;
    img.data[i] = img.data[i+1] = img.data[i+2] = invertedV;
    img.data[i+3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
}

// Full pipeline
export async function silhouetteFromCanvas(canvas: HTMLCanvasElement): Promise<SilhouetteResult> {
  const { width, height } = canvas;
  const processingId = Math.random().toString(36).substr(2, 9);
  console.log(`Silhouette processing [${processingId}]: Canvas dimensions ${width}x${height}`);
  
  // Debug: Check if canvas has any content and get a sample hash
  const ctx = canvas.getContext('2d');
  let canvasHash = 0;
  if (ctx) {
    const testData = ctx.getImageData(0, 0, Math.min(100, width), Math.min(100, height));
    let hasContent = false;
    // Create a simple hash of the canvas content for debugging duplicates
    for (let i = 0; i < testData.data.length; i += 4) {
      canvasHash = ((canvasHash << 5) - canvasHash + testData.data[i] + testData.data[i+1] + testData.data[i+2]) & 0xffffffff;
      if (testData.data[i] !== 255 || testData.data[i+1] !== 255 || testData.data[i+2] !== 255) {
        hasContent = true;
      }
    }
    console.log(`Canvas [${processingId}] has drawing content:`, hasContent, 'hash:', canvasHash);
  }
  
  const rgba = getImageData(canvas);
  console.log(`Got image data: ${rgba.data.length} bytes`);
  
  const bin = toBinary(rgba); // Higher threshold - only very dark pixels are ink
  const totalPixels = bin.length;
  const inkPixels = bin.reduce((count, pixel) => count + (pixel ? 1 : 0), 0);
  console.log(`Binary conversion: ${inkPixels}/${totalPixels} pixels have ink`);
  
  // Debug: check some sample pixel values
  const centerIdx = Math.floor(rgba.data.length/2);
  console.log('Sample pixel values:', {
    topLeft: [rgba.data[0], rgba.data[1], rgba.data[2], rgba.data[3]],
    center: [rgba.data[centerIdx], rgba.data[centerIdx+1], rgba.data[centerIdx+2], rgba.data[centerIdx+3]]
  });
  
  // Check what the background color actually is
  let whitePixels = 0, blackPixels = 0, otherPixels = 0;
  for (let i = 0; i < rgba.data.length; i += 4) {
    const r = rgba.data[i], g = rgba.data[i+1], b = rgba.data[i+2];
    if (r === 255 && g === 255 && b === 255) whitePixels++;
    else if (r === 0 && g === 0 && b === 0) blackPixels++;
    else otherPixels++;
  }
  console.log('Pixel color distribution:', { whitePixels, blackPixels, otherPixels });
  
  const bridged = dilate1px(bin, width, height);
  const bridgedInkPixels = bridged.reduce((count, pixel) => count + (pixel ? 1 : 0), 0);
  console.log(`After dilation: ${bridgedInkPixels} ink pixels`);

  const largest = keepLargest(bridged, width, height);
  const largestPixels = largest.reduce((count, pixel) => count + (pixel ? 1 : 0), 0);
  console.log(`After keep largest: ${largestPixels} pixels (outline only)`);

  // Extract external contour of the largest component
  const externalContour = traceExternalContour(largest, width, height);
  console.log(`External contour has ${externalContour.length} points`);

  // Calculate area using shoelace formula on the external contour
  const areaPixels = polygonArea(externalContour);
  console.log(`Polygon area from external contour: ${areaPixels} pixels`);

  // For visualization, we'll still create a filled mask (but area calculation uses contour)
  const final = largest; // Just use the outline for the PNG

  // Calculate bounding box of the filled silhouette in pixels
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (final[y * width + x]) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // If no pixels found, use 0 dimensions
  const silhouetteWidth = areaPixels > 0 ? maxX - minX + 1 : 0;
  const silhouetteHeight = areaPixels > 0 ? maxY - minY + 1 : 0;
  
  // Calculate verticality (distance from bottom of canvas to nearest boundary of drawing)
  // Higher values = greater distance from bottom of canvas
  // Use maxY (bottom edge of drawing) instead of minY (top edge)
  const verticality = areaPixels > 0 ? height - maxY : 0;
  console.log(`DEBUG: Verticality calculation - height: ${height}, maxY: ${maxY}, verticality: ${verticality}`);

  const silhouettePNG = await maskToPNG(final, width, height);
  return { silhouettePNG, areaPixels, width: silhouetteWidth, height: silhouetteHeight, verticality };
}
