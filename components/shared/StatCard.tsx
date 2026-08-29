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
    <div className={cn("rounded-lg border p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-2">{displayValue}</p>
        </div>
        <div className="rounded-lg border p-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}
