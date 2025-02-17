"use client";

export default function PDFViewer({ pdfUrl }: { pdfUrl: string }) {
  return (
    <embed 
      src={pdfUrl}
      type="application/pdf"
      width="100%"
      height="600px"
    />
  );
} 