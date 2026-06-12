import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
} from "@mui/material";

export interface DataTableColumn<T> {
  /** Unique key for the column */
  key: string;
  /** Header label displayed in the table head */
  label: string;
  /** Column width (CSS value) */
  width?: string | number;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Custom render function for cell content */
  render: (row: T, index: number) => React.ReactNode;
  /** Whether this column header should stick to the left (for first column) */
  sticky?: boolean;
  /** Whether content in this column should truncate with ellipsis */
  truncate?: boolean;
}

export interface DataTableProps<T> {
  /** Title displayed in the table header bar */
  title: string;
  /** Badge text displayed on the right side of the header (e.g. "20 total bookings") */
  badge?: string;
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Row data */
  data: T[];
  /** Unique key extractor for each row */
  getRowKey: (row: T) => string | number;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Total count for pagination */
  total?: number;
  /** Current page (1-indexed) */
  page?: number;
  /** Rows per page */
  limit?: number;
  /** Page change handler */
  onPageChange?: (event: unknown, newPage: number) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Max height for the scrollable table area */
  maxHeight?: string;
}

export function DataTable<T>({
  title,
  badge,
  columns,
  data,
  getRowKey,
  loading = false,
  emptyMessage = "No data found.",
  total,
  page = 1,
  limit = 12,
  onPageChange,
  onRowClick,
  maxHeight = "calc(100vh - 450px)",
}: DataTableProps<T>) {
  const headerCellClass =
    "bg-[var(--surface-muted)] text-[11px] font-bold text-[var(--text-muted)] border-b border-[var(--border-subtle)] tracking-wider uppercase whitespace-nowrap";
  const bodyCellClass = "border-b border-[var(--border-subtle)] py-4 h-[85px]";

  if (loading && data.length === 0) {
    return (
      <Box className="w-full bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] flex items-center justify-center py-10">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="w-full bg-[var(--surface)] rounded-2xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
      {/* Header bar */}
      <Box className="flex justify-between items-center p-5 border-b border-[var(--border-subtle)]">
        <Typography variant="h3" fontWeight="bold" className="text-[var(--text-primary)]">
          {title}
        </Typography>
        {badge && (
          <Box className="px-3 py-1 rounded-md bg-[var(--experimental-50)] text-[var(--experimental-800)] text-xs font-semibold">
            {badge}
          </Box>
        )}
      </Box>

      {/* Table */}
      <TableContainer className="overflow-auto custom-scrollbar" sx={{ maxHeight }}>
        <Table stickyHeader sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align || "left"}
                  className={headerCellClass}
                  sx={{
                    width: col.width,
                    ...(col.sticky
                      ? {
                          position: "sticky",
                          left: 0,
                          zIndex: 3,
                        }
                      : {}),
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-500 border-b-0"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={getRowKey(row)}
                  className="hover:bg-[var(--surface-muted)] transition-colors"
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      align={col.align || "left"}
                      className={bodyCellClass}
                      sx={{
                        ...(col.sticky
                          ? {
                              position: "sticky",
                              left: 0,
                              backgroundColor: "var(--surface)",
                              zIndex: 1,
                            }
                          : {}),
                        ...(col.truncate
                          ? {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 0,
                            }
                          : {}),
                      }}
                    >
                      {col.render(row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {total != null && total > 0 && onPageChange && (
        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          onPageChange={onPageChange}
          rowsPerPage={limit}
          rowsPerPageOptions={[limit]}
        />
      )}
    </Box>
  );
}

export default DataTable;
