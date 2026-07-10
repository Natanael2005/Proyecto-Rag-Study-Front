import type { ReactNode } from "react"
import { SessionRefresher } from "@/components/auth/session-refresher"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SessionRefresher />

      <div className="flex min-h-screen">
        <DashboardSidebar />

        <main className="flex min-h-screen min-w-0 flex-1 flex-col p-4 pb-28 md:p-6 md:pb-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
