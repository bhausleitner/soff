import { type UseQueryResult } from "react-query";

export interface ColumnConfig<T> {
  header: string;
  accessorKey: string;
  sortable: boolean;
  link?: string;
  cell?: (row: T) => JSX.Element;
}

export interface TableConfig<T> {
  placeholder: string;
  checkbox: boolean;
  columns: ColumnConfig<T>[];
}

export interface TableProps<T extends { id: number }> {
  tableConfig: {
    placeholder: string;
    checkbox: boolean;
    columns: Array<{
      header: string;
      accessorKey: string;
      sortable: boolean;
      link?: string;
      cell?: (row: any) => JSX.Element;
    }>;
  };
  data: T[];
}

export type QueryHook<TData, TError = unknown> = (input: {
  supplierId: number;
}) => UseQueryResult<TData[], TError>;
