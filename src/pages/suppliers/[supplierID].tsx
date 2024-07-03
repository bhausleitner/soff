
import { useRouter } from "next/router";
import React from "react";
import { SupplierDetail } from "../../components/supplier-detail/SupplierDetail";



const SupplierPage = () => {
  const router = useRouter();
  const {supplierID} = router.query;

  if (!supplierID) {
    return <p>Loading...</p>;
  }

  const supplierId = parseInt(supplierID as string, 10);

  return (
        <SupplierDetail supplierId={supplierId} />
  );
}

export default SupplierPage;