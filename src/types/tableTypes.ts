export interface ColumnConfig {
  header: string;
  accessorKey: string;
  sortable: boolean;
  link?: string;
  cell?: (row: any) => JSX.Element;
}

export interface TableConfig {
  placeholder: string;
  checkbox: boolean;
  columns: ColumnConfig[];
  link?: string;
  maxRowsBeforePagination?: number;
}

export interface TableProps<T extends { id: number }> {
  tableConfig: TableConfig;
  data: T[];
}
