import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Currency } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Icons } from "~/components/icons";
import EditableCell from "./editable-cell";
import { type ParsedQuoteData } from "~/server/api/routers/quote";

type PricingTier = ParsedQuoteData["lineItems"][number]["pricingTiers"][number];

type PricingTiersProps = {
  pricingTiers: PricingTier[] | undefined;
  currency: Currency;
  onPricingTierEdit: (
    tierIndex: number,
    field: string,
    value: string | number
  ) => void;
  onPricingTierBlur: () => void;
  onDeletePricingTier: (tierIndex: number) => void;
  onAddPricingTier: () => void;
};

const PricingTiers: React.FC<PricingTiersProps> = ({
  pricingTiers,
  currency,
  onPricingTierEdit,
  onPricingTierBlur,
  onDeletePricingTier,
  onAddPricingTier
}) => {
  return (
    <Card className="m-2 overflow-hidden">
      <CardContent className="p-0">
        <Table>
          <TableHeader className="border-b">
            <TableRow>
              <TableHead className="w-1/4 py-2 text-center text-xs font-medium">
                Min Quantity
              </TableHead>
              <TableHead className="w-1/4 py-2 text-center text-xs font-medium">
                Max Quantity
              </TableHead>
              <TableHead className="w-1/4 py-2 text-center text-xs font-medium">
                Unit Price
              </TableHead>
              <TableHead className="w-1/4 py-2 text-center text-xs font-medium"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {pricingTiers?.map((tier, tierIndex) => (
                <motion.tr
                  key={tierIndex}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  layout
                  className="border-b last:border-b-0"
                >
                  <TableCell className="py-1">
                    <EditableCell
                      value={tier.minQuantity ?? 0}
                      onEdit={(value) => {
                        onPricingTierEdit(tierIndex, "minQuantity", value ?? 0);
                        onPricingTierBlur();
                      }}
                      type="number"
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <EditableCell
                      value={tier.maxQuantity ?? "∞"}
                      onEdit={(value) =>
                        onPricingTierEdit(tierIndex, "maxQuantity", value ?? 0)
                      }
                      type="number"
                      isMaxQuantity={true}
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <EditableCell
                      value={tier.price ?? 0}
                      onEdit={(value) =>
                        onPricingTierEdit(tierIndex, "price", value ?? 0)
                      }
                      type={currency}
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-red-600"
                      onClick={() => onDeletePricingTier(tierIndex)}
                    >
                      <Icons.trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
        <motion.div
          whileHover={{
            backgroundColor: "rgba(59, 130, 246, 0.1)"
          }}
          transition={{ duration: 0.2 }}
          className="m-2 rounded-md"
        >
          <Button
            variant="ghost"
            className="w-full rounded-xl py-2 text-blue-500 hover:text-blue-700"
            onClick={onAddPricingTier}
          >
            <Icons.add className="mr-2 h-4 w-4" />
            Add Pricing Tier
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default PricingTiers;
