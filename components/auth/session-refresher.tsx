"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { refreshSession } from "@/lib/auth-api"

const REFRESH_INTERVAL = 14 * 60 * 1000

export function SessionRefresher() {
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const refresh = async () => {
      try {
        await refreshSession()
      } catch {
        if (!isMounted) return

        router.replace("/auth/login")
      }
    }

    void refresh()

    const intervalId = window.setInterval(() => {
      void refresh()
    }, REFRESH_INTERVAL)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [router])

  return null
}