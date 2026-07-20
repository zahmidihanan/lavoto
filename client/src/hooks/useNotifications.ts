import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { notificationsApi } from '@/api/services'
import type { Notification } from '@/types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

function playNotificationSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch {
  }
}

export function useNotifications() {
  const { token } = useAuthStore()
  const qc = useQueryClient()
  const esRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (!token) return

    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    const url = `${API_URL}/notifications/stream?token=${encodeURIComponent(token)}`

    try {
      const es = new EventSource(url)
      esRef.current = es

      es.addEventListener('notification', (event: MessageEvent) => {
        try {
          const notification: Notification = JSON.parse(event.data)

          playNotificationSound()

          qc.invalidateQueries({ queryKey: ['notifications'] })
          qc.invalidateQueries({ queryKey: ['notifications-unread'] })

          const data = (notification.data ?? {}) as Record<string, unknown>
          if (data.booking_id) {
            qc.invalidateQueries({ queryKey: ['bookings'] })
          }
        } catch {
        }
      })

      es.addEventListener('connected', () => {
        qc.invalidateQueries({ queryKey: ['notifications-unread'] })
      })

      es.onerror = (event) => {
        console.error('Notification SSE error', event)
        es.close()
        esRef.current = null
        reconnectTimeoutRef.current = setTimeout(connect, 5000)
      }
    } catch {
      reconnectTimeoutRef.current = setTimeout(connect, 5000)
    }
  }, [token, qc])

  const refreshNow = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['notifications-unread'] })
  }, [qc])

  useEffect(() => {
    connect()

    return () => {
      if (esRef.current) {
        esRef.current.close()
        esRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    }
  }, [connect])

  return { refreshNow }
}
