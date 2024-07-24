import type { Icons } from "~/components/icons";
import { type z } from "zod";
import { type supplierSchema } from "~/server/api/routers/supplier";

export interface NavItem {
  title: string;
  href: string;
  icon: keyof typeof Icons;
  label: string;
  disabled?: boolean;
}

export type SupplierType = z.infer<typeof supplierSchema>;
