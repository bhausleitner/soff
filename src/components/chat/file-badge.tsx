import { Badge } from "~/components/ui/badge";
import { Icons } from "~/components/icons";
import Link from "next/link";
import { cn } from "~/lib/utils";

interface FileBadgeProps {
  fileName: string;
  handleOpen?: () => void;
  handleRemove?: () => void;
  uploading?: boolean;
}

export function FileBadge({
  fileName,
  handleOpen,
  handleRemove,
  uploading = false
}: FileBadgeProps) {
  return (
    <Badge
      onClick={handleOpen}
      className="flex max-w-[170px] cursor-pointer items-center space-x-2 border border-gray-300 bg-white px-2 py-2 text-gray-700 shadow-sm transition-all duration-200 ease-in-out hover:bg-gray-100"
    >
      {!handleRemove && (
        <Icons.paperClip className="h-4 w-4 flex-shrink-0 text-red-500" />
      )}
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
