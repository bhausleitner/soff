import React from "react";
import { TableComponent } from "~/components/common/TableComponent";
import Spinner from "~/components/spinner";
import { type TableConfig, type QueryHook } from "~/types/tableTypes";

interface GenericTableProps<TData extends { id: number }> {
  tableConfig: TableConfig<TData>;
  useQueryHook: QueryHook<TData>;
  supplierId: number;
}

export function GenericTable<TData extends { id: number }>({
  tableConfig,
  useQueryHook,
  supplierId
}: GenericTableProps<TData>) {
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
