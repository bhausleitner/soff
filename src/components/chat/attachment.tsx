import React, { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "~/components/ui/dialog";
import { Icons } from "~/components/icons";
import PDFViewer from "~/components/chat/pdf-viewer";

interface AttachmentProps {
  fileKey: string;
}

export function Attachment({ fileKey }: AttachmentProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Derive the file name from the fileKey
  const fileName = fileKey.split("/").pop() || "Unnamed File";

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild className="mt-2">
        <Badge
          onClick={handleOpen}
          className="flex max-w-[170px] cursor-pointer items-center space-x-2 border border-gray-300 bg-white px-2 py-2 text-gray-700 shadow-sm transition-all duration-200 ease-in-out hover:bg-gray-100"
        >
          <Icons.paperClip className="h-4 w-4 flex-shrink-0 text-red-500" />
          <span className="truncate">{fileName}</span>
        </Badge>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-[60vw] overflow-auto">
        <DialogHeader>
          <DialogTitle>View Attachment</DialogTitle>
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
