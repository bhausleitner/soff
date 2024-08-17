import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import PDFViewer from "~/components/chat/pdf-viewer";
import { FILE_PREVIEW_MESSAGES } from "~/constants/messages";

interface FilePreviewDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fileKey: string | null;
  isDownloading: boolean;
  handleDownload: (fileKey: string) => void;
  handleClose: () => void;
  additionalButtons?: React.ReactNode;
}

export function FilePreviewDialog({
  isOpen,
  setIsOpen,
  fileKey,
  isDownloading,
  handleDownload,
  handleClose,
  additionalButtons
}: FilePreviewDialogProps) {
  const fileName = fileKey?.split("/").pop() ?? "File Preview";
  const [name, extension] = fileName.split(/\.(?=[^\.]+$)/);
  const isPDF = extension?.toLowerCase() === "pdf";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] max-w-[60vw] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {name}
            <span className="text-gray-500">.{extension}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          {fileKey &&
            (isPDF ? (
              <PDFViewer fileKey={fileKey} />
            ) : (
              <div className="text-sm text-gray-500">
                {FILE_PREVIEW_MESSAGES.UNSUPPORTED_FILE_TYPE}
              </div>
            ))}
        </div>
        <DialogFooter>
          <Button
            className="w-32"
            onClick={() => fileKey && handleDownload(fileKey)}
            variant="outline"
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Icons.loaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <>Download</>
            )}
          </Button>
          {additionalButtons}
          <Button variant="soff" onClick={handleClose} className="w-32">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
