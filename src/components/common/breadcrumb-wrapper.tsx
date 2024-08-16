import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbList,
  BreadcrumbSeparator
} from "~/components/ui/breadcrumb";

import { Home } from "lucide-react";

interface BreadCrumbWrapperProsp {
  items: {
    label: string;
    href: string;
  }[];
}

export default function BreadCrumbWrapper({ items }: BreadCrumbWrapperProsp) {
  // Ensure we only use up to 4 items and filter out any empty inputs
  const validItems = items.slice(0, 4).filter((item) => item?.label);

  return (
    <div className="mt-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {validItems.map((item, index) => (
            <React.Fragment key={index}>
              {index === validItems.length - 1 ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
