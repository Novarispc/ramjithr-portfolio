'use client'
import { createContext, useContext, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import { AdminThemeProvider } from '@/components/admin/AdminTheme'
import { ToastProvider } from '@/components/admin/Toast'

interface SidebarCtx {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}
const Ctx = createContext<SidebarCtx | null>(null)

export function useAdminSidebar(): SidebarCtx {
  const ctx = useContext(Ctx)
  if (!ctx) return { open: false, setOpen: () => {}, toggle: () => {} }
  return ctx
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isLogin = pathname === '/admin/login'

  if (isLogin) {
    return (
      <AdminThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </AdminThemeProvider>
    )
  }

  return (
    <AdminThemeProvider>
      <ToastProvider>
        <Ctx.Provider value={{ open, setOpen, toggle: () => setOpen(o => !o) }}>
          <Sidebar open={open} onClose={() => setOpen(false)} />
          <div className="md:ml-[248px] min-h-screen">{children}</div>
        </Ctx.Provider>
      </ToastProvider>
    </AdminThemeProvider>
  )
}
