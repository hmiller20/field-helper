interface Point {
  x: number;
  y: number;
}

export const calculateArea = (points: Point[]): number => {
  if (points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
};

export const calculateDrawingExtents = (shapes: Point[][]): { width: number; height: number; minY: number } => {
  if (shapes.length === 0) return { width: 0, height: 0, minY: 0 };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  shapes.forEach(shape => {
    shape.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });

  return {
    width: maxX - minX,
    height: maxY - minY,
    minY: minY,
  };
}; 