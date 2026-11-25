import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  className?: string
}

export function StatCard({ title, value, icon: Icon, className }: StatCardProps) {
  const displayValue = value ?? 'N/A'
  return (
    <div className={cn("rounded-3xl border border-border/70 bg-card p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-lg sm:p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
          <p className="mt-3 break-words text-3xl font-semibold leading-none tracking-tight tabular-nums">{displayValue}</p>
        </div>
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-primary/20 bg-primary/10">
          <Icon className="size-5 text-primary" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
