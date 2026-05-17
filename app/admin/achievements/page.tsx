'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import SectionShell from '@/components/admin/SectionShell'
import { Field } from '@/components/admin/Field'
import { SortableList } from '@/components/admin/Sortable'
import { useSection } from '@/components/admin/useContent'
import { newId } from '@/lib/admin-client'
import type { AchievementGroup, AchievementItem } from '@/lib/content-schema'

export default function AchievementsPage() {
  const ctrl = useSection('achievements')
  const [open, setOpen] = useState(false)
  const v = ctrl.value

  function addGroup() {
    if (!v) return
    const g: AchievementGroup = {
      id: newId('a'), name: 'New tracker', description: '', color: '#00ff87', items: [],
    }
    ctrl.setValue([...v, g])
  }

  function updateGroup(id: string, patch: Partial<AchievementGroup>) {
    if (!v) return
    ctrl.setValue(v.map(g => (g.id === id ? { ...g, ...patch } : g)))
  }

  function removeGroup(id: string) {
    if (!v) return
    if (!confirm('Remove this tracker and all its items?')) return
    ctrl.setValue(v.filter(g => g.id !== id))
  }

  function addItem(gid: string) {
    if (!v) return
    ctrl.setValue(v.map(g => g.id === gid ? { ...g, items: [...g.items, { id: newId('it'), text: '', completed: false }] } : g))
  }

  function updateItem(gid: string, id: string, patch: Partial<AchievementItem>) {
    if (!v) return
    ctrl.setValue(v.map(g => g.id === gid ? { ...g, items: g.items.map(it => it.id === id ? { ...it, ...patch } : it) } : g))
  }

  function removeItem(gid: string, id: string) {
    if (!v) return
    ctrl.setValue(v.map(g => g.id === gid ? { ...g, items: g.items.filter(it => it.id !== id) } : g))
  }

  function reorderItems(gid: string, next: AchievementItem[]) {
    if (!v) return
    ctrl.setValue(v.map(g => g.id === gid ? { ...g, items: next } : g))
  }

  return (
    <SectionShell
      title="Achievements"
      subtitle="Goal trackers like 7 wonders, marathon milestones, fitness checklists."
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
            render={(g, _i, handle) => {
              const done = g.items.filter(i => i.completed).length
              return (
                <div className="admin-card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    {handle}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{g.name || 'Untitled tracker'}</div>
                      <div style={{ fontSize: 12, color: 'var(--admin-muted)' }}>{done}/{g.items.length} complete</div>
                    </div>
                    <button onClick={() => removeGroup(g.id)} className="admin-btn admin-btn-danger">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="admin-grid-2">
                    <Field label="Tracker name">
                      <input className="admin-input" value={g.name} onChange={e => updateGroup(g.id, { name: e.target.value })} />
                    </Field>
                    <Field label="Accent color">
                      <input className="admin-input" value={g.color ?? ''} onChange={e => updateGroup(g.id, { color: e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Description">
                    <input className="admin-input" value={g.description ?? ''} onChange={e => updateGroup(g.id, { description: e.target.value })} />
                  </Field>

                  <div className="admin-divider" style={{ margin: '16px 0' }} />
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--admin-muted)', fontWeight: 600, marginBottom: 10 }}>
                    Items
                  </div>

                  <SortableList
                    items={g.items}
                    onReorder={next => reorderItems(g.id, next)}
                    gap={8}
                    maxVisible={7}
                    render={(it, _ix, h) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--admin-surface-2)', padding: '8px 10px', borderRadius: 9 }}>
                        {h}
                        <input
                          type="checkbox"
                          className="admin-checkbox"
                          checked={it.completed}
                          onChange={e => updateItem(g.id, it.id, { completed: e.target.checked })}
                          aria-label="Completed"
                        />
                        <input
                          className="admin-input"
                          value={it.text}
                          onChange={e => updateItem(g.id, it.id, { text: e.target.value })}
                          style={{ flex: 1, textDecoration: it.completed ? 'line-through' : undefined, opacity: it.completed ? 0.7 : 1 }}
                        />
                        <button onClick={() => removeItem(g.id, it.id)} className="admin-btn admin-btn-danger">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  />
                  <button onClick={() => addItem(g.id)} className="admin-btn" style={{ marginTop: 10 }}>
                    <Plus size={14} /> Add item
                  </button>
                </div>
              )
            }}
          />
          <button onClick={addGroup} className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}>
            <Plus size={14} /> Add tracker
          </button>
        </>
      )}
    </SectionShell>
  )
}
