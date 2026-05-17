'use client'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import SectionShell from '@/components/admin/SectionShell'
import { Field } from '@/components/admin/Field'
import { SortableList } from '@/components/admin/Sortable'
import { useSection } from '@/components/admin/useContent'
import { fetchContent, newId, saveSection } from '@/lib/admin-client'
import { useToast } from '@/components/admin/Toast'
import type { Certification, EducationItem } from '@/lib/content-schema'
import { useEffect } from 'react'

export default function EducationPage() {
  const eduCtrl = useSection('education')
  const certCtrl = useSection('certifications')
  const [open, setOpen] = useState(false)

  const loading = eduCtrl.loading || certCtrl.loading
  const dirty = eduCtrl.dirty || certCtrl.dirty
  const saving = eduCtrl.saving || certCtrl.saving
  const hasDraft = eduCtrl.hasDraft || certCtrl.hasDraft

  async function save(mode: 'draft' | 'publish') {
    if (eduCtrl.dirty) await eduCtrl.save(mode)
    if (certCtrl.dirty) await certCtrl.save(mode)
  }

  function reset() {
    eduCtrl.reset()
    certCtrl.reset()
  }

  function addEdu() {
    if (!eduCtrl.value) return
    const item: EducationItem = {
      id: newId('e'), degree: '', institution: '', period: '', location: '', grade: '',
    }
    eduCtrl.setValue([...eduCtrl.value, item])
  }
  function updateEdu(id: string, patch: Partial<EducationItem>) {
    if (!eduCtrl.value) return
    eduCtrl.setValue(eduCtrl.value.map(i => (i.id === id ? { ...i, ...patch } : i)))
  }
  function removeEdu(id: string) {
    if (!eduCtrl.value) return
    if (!confirm('Remove?')) return
    eduCtrl.setValue(eduCtrl.value.filter(i => i.id !== id))
  }

  function addCert() {
    if (!certCtrl.value) return
    const item: Certification = { id: newId('ce'), name: '', issuer: '', year: '' }
    certCtrl.setValue([...certCtrl.value, item])
  }
  function updateCert(id: string, patch: Partial<Certification>) {
    if (!certCtrl.value) return
    certCtrl.setValue(certCtrl.value.map(i => (i.id === id ? { ...i, ...patch } : i)))
  }
  function removeCert(id: string) {
    if (!certCtrl.value) return
    if (!confirm('Remove?')) return
    certCtrl.setValue(certCtrl.value.filter(i => i.id !== id))
  }

  return (
    <SectionShell
      title="Education & Certifications"
      subtitle="Academic background and professional credentials."
      loading={loading}
      saving={saving}
      dirty={dirty}
      hasDraft={hasDraft}
      onSave={save}
      onReset={reset}
      onMenu={() => setOpen(true)}
      onAfterPublish={() => { eduCtrl.reload(); certCtrl.reload() }}
    >
      {eduCtrl.value && certCtrl.value && (
        <>
          <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--admin-muted)', fontWeight: 700, margin: '8px 0 12px' }}>
            Education
          </h3>
          <SortableList
            items={eduCtrl.value}
            onReorder={eduCtrl.setValue}
            render={(item, _i, handle) => (
              <div className="admin-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  {handle}
                  <div style={{ flex: 1, fontWeight: 600 }}>{item.degree || 'Untitled'}</div>
                  <button onClick={() => removeEdu(item.id)} className="admin-btn admin-btn-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="admin-grid-2">
                  <Field label="Degree">
                    <input className="admin-input" value={item.degree} onChange={e => updateEdu(item.id, { degree: e.target.value })} />
                  </Field>
                  <Field label="Institution">
                    <input className="admin-input" value={item.institution} onChange={e => updateEdu(item.id, { institution: e.target.value })} />
                  </Field>
                  <Field label="Period">
                    <input className="admin-input" value={item.period} onChange={e => updateEdu(item.id, { period: e.target.value })} />
                  </Field>
                  <Field label="Location">
                    <input className="admin-input" value={item.location ?? ''} onChange={e => updateEdu(item.id, { location: e.target.value })} />
                  </Field>
                  <Field label="Grade">
                    <input className="admin-input" value={item.grade ?? ''} onChange={e => updateEdu(item.id, { grade: e.target.value })} />
                  </Field>
                </div>
              </div>
            )}
          />
          <button onClick={addEdu} className="admin-btn admin-btn-primary" style={{ marginTop: 12 }}>
            <Plus size={14} /> Add degree
          </button>

          <div className="admin-divider" style={{ margin: '32px 0 20px' }} />

          <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--admin-muted)', fontWeight: 700, margin: '0 0 12px' }}>
            Certifications
          </h3>
          <SortableList
            items={certCtrl.value}
            onReorder={certCtrl.setValue}
            render={(item, _i, handle) => (
              <div className="admin-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  {handle}
                  <div style={{ flex: 1, fontWeight: 600 }}>{item.name || 'Untitled'}</div>
                  <button onClick={() => removeCert(item.id)} className="admin-btn admin-btn-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="admin-grid-2">
                  <Field label="Name">
                    <input className="admin-input" value={item.name} onChange={e => updateCert(item.id, { name: e.target.value })} />
                  </Field>
                  <Field label="Issuer">
                    <input className="admin-input" value={item.issuer} onChange={e => updateCert(item.id, { issuer: e.target.value })} />
                  </Field>
                  <Field label="Year">
                    <input className="admin-input" value={item.year} onChange={e => updateCert(item.id, { year: e.target.value })} />
                  </Field>
                </div>
              </div>
            )}
          />
          <button onClick={addCert} className="admin-btn admin-btn-primary" style={{ marginTop: 12 }}>
            <Plus size={14} /> Add certification
          </button>
        </>
      )}
    </SectionShell>
  )
}
