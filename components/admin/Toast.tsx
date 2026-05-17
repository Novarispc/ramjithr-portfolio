'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Variant = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: Variant
}

interface ToastCtx {
  toast: (message: string, variant?: Variant) => void
}

const Ctx = createContext<ToastCtx | null>(null)

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, variant: Variant = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setItems(curr => [...curr, { id, message, variant }])
  }, [])

  useEffect(() => {
    if (!items.length) return
    const timers = items.map(item =>
      setTimeout(() => setItems(curr => curr.filter(i => i.id !== item.id)), 3200),
    )
    return () => timers.forEach(clearTimeout)
  }, [items])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="admin-toast-wrap" role="status" aria-live="polite">
        {items.map(item => (
          <div key={item.id} className="admin-toast" data-variant={item.variant}>
            {item.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
