'use client'
import { useState } from 'react'
import { Plus, Trash2, Star } from 'lucide-react'
import SectionShell from '@/components/admin/SectionShell'
import { Field, TagInput } from '@/components/admin/Field'
import { SortableList } from '@/components/admin/Sortable'
import { useSection } from '@/components/admin/useContent'
import { newId } from '@/lib/admin-client'
import type { Project } from '@/lib/content-schema'

export default function ProjectsPage() {
  const ctrl = useSection('projects')
  const [open, setOpen] = useState(false)
  const v = ctrl.value

  function add() {
    if (!v) return
    const item: Project = {
      id: newId('p'), title: '', description: '', tech: [],
      image: '', url: '', repo: '', featured: false,
    }
    ctrl.setValue([...v, item])
  }

  function update(id: string, patch: Partial<Project>) {
    if (!v) return
    ctrl.setValue(v.map(i => (i.id === id ? { ...i, ...patch } : i)))
  }

  function remove(id: string) {
    if (!v) return
    if (!confirm('Remove this project?')) return
    ctrl.setValue(v.filter(i => i.id !== id))
  }

  return (
    <SectionShell
      title="Projects"
      subtitle="Showcased work — drag to reorder, star to feature."
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
                  <div style={{ flex: 1, fontWeight: 600 }}>{item.title || 'Untitled project'}</div>
                  <button
                    onClick={() => update(item.id, { featured: !item.featured })}
                    className="admin-btn admin-btn-ghost"
                    aria-label="Featured"
                    style={{ color: item.featured ? 'var(--admin-accent)' : undefined }}
                  >
                    <Star size={14} />
                  </button>
                  <button onClick={() => remove(item.id)} className="admin-btn admin-btn-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
                <Field label="Title">
                  <input className="admin-input" value={item.title} onChange={e => update(item.id, { title: e.target.value })} />
                </Field>
                <Field label="Description">
                  <textarea className="admin-textarea" value={item.description} onChange={e => update(item.id, { description: e.target.value })} />
                </Field>
                <Field label="Tech stack">
                  <TagInput values={item.tech} onChange={next => update(item.id, { tech: next })} />
                </Field>
                <div className="admin-grid-2">
                  <Field label="Live URL">
                    <input className="admin-input" value={item.url ?? ''} onChange={e => update(item.id, { url: e.target.value })} placeholder="https://…" />
                  </Field>
                  <Field label="Repository URL">
                    <input className="admin-input" value={item.repo ?? ''} onChange={e => update(item.id, { repo: e.target.value })} placeholder="https://github.com/…" />
                  </Field>
                </div>
                <Field label="Image URL">
                  <input className="admin-input" value={item.image ?? ''} onChange={e => update(item.id, { image: e.target.value })} placeholder="/projects/foo.png" />
                </Field>
              </div>
            )}
          />
          <button onClick={add} className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}>
            <Plus size={14} /> Add project
          </button>
        </>
      )}
    </SectionShell>
  )
}
