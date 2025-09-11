"use client";

import { useRouter } from "next/navigation";
import { BlockType, Session, getCurrentSession, updateSession } from "@/utils/sessionData";
import { silhouetteFromCanvas } from "@/lib/silhouette";
import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";

interface Props {
  blockType: BlockType;
}

/* You probably have lots of refs and handlers—keep them.
   Just include `blockType` when you push to session.        */

const Draw = ({ blockType }: Props) => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const shapesRef = useRef<Array<Array<{ x: number; y: number }>>>([]);

  // Test if silhouette function is available
  console.log('Silhouette function available:', typeof silhouetteFromCanvas);

  // Timer effect - 10 seconds like prep pages
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanContinue(true);
    }, 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleDone = async () => {
    console.log('handleDone called');
    if (!canvasRef.current) {
      console.log('No canvas ref found');
      return;
    }
    const canvas = canvasRef.current;
    console.log('Canvas found:', canvas.width, 'x', canvas.height);

    try {
      console.log('Starting silhouette processing...');
      // Process drawing with silhouette pipeline
      const silhouetteResult = await silhouetteFromCanvas(canvas);
      console.log('Silhouette result:', {
        areaPixels: silhouetteResult.areaPixels,
        width: silhouetteResult.width,
        height: silhouetteResult.height,
        pngSize: silhouetteResult.silhouettePNG.size
      });

      // Also capture the original drawing as fallback
      let originalImageData = "";
      if (containerRef.current) {
        const html2canvasResult = await html2canvas(containerRef.current, {
          backgroundColor: null,
        });
        originalImageData = html2canvasResult.toDataURL("image/png");
      } else {
        originalImageData = canvas.toDataURL("image/png");
      }

      // Get current session and update it
      const session = getCurrentSession();
      if (!session) {
        router.push('/consent');
        return;
      }

      // Convert silhouette PNG blob to data URL for storage
      const silhouetteDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(silhouetteResult.silhouettePNG);
      });

      // Add the new block
      const blocks = [...(session.blocks || [])];
      const drawingData = {
        // Simplified silhouette-based metrics
        area: silhouetteResult.areaPixels, // pixel count area
        maxWidth: silhouetteResult.width, // silhouette width
        maxHeight: silhouetteResult.height, // silhouette height
        verticality: silhouetteResult.verticality, // how high up the drawing is positioned
        // Images
        pngUrl: originalImageData, // original drawing
        silhouettePngUrl: silhouetteDataUrl, // processed silhouette
      };
      
      console.log('Drawing data being stored:', {
        blockType,
        area: drawingData.area,
        maxWidth: drawingData.maxWidth,
        maxHeight: drawingData.maxHeight,
        verticality: drawingData.verticality,
        hasPngUrl: !!drawingData.pngUrl,
        hasSilhouettePngUrl: !!drawingData.silhouettePngUrl,
        silhouetteDataLength: silhouetteDataUrl.length
      });
      
      blocks.push({
        blockType,
        vignetteStartedAt: session.tempVignetteStart || Date.now(),
        survey: session.tempSurvey || {},
        drawing: drawingData,
      });

      // Update session with new block and order if needed
      const updates: Partial<Session> = { blocks };
      if (blockType === "control" && !session.order) {
        updates.order = Math.random() < 0.5 ? ['prestige', 'dominance'] : ['dominance', 'prestige'];
      }
      updateSession(updates);
    } catch (error) {
      console.error('Error processing silhouette:', error);
      console.error('Error details:', error instanceof Error ? error.message : error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      // Fallback to original method if silhouette processing fails
      // ... you could add the original vector-based calculation here as fallback
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-lg font-semibold">{blockType.charAt(0).toUpperCase() + blockType.slice(1)} drawing</h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300"
        onMouseDown={() => setIsDrawing(true)}
        onMouseUp={() => setIsDrawing(false)}
        onMouseMove={(e) => {
          if (!isDrawing) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          // Add point to current shape
          if (shapesRef.current.length === 0 || !isDrawing) {
            shapesRef.current.push([{ x, y }]);
          } else {
            shapesRef.current[shapesRef.current.length - 1].push({ x, y });
          }
          // Redraw
          const ctx = e.currentTarget.getContext('2d');
          if (!ctx) return;
          ctx.clearRect(0, 0, rect.width, rect.height);
          ctx.beginPath();
          shapesRef.current.forEach(shape => {
            if (shape.length < 2) return;
            ctx.moveTo(shape[0].x, shape[0].y);
            shape.slice(1).forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
          });
          ctx.stroke();
        }}
      />
      <button
        className={`rounded px-4 py-2 font-medium text-white ${
          canContinue 
            ? "bg-blue-600 hover:bg-blue-700" 
            : "bg-gray-400 cursor-not-allowed"
        }`}
        style={{ opacity: canContinue ? 1 : 0.5 }}
        onClick={canContinue ? handleDone : undefined}
        disabled={!canContinue}
      >
        Done
      </button>
      {!canContinue && (
        <p className="text-sm text-gray-500 mt-2">
          The done button will become available soon. Please take your time with the drawing.
        </p>
      )}
    </div>
  );
};

export default Draw;
