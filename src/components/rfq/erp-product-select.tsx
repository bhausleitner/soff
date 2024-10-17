import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "~/components/ui/popover";
import { Icons } from "~/components/icons";
import { type ErpProduct } from "@prisma/client";

type ProductDropdownProps = {
  erpProducts: ErpProduct[];
  selectedErpProductId: number;
  onErpProductSelect: (
    productName: string,
    productCode: string,
    productId: number
  ) => void;
};

const ErpProductSelect = ({
  erpProducts,
  onErpProductSelect
}: ProductDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ErpProduct>();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[250px] justify-between"
        >
          <span className="truncate">
            {selectedProduct ? selectedProduct.productName : "Select a product"}
          </span>
          <Icons.chevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[450px] p-0" align="start" sideOffset={5}>
        <Command>
          <CommandInput placeholder="Search products..." />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {erpProducts?.map((erpProduct) => (
                <CommandItem
                  key={erpProduct.id}
                  onSelect={() => {
                    setSelectedProduct(erpProduct);
                    onErpProductSelect(
                      erpProduct.productName,
                      erpProduct.productCode ?? "",
                      erpProduct.id
                    );
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col items-start">
                    <p className="w-full truncate">{erpProduct.productName}</p>
                    {erpProduct.productCode && (
                      <p className="w-full truncate text-sm text-muted-foreground">
                        {erpProduct.productCode}
                      </p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ErpProductSelect;
