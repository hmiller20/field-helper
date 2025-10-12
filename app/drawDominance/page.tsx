"use client"

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
import { getCurrentSession, updateSession, debugSessionState, safeColorNamesInText, getCharacterForCondition, incrementSmallViolation, incrementLargeViolation } from "@/utils/sessionData";
import html2canvas from "html2canvas";
import { capitalize } from "@/utils/capitalize";
import { silhouetteFromCanvas } from "@/lib/silhouette";

// Drawing area validation constants
const MIN_AREA = 4600; // 4602 was the 5th percentile area in the last study (n=215)
const MAX_AREA = 59670; // 59668 was the 95th percentile area in the last study (n=215)

// Remove the local colorNamesInText function and use the imported one
// helper function to color names in text
// function colorNamesInText(text: string) {
//   return text
//     .replace(/John/g, `<span style="color: ${getNameColor("John")}; font-weight: bold;">John</span>`)
//     .replace(/Bill/g, `<span style="color: ${getNameColor("Bill")}; font-weight: bold;">Bill</span>`);
// }

const DrawDominancePage: React.FC = () => {
  const shapesRef = useRef<{ x: number; y: number }[][]>([]);
  const [showModal, setShowModal] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [canContinue, setCanContinue] = useState(false);
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const shapePointsRef = useRef<{ x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const session = getCurrentSession();

  console.log("=== DOMINANCE PAGE LOADED ===");

  // Timer effect - 5 seconds like prep pages
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 5000); // 5 seconds
    return () => clearTimeout(timer);
  }, []);

  // Function to get the modal text
  const getModalText = (): string => {
    const characterName = getCharacterForCondition('dominance');
    return safeColorNamesInText(`Please draw the outline of ${characterName}, the person you just read about.`);
  };

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


  const doneDrawing = async () => {
    // Prevent multiple simultaneous calls
    if (isProcessing) {
      console.log("=== DOMINANCE: Already processing, ignoring click ===");
      return;
    }

    console.log("=== DOMINANCE DONE DRAWING CALLED ===");
    setIsProcessing(true);
    
    try {
      if (isDrawingRef.current) stopDrawing();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.beginPath();

    // Silhouette processing
    const timestamp = Date.now();
    console.log(`Starting silhouette processing in drawDominance at ${timestamp}...`);
    const silhouetteResult = await silhouetteFromCanvas(canvas);
    console.log('Silhouette result:', {
      areaPixels: silhouetteResult.areaPixels,
      width: silhouetteResult.width,
      height: silhouetteResult.height,
      pngSize: silhouetteResult.silhouettePNG.size
    });

    const totalArea = silhouetteResult.areaPixels;

    // Area validation - track violations but don't block submission
    if (totalArea < MIN_AREA) {
      incrementSmallViolation(); // Track small drawing violation
    }
    
    if (totalArea > MAX_AREA) {
      incrementLargeViolation(); // Track large drawing violation
    }

    // Use silhouette dimensions instead of vector extents
    const extents = {
      width: silhouetteResult.width,
      height: silhouetteResult.height,
      minY: 0 // Not applicable for raster approach
    };

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

    // Convert silhouette PNG blob to data URL
    const silhouetteDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(silhouetteResult.silhouettePNG);
    });

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
        verticality: silhouetteResult.verticality,
        pngUrl: imageData,
        silhouettePngUrl: silhouetteDataUrl,
      },
    });

    // Update session with the new block
    updateSession({ blocks });

    console.log("=== UPDATED SESSION ===");
    console.log("DOMINANCE COMPLETE");

    // Debug session state
    debugSessionState();

    // Determine next step using local session data to avoid Firefox race condition
    // Don't call getCurrentSession() again - use the session we already have
    const updatedSession = { ...session, blocks };
    const completedBlockTypes = updatedSession.blocks.map(b => b.blockType);

    // Find next block from sessionOrder
    let nextBlockType = null;
    for (const blockType of updatedSession.sessionOrder) {
      if (!completedBlockTypes.includes(blockType)) {
        nextBlockType = blockType;
        break;
      }
    }

    console.log("=== NEXT BLOCK DETERMINATION ===");
    console.log("Completed blocks:", completedBlockTypes);
    console.log("Session order:", updatedSession.sessionOrder);
    console.log("Next block type:", nextBlockType);

      if (nextBlockType) {
        router.push(`/prep${capitalize(nextBlockType)}`);
      } else {
        // All blocks completed, go to demographics
        router.push('/demographics');
      }
    } catch (error) {
      console.error("=== DOMINANCE: Error in doneDrawing ===", error);
      // Re-enable button on error
      setIsProcessing(false);
    }
  };

  if (!session) return null;

  return (
    <>
      <Dialog open={showModal}>
        <DrawDialogContent className="sm:max-w-[725px]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Directions</DialogTitle>
            <DialogDescription 
              className="text-lg text-black"
              dangerouslySetInnerHTML={{
                __html: `${getModalText()} It should be a simple outline—kind of like a gingerbread man. <b>Do NOT draw a stick figure.</b> Please ask the experimenter if you have any questions. When you are finished with your drawing, press Done.`
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

      {/* Area validation warning dialog */}


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
        <div className="flex-shrink-0 p-2 flex flex-col items-center space-y-2">
          <div className="flex justify-center space-x-3">
            <button 
              className={`px-4 py-2 rounded font-medium text-base ${
                isProcessing 
                  ? "bg-gray-400 cursor-not-allowed text-white" 
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
              onClick={clearCanvas}
              disabled={isProcessing}
            >
              Clear Canvas
            </button>
            <button 
              className={`px-4 py-2 rounded font-medium text-base ${
                isProcessing 
                  ? "bg-gray-400 cursor-not-allowed text-white" 
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
              onClick={doneDrawing}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Done"}
            </button>
          </div>
          {isProcessing && (
            <p className="text-sm text-gray-600 text-center">
              The next page will load soon. We appreciate your patience.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default DrawDominancePage;