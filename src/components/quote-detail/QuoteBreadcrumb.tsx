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
  quoteIds?: number[];
}

export function QuoteBreadcrumb({ quoteIds }: QuoteBreadcrumbProps) {
  return (
    <div className="mt-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {quoteIds ? (
              <BreadcrumbLink href="/quotes">Quotes</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Quotes</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {quoteIds && quoteIds.length > 0 && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {quoteIds.length === 1
                    ? `Quote #${quoteIds[0]}`
                    : `Compare ${quoteIds.map((id) => `${id}`).join(" v. ")}`}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
