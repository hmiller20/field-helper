"use client";

import { useRouter } from "next/navigation";
import { BlockType, Session, getCurrentSession, updateSession } from "@/utils/sessionData";
import { calculateArea, calculateDrawingExtents } from "@/utils/drawMetrics";
import { useRef, useState } from "react";
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
  const shapesRef = useRef<Array<Array<{ x: number; y: number }>>>([]);

  const handleDone = async () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate drawing metrics
    let totalArea = 0;
    shapesRef.current.forEach((shape) => {
      if (shape.length >= 3) totalArea += calculateArea(shape);
    });
    const extents = calculateDrawingExtents(shapesRef.current);

    // Capture drawing as PNG
    let imageData = "";
    if (containerRef.current) {
      const html2canvasResult = await html2canvas(containerRef.current, {
        backgroundColor: null,
      });
      imageData = html2canvasResult.toDataURL("image/png");
    } else {
      imageData = canvas.toDataURL("image/png");
    }

    // Get current session and update it
    const session = getCurrentSession();
    if (!session) {
      router.push('/consent');
      return;
    }

    // Add the new block
    const blocks = [...(session.blocks || [])];
    blocks.push({
      blockType,
      vignetteStartedAt: session.tempVignetteStart || Date.now(),
      survey: session.tempSurvey || {},
      drawing: {
        area: totalArea,
        maxWidth: extents.width,
        maxHeight: extents.height,
        verticality: extents.minY,
        pngUrl: imageData,
      },
    });

    // Update session with new block and order if needed
    const updates: Partial<Session> = { blocks };
    if (blockType === "control" && !session.order) {
      updates.order = Math.random() < 0.5 ? ['prestige', 'dominance'] : ['dominance', 'prestige'];
    }
    updateSession(updates);
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
        className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        onClick={handleDone}
      >
        Done
      </button>
    </div>
  );
};

export default Draw;
