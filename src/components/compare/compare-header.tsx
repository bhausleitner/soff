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
import { Checkbox } from "~/components/ui/checkbox";

interface CompareHeaderProps {
  supplierName: string;
  quoteId: number;
  fileKey: string;
  isSelected: boolean;
  onSelect: (quoteId: number) => void;
}

export default function CompareHeader({
  supplierName,
  quoteId,
  fileKey,
  isSelected,
  onSelect
}: CompareHeaderProps) {
  const { isOpen, setIsOpen, isDownloading, handleDownload, handleOpen } =
    useFileHandling();

  return (
    <Card className="flex shrink-0 grow basis-0 flex-col items-start gap-1 self-stretch">
      <CardHeader className="w-full">
        <div className="flex w-full flex-col">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(quoteId)}
              aria-label={`Select quote ${quoteId}`}
            />
            <CardTitle>{supplierName}</CardTitle>
          </div>
          <div className="ml-8">
            <CardDescription className="text-sm">Q-{quoteId}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardFooter>
        <Tooltip>
          <TooltipTrigger asChild>
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
