import React, { useState, useCallback } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Infinity } from "lucide-react";

interface EditableCellProps {
  value: string | number | null;
  onEdit: (value: string | number | null) => void;
  type?: "text" | "number";
  isMaxQuantity?: boolean;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onEdit,
  type = "text",
  isMaxQuantity = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState<string | number | null>(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(
        newValue === "" ? null : type === "number" ? Number(newValue) : newValue
      );
    },
    [type]
  );

  const handleBlur = useCallback(() => {
    onEdit(localValue);
    setIsOpen(false);
  }, [localValue, onEdit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && type !== "text") {
        handleBlur();
      }
    },
    [handleBlur, type]
  );

  const getDisplayValue = useCallback(
    (val: string | number | null) => {
      if (val === null) return "-";
      if (val === "∞") return "∞";
      if (type === "number" && typeof val === "number")
        return val.toLocaleString();
      return val.toString();
    },
    [type]
  );

  const handleInfinityClick = useCallback(() => {
    setLocalValue("∞");
    onEdit("∞");
    setIsOpen(false);
  }, [onEdit]);

  const displayValue = getDisplayValue(value);
  const isInfinity = displayValue === "∞";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`h-auto w-full justify-center p-1 font-normal hover:bg-blue-100 ${
            isInfinity ? "text-2xl" : ""
          }`}
          style={{
            cursor: "pointer"
          }}
        >
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex items-center">
          {type === "text" ? (
            <Textarea
              value={localValue ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              className="min-h-[100px]"
              autoFocus
            />
          ) : (
            <Input
              type="text"
              value={localValue ?? ""}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="border-none focus:ring-0"
              autoFocus
            />
          )}
          {isMaxQuantity && (
            <Button
              variant="ghost"
              className="ml-2 p-2"
              onClick={handleInfinityClick}
              title="Set to Infinity"
            >
              <Infinity size={20} />
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EditableCell;
