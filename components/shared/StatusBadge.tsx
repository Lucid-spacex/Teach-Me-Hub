import { Badge } from "@/components/ui/badge"
import { CheckCircle, PauseCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
      case "COMPLETED":
      case "APPROVED":
        return {
          icon: CheckCircle,
          variant: "primary" as const,
          label: status,
        }
      case "PAUSED":
      case "PENDING":
      case "PENDING_VETTING":
        return {
          icon: Clock,
          variant: "primary" as const,
          label: status,
        }
      case "CANCELLED":
      case "REJECTED":
      case "MISSED":
        return {
          icon: XCircle,
          variant: "primary" as const,
          label: status,
        }
      case "SCHEDULED":
        return {
          icon: Clock,
          variant: "primary" as const,
          label: status,
        }
      default:
        return {
          icon: AlertCircle,
          variant: "primary" as const,
          label: status,
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
