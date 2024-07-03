
import { useRouter } from "next/router";
import React from "react";
import { SupplierDetail } from "../../components/supplier-detail/SupplierDetail";



const SupplierPage = () => {
  const router = useRouter();
  const {supplierId} = router.query;

  if (!supplierId) {
    return <p>Loading...</p>;
  }

  const supplierID = parseInt(supplierId as string, 10);

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <SupplierDetail supplierId={supplierID} />
      </div>
    </>
        
  );
}

export default SupplierPage;