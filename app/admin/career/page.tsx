'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import SectionShell from '@/components/admin/SectionShell'
import { Field, ListEditor, TagInput } from '@/components/admin/Field'
import { SortableList } from '@/components/admin/Sortable'
import { useSection } from '@/components/admin/useContent'
import { newId } from '@/lib/admin-client'
import type { Career } from '@/lib/content-schema'

export default function CareerPage() {
  const ctrl = useSection('career')
  const [open, setOpen] = useState(false)
  const v = ctrl.value

  function addItem() {
    if (!v) return
    const item: Career = {
      id: newId('c'), company: '', short: '', role: '', period: '',
      location: '', focus: '', color: '#00ff87', achievements: [], tools: [],
    }
    ctrl.setValue([...v, item])
  }

  function update(id: string, patch: Partial<Career>) {
    if (!v) return
    ctrl.setValue(v.map(i => (i.id === id ? { ...i, ...patch } : i)))
  }

  function remove(id: string) {
    if (!v) return
    if (!confirm('Remove this role?')) return
    ctrl.setValue(v.filter(i => i.id !== id))
  }

  return (
    <SectionShell
      title="Career"
      subtitle="Roles, achievements, and tools — drag to reorder."
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
              <div className="admin-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  {handle}
                  <div style={{ flex: 1, fontWeight: 600 }}>
                    {item.company || 'Untitled role'}
                  </div>
                  <button onClick={() => remove(item.id)} className="admin-btn admin-btn-danger" aria-label="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="admin-grid-2">
                  <Field label="Company">
                    <input className="admin-input" value={item.company} onChange={e => update(item.id, { company: e.target.value })} />
                  </Field>
                  <Field label="Short label">
                    <input className="admin-input" value={item.short ?? ''} onChange={e => update(item.id, { short: e.target.value })} />
                  </Field>
                  <Field label="Role">
                    <input className="admin-input" value={item.role} onChange={e => update(item.id, { role: e.target.value })} />
                  </Field>
                  <Field label="Period">
                    <input className="admin-input" value={item.period} onChange={e => update(item.id, { period: e.target.value })} placeholder="Feb 2023 – Present" />
                  </Field>
                  <Field label="Location">
                    <input className="admin-input" value={item.location ?? ''} onChange={e => update(item.id, { location: e.target.value })} />
                  </Field>
                  <Field label="Focus area">
                    <input className="admin-input" value={item.focus ?? ''} onChange={e => update(item.id, { focus: e.target.value })} />
                  </Field>
                  <Field label="Accent color (hex)">
                    <input className="admin-input" value={item.color ?? ''} onChange={e => update(item.id, { color: e.target.value })} />
                  </Field>
                </div>
                <Field label="Achievements">
                  <ListEditor values={item.achievements} onChange={next => update(item.id, { achievements: next.filter(Boolean) })} placeholder="Add achievement" />
                </Field>
                <Field label="Tools / tech">
                  <TagInput values={item.tools} onChange={next => update(item.id, { tools: next })} />
                </Field>
              </div>
            )}
          />
          <button onClick={addItem} className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}>
            <Plus size={14} /> Add role
          </button>
        </>
      )}
    </SectionShell>
  )
}
