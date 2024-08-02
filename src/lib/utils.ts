import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createAndDownloadFile = (
  content: string,
  contentType: string,
  fileName: string
) => {
  const blob = new Blob([Buffer.from(content, "base64")], {
    type: contentType
  });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // Clean up by removing the download link and revoking the object URL
  downloadLink.remove();
  URL.revokeObjectURL(url);
};
