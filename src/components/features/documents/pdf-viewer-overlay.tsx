"use client";

import { useEffect, useRef } from "react";
import { Dialog } from "../../ui/dialog";
import { Button } from "@/components/ui/button";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

interface PDFViewerOverlayProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  pageNumber?: number;
}

export function PDFViewerOverlay({ open, onClose, pdfUrl, pageNumber }: PDFViewerOverlayProps) {
  const pageRef = useRef<number>(pageNumber || 1);

  useEffect(() => {
    if (open) {
      console.log("PDF URL:", pdfUrl);
    }
    pageRef.current = pageNumber || 1;
  }, [open, pdfUrl]);

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="w-[90vw] h-[90vh] flex flex-col bg-white rounded shadow-lg">
        <div className="flex justify-between items-center p-2 border-b">
          <span className="font-semibold text-lg">PDF Document</span>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="flex-1 overflow-auto flex justify-center items-center">
          <Document file={pdfUrl} loading={<div>Loading PDF...</div>}>
            <Page pageNumber={pageRef.current} width={800} />
          </Document>
        </div>
      </div>
    </Dialog>
  );
}
