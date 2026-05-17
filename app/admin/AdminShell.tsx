'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import { AdminThemeProvider } from '@/components/admin/AdminTheme'
import { ToastProvider } from '@/components/admin/Toast'

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
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <div className="md:ml-[248px]">{children}</div>
      </ToastProvider>
    </AdminThemeProvider>
  )
}
