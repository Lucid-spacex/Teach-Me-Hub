import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  className?: string
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/70 px-6 py-12 text-center", className)}>
      <div className="mb-5 grid size-16 place-items-center rounded-2xl border border-primary/25 bg-primary/10 shadow-sm">
        <Icon className="size-7 text-primary" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
