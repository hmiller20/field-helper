"use client";

export default function PDFViewer({ pdfUrl }: { pdfUrl: string }) {
  return (
    <iframe
      src={pdfUrl}
      title="PDF Viewer"
      className="w-full h-[600px] border-none"
    />
  );
} 