import { useRouter } from "next/router";
import { type z } from "zod";

import { type supplierSchema } from "~/server/api/routers/supplier";
type SupplierType = z.infer<typeof supplierSchema>;

interface SupplierLinkProps {
  row: {
    original: SupplierType;
  };
}

export function SupplierLink({ row }: SupplierLinkProps) {
  const supplier = row.original;
  const router = useRouter();

  const handleNavigation = async () => {
    await router.push(`/suppliers/${supplier.id}`);
  };

  return (
    <p
      onClick={handleNavigation}
      className="cursor-pointer text-blue-600 hover:text-blue-800"
    >
      {supplier.name}
    </p>
  );
}
