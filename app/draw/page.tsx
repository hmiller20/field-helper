"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation"
// Import shadcn modal components and button component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateSessionData } from "@/utils/sessionData";

const DrawingPage: React.FC = () => {
  // New ref that stores completed shapes (each as an array of points)
  const shapesRef = useRef<{ x: number; y: number }[][]>([]);
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const shapePointsRef = useRef<{ x: number; y: number }[]>([]);

  // Adjust the canvas dimensions on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx?.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    if (showModal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    isDrawingRef.current = true;
    // Initialize shape points array
    shapePointsRef.current = [];
    shapePointsRef.current.push({ x, y });
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawingRef.current) return;
    if (showModal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Append current point to our shape points tracker
    shapePointsRef.current.push({ x, y });
    // Continue drawing the line to the current cursor
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    // Only save the shape if drawing was in progress
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      // Save current shape if it has at least 3 points
      if (shapePointsRef.current.length >= 3) {
        shapesRef.current.push([...shapePointsRef.current]);
      }
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.beginPath();
  };

  // Clear canvas function
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Also clear stored shapes and the temporary shape points
    shapesRef.current = [];
    shapePointsRef.current = [];
  };

  // Helper: calculate polygon area using the shoelace formula
  const calculateArea = (points: { x: number; y: number }[]): number => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const nextIndex = (i + 1) % points.length;
      area += points[i].x * points[nextIndex].y - points[nextIndex].x * points[i].y;
    }
    return Math.abs(area) / 2;
  };

  // Helper: calculate bounding box for all drawn shapes
  const calculateDrawingExtents = (
    shapes: { x: number; y: number }[][]
  ) => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    shapes.forEach((shape) => {
      shape.forEach(({ x, y }) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      });
    });
    return {
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  const doneDrawing = () => {
    // If drawing is in progress, finish it and save the shape
    if (isDrawingRef.current) {
      stopDrawing();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.beginPath();

    if (shapesRef.current.length === 0) {
      console.log("No completed shapes have been drawn.");
      return;
    }

    let totalArea = 0;
    shapesRef.current.forEach((shape) => {
      if (shape.length >= 3) {
        totalArea += calculateArea(shape);
      }
    });
    
    // Calculate drawing extents (bounding box)
    const extents = calculateDrawingExtents(shapesRef.current);
    console.log("Calculated total area:", totalArea);
    console.log("Drawing extents:", extents);
    // extents.height = distance between the highest and lowest pixel
    // extents.width = horizontal length of your drawing

    // Update the session data with drawing information:
    updateSessionData({
      drawingData: {
        totalArea,
        maxWidth: extents.width,
        maxHeight: extents.height,
        // Optionally, add more drawing details here
      }
    });

    // Navigate to the debriefing page after finishing drawing.
    router.push('/debriefing');
  };

  return (
    <>
      {/* Shadcn modal that appears over the drawing area */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Directions</DialogTitle>
            <DialogDescription className="text-lg text-black">
              Now, in between the house and the tree, please draw the outline of John, the person you just read about.
              It should be a simple outline—kind of like a gingerbread man.
              Please ask the experimenter if you have any questions.
              When you are finished with your drawing, press Done.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowModal(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="relative w-full h-[80vh] border border-gray-300 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full bg-sky-100"
            style={{ touchAction: "none" }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
          />
          {/* Scale object: simple tree */}
          <div className="absolute bottom-0 right-4" style={{ pointerEvents: "none" }}>
            <svg width="500" height="480" viewBox="0 0 40 120">
              {/* Tree trunk */}
              <rect x="35" y="70" width="10" height="60" fill="saddlebrown" />
              {/* Tree branch rotated 180 degrees */}
              <rect x="55" y="100" width="12" height="2" fill="saddlebrown" transform="rotate(225 45 100)" />
              {/* Tree branch rotated 180 degrees */}
              <rect x="35" y="105" width="12" height="2" fill="saddlebrown" transform="rotate(155 45 100)" />
              {/* Tree canopy */}
              <circle cx="40" cy="50" r="30" fill="green" stroke="green" strokeWidth="5" />
            </svg>
          </div>
          {/* Simple house for scale */}
          <div className="absolute bottom-0 left-30" style={{ pointerEvents: "none" }}>
            <svg width="900" height="1100" viewBox="20 0 100 100">
              {/* House body: tan square */}
              <rect x="20" y="70" width="60" height="40" fill="#D2B48C" />
              {/* Chimney: basic rectangular chimney behind the red roof */}
              <rect x="65" y="45" width="8" height="25" fill="#8B4513" />
              {/* Roof: red triangle */}
              <polygon points="20,70 50,40 80,70" fill="red" />
              {/* Garage door: basic gray garage door in front of the house body */}
              <rect x="30" y="85" width="40" height="40" fill="gray" />
            </svg>
          </div>
          {/* Ground line: green horizontal line */}
          <div className="absolute bottom-0 left-0 w-full h-3 bg-green-500 pointer-events-none" />
        </div>
        
        <div className="mt-4 flex space-x-4">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={clearCanvas}
          >
            Clear Canvas
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={doneDrawing}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

export default DrawingPage;
