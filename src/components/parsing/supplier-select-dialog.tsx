import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "~/components/ui/command";
import { Icons } from "~/components/icons";
import AddQuote from "./add-quote";

interface Supplier {
  id: number;
  name: string;
  description?: string;
}

interface SupplierSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[] | undefined;
  isLoadingSuppliers: boolean;
  selectedSupplierId: number | null;
  setSelectedSupplierId: (id: number) => void;
  onAddQuote: () => void;
}

const SupplierSelectionDialog: React.FC<SupplierSelectionDialogProps> = ({
  isOpen,
  onClose,
  suppliers,
  isLoadingSuppliers,
  selectedSupplierId,
  setSelectedSupplierId,
  onAddQuote
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedSupplier = suppliers?.find((s) => s.id === selectedSupplierId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Specify Supplier for this Quote</DialogTitle>
        </DialogHeader>
        <div className="py-4" ref={dropdownRef}>
          <Button
            ref={buttonRef}
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedSupplier ? selectedSupplier.name : "Select a supplier"}
            <Icons.chevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
          </Button>
          {isDropdownOpen && (
            <div
              className="absolute z-50 mt-2 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95"
              style={{
                width: buttonRef.current
                  ? buttonRef.current.offsetWidth
                  : "auto"
              }}
            >
              <Command className="w-full">
                <CommandInput placeholder="Search suppliers..." />
                <CommandList>
                  <CommandEmpty>No suppliers found.</CommandEmpty>
                  <CommandGroup className="p-1.5">
                    {isLoadingSuppliers ? (
                      <CommandItem disabled>
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        Loading suppliers...
                      </CommandItem>
                    ) : (
                      suppliers?.map((supplier) => (
                        <CommandItem
                          key={supplier.id}
                          onSelect={() => {
                            setSelectedSupplierId(supplier.id);
                            setIsDropdownOpen(false);
                          }}
                          className="flex flex-col items-start px-4 py-2"
                        >
                          <p>{supplier.name}</p>
                          {supplier.description && (
                            <p className="text-sm text-muted-foreground">
                              {supplier.description}
                            </p>
                          )}
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>
        <DialogFooter className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <AddQuote onClick={onAddQuote} disabled={!selectedSupplierId} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierSelectionDialog;
