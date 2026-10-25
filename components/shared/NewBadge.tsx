'use client'

import { Badge } from '@/components/ui/badge'
import { useNotifications } from './NotificationProvider'

interface NewBadgeProps {
  entityType: string
  entityId: string
}

export function NewBadge({ entityType, entityId }: NewBadgeProps) {
  const { hasUnreadForEntity } = useNotifications()

  // Check if there's an unread notification for this specific entity
  const hasUnreadNotification = hasUnreadForEntity(entityType, entityId)

  if (!hasUnreadNotification) {
    return null
  }

  return (
    <Badge variant="destructive" className="text-xs font-semibold">
      NEW
    </Badge>
  )
}
