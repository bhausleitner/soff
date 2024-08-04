import React from "react";
import { TableComponent } from "~/components/common/TableComponent";
import Spinner from "~/components/spinner";
import { type TableConfig } from "~/types/tableTypes";
import { type UseTRPCQueryResult } from "@trpc/react-query/shared";
import { type TRPCClientErrorLike } from "@trpc/client";

interface GenericTableProps<T, TQueryArgs = void> {
  tableConfig: TableConfig;
  useQueryHook: (
    args: TQueryArgs
  ) => UseTRPCQueryResult<T[], TRPCClientErrorLike<any>>;
  queryArgs: TQueryArgs;
  maxSize?: number;
}

export function GenericTable<T extends { id: number }, TQueryArgs>({
  tableConfig,
  useQueryHook,
  queryArgs
}: GenericTableProps<T, TQueryArgs>) {
  const { data, isLoading } = useQueryHook(queryArgs);

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
