import { Badge } from "@/components/ui/badge"
import { CheckCircle, PauseCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = () => {
    const statusUpper = status?.toUpperCase() || 'UNKNOWN'
    switch (statusUpper) {
      case "ACTIVE":
      case "COMPLETED":
      case "APPROVED":
      case "SUCCESS":
      case "PAID":
        return {
          icon: CheckCircle,
          variant: "success" as const,
          label: status,
        }
      case "PAUSED":
      case "PENDING":
      case "PENDING_APPROVAL":
      case "PENDING_VETTING":
      case "UNSCHEDULED":
        return {
          icon: Clock,
          variant: "warning" as const,
          label: status,
        }
      case "PENDING_PAYMENT":
        return {
          icon: Clock,
          variant: "warning" as const,
          label: "Pending Payment",
        }
      case "CANCELLED":
      case "REJECTED":
      case "MISSED":
      case "FAILED":
        return {
          icon: XCircle,
          variant: "destructive" as const,
          label: status,
        }
      case "SCHEDULED":
      case "REFUNDED":
        return {
          icon: Clock,
          variant: "info" as const,
          label: status,
        }
      case "DRAFT":
      case "EXPIRED":
        return {
          icon: PauseCircle,
          variant: "outline" as const,
          label: status,
        }
      default:
        return {
          icon: AlertCircle,
          variant: "outline" as const,
          label: status,
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)}>
      <Icon className="size-3" aria-hidden="true" />
      {config.label}
    </Badge>
  )
}
