"use client"

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCurrentSession, updateSession, getNextBlockType, isSessionComplete, debugSessionState } from "@/utils/sessionData";
import html2canvas from "html2canvas";
import { capitalize } from "@/utils/capitalize";

const DrawDominancePage: React.FC = () => {
  const shapesRef = useRef<{ x: number; y: number }[][]>([]);
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const shapePointsRef = useRef<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const session = getCurrentSession();

  console.log("=== DOMINANCE PAGE LOADED ===");

  useEffect(() => {
    if (!session) {
      router.push('/consent');
      return;
    }
  }, [session, router]);

  // Canvas setup
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

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (showModal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    isDrawingRef.current = true;
    shapePointsRef.current = [{ x, y }];
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    if (showModal) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    shapePointsRef.current.push({ x, y });
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      if (shapePointsRef.current.length >= 3) {
        shapesRef.current.push([...shapePointsRef.current]);
      }
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapesRef.current = [];
    shapePointsRef.current = [];
  };

  const calculateArea = (points: { x: number; y: number }[]): number => {
    if (points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const nextIndex = (i + 1) % points.length;
      area += points[i].x * points[nextIndex].y - points[nextIndex].x * points[i].y;
    }
    return Math.abs(area) / 2;
  };

  const calculateDrawingExtents = (shapes: { x: number; y: number }[][]) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    shapes.forEach((shape) => {
      shape.forEach(({ x, y }) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      });
    });
    return { width: maxX - minX, height: maxY - minY };
  };

  const doneDrawing = async () => {
    console.log("=== DOMINANCE DONE DRAWING CALLED ===");
    
    if (isDrawingRef.current) stopDrawing();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.beginPath();

    // Calculate metrics
    let totalArea = 0;
    shapesRef.current.forEach((shape) => {
      if (shape.length >= 3) totalArea += calculateArea(shape);
    });
    const extents = calculateDrawingExtents(shapesRef.current);

    // Capture image
    let imageData = "";
    if (containerRef.current) {
      const html2canvasResult = await html2canvas(containerRef.current, {
        backgroundColor: null,
      });
      imageData = html2canvasResult.toDataURL("image/png");
    } else {
      imageData = canvas.toDataURL("image/png");
    }

    // Update session
    console.log("=== GETTING SESSION FROM LOCALSTORAGE ===");
    const session = getCurrentSession();
    if (!session) {
      router.push('/consent');
      return;
    }
    
    console.log("Current session:", session);
    
    const blocks = [...(session.blocks || [])];
    console.log("Current blocks before adding:", blocks);
    
    blocks.push({
      blockType: "dominance",
      vignetteStartedAt: session.tempVignetteStart || Date.now(),
      survey: session.tempSurvey || {},
      drawing: {
        area: totalArea,
        maxWidth: extents.width,
        maxHeight: extents.height,
        pngUrl: imageData,
      },
    });

    // Update session with the new block
    updateSession({ blocks });
    
    console.log("=== UPDATED SESSION ===");
    console.log("DOMINANCE COMPLETE");
    
    // Debug session state
    debugSessionState();

    // Determine next step using helper function
    const nextBlockType = getNextBlockType();
    if (nextBlockType) {
      router.push(`/prep${capitalize(nextBlockType)}`);
    } else {
      // All blocks completed, go to demographics
      router.push('/demographics');
    }
  };

  if (!session) return null;

  return (
    <>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[725px]">
          <DialogHeader>
            <DialogTitle>Directions</DialogTitle>
            <DialogDescription className="text-lg text-black">
              Now, in between the house and the tree, please draw the outline of John, the person you just read about.
              It should be a simple outline—kind of like a gingerbread man.
              <b> Do NOT draw a stick figure. </b>
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
        <div ref={containerRef} className="relative w-full h-[80vh] border border-gray-300 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full bg-sky-100"
            style={{ touchAction: "none" }}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
          />
          {/* Tree */}
          <div className="absolute bottom-0 right-[0vw]" style={{ pointerEvents: "none", width: "20vw", height: "100%" }}>
            <svg className="w-full h-full" viewBox="-200 -100 500 500" preserveAspectRatio="xMidYMid meet">
              <rect x="35" y="340" width="65" height="470" fill="saddlebrown" />
              <rect x="240" y="-30" width="100" height="15" fill="saddlebrown" transform="rotate(225 260 270)" />
              <rect x="460" y="115" width="100" height="15" fill="saddlebrown" transform="rotate(155 260 270)" />
              <circle cx="68" cy="195" r="200" fill="green" stroke="green" strokeWidth="2" />
            </svg>
          </div>
          {/* House */}
          <div className="absolute bottom-0 left-0" style={{ pointerEvents: "none", width: "40vw", height: "100%" }}>
            <svg className="w-full h-full" viewBox="-200 -100 500 500" preserveAspectRatio="xMinYMid meet">
              <rect x="-200" y="100" width="470" height="375" fill="#D2B48C" />
              <rect x="165" y="-30" width="50" height="100" fill="#8B4513" />
              <polygon points="-200,100 35,-100, 270,100" fill="red" />
              <rect x="-115" y="230" width="300" height="865" fill="gray" />
            </svg>
          </div>
          {/* Ground */}
          <div className="absolute bottom-0 left-0 w-full h-3 bg-green-500 pointer-events-none" />
        </div>
        
        <div className="mt-4 flex space-x-4">
          <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={clearCanvas}>
            Clear Canvas
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={doneDrawing}>
            Done
          </button>
        </div>
      </div>
    </>
  );
};

export default DrawDominancePage;