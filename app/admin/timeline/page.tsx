'use client'
import { useState } from 'react'
import { Plus, Trash2, Pin } from 'lucide-react'
import SectionShell from '@/components/admin/SectionShell'
import { Field } from '@/components/admin/Field'
import { SortableList } from '@/components/admin/Sortable'
import { useSection } from '@/components/admin/useContent'
import { newId } from '@/lib/admin-client'
import type { Timeline, TimelineCategoryType } from '@/lib/content-schema'

const CATEGORIES: TimelineCategoryType[] = ['life', 'education', 'career', 'milestone', 'personal', 'current']

export default function TimelinePage() {
  const ctrl = useSection('timeline')
  const [open, setOpen] = useState(false)
  const v = ctrl.value

  function add() {
    if (!v) return
    const item: Timeline = {
      id: newId('lt'), year: String(new Date().getFullYear()),
      title: '', description: '', category: 'life', pinned: false,
    }
    ctrl.setValue([...v, item])
  }

  function update(id: string, patch: Partial<Timeline>) {
    if (!v) return
    ctrl.setValue(v.map(i => (i.id === id ? { ...i, ...patch } : i)))
  }

  function remove(id: string) {
    if (!v) return
    if (!confirm('Remove this entry?')) return
    ctrl.setValue(v.filter(i => i.id !== id))
  }

  return (
    <SectionShell
      title="Life Timeline"
      subtitle="Year-based story — drag to reorder, pin highlights."
      loading={ctrl.loading}
      saving={ctrl.saving}
      dirty={ctrl.dirty}
      hasDraft={ctrl.hasDraft}
      onSave={ctrl.save}
      onReset={ctrl.reset}
      onMenu={() => setOpen(true)}
      onAfterPublish={ctrl.reload}
    >
      {v && (
        <>
          <SortableList
            items={v}
            onReorder={ctrl.setValue}
            render={(item, _i, handle) => (
              <div className="admin-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  {handle}
                  <div style={{ flex: 1, fontWeight: 600 }}>
                    {item.year} · {item.title || 'Untitled'}
                  </div>
                  <button
                    onClick={() => update(item.id, { pinned: !item.pinned })}
                    className="admin-btn admin-btn-ghost"
                    aria-label="Pin"
                    style={{ color: item.pinned ? 'var(--admin-accent)' : undefined }}
                  >
                    <Pin size={14} />
                  </button>
                  <button onClick={() => remove(item.id)} className="admin-btn admin-btn-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="admin-grid-2">
                  <Field label="Year">
                    <input className="admin-input" value={item.year} onChange={e => update(item.id, { year: e.target.value })} />
                  </Field>
                  <Field label="Category">
                    <select className="admin-select" value={item.category} onChange={e => update(item.id, { category: e.target.value as TimelineCategoryType })}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Title">
                  <input className="admin-input" value={item.title} onChange={e => update(item.id, { title: e.target.value })} />
                </Field>
                <Field label="Description">
                  <textarea className="admin-textarea" value={item.description} onChange={e => update(item.id, { description: e.target.value })} />
                </Field>
              </div>
            )}
          />
          <button onClick={add} className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}>
            <Plus size={14} /> Add entry
          </button>
        </>
      )}
    </SectionShell>
  )
}
