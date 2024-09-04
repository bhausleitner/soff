import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import { Separator } from "~/components/ui/separator";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PDFViewerProps {
  fileKey: string;
  isDialog?: boolean;
}

const PDFViewer = ({ fileKey, isDialog = true }: PDFViewerProps) => {
  const [url, setUrl] = useState<string>();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [autoScale, setAutoScale] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data } = api.s3.getSignedUrl.useQuery({
    fileKey: fileKey
  });

  useEffect(() => {
    if (data?.signedUrl) {
      setUrl(data.signedUrl);
    }
  }, [data]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  };

  const onPageLoadSuccess = ({
    originalWidth,
    originalHeight
  }: {
    originalWidth: number;
    originalHeight: number;
  }) => {
    if (autoScale && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const widthScale = containerWidth / originalWidth;
      const heightScale = containerHeight / originalHeight;
      setScale(Math.min(widthScale, heightScale));
    }
  };

  const zoomIn = () => {
    setScale((prevScale) => {
      const newScale = Math.min(prevScale + 0.1, 3.0);
      setAutoScale(false);
      return newScale;
    });
  };

  const zoomOut = () => {
    setScale((prevScale) => {
      const newScale = Math.max(prevScale - 0.1, 0.5);
      setAutoScale(false);
      return newScale;
    });
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const goToNextPage = () => {
    if (numPages !== null) {
      setCurrentPage((prevPage) => Math.min(prevPage + 1, numPages));
    }
  };

  if (!url) {
    return <Spinner />;
  }

  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-2 flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
        >
          <Icons.chevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {currentPage} / {numPages ?? 0}
        </span>
        <Button
          variant="secondary"
          onClick={goToNextPage}
          disabled={currentPage === numPages}
        >
          <Icons.chevronRight className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" />
        <Button variant="secondary" onClick={zoomIn}>
          <Icons.zoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" onClick={zoomOut}>
          <Icons.zoomOut className="h-4 w-4" />
        </Button>
      </div>
      {isDialog ? (
        <div className="w-[50vw] rounded-lg bg-gray-200">
          <div
            ref={containerRef}
            className="flex flex-col items-center overflow-auto"
            style={{ height: "60vh", maxWidth: "100%" }}
          >
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<Spinner />}
            >
              {numPages !== null && (
                <Page
                  key={`page_${currentPage}`}
                  pageNumber={currentPage}
                  className="m-2"
                  scale={scale}
                  onLoadSuccess={onPageLoadSuccess}
                />
              )}
            </Document>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-lg bg-gray-200">
          <div
            ref={containerRef}
            className="flex flex-col items-center overflow-auto"
            style={{ height: "65vh", maxWidth: "100%" }}
          >
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<Spinner />}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  className="m-2"
                  scale={scale}
                  onLoadSuccess={onPageLoadSuccess}
                />
              ))}
            </Document>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
