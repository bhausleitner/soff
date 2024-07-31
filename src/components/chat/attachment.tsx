import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { FileBadge } from "~/components/chat/file-badge";
import { api } from "~/utils/api";
import { Icons } from "~/components/icons";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useFileHandling } from "~/hooks/use-file-handling";
import { FilePreviewDialog } from "~/components/common/FilePreviewDialog";

interface AttachmentProps {
  fileKey: string;
  isUserMessage: boolean;
  supplierId: number;
  chatId: number;
}

export function Attachment({
  chatId,
  fileKey,
  isUserMessage,
  supplierId
}: AttachmentProps) {
  const {
    isOpen,
    setIsOpen,
    isDownloading,
    handleDownload,
    handleOpen,
    handleClose
  } = useFileHandling();
  const [isParsing, setIsParsing] = useState(false);
  const router = useRouter();

  const createQuoteMutation = api.quote.createQuoteFromPdf.useMutation();

  const handleCreateQuote = async () => {
    try {
      setIsParsing(true);
      const quoteId = await createQuoteMutation.mutateAsync({
        chatId,
        fileKey,
        supplierId
      });
      await router.push(`/quotes/${quoteId}`);
    } catch (error) {
      console.error("Error in handleCreateQuote:", error);
      toast.error("Failed to create quote. Please reach out to admin.");
    } finally {
      setIsParsing(false);
    }
  };

  const fileName = fileKey.split("/").pop() ?? "Unnamed File";

  const additionalButtons = !isUserMessage && (
    <Button
      className="w-40"
      onClick={handleCreateQuote}
      variant="outline"
      disabled={isParsing}
    >
      {isParsing ? (
        <Icons.loaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <>
          Parse Quote
          <Icons.sparkles className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );

  // Split the file name and extension
  const [name, extension] = fileName.split(/\.(?=[^\.]+$)/); // Splits at the last dot

  const handleClose = () => setIsOpen(false);
  const handleOpen = () => {
    if (isPDF) {
      setIsOpen(true);
    } else {
      toast.info("This file type is not supported for preview.");
    }
  };

  const isPDF = extension?.toLowerCase() === "pdf";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="mt-2">
        <FileBadge
          fileName={fileName}
          handleOpen={handleOpen}
          handleDownload={() => handleDownload(fileKey)}
        />
      </DialogTrigger>
      <FilePreviewDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        fileKey={fileKey}
        isDownloading={isDownloading}
        handleDownload={handleDownload}
        handleClose={handleClose}
        additionalButtons={additionalButtons}
      />
    </Dialog>
  );
}
