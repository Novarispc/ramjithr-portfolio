'use client'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { ReactNode, useLayoutEffect, useRef, useState } from 'react'

interface SortableListProps<T extends { id: string }> {
  items: T[]
  onReorder: (next: T[]) => void
  render: (item: T, index: number, dragHandle: ReactNode) => ReactNode
  gap?: number
  /** When set, the list scrolls internally once it exceeds this many items. */
  maxVisible?: number
}

export function SortableList<T extends { id: string }>({
  items, onReorder, render, gap = 12, maxVisible,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex(i => i.id === active.id)
    const newIndex = items.findIndex(i => i.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  const wrapRef = useRef<HTMLDivElement>(null)
  const [maxH, setMaxH] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (!maxVisible) { setMaxH(null); return }
    const el = wrapRef.current
    if (!el) return

    const measure = () => {
      const kids = Array.from(el.children) as HTMLElement[]
      if (kids.length <= maxVisible) { setMaxH(null); return }
      const wrapTop = el.getBoundingClientRect().top
      const lastVisible = kids[maxVisible - 1].getBoundingClientRect().bottom
      let total = lastVisible - wrapTop
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
  }, [maxVisible, items.length])

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={wrapRef}
          className={maxH != null ? 'scroll-list scroll-list--admin' : ''}
          tabIndex={maxH != null ? 0 : -1}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap,
            maxHeight: maxH != null ? `${maxH}px` : undefined,
            overflowY: maxH != null ? 'auto' : 'visible',
            overflowX: 'hidden',
            scrollbarGutter: maxH != null ? 'stable' : undefined,
            outline: 'none',
          }}
        >
          {items.map((item, idx) => (
            <SortableRow key={item.id} id={item.id}>
              {handle => render(item, idx, handle)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({ id, children }: { id: string; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }
  const handle = (
    <span
      {...attributes}
      {...listeners}
      className="admin-sortable-handle"
      aria-label="Drag to reorder"
    >
      <GripVertical size={16} />
    </span>
  )
  return (
    <div ref={setNodeRef} style={style}>
      {children(handle)}
    </div>
  )
}
