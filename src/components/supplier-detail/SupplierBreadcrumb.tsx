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
}

export function SupplierBreadcrumb({ name }: SupplierBreadcrumbProps) {
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
              <BreadcrumbItem>
                <BreadcrumbPage>{name}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
