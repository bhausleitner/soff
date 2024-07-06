import { useRouter } from "next/router";
import React from "react";
import { SupplierInfo } from "~/components/supplier-detail/SupplierInfo";
import { SupplierTabs } from "~/components/supplier-detail/SupplierTabs";
import { api } from "~/utils/api";
import { SupplierBreadcrumb } from "~/components/supplier-detail/SupplierBreadcrumb";

const SupplierPage = () => {
  const router = useRouter();
  const { supplierId } = router.query;

  if (!supplierId) {
    return <p>Loading...</p>;
  }

  const supplierID = parseInt(supplierId as string, 10);

  const { data, isLoading, error } = api.supplier.getSupplierById.useQuery({
    supplierId: supplierID
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data) {
    return <p>No supplier found.</p>;
  }

  const transformedData = {
    supplierName: data.title,
    email: data.email,
    status: data.status,
    responseTime: data.responseTime
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <SupplierBreadcrumb supplierName={data.title} />
      <SupplierInfo data={transformedData} />
      <SupplierTabs />
    </div>
  );
};

export default SupplierPage;
