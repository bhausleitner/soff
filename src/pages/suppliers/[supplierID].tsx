import { useRouter } from "next/router";
import React from "react";
import { SupplierInfo } from "../../components/supplier-detail/SupplierInfo";
import { api } from "~/utils/api";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "~/components/ui/breadcrumb";

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

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/suppliers">Suppliers</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{data.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <SupplierInfo data={data} />
    </div>
  );
};

export default SupplierPage;
