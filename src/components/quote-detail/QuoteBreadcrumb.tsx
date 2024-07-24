import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "~/components/ui/breadcrumb";

interface QuoteBreadcrumbProps {
  quoteId?: number;
}

export function QuoteBreadcrumb({ quoteId }: QuoteBreadcrumbProps) {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {quoteId ? (
              <BreadcrumbLink href="/quotes">Quotes</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Quotes</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {quoteId && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Quote #{quoteId}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
