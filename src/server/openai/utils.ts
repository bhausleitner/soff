import { createCanvas, DOMMatrix } from "canvas";
import { pdfjs } from "react-pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// this is the reason why I'm allowing any (if we switch to reducto, we can get rid of this)
global.DOMMatrix = DOMMatrix as any;

// Function to convert ArrayBuffer to Uint8Array
const arrayBufferToUint8Array = (buffer: ArrayBuffer): Uint8Array => {
  return new Uint8Array(buffer);
};

export const convertPdfToImage = async (pdfData: ArrayBuffer) => {
  const uint8ArrayData = arrayBufferToUint8Array(pdfData);

  const loadingTask = pdfjs.getDocument({
    data: uint8ArrayData,
    standardFontDataUrl: "node_modules/pdfjs-dist/standard_fonts/"
  });

  const pdfDocument = await loadingTask.promise;
  const page = await pdfDocument.getPage(1); // Get the first page

  const viewport = page.getViewport({ scale: 1.5 }); // Set scale to 1.5

  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");

  const renderContext = {
    canvasContext: context as unknown as CanvasRenderingContext2D,
    viewport: viewport
  };

  await page.render(renderContext).promise;

  // Get the image buffer
  return canvas.toBuffer("image/png");
};
