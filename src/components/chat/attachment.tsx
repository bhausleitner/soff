import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "~/components/ui/dialog";
import PDFViewer from "~/components/chat/pdf-viewer";
import { FileBadge } from "~/components/chat/file-badge";
import { api } from "~/utils/api";
import { Icons } from "~/components/icons";
import { useRouter } from "next/router";

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
  const [isOpen, setIsOpen] = useState(false);
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

  // Derive the file name from the fileKey
  const fileName = fileKey.split("/").pop() ?? "Unnamed File";

  // Split the file name and extension
  const [name, extension] = fileName.split(/\.(?=[^\.]+$)/); // Splits at the last dot

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const isPDF = extension?.toLowerCase() === "pdf";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="mt-2">
        <FileBadge fileName={fileName} handleOpen={handleOpen} />
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-[60vw] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {name}
            <span className="text-gray-500">.{extension}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          {isPDF ? (
            <PDFViewer fileKey={fileKey} />
          ) : (
            <div className="text-sm text-gray-500">
              This file type is not supported for preview, yet.
            </div>
          )}
        </div>
        <DialogFooter>
          {!isUserMessage && (
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
          )}
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
