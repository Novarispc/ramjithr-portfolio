'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import SectionShell from '@/components/admin/SectionShell'
import { SortableList } from '@/components/admin/Sortable'
import { useSection } from '@/components/admin/useContent'
import { newId } from '@/lib/admin-client'
import type { Language } from '@/lib/content-schema'

export default function LanguagesPage() {
  const ctrl = useSection('languages')
  const [open, setOpen] = useState(false)
  const v = ctrl.value

  function add() {
    if (!v) return
    const item: Language = { id: newId('lang'), name: '', completed: false }
    ctrl.setValue([...v, item])
  }

  function update(id: string, patch: Partial<Language>) {
    if (!v) return
    ctrl.setValue(v.map(i => (i.id === id ? { ...i, ...patch } : i)))
  }

  function remove(id: string) {
    if (!v) return
    if (!confirm('Remove this language?')) return
    ctrl.setValue(v.filter(i => i.id !== id))
  }

  return (
    <SectionShell
      title="Languages"
      subtitle="Spoken languages — toggle fluency, drag to reorder."
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
        <div className="admin-card" style={{ padding: 18 }}>
          <SortableList
            items={v}
            onReorder={ctrl.setValue}
            gap={8}
            maxVisible={7}
            render={(item, _i, handle) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--admin-surface-2)', padding: '8px 10px', borderRadius: 9 }}>
                {handle}
                <input
                  type="checkbox"
                  className="admin-checkbox"
                  checked={item.completed}
                  onChange={e => update(item.id, { completed: e.target.checked })}
                  aria-label="Fluent"
                />
                <input
                  className="admin-input"
                  value={item.name}
                  placeholder="Language name"
                  onChange={e => update(item.id, { name: e.target.value })}
                  style={{ flex: 1 }}
                />
                <button onClick={() => remove(item.id)} className="admin-btn admin-btn-danger">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          />
          <button onClick={add} className="admin-btn" style={{ marginTop: 12 }}>
            <Plus size={14} /> Add language
          </button>
        </div>
      )}
    </SectionShell>
  )
}
