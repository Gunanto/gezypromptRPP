import type { PromptDocument, PromptRevision } from '@promptrpp/contracts'

type Props = {
  prompt: string
  activeDocument: PromptDocument | null
  documents: PromptDocument[]
  revisions: PromptRevision[]
  warnings: string[]
  assumptions: string[]
  busy: boolean
  onPromptChange: (value: string) => void
  onOpenDocument: (id: string) => void
  onSaveRevision: () => void
  onRestoreRevision: (revisionId: string) => void
  onCopy: () => void
  onDownloadMarkdown: () => void
  onDownloadDoc: () => void
  onOpenDestination: (destination: string) => void
}

export function PromptEditor({
  prompt,
  activeDocument,
  documents,
  revisions,
  warnings,
  assumptions,
  busy,
  onPromptChange,
  onOpenDocument,
  onSaveRevision,
  onRestoreRevision,
  onCopy,
  onDownloadMarkdown,
  onDownloadDoc,
  onOpenDestination,
}: Props) {
  return (
    <section className="card min-w-0 p-4 lg:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-brand-900">
            {activeDocument?.title ?? 'Pratinjau Prompt'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {activeDocument
              ? `Tersimpan · revisi ${activeDocument.currentRevision} · dapat diedit`
              : 'Generate prompt untuk melihat hasil.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-brand-100 px-3 py-1 text-[10px] font-black text-brand-700">
            MARKDOWN
          </span>
          {activeDocument && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700">
              TERSIMPAN
            </span>
          )}
        </div>
      </div>

      {documents.length > 0 && (
        <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
          <label className="field-label" htmlFor="saved-prompt">
            Prompt tersimpan pada proyek
          </label>
          <select
            id="saved-prompt"
            className="field"
            value={activeDocument?.id ?? ''}
            onChange={(event) => event.target.value && onOpenDocument(event.target.value)}
          >
            <option value="">Pilih prompt...</option>
            {documents.map((document) => (
              <option key={document.id} value={document.id}>
                {document.title} · revisi {document.currentRevision}
              </option>
            ))}
          </select>
        </div>
      )}

      <textarea
        className="min-h-[620px] w-full resize-y rounded-2xl border border-slate-700 bg-prompt p-4 font-mono text-[12px] leading-6 text-blue-50 shadow-inner focus:border-brand-400 focus:outline-none"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Prompt akan tampil di sini dan dapat diedit..."
        spellCheck={false}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn-primary" type="button" onClick={onCopy} disabled={!prompt}>
          📋 Salin
        </button>
        <button
          className="btn-secondary"
          type="button"
          onClick={onSaveRevision}
          disabled={!activeDocument || !prompt || busy}
        >
          💾 Simpan Revisi
        </button>
        <button className="btn-outline" type="button" onClick={onDownloadMarkdown} disabled={!prompt}>
          ↓ Markdown
        </button>
        <button className="btn-outline" type="button" onClick={onDownloadDoc} disabled={!prompt}>
          ↓ DOC
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
        <span className="text-xs font-bold text-slate-600">Salin & buka:</span>
        {([
          ['ChatGPT', 'chatgpt'],
          ['Claude', 'claude'],
          ['DeepSeek', 'deepseek'],
          ['Codex', 'codex'],
          ['Muse', 'muse'],
        ] as const).map(([label, value]) => (
          <button
            key={value}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-extrabold text-slate-600 hover:border-brand-300 hover:text-brand-700"
            type="button"
            disabled={!prompt}
            onClick={() => onOpenDestination(value)}
          >
            {label} ↗
          </button>
        ))}
      </div>

      {(warnings.length > 0 || assumptions.length > 0) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <h3 className="text-xs font-black text-amber-900">Perlu diperiksa</h3>
            {warnings.length === 0 ? (
              <p className="mt-2 text-[11px] text-amber-800">Tidak ada peringatan.</p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-amber-800">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <h3 className="text-xs font-black text-blue-900">Asumsi</h3>
            {assumptions.length === 0 ? (
              <p className="mt-2 text-[11px] text-blue-800">Tidak ada asumsi otomatis.</p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-blue-800">
                {assumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeDocument && (
        <details className="mt-4 rounded-xl border border-slate-200 p-3">
          <summary className="cursor-pointer text-xs font-black text-slate-700">
            Riwayat revisi ({revisions.length})
          </summary>
          <div className="mt-3 space-y-2">
            {revisions.map((revision) => (
              <div
                key={revision.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-[11px] font-bold text-slate-700">
                    Revisi {revision.revisionNumber} · {revision.changeSource}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(revision.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
                {revision.revisionNumber !== activeDocument.currentRevision && (
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-[10px] font-bold text-slate-600 hover:border-brand-300"
                    onClick={() => onRestoreRevision(revision.id)}
                    disabled={busy}
                  >
                    Pulihkan
                  </button>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  )
}
