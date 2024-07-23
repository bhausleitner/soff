import React from "react";
import { TableComponent } from "~/components/common/TableComponent";
import Spinner from "~/components/spinner";
import { type TableConfig } from "~/types/tableTypes";
import { type UseTRPCQueryResult } from "@trpc/react-query/shared";
import { type TRPCClientErrorLike } from "@trpc/client";

interface GenericTableProps<T> {
  tableConfig: TableConfig;
  useQueryHook: (args: { supplierId: number }) => UseTRPCQueryResult<
    T[],
    TRPCClientErrorLike<{
      input: {
        supplierId: number;
      };
      output: T[];
      transformer: true;
      errorShape: {
        // Define the shape of the error here
      };
    }>
  >;
  supplierId: number;
}

export function GenericTable<T extends { id: number }>({
  tableConfig,
  useQueryHook,
  supplierId
}: GenericTableProps<T>) {
  const { data, isLoading } = useQueryHook({ supplierId });

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <TableComponent tableConfig={tableConfig} data={data ?? []} />
      )}
    </>
  );
}
