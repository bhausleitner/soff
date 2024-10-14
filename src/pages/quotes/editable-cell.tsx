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
import { truncateDescription } from "~/utils/string-format";

interface EditableCellProps {
  value: string | number | null;
  onEdit: (value: string | number | null) => void;
  type?: "text" | "number" | "USD" | "EUR";
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

  const formatNumber = useCallback(
    (val: string, currencyType: "USD" | "EUR") => {
      // Remove all non-numeric characters except the decimal separator
      const cleanedVal = val.replace(
        currencyType === "USD" ? /[^0-9.]/g : /[^0-9,]/g,
        ""
      );

      // Split the number into integer and decimal parts
      const parts = cleanedVal.split(currencyType === "USD" ? "." : ",");

      if (parts[0] && parts[0].length > 3) {
        // Add thousand separators to the integer part
        parts[0] = parts[0].replace(
          /\B(?=(\d{3})+(?!\d))/g,
          currencyType === "USD" ? "," : "."
        );
      }

      // Rejoin the parts with the appropriate decimal separator
      return parts.join(currencyType === "USD" ? "." : ",");
    },
    []
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (type === "USD" || type === "EUR") {
        const formattedValue = formatNumber(newValue, type);
        setLocalValue(formattedValue === "" ? null : formattedValue);
      } else {
        setLocalValue(
          newValue === ""
            ? null
            : type === "number"
              ? Number(newValue)
              : newValue
        );
      }
    },
    [type, formatNumber]
  );

  const handleSave = useCallback(() => {
    let finalValue = localValue;
    if (type === "USD" || type === "EUR") {
      if (typeof finalValue === "string") {
        // Convert the formatted string to a number
        const numberValue =
          type === "USD"
            ? Number(finalValue.replace(/,/g, ""))
            : Number(finalValue.replace(/\./g, "").replace(",", "."));
        finalValue = isNaN(numberValue) ? null : numberValue;
      }
    }
    onEdit(finalValue);
    setIsOpen(false);
  }, [localValue, onEdit, type]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  const getDisplayValue = useCallback(
    (val: string | number | null) => {
      if (val === null) return "-";
      if (val === "∞") return "∞";
      if (type === "number" && typeof val === "number")
        return val.toLocaleString();
      if (type === "USD" && typeof val === "number")
        return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (type === "EUR" && typeof val === "number")
        return val
          .toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })
          .replace("€", "€");
      return truncateDescription(val.toString());
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
          className={`h-auto w-full justify-center p-1 font-normal hover:bg-blue-100 focus:ring-0 ${
            isInfinity ? "text-2xl" : ""
          }`}
          style={{
            cursor: "pointer"
          }}
        >
          {displayValue || <span className="opacity-50">Click to edit</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex items-center">
          {type === "text" ? (
            <Textarea
              value={localValue ?? ""}
              onChange={handleChange}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="min-h-[100px]"
              autoFocus
            />
          ) : (
            <Input
              type="text"
              value={localValue ?? ""}
              onChange={handleChange}
              onBlur={handleSave}
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
