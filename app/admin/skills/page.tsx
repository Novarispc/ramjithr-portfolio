'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import SectionShell from '@/components/admin/SectionShell'
import { Field } from '@/components/admin/Field'
import { SortableList } from '@/components/admin/Sortable'
import { useSection } from '@/components/admin/useContent'
import { newId } from '@/lib/admin-client'
import type { Skill, SkillCategory } from '@/lib/content-schema'

const PROFICIENCY_LABELS = ['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert']

export default function SkillsPage() {
  const ctrl = useSection('skillCategories')
  const [open, setOpen] = useState(false)
  const v = ctrl.value

  function addCategory() {
    if (!v) return
    const cat: SkillCategory = {
      id: newId('sc'), name: 'New category', description: '', color: '#00ff87', skills: [],
    }
    ctrl.setValue([...v, cat])
  }

  function updateCat(id: string, patch: Partial<SkillCategory>) {
    if (!v) return
    ctrl.setValue(v.map(c => (c.id === id ? { ...c, ...patch } : c)))
  }

  function removeCat(id: string) {
    if (!v) return
    if (!confirm('Remove this category and all its skills?')) return
    ctrl.setValue(v.filter(c => c.id !== id))
  }

  function addSkill(catId: string) {
    updateSkills(catId, skills => [...skills, { id: newId('sk'), name: '', proficiency: 3 }])
  }

  function updateSkill(catId: string, id: string, patch: Partial<Skill>) {
    updateSkills(catId, skills => skills.map(s => (s.id === id ? { ...s, ...patch } : s)))
  }

  function removeSkill(catId: string, id: string) {
    updateSkills(catId, skills => skills.filter(s => s.id !== id))
  }

  function reorderSkills(catId: string, next: Skill[]) {
    updateSkills(catId, () => next)
  }

  function updateSkills(catId: string, fn: (skills: Skill[]) => Skill[]) {
    if (!v) return
    ctrl.setValue(v.map(c => (c.id === catId ? { ...c, skills: fn(c.skills) } : c)))
  }

  return (
    <SectionShell
      title="Skills"
      subtitle="Categorized skill matrix with proficiency 1–5."
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
            render={(cat, _i, handle) => (
              <div className="admin-card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  {handle}
                  <div style={{ flex: 1, fontWeight: 600 }}>{cat.name || 'Untitled category'}</div>
                  <button onClick={() => removeCat(cat.id)} className="admin-btn admin-btn-danger"><Trash2 size={14} /></button>
                </div>
                <div className="admin-grid-2">
                  <Field label="Category name">
                    <input className="admin-input" value={cat.name} onChange={e => updateCat(cat.id, { name: e.target.value })} />
                  </Field>
                  <Field label="Accent color">
                    <input className="admin-input" value={cat.color ?? ''} onChange={e => updateCat(cat.id, { color: e.target.value })} />
                  </Field>
                </div>
                <Field label="Description">
                  <input className="admin-input" value={cat.description ?? ''} onChange={e => updateCat(cat.id, { description: e.target.value })} />
                </Field>

                <div className="admin-divider" style={{ margin: '16px 0' }} />
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--admin-muted)', fontWeight: 600, marginBottom: 10 }}>
                  Skills ({cat.skills.length})
                </div>

                <SortableList
                  items={cat.skills}
                  onReorder={next => reorderSkills(cat.id, next)}
                  gap={8}
                  maxVisible={7}
                  render={(skill, _idx, h) => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--admin-surface-2)', padding: '8px 10px', borderRadius: 9 }}>
                      {h}
                      <input
                        className="admin-input"
                        value={skill.name}
                        onChange={e => updateSkill(cat.id, skill.id, { name: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <select
                        className="admin-select"
                        value={skill.proficiency}
                        onChange={e => updateSkill(cat.id, skill.id, { proficiency: Number(e.target.value) as Skill['proficiency'] })}
                        style={{ width: 160 }}
                      >
                        {PROFICIENCY_LABELS.map((label, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1} · {label}</option>
                        ))}
                      </select>
                      <button onClick={() => removeSkill(cat.id, skill.id)} className="admin-btn admin-btn-danger">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                />
                <button onClick={() => addSkill(cat.id)} className="admin-btn" style={{ marginTop: 10 }}>
                  <Plus size={14} /> Add skill
                </button>
              </div>
            )}
          />
          <button onClick={addCategory} className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}>
            <Plus size={14} /> Add category
          </button>
        </>
      )}
    </SectionShell>
  )
}
