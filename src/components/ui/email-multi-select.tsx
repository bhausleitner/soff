import React, { useState, useCallback, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { isValidEmail } from "~/utils/string-format";

export interface EmailOption {
  value: string;
  label: string;
  fixed?: boolean;
}

interface EmailMultiSelectorProps {
  value?: EmailOption[];
  onChange?: (options: EmailOption[]) => void;
  placeholder?: string;
  maxSelected?: number;
  onMaxSelected?: (maxLimit: number) => void;
  disabled?: boolean;
  className?: string;
  badgeClassName?: string;
  hidePlaceholderWhenSelected?: boolean;
}

const EmailMultiSelector = React.forwardRef<
  HTMLInputElement,
  EmailMultiSelectorProps
>(
  ({
    value,
    onChange,
    placeholder = "Enter email addresses...",
    maxSelected = Number.MAX_SAFE_INTEGER,
    onMaxSelected,
    disabled,
    className,
    badgeClassName,
    hidePlaceholderWhenSelected
  }: EmailMultiSelectorProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selected, setSelected] = useState<EmailOption[]>(
      Array.isArray(value) ? value : []
    );
    const [inputValue, setInputValue] = useState("");
    const [isInputInvalid, setIsInputInvalid] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (Array.isArray(value)) {
        setSelected(value);
      }
    }, [value]);

    const handleUnselect = useCallback(
      (option: EmailOption) => {
        const newOptions = selected.filter((s) => s.value !== option.value);
        setSelected(newOptions);
        onChange?.(newOptions);
      },
      [onChange, selected]
    );

    const addEmailOption = useCallback(() => {
      if (inputValue.trim() === "") {
        setIsInputInvalid(false);
        return;
      }

      if (isValidEmail(inputValue)) {
        if (selected.length >= maxSelected) {
          onMaxSelected?.(selected.length);
          toast.error(
            `You can only select up to ${maxSelected} email addresses.`
          );
          return;
        }
        const newOption = { value: inputValue, label: inputValue };
        const newOptions = [...selected, newOption];
        setSelected(newOptions);
        onChange?.(newOptions);
        setInputValue("");
        setIsInputInvalid(false);
      } else {
        setIsInputInvalid(true);
        toast.error("Please enter a valid email address.");
      }
    }, [inputValue, selected, maxSelected, onMaxSelected, onChange]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue) {
          e.preventDefault();
          addEmailOption();
        } else if (
          (e.key === "Backspace" || e.key === "Delete") &&
          inputValue === "" &&
          selected.length > 0
        ) {
          const lastOption = selected[selected.length - 1];
          if (lastOption && !lastOption.fixed) {
            handleUnselect(lastOption);
          }
        }
      },
      [inputValue, selected, handleUnselect, addEmailOption]
    );

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      addEmailOption();
    }, [addEmailOption]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      setIsInputInvalid(false);
    }, []);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        if (isFocused) {
          setIsInputInvalid(false);
        }
      },
      [isFocused]
    );

    return (
      <div className={cn("w-full", className)}>
        <div
          className={cn(
            "flex min-h-10 w-full flex-wrap gap-2 rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-soff-foreground focus-within:ring-offset-2",
            isInputInvalid && !isFocused ? "border-red-500" : "border-input",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onClick={() => {
            if (disabled) return;
            inputRef.current?.focus();
          }}
        >
          {selected.map((option) => (
            <Badge
              key={option.value}
              variant="outline"
              className={cn(
                "bg-blue-50 text-gray-800 hover:bg-blue-200",
                "data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
                badgeClassName
              )}
              data-fixed={option.fixed}
            >
              {option.label}
              {!option.fixed && (
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-soff-foreground focus:ring-offset-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleUnselect(option);
                  }}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </Badge>
          ))}
          <input
            ref={inputRef}
            type="text"
            disabled={disabled}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={
              hidePlaceholderWhenSelected && selected.length !== 0
                ? ""
                : placeholder
            }
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
    );
  }
);

EmailMultiSelector.displayName = "EmailMultiSelector";
export default EmailMultiSelector;
