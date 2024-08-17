import { Badge } from "~/components/ui/badge";
import { Icons } from "~/components/icons";
import { forwardRef, useState } from "react";

interface FileBadgeProps {
  fileName: string;
  handleOpen?: () => void;
  handleRemove?: () => void;
  handleDownload?: () => void;
  uploading?: boolean;
}

export const FileBadge = forwardRef<HTMLDivElement, FileBadgeProps>(
  (
    { fileName, handleOpen, handleRemove, handleDownload, uploading = false },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Badge
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex max-w-[170px] cursor-pointer items-center space-x-2 border border-gray-300 bg-white px-3 py-2 text-gray-700 transition-colors duration-200 ease-in-out hover:bg-gray-100"
      >
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
          {isHovered && handleDownload ? (
            <div
              className="flex h-full w-full items-center justify-center rounded-full bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
            >
              <Icons.download
                size={15}
                className="text-gray-600 hover:text-blue"
              />
            </div>
          ) : (
            <Icons.paperClip size={15} className="text-gray-500" />
          )}
        </div>
        <span className="flex-grow truncate">{fileName}</span>
        {handleRemove && (
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
            {uploading ? (
              <Icons.loaderCircle
                size={15}
                className="animate-spin text-muted-foreground"
              />
            ) : (
              <Icons.trash
                size={15}
                className="text-gray-500 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              />
            )}
          </div>
        )}
      </Badge>
    );
  }
);
