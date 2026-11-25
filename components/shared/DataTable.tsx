import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "./EmptyState"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

interface Column<T> {
  key: string
  header: string
  cell: (item: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  emptyState?: {
    icon: LucideIcon
    title: string
    description?: string
  }
  loading?: boolean
}

export function DataTable<T>({ data, columns, emptyState, loading }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-border/70 bg-card py-12 text-sm text-muted-foreground shadow-[var(--shadow-soft)]">
        Loading...
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return (
      <EmptyState
        icon={emptyState.icon}
        title={emptyState.title}
        description={emptyState.description}
      />
    )
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[var(--shadow-soft)]">
      <div className="hidden overflow-x-auto lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={column.key}>{column.cell(item)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3 p-3 lg:hidden" role="list">
        {data.map((item, index) => (
          <article
            key={index}
            className="rounded-2xl border border-border/70 bg-background p-4"
            role="listitem"
          >
            <dl className="flex flex-col gap-3">
              {columns.map((column) => (
                <div
                  key={column.key}
                  className="grid grid-cols-[minmax(5.25rem,0.35fr)_minmax(0,1fr)] items-start gap-3"
                >
                  <dt className="pt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {column.header || "Actions"}
                  </dt>
                  <dd className="min-w-0 break-words text-right text-sm font-medium [&_a]:break-all">
                    {column.cell(item)}
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </div>
  )
}
