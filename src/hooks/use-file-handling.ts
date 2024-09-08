import { useState } from "react";
import { api } from "~/utils/api";
import { createAndDownloadFile } from "~/lib/utils";
import { toast } from "sonner";

export function useFileHandling() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadFileMutation = api.s3.downloadFile.useMutation();

  const handleDownload = async (fileKey: string) => {
    setIsDownloading(true);

    try {
      const result = await downloadFileMutation.mutateAsync({ fileKey });
      createAndDownloadFile(
        result.content,
        result.contentType ?? "application/octet-stream",
        result.fileName
      );
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpen = () => setIsOpen(true);

  return {
    isOpen,
    setIsOpen,
    isDownloading,
    handleDownload,
    handleOpen
  };
}
