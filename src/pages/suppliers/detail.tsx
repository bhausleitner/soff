
import React from "react";
import { SupplierDetail } from "../../components/supplier-detail/SupplierDetail";



const Supplier = () => {

  const supplierId = 4;

  return (
        <SupplierDetail supplierId={supplierId} />
  );
}

export default Supplier;