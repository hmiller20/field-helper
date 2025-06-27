"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ServiceWorkerUpdater() {
  const [showReload, setShowReload] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          
          // Check if there's an update available
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, show update prompt
                  setWaitingWorker(newWorker)
                  setShowReload(true)
                }
              })
            }
          })

          // Handle controller change (when new SW takes over)
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload()
          })

        } catch (error) {
          console.log('SW registration failed: ', error)
        }
      }

      registerSW()
    }
  }, [])

  const handleReload = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
      setShowReload(false)
    }
  }

  if (!showReload) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
      <p className="mb-2 text-sm">A new version is available!</p>
      <Button 
        onClick={handleReload}
        variant="secondary"
        size="sm"
        className="bg-white text-blue-600 hover:bg-gray-100"
      >
        Update Now
      </Button>
    </div>
  )
} 