import React, { useEffect } from "react";
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
  refetchTrigger?: boolean;
  handleSelectedRowIdsChange?: (checked: number[]) => void;
}

export function GenericTable<T extends { id: number }, TQueryArgs>({
  tableConfig,
  useQueryHook,
  queryArgs,
  refetchTrigger = false,
  handleSelectedRowIdsChange
}: GenericTableProps<T, TQueryArgs>) {
  const { data, isLoading, refetch } = useQueryHook(queryArgs);

  useEffect(() => {
    if (refetchTrigger) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      refetch();
    }
  }, [refetchTrigger, refetch]);

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <TableComponent
          tableConfig={tableConfig}
          data={data ?? []}
          onSelectedRowIdsChange={handleSelectedRowIdsChange}
        />
      )}
    </>
  );
}
