import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "~/components/ui/breadcrumb";

interface SupplierBreadcrumbProps {
  name?: string;
  supplierId?: number;
  rfq?: boolean;
  chatId?: number;
}

export function SupplierBreadcrumb({
  name,
  supplierId,
  rfq,
  chatId
}: SupplierBreadcrumbProps) {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {name ? (
              <BreadcrumbLink href="/suppliers">Suppliers</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Suppliers</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {name && (
            <>
              <BreadcrumbSeparator />
              {!rfq && (
                <BreadcrumbItem>
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
              {rfq && (
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/suppliers/${supplierId}`}>
                    {name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              )}
            </>
          )}
          {rfq && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>RFQ #{chatId}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
