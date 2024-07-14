import { useRouter } from "next/router";
import React from "react";
import { SupplierInfo } from "~/components/supplier-detail/SupplierInfo";
import { SupplierTabs } from "~/components/supplier-detail/SupplierTabs";
import { api } from "~/utils/api";
import { SupplierBreadcrumb } from "~/components/supplier-detail/SupplierBreadcrumb";
import Spinner from "~/components/spinner";

const SupplierPage = () => {
  const router = useRouter();
  const supplierId = parseInt(router.query.supplierId as string, 10);

  if (isNaN(supplierId)) {
    return <Spinner />;
  }

  const { data, isLoading, error } = api.supplier.getSupplierById.useQuery({
    supplierId
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data) {
    return <p>No supplier found.</p>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <SupplierBreadcrumb name={data.name} />
      <SupplierInfo data={data} />
      <SupplierTabs supplierId={data.id} />
    </div>
  );
};

export default SupplierPage;
