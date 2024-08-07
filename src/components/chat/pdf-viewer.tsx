import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import { Separator } from "~/components/ui/separator";

// We are using this to offload heavy PDF parsing tasks to a public web worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PDFViewerProps {
  fileKey: string;
}

const PDFViewer = ({ fileKey }: PDFViewerProps) => {
  const [url, setUrl] = useState<string>();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState<number>(1.0); // Initial zoom level
  const [currentPage, setCurrentPage] = useState<number>(1); // Track current page number

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
    setCurrentPage(1); // Reset to the first page when a new document loads
  };

  const zoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.1, 3.0));
  const zoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));

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
    <div className="flex flex-col items-center">
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
      <div className="w-[50vw] rounded-lg bg-gray-400">
        <div
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
                className="my-2"
                scale={scale}
              />
            )}
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
