'use client'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

interface ScrollListProps {
  /** Max number of items to show before the container becomes scrollable. */
  maxVisible?: number
  /** Optional fixed max-height (px). When set, overrides the per-item calculation. */
  maxHeight?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
  /** Apply admin-themed scrollbar instead of public-site scrollbar. */
  theme?: 'public' | 'admin'
}

/**
 * Reusable scrollable list container.
 * - Shows up to `maxVisible` items at full height (default 7).
 * - When children exceed maxVisible, caps height to the sum of the first
 *   maxVisible items' heights + gaps, and exposes an internal scrollbar.
 * - Falls back to natural height for short lists (no scrollbar, no reserved space).
 * - Variable item heights supported (measured live via ResizeObserver).
 */
export default function ScrollList({
  maxVisible = 7,
  maxHeight: fixedMax,
  className = '',
  style,
  children,
  theme = 'public',
}: ScrollListProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [maxH, setMaxH] = useState<number | null>(fixedMax ?? null)

  useLayoutEffect(() => {
    if (fixedMax != null) { setMaxH(fixedMax); return }
    const el = ref.current
    if (!el) return

    const measure = () => {
      const kids = Array.from(el.children) as HTMLElement[]
      if (kids.length <= maxVisible) { setMaxH(null); return }
      // Use bounding rects so margin-based spacers (space-y-*), gap, and
      // grid row-gap are all measured uniformly.
      const cs = window.getComputedStyle(el)
      const padBottom = parseFloat(cs.paddingBottom || '0') || 0
      const wrapTop = el.getBoundingClientRect().top
      const lastVisible = kids[maxVisible - 1].getBoundingClientRect().bottom
      let total = (lastVisible - wrapTop) + padBottom
      // Add a sliver so the next item peeks, hinting at scrollability.
      const next = kids[maxVisible]
      if (next) total += Math.min(next.getBoundingClientRect().height * 0.35, 24)
      setMaxH(Math.ceil(total))
    }

    measure()
    const obs = new ResizeObserver(measure)
    obs.observe(el)
    Array.from(el.children).forEach(c => obs.observe(c as Element))

    const mo = new MutationObserver(() => {
      Array.from(el.children).forEach(c => obs.observe(c as Element))
      measure()
    })
    mo.observe(el, { childList: true })

    return () => { obs.disconnect(); mo.disconnect() }
  }, [maxVisible, fixedMax, children])

  // Suppress wheel-pass-through when the list itself can scroll, to keep the
  // page from jumping when the cursor is over the list.
  useEffect(() => {
    const el = ref.current
    if (!el || maxH == null) return
    const onWheel = (ev: WheelEvent) => {
      const atTop = el.scrollTop === 0
      const atBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 1
      if ((ev.deltaY < 0 && atTop) || (ev.deltaY > 0 && atBottom)) return
      ev.stopPropagation()
    }
    el.addEventListener('wheel', onWheel, { passive: true })
    return () => el.removeEventListener('wheel', onWheel)
  }, [maxH])

  return (
    <div
      ref={ref}
      className={`scroll-list ${theme === 'admin' ? 'scroll-list--admin' : ''} ${className}`.trim()}
      tabIndex={maxH != null ? 0 : -1}
      style={{
        maxHeight: maxH != null ? `${maxH}px` : undefined,
        overflowY: maxH != null ? 'auto' : 'visible',
        overflowX: 'hidden',
        // Reserve space so layout doesn't shift when the scrollbar appears.
        scrollbarGutter: maxH != null ? 'stable' : undefined,
        outline: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
