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

interface AttachmentProps {
  fileKey: string;
}

export function Attachment({ fileKey }: AttachmentProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Derive the file name from the fileKey
  const fileName = fileKey.split("/").pop() ?? "Unnamed File";

  // Split the file name and extension
  const [name, extension] = fileName.split(/\.(?=[^\.]+$)/); // Splits at the last dot

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

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
          <PDFViewer fileKey={fileKey} />
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
