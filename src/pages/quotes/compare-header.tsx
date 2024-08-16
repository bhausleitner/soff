import React from "react";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { FilePreviewDialog } from "~/components/common/FilePreviewDialog";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "~/components/ui/card";
import { useFileHandling } from "~/hooks/use-file-handling";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "~/components/ui/tooltip";

interface CompareHeaderProps {
  supplierName: string;
  quoteId: number;
  fileKey: string;
}

export default function CompareHeader({
  supplierName,
  quoteId,
  fileKey
}: CompareHeaderProps) {
  const {
    isOpen,
    setIsOpen,
    isDownloading,
    handleDownload,
    handleClose,
    handleOpen
  } = useFileHandling();

  return (
    <Card className="flex shrink-0 grow basis-0 flex-col items-start gap-1 self-stretch">
      <CardHeader>
        <CardTitle>{supplierName}</CardTitle>
        <CardDescription>Q-{quoteId}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Tooltip>
          <TooltipTrigger asChild>
            {/* need this div for forward ref error */}
            <div>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleOpen}
                    disabled={!fileKey}
                  >
                    <Icons.fileText className="mr-2 h-4 w-4" />
                    View PDF
                  </Button>
                </DialogTrigger>
                <FilePreviewDialog
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  fileKey={fileKey}
                  isDownloading={isDownloading}
                  handleDownload={handleDownload}
                  handleClose={handleClose}
                />
              </Dialog>
            </div>
          </TooltipTrigger>
          {!fileKey && <TooltipContent>No PDF available.</TooltipContent>}
        </Tooltip>
      </CardFooter>
    </Card>
  );
}
