import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";

const ErpProductSelect = ({
  onErpProductSelect
}: {
  onErpProductSelect: (
    productName: string,
    productCode: string,
    productId: number
  ) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(false);

  const { data: erpProducts, isLoading } =
    api.product.searchErpProducts.useQuery(
      { query: searchTerm },
      { enabled: open }
    );

  const handleValueChange = (value: string) => {
    const selectedProduct = erpProducts?.find((p) => p.id.toString() === value);
    if (selectedProduct) {
      onErpProductSelect(
        selectedProduct.productName,
        selectedProduct.productCode ?? "",
        selectedProduct.id
      );
      setSelected(true);
    }
  };

  return (
    <div className="w-[240px]">
      <Select onValueChange={handleValueChange} onOpenChange={setOpen}>
        <SelectTrigger className={`text-start ${!selected && "text-gray-400"}`}>
          <SelectValue placeholder="Select a product" />
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : erpProducts && erpProducts.length > 0 ? (
            erpProducts.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {`[${product.productCode}] ${product.productName}`}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-results" disabled>
              No products found
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ErpProductSelect;
