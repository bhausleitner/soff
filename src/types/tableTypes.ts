import { type Row } from "@tanstack/react-table";
import type React from "react";

export interface ColumnConfig {
  header: string;
  accessorKey: string;
  sortable: boolean;
  link?: string;
  cell?: (row: any) => JSX.Element;
  isBadge?: boolean;
  isDate?: boolean;
}

export interface TableConfig {
  placeholder: string;
  checkbox: boolean;
  columns: ColumnConfig[];
  expandable?: boolean;
  link?: string;
  maxRowsBeforePagination?: number;
  renderSubComponent?: (row: Row<any>) => React.ReactNode;
}

export interface TableProps<T extends { id: number }> {
  tableConfig: TableConfig;
  data: T[];
  onSelectedRowIdsChange?: (checked: number[]) => void;
}
