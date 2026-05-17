import type { Metadata } from 'next'
import './admin.css'
import AdminShell from './AdminShell'

export const metadata: Metadata = {
  title: 'Admin Studio · Portfolio',
  description: 'Private admin dashboard',
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
