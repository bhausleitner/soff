import React, { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer = ({ fileKey }: { fileKey: string }) => {
  const [url, setUrl] = useState<string>();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [autoScale, setAutoScale] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const { data } = api.s3.getSignedUrl.useQuery(
    {
      fileKey: fileKey
    },
    {
      enabled: !!fileKey,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  );

  useEffect(() => {
    if (data?.signedUrl) {
      setUrl(data.signedUrl);
    }
  }, [data]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
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
      const padding = 40; // 20px padding on each side
      const widthScale = (containerWidth - padding) / originalWidth;
      const heightScale = (containerHeight - padding) / originalHeight;
      setScale(Math.min(widthScale, heightScale, 1.0)); // Limit max scale to 1.0
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

  if (!url) {
    return <Spinner />;
  }

  const documentContainer = (
    <div
      ref={containerRef}
      className="group relative flex flex-col items-center overflow-auto"
      style={{ height: "65vh", maxWidth: "100%" }}
    >
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Spinner />}
      >
        {numPages !== null &&
          Array.from(new Array(numPages), (el, index) => (
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
  );

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="relative w-full rounded-lg bg-gray-200"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {documentContainer}
        <div
          className={`absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 transform gap-2 transition-opacity duration-300 ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            variant="outline"
            onClick={zoomIn}
            className="bg-white bg-opacity-50 backdrop-blur-sm backdrop-filter transition-all"
          >
            <Icons.zoomIn className="h-4 w-4 text-black" />
          </Button>
          <Button
            variant="outline"
            onClick={zoomOut}
            className="bg-white bg-opacity-50 backdrop-blur-sm backdrop-filter transition-all"
          >
            <Icons.zoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
