"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface TableColumn {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
}

export interface TableRowData {
  [key: string]: string | number | React.ReactNode;
}

interface DataTableProps {
  columns: TableColumn[];
  data: TableRowData[];
  highlightLastRow?: boolean;
  className?: string;
}

export function DataTable({ columns, data, highlightLastRow = false, className = "" }: DataTableProps) {
  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {columns.map((col) => (
              <TableHead key={col.key} className={`text-xs font-semibold text-gray-600 uppercase ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}`}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={idx} className={highlightLastRow && idx === data.length - 1 ? "bg-gray-100 font-medium" : ""}>
              {columns.map((col) => (
                <TableCell key={col.key} className={col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}>
                  {row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
