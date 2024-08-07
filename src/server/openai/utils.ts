import { createCanvas } from "canvas";
// import * as pdfjsLib from "pdfjs-dist";
import { pdfjs } from "react-pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

// import {
//   getDocument,
//   GlobalWorkerOptions
// } from "pdfjs-dist/legacy/build/pdf.js";

// import { type RenderParameters } from "pdfjs-dist/types/src/display/api";

// GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Function to convert ArrayBuffer to Uint8Array
const arrayBufferToUint8Array = (buffer: ArrayBuffer): Uint8Array => {
  return new Uint8Array(buffer);
};

export const convertPdfToImage = async (pdfData: ArrayBuffer) => {
  const uint8ArrayData = arrayBufferToUint8Array(pdfData);

  const loadingTask = pdfjs.getDocument({ data: uint8ArrayData });

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
