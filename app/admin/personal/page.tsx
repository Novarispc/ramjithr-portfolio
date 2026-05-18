'use client'
import { useState } from 'react'
import SectionShell from '@/components/admin/SectionShell'
import { Field } from '@/components/admin/Field'
import SingleImageUploader from '@/components/admin/SingleImageUploader'
import ResumeUploader from '@/components/admin/ResumeUploader'
import { useSection } from '@/components/admin/useContent'

export default function PersonalPage() {
  const ctrl = useSection('personal')
  const [open, setOpen] = useState(false)
  const v = ctrl.value

  return (
    <SectionShell
      title="Personal Info"
      subtitle="Identity, headline, and contact details."
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
        <div className="admin-card" style={{ padding: 20 }}>
          <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--admin-border)' }}>
            <SingleImageUploader
              label="Profile photo"
              value={v.image ?? ''}
              onChange={url => ctrl.setValue({ ...v, image: url })}
            />
          </div>
          <div className="admin-grid-2">
            <Field label="Full name">
              <input className="admin-input" value={v.name} onChange={e => ctrl.setValue({ ...v, name: e.target.value })} />
            </Field>
            <Field label="Title / role">
              <input className="admin-input" value={v.title} onChange={e => ctrl.setValue({ ...v, title: e.target.value })} />
            </Field>
          </div>
          <Field label="Tagline">
            <input className="admin-input" value={v.tagline ?? ''} onChange={e => ctrl.setValue({ ...v, tagline: e.target.value })} />
          </Field>
          <Field label="Bio" hint="Short paragraph describing what you do.">
            <textarea className="admin-textarea" value={v.bio ?? ''} onChange={e => ctrl.setValue({ ...v, bio: e.target.value })} />
          </Field>
          <div className="admin-grid-2">
            <Field label="Location">
              <input className="admin-input" value={v.location} onChange={e => ctrl.setValue({ ...v, location: e.target.value })} />
            </Field>
            <Field label="Current company">
              <input className="admin-input" value={v.currentCompany ?? ''} onChange={e => ctrl.setValue({ ...v, currentCompany: e.target.value })} />
            </Field>
          </div>
          <Field label="Email">
            <input type="email" className="admin-input" value={v.email} onChange={e => ctrl.setValue({ ...v, email: e.target.value })} />
          </Field>
          <div className="admin-grid-2">
            <Field label="LinkedIn URL">
              <input className="admin-input" value={v.linkedin} onChange={e => ctrl.setValue({ ...v, linkedin: e.target.value })} />
            </Field>
            <Field label="GitHub URL (optional)">
              <input className="admin-input" value={v.github ?? ''} onChange={e => ctrl.setValue({ ...v, github: e.target.value })} />
            </Field>
          </div>
          <Field label="Resume / CV" hint="Uploaded PDF will appear as a Download Resume button on the portfolio.">
            <div style={{ marginTop: 6 }}>
              <ResumeUploader
                value={v.resumeUrl ?? ''}
                onChange={url => ctrl.setValue({ ...v, resumeUrl: url })}
              />
            </div>
          </Field>
        </div>
      )}
    </SectionShell>
  )
}
