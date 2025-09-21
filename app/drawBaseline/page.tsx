"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation"
import {
  Dialog,
  DrawDialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCurrentSession, saveBaselineDrawing, generateSessionOrder, setSessionOrder, incrementSmallViolation, incrementLargeViolation } from "@/utils/sessionData";
import html2canvas from "html2canvas";
import { silhouetteFromCanvas } from "@/lib/silhouette";

// Drawing area validation constants
const MIN_AREA = 4600; // 4602 was the 5th percentile area in the last study (n=215)
const MAX_AREA = 59670; // 59668 was the 95th percentile area in the last study (n=215)

const DrawBaselinePage: React.FC = () => {
  // New ref that stores completed shapes (each as an array of points)
  const shapesRef = useRef<{ x: number; y: number }[][]>([]);
  const [showModal, setShowModal] = useState(true);

  const [canContinue, setCanContinue] = useState(false);
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const shapePointsRef = useRef<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Timer effect - 10 seconds like prep pages
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, []);

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

    // Append current point to our shape points tracker and draw the line
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

  const doneDrawing = async () => {
    /* ------- 1. normal finish-up stuff ---------- */
    if (isDrawingRef.current) stopDrawing();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.beginPath();

    if (shapesRef.current.length === 0) {
      console.log("No completed shapes have been drawn.");
      return;
    }

    // ▸ A. Silhouette processing
    const timestamp = Date.now();
    console.log(`Starting silhouette processing in drawBaseline at ${timestamp}...`);
    const silhouetteResult = await silhouetteFromCanvas(canvas);
    console.log('Baseline silhouette result:', {
      areaPixels: silhouetteResult.areaPixels,
      width: silhouetteResult.width,
      height: silhouetteResult.height,
      pngSize: silhouetteResult.silhouettePNG.size
    });

    const totalArea = silhouetteResult.areaPixels;

    // ▸ Area validation - track violations but don't block submission
    if (totalArea < MIN_AREA) {
      incrementSmallViolation(); // Track small drawing violation
    }
    
    if (totalArea > MAX_AREA) {
      incrementLargeViolation(); // Track large drawing violation
    }

    // ▸ B. image capture
    let imageData = "";
    if (containerRef.current) {
      const html2canvasResult = await html2canvas(containerRef.current, {
        backgroundColor: null,
      });
      imageData = html2canvasResult.toDataURL("image/png");
    } else {
      imageData = canvas.toDataURL("image/png");
    }

    // ▸ C. Convert silhouette PNG blob to data URL
    const silhouetteDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(silhouetteResult.silhouettePNG);
    });

    /* ------- 2. Save baseline drawing to session ---------- */
    const session = getCurrentSession();
    if (!session) {
      router.push('/consent');
      return;
    }

    // Save baseline drawing data
    const baselineDrawing = {
      area: totalArea,
      maxWidth: silhouetteResult.width,
      maxHeight: silhouetteResult.height,
      verticality: silhouetteResult.verticality,
      pngUrl: imageData,
      silhouettePngUrl: silhouetteDataUrl,
    };

    saveBaselineDrawing(baselineDrawing);

    /* ------- 3. Generate session order for experimental conditions ---------- */
    const sessionOrder = generateSessionOrder();
    setSessionOrder(sessionOrder);

    /* ------- 4. Navigate to information page ---------- */
    router.push('/information');
  };

  return (
    <>
      {/* Shadcn modal that appears over the drawing area */}
      <Dialog open={showModal}>
        <DrawDialogContent className="sm:max-w-[725px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Directions</DialogTitle>
            <DialogDescription 
              className="text-lg text-black"
              dangerouslySetInnerHTML={{
                __html: `Please draw the outline of a man. It should be a simple outline—kind of like a gingerbread man. <b>Do NOT draw a stick figure.</b> Please ask the experimenter if you have any questions. When you are finished with your drawing, press Done.`
              }}
            />
          </DialogHeader>
          <DialogFooter>
            <Button 
              className={`${
                canContinue 
                  ? "bg-[#c1e6c1] hover:bg-[#a8dba8] text-black" 
                  : "bg-gray-400 cursor-not-allowed text-white"
              }`}
              style={{ opacity: canContinue ? 1 : 0.5 }}
              onClick={canContinue ? () => setShowModal(false) : undefined}
              disabled={!canContinue}
            >
              Got it
            </Button>
            {!canContinue && (
              <p className="text-sm text-gray-500 mt-2">
                Please read the instructions carefully. The button will become available soon.
              </p>
            )}
          </DialogFooter>
        </DrawDialogContent>
      </Dialog>

      <div className="h-screen flex flex-col bg-gray-200 overflow-hidden">
        {/* Container for html2canvas screenshot - takes remaining space after buttons */}
        <div className="flex-1 flex flex-col p-2 min-h-0" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <div ref={containerRef} className="flex-1 relative border border-gray-300 overflow-hidden min-h-0">
            <canvas
              ref={canvasRef}
              className="w-full h-full bg-white"
              style={{ 
                touchAction: "none",
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTouchCallout: "none"
              }}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
            />
          </div>
        </div>
        
        {/* Buttons fixed at bottom */}
        <div className="flex-shrink-0 p-2 flex justify-center space-x-3">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded font-medium text-base"
            onClick={clearCanvas}
          >
            Clear Canvas
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded font-medium text-base"
            onClick={doneDrawing}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

export default DrawBaselinePage;