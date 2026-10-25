'use client'

import { useEffect } from 'react'
import { useNotifications } from '@/components/shared/NotificationProvider'

/**
 * Hook to mark notifications as read when viewing an entity detail page
 * Call this in detail pages to automatically mark notifications for that entity as read
 *
 * @param entityType - The type of entity (e.g., 'STUDENT', 'SESSION', 'GRADE')
 * @param entityId - The ID of the entity being viewed
 */
export function useEntityNotification(entityType: string | null, entityId: string | null) {
  const { markEntityAsRead } = useNotifications()

  useEffect(() => {
    if (entityType && entityId) {
      markEntityAsRead(entityType, entityId)
    }
  }, [entityType, entityId, markEntityAsRead])
}
