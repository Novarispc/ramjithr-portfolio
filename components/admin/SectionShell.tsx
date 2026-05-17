'use client'
import { ReactNode, useState } from 'react'
import { Save, RotateCcw, FileEdit, Loader2 } from 'lucide-react'
import Topbar from './Topbar'
import { useToast } from './Toast'
import { publishDraft, discardDraft } from '@/lib/admin-client'

interface Props {
  title: string
  subtitle?: string
  loading?: boolean
  saving?: boolean
  dirty?: boolean
  hasDraft?: boolean
  onSave?: (mode: 'draft' | 'publish') => void
  onReset?: () => void
  onMenu: () => void
  onAfterPublish?: () => void
  children: ReactNode
}

export default function SectionShell({
  title, subtitle, loading, saving, dirty, hasDraft,
  onSave, onReset, onMenu, onAfterPublish, children,
}: Props) {
  const { toast } = useToast()
  const [working, setWorking] = useState(false)

  async function handlePublish() {
    setWorking(true)
    try {
      await publishDraft()
      toast('Draft published', 'success')
      onAfterPublish?.()
    } catch (err: any) {
      toast(`Publish failed: ${err.message}`, 'error')
    } finally { setWorking(false) }
  }

  async function handleDiscard() {
    if (!confirm('Discard all draft changes?')) return
    setWorking(true)
    try {
      await discardDraft()
      toast('Draft discarded', 'info')
      onAfterPublish?.()
    } catch (err: any) {
      toast(`Discard failed: ${err.message}`, 'error')
    } finally { setWorking(false) }
  }

  return (
    <>
      <Topbar
        onMenu={onMenu}
        hasDraft={hasDraft}
        onPublish={hasDraft ? handlePublish : undefined}
        onDiscard={hasDraft ? handleDiscard : undefined}
        title={title}
      />
      <main style={{ padding: 'clamp(16px, 3vw, 24px) clamp(12px, 3vw, 32px)', maxWidth: 1100 }}>
        <div className="admin-section-header">
          <div>
            <div className="admin-section-title">{title}</div>
            {subtitle && <div className="admin-section-subtitle">{subtitle}</div>}
          </div>
          <div className="admin-row">
            {onReset && (
              <button onClick={onReset} disabled={!dirty || saving} className="admin-btn admin-btn-ghost">
                <RotateCcw size={14} /> Reset
              </button>
            )}
            {onSave && (
              <>
                <button
                  onClick={() => onSave('draft')}
                  disabled={!dirty || saving}
                  className="admin-btn"
                >
                  <FileEdit size={14} /> Save draft
                </button>
                <button
                  onClick={() => onSave('publish')}
                  disabled={!dirty || saving}
                  className="admin-btn admin-btn-primary"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? 'Saving…' : 'Save & publish'}
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="admin-empty">
            <Loader2 size={20} className="animate-spin" style={{ display: 'inline' }} />
            <div style={{ marginTop: 8 }}>Loading…</div>
          </div>
        ) : (
          children
        )}
        {working && (
          <div className="admin-modal-backdrop">
            <div className="admin-modal" style={{ textAlign: 'center' }}>
              <Loader2 size={24} className="animate-spin" style={{ display: 'inline' }} />
              <div style={{ marginTop: 12 }}>Working…</div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
