import { Badge } from "~/components/ui/badge";
import { Icons } from "~/components/icons";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { useState } from "react";

interface FileBadgeProps {
  fileName: string;
  handleOpen?: () => void;
  handleRemove?: () => void;
  handleDownload?: () => void;
  uploading?: boolean;
}

export function FileBadge({
  fileName,
  handleOpen,
  handleRemove,
  handleDownload,
  uploading = false
}: FileBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Badge
      onClick={handleOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex max-w-[170px] cursor-pointer items-center space-x-2 border border-gray-300 bg-white px-2 py-2 text-gray-700 shadow-sm transition-all duration-200 ease-in-out hover:bg-gray-100"
    >
      <div className="relative flex h-5 w-5 items-center justify-center">
        {isHovered && handleDownload ? (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-200"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
          >
            <Icons.download
              size={15}
              className="text-gray-600 hover:text-blue-500"
            />
          </div>
        ) : (
          <Icons.paperClip size={15} className="text-gray-500" />
        )}
      </div>
      <span className="truncate">{fileName}</span>
      {handleRemove && (
        <Link
          href="#"
          className={cn(
            "shrink-0 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
        >
          {uploading ? (
            <Icons.loaderCircle
              size={15}
              className="animate-spin text-muted-foreground"
            />
          ) : (
            <Icons.trash
              size={15}
              className="text-gray-500 hover:text-red-500"
            />
          )}
        </Link>
      )}
    </Badge>
  );
}
