import React from "react";
import { TableHead } from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select";
import { Currency } from "@prisma/client";

interface PriceHeaderProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const PriceHeader: React.FC<PriceHeaderProps> = ({
  currency,
  onCurrencyChange
}) => {
  return (
    <TableHead className="flex items-center justify-center">
      <span>Unit Price</span>
      <Select
        value={currency}
        onValueChange={(value: Currency) => onCurrencyChange(value)}
      >
        <SelectTrigger className="ml-2 w-[70px]">
          <SelectValue placeholder="Select currency" />
        </SelectTrigger>
        <SelectContent className="w-[70px]">
          <SelectItem value={Currency.USD}>$</SelectItem>
          <SelectItem value={Currency.EUR}>€</SelectItem>
        </SelectContent>
      </Select>
    </TableHead>
  );
};

export default PriceHeader;
