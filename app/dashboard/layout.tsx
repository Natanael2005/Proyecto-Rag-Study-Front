import type { ReactNode } from "react"
import { SessionRefresher } from "@/components/auth/session-refresher"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
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

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader />

          <main className="flex-1 p-6 pb-28 md:pb-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
