import { zodResolver } from '@hookform/resolvers/zod'
import {
  promptInputSchema,
  type DocumentType,
  type PromptDocument,
  type PromptInput,
  type PromptRevision,
  type ProjectSummary,
} from '@promptrpp/contracts'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { ProjectSidebar } from './components/ProjectSidebar'
import { PromptEditor } from './components/PromptEditor'
import { defaultPromptInput } from './defaults'
import { api, ApiError } from './lib/api'

const draftKey = 'promptrpp-react-draft-v1'

const documentTypes: Array<{
  value: DocumentType
  label: string
  description: string
  icon: string
}> = [
  { value: 'rpp', label: 'RPP', description: 'Rencana pembelajaran', icon: '📄' },
  { value: 'modul', label: 'Modul Ajar', description: 'Perangkat lengkap', icon: '📚' },
  { value: 'mendalam', label: 'Rencana PM', description: 'Pembelajaran Mendalam', icon: '🧭' },
  { value: 'lkpd', label: 'LKPD', description: 'Lembar kerja siswa', icon: '📝' },
  { value: 'asesmen', label: 'Asesmen', description: 'Instrumen dan kunci', icon: '✓' },
  { value: 'rubrik', label: 'Rubrik', description: 'Kriteria penilaian', icon: '▦' },
  { value: 'media', label: 'Media', description: 'Rancangan media', icon: '🖥️' },
  { value: 'paket', label: 'Paket Lengkap', description: 'Perangkat terpadu', icon: '🎒' },
]

const dimensions = [
  'Keimanan dan Ketakwaan terhadap Tuhan YME',
  'Kewargaan',
  'Penalaran Kritis',
  'Kreativitas',
  'Kolaborasi',
  'Kemandirian',
  'Kesehatan',
  'Komunikasi',
]

const destinations: Record<string, string> = {
  chatgpt: 'https://chatgpt.com/',
  claude: 'https://claude.ai/new',
  deepseek: 'https://chat.deepseek.com/',
  codex: 'https://chatgpt.com/',
  muse: 'https://muse.ai/',
}

function loadDraft(): PromptInput {
  try {
    const saved = localStorage.getItem(draftKey)
    if (!saved) return defaultPromptInput
    const parsed = promptInputSchema.safeParse(JSON.parse(saved))
    return parsed.success ? parsed.data : defaultPromptInput
  } catch {
    return defaultPromptInput
  }
}

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null
  return <p className="mt-1 text-[11px] font-semibold text-red-600">{message}</p>
}

function FormSection({
  number,
  title,
  children,
  open = false,
}: {
  number: number
  title: string
  children: React.ReactNode
  open?: boolean
}) {
  return (
    <details className="border-t border-slate-200 py-4 first:border-0 first:pt-0" open={open}>
      <summary className="cursor-pointer list-none text-sm font-black text-brand-800">
        {number}. {title}
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  )
}

function Toggle({
  label,
  registration,
}: {
  label: string
  registration: ReturnType<ReturnType<typeof useForm<PromptInput>>['register']>
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-600">
      <input
        type="checkbox"
        className="mt-1 size-4 shrink-0 accent-brand-600"
        {...registration}
      />
      <span>{label}</span>
    </label>
  )
}

export default function App() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<PromptInput>({
    resolver: zodResolver(promptInputSchema) as Resolver<PromptInput>,
    defaultValues: loadDraft(),
    mode: 'onBlur',
  })

  const form = watch()
  const selectedDimensions = form.dimensions ?? []
  const [projectTitle, setProjectTitle] = useState('')
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [projectSearch, setProjectSearch] = useState('')
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<PromptDocument[]>([])
  const [activeDocument, setActiveDocument] = useState<PromptDocument | null>(null)
  const [revisions, setRevisions] = useState<PromptRevision[]>([])
  const [prompt, setPrompt] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])
  const [assumptions, setAssumptions] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: 'ok' | 'error' | 'info'
    message: string
  } | null>(null)

  const perMeeting = Number(form.jpPerMeeting || 0) * Number(form.minutesPerJp || 0)
  const totalJp = Number(form.meetings || 0) * Number(form.jpPerMeeting || 0)
  const totalMinutes = Number(form.meetings || 0) * perMeeting
  const promptDirty = Boolean(activeDocument && prompt !== activeDocument.contentMarkdown)

  const quality = useMemo(
    () => [
      ['Materi pokok', Boolean(form.topic?.trim())],
      ['Alokasi waktu', perMeeting > 0 && totalMinutes > 0],
      ['CP atau TP', Boolean(form.cp?.trim() || form.tp?.trim())],
      ['Karakteristik siswa', Boolean(form.studentCharacteristics?.trim())],
      ['2–3 Dimensi Profil Lulusan', selectedDimensions.length >= 2],
      ['Konteks atau sumber', Boolean(form.localContext?.trim() || form.resources?.trim())],
    ] as const,
    [
      form.cp,
      form.localContext,
      form.resources,
      form.studentCharacteristics,
      form.topic,
      form.tp,
      perMeeting,
      selectedDimensions.length,
      totalMinutes,
    ],
  )

  const loadProjects = useCallback(async (search = projectSearch) => {
    setProjectsLoading(true)
    try {
      const result = await api.listProjects(search)
      setProjects(result.projects)
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Gagal memuat proyek.',
      })
    } finally {
      setProjectsLoading(false)
    }
  }, [projectSearch])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProjects(projectSearch)
    }, 200)
    return () => window.clearTimeout(timer)
  }, [loadProjects, projectSearch])

  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(draftKey, JSON.stringify(value))
    })
    return () => subscription.unsubscribe()
  }, [watch])

  function messageFromError(error: unknown): string {
    if (error instanceof ApiError) return error.message
    if (error instanceof Error) return error.message
    return 'Terjadi kesalahan yang tidak diketahui.'
  }

  async function openPrompt(id: string) {
    if (promptDirty && !window.confirm('Perubahan prompt belum disimpan. Tetap membuka prompt lain?')) {
      return
    }
    setBusy(true)
    try {
      const result = await api.getPrompt(id)
      setActiveDocument(result.document)
      setPrompt(result.document.contentMarkdown)
      setRevisions(result.revisions)
      setWarnings([])
      setAssumptions([])
      setStatus({ type: 'ok', message: `Prompt revisi ${result.document.currentRevision} dibuka.` })
    } catch (error) {
      setStatus({ type: 'error', message: messageFromError(error) })
    } finally {
      setBusy(false)
    }
  }

  async function openProject(id: string) {
    if (promptDirty && !window.confirm('Perubahan prompt belum disimpan. Tetap membuka proyek lain?')) {
      return
    }
    setBusy(true)
    try {
      const result = await api.getProject(id)
      setActiveProjectId(id)
      setProjectTitle(result.project.title)
      reset(result.project.input)
      setDocuments(result.prompts)
      setActiveDocument(null)
      setRevisions([])
      setPrompt('')
      setWarnings([])
      setAssumptions([])
      if (result.prompts[0]) {
        const promptResult = await api.getPrompt(result.prompts[0].id)
        setActiveDocument(promptResult.document)
        setPrompt(promptResult.document.contentMarkdown)
        setRevisions(promptResult.revisions)
      }
      setStatus({ type: 'ok', message: 'Proyek berhasil dibuka.' })
    } catch (error) {
      setStatus({ type: 'error', message: messageFromError(error) })
    } finally {
      setBusy(false)
    }
  }

  function newProject() {
    if (
      (isDirty || promptDirty) &&
      !window.confirm('Ada perubahan yang belum disimpan. Buat proyek baru?')
    ) {
      return
    }
    reset(defaultPromptInput)
    localStorage.removeItem(draftKey)
    setProjectTitle('')
    setActiveProjectId(null)
    setDocuments([])
    setActiveDocument(null)
    setRevisions([])
    setPrompt('')
    setWarnings([])
    setAssumptions([])
    setStatus({ type: 'info', message: 'Form proyek baru siap diisi.' })
  }

  async function ensureProject(input: PromptInput): Promise<string> {
    const title = projectTitle.trim() || input.topic || 'Proyek perangkat ajar'
    if (activeProjectId) {
      const result = await api.updateProject(activeProjectId, title, input)
      setProjectTitle(result.project.title)
      return activeProjectId
    }
    const result = await api.createProject(title, input)
    setActiveProjectId(result.project.id)
    setProjectTitle(result.project.title)
    return result.project.id
  }

  const previewPrompt = handleSubmit(async (input) => {
    if (
      promptDirty &&
      !window.confirm('Perubahan prompt belum disimpan. Pratinjau baru akan mengganti isi editor saat ini. Lanjutkan?')
    ) {
      return
    }
    setBusy(true)
    try {
      const result = await api.compose(input)
      setPrompt(result.prompt)
      setWarnings(result.validation.warnings)
      setAssumptions(result.validation.assumptions)
      setActiveDocument(null)
      setRevisions([])
      setStatus({ type: 'ok', message: 'Pratinjau dibuat. Gunakan Generate & Simpan untuk menyimpan.' })
    } catch (error) {
      setStatus({ type: 'error', message: messageFromError(error) })
    } finally {
      setBusy(false)
    }
  })

  const saveProject = handleSubmit(async (input) => {
    setBusy(true)
    try {
      await ensureProject(input)
      await loadProjects()
      setStatus({ type: 'ok', message: 'Proyek dan snapshot input berhasil disimpan.' })
    } catch (error) {
      setStatus({ type: 'error', message: messageFromError(error) })
    } finally {
      setBusy(false)
    }
  })

  const generateAndSave = handleSubmit(async (input) => {
    if (
      promptDirty &&
      !window.confirm('Perubahan prompt belum disimpan. Generate akan membuat dokumen prompt baru. Lanjutkan?')
    ) {
      return
    }
    setBusy(true)
    try {
      const projectId = await ensureProject(input)
      const title = projectTitle.trim() || input.topic || 'Proyek perangkat ajar'
      const result = await api.generateAndSave(projectId, title, input)
      setPrompt(result.prompt)
      setWarnings(result.validation.warnings)
      setAssumptions(result.validation.assumptions)
      setActiveDocument(result.document)
      setRevisions([
        {
          id: 'latest',
          revisionNumber: 1,
          changeSource: 'generated',
          createdAt: result.document.createdAt,
        },
      ])
      const detail = await api.getProject(projectId)
      setDocuments(detail.prompts)
      await loadProjects()
      setStatus({ type: 'ok', message: 'Prompt dibuat dan tersimpan sebagai revisi 1.' })
    } catch (error) {
      setStatus({ type: 'error', message: messageFromError(error) })
    } finally {
      setBusy(false)
    }
  })

  async function savePromptRevision() {
    if (!activeDocument) return
    setBusy(true)
    try {
      const result = await api.savePrompt(
        activeDocument.id,
        prompt,
        activeDocument.currentRevision,
      )
      setActiveDocument(result.document)
      setPrompt(result.document.contentMarkdown)
      setRevisions(result.revisions)
      setDocuments((items) =>
        items
          .map((item) => (item.id === result.document.id ? result.document : item))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      )
      setStatus({
        type: 'ok',
        message: `Prompt disimpan sebagai revisi ${result.document.currentRevision}.`,
      })
    } catch (error) {
      setStatus({ type: 'error', message: messageFromError(error) })
    } finally {
      setBusy(false)
    }
  }

  async function restoreRevision(revisionId: string) {
    if (!activeDocument) return
    if (!window.confirm('Pulihkan isi revisi ini sebagai revisi baru?')) return
    setBusy(true)
    try {
      const result = await api.restoreRevision(
        activeDocument.id,
        revisionId,
        activeDocument.currentRevision,
      )
      setActiveDocument(result.document)
      setPrompt(result.document.contentMarkdown)
      setRevisions(result.revisions)
      setStatus({
        type: 'ok',
        message: `Revisi dipulihkan sebagai revisi ${result.document.currentRevision}.`,
      })
    } catch (error) {
      setStatus({ type: 'error', message: messageFromError(error) })
    } finally {
      setBusy(false)
    }
  }

  function toggleDimension(dimension: string) {
    const current = selectedDimensions
    if (current.includes(dimension)) {
      setValue(
        'dimensions',
        current.filter((item) => item !== dimension),
        { shouldDirty: true, shouldValidate: true },
      )
      return
    }
    if (current.length >= 3) {
      setStatus({ type: 'error', message: 'Pilih maksimal tiga Dimensi Profil Lulusan.' })
      return
    }
    setValue('dimensions', [...current, dimension], {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  async function copyPrompt(): Promise<boolean> {
    if (!prompt) return false
    try {
      await navigator.clipboard.writeText(prompt)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = prompt
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setStatus({ type: 'ok', message: 'Prompt disalin ke clipboard.' })
    return true
  }

  function safeFileName(): string {
    return (form.topic || 'Perangkat-Ajar')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'Perangkat-Ajar'
  }

  function download(content: BlobPart, type: string, extension: string) {
    const blob = new Blob([content], { type })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `PromptRPP-${safeFileName()}.${extension}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(link.href)
  }

  function escapeHtml(value: string): string {
    return value.replace(/[&<>]/g, (character) => {
      const values: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;' }
      return values[character] ?? character
    })
  }

  async function openDestination(destination: string) {
    if (!prompt) return
    const copied = await copyPrompt()
    if (!copied) return
    const opened = window.open(destinations[destination], '_blank', 'noopener')
    if (!opened) {
      setStatus({
        type: 'error',
        message: 'Browser memblokir tab baru. Prompt sudah disalin; buka layanan AI secara manual.',
      })
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-[1800px] p-3 md:p-6">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-600 to-blue-400 px-6 py-8 text-white shadow-2xl md:px-9">
        <div className="absolute -right-16 -top-24 size-72 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-xs font-black tracking-[0.2em] text-blue-100">📘 PROMPTRPP</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-black tracking-tight md:text-5xl">
            Isi konteksnya. AI menyusun perangkat ajarnya.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-50 md:text-base">
            Bangun, simpan, edit, dan versi-kan prompt perangkat ajar dalam satu ruang kerja.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['8 jenis dokumen', 'Riwayat revisi', 'Prompt lintas-AI'].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/25 bg-blue-950/20 px-3 py-1.5 text-[10px] font-extrabold"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>

      {status && (
        <div
          role="status"
          className={`mt-4 rounded-xl border px-4 py-3 text-xs font-semibold ${
            status.type === 'error'
              ? 'status-error'
              : status.type === 'ok'
                ? 'status-ok'
                : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[250px_430px_minmax(0,1fr)]">
        <ProjectSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          search={projectSearch}
          loading={projectsLoading}
          onSearch={setProjectSearch}
          onNew={newProject}
          onSelect={(id) => void openProject(id)}
        />

        <form className="card p-4 lg:p-5" onSubmit={generateAndSave}>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-brand-100 text-xl">🗂️</div>
            <div>
              <h2 className="text-base font-black text-brand-900">Rancang Prompt</h2>
              <p className="text-[11px] text-slate-500">
                {activeProjectId ? 'Mengedit proyek tersimpan' : 'Proyek baru'}
              </p>
            </div>
          </div>

          <label className="field-label" htmlFor="project-title">
            Judul proyek
          </label>
          <input
            id="project-title"
            className="field mb-4"
            value={projectTitle}
            onChange={(event) => setProjectTitle(event.target.value)}
            placeholder={form.topic || 'Contoh: RPP PLSV Kelas VIII'}
          />

          <FormSection number={1} title="Jenis dokumen dan identitas" open>
            <fieldset>
              <legend className="field-label">Jenis perangkat ajar</legend>
              <div className="grid grid-cols-2 gap-2">
                {documentTypes.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={form.documentType === item.value}
                    onClick={() =>
                      setValue('documentType', item.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={`rounded-xl border p-2.5 text-left transition ${
                      form.documentType === item.value
                        ? 'border-brand-400 bg-brand-50 text-brand-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="ml-1 text-xs font-black">{item.label}</span>
                    <span className="mt-1 block text-[9px] text-slate-500">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-3">
              <label className="field-label" htmlFor="curriculum">
                Kurikulum
              </label>
              <select id="curriculum" className="field" {...register('curriculum')}>
                <option>Kurikulum Merdeka</option>
                <option>Kurikulum Satuan Pendidikan</option>
                <option>Kurikulum lainnya</option>
              </select>
              <FieldError message={errors.curriculum?.message} />
            </div>

            <div className="mt-3">
              <label className="field-label" htmlFor="subject">
                Mata pelajaran *
              </label>
              <input
                id="subject"
                className="field"
                list="subjects"
                {...register('subject')}
              />
              <datalist id="subjects">
                {[
                  'Matematika',
                  'Bahasa Indonesia',
                  'IPA',
                  'IPS',
                  'Bahasa Inggris',
                  'Pendidikan Pancasila',
                  'Informatika',
                  'Pendidikan Agama',
                  'Seni Budaya',
                  'PJOK',
                  'Prakarya',
                ].map((subject) => (
                  <option key={subject} value={subject} />
                ))}
              </datalist>
              <FieldError message={errors.subject?.message} />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <label className="field-label" htmlFor="level">
                  Jenjang *
                </label>
                <select id="level" className="field" {...register('level')}>
                  <option>SD/MI</option>
                  <option>SMP/MTs</option>
                  <option>SMA/MA</option>
                  <option>SMK/MAK</option>
                  <option>PAUD/TK</option>
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="phase">
                  Fase
                </label>
                <input id="phase" className="field" {...register('phase')} />
              </div>
              <div>
                <label className="field-label" htmlFor="classroom">
                  Kelas *
                </label>
                <input id="classroom" className="field" {...register('classroom')} />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="field-label" htmlFor="semester">
                  Semester
                </label>
                <select id="semester" className="field" {...register('semester')}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="locale">
                  Daerah/lingkungan
                </label>
                <input
                  id="locale"
                  className="field"
                  placeholder="Contoh: Sleman"
                  {...register('locale')}
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="field-label" htmlFor="topic">
                Materi pokok *
              </label>
              <input
                id="topic"
                className="field"
                placeholder="Contoh: Persamaan Linear Satu Variabel"
                {...register('topic')}
              />
              <FieldError message={errors.topic?.message} />
            </div>
          </FormSection>

          <FormSection number={2} title="Waktu, capaian, dan siswa" open>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="field-label" htmlFor="meetings">
                  Pertemuan
                </label>
                <input
                  id="meetings"
                  type="number"
                  min={1}
                  className="field"
                  {...register('meetings', { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="jp">
                  JP/pertemuan
                </label>
                <input
                  id="jp"
                  type="number"
                  min={1}
                  className="field"
                  {...register('jpPerMeeting', { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="minutes">
                  Menit/JP
                </label>
                <input
                  id="minutes"
                  type="number"
                  min={1}
                  className="field"
                  {...register('minutesPerJp', { valueAsNumber: true })}
                />
              </div>
            </div>
            <div className="mt-2 rounded-xl border border-blue-100 bg-brand-50 p-3 text-[11px] text-brand-800">
              <b>{form.jpPerMeeting || 0} JP × {form.minutesPerJp || 0} menit</b> ={' '}
              {perMeeting} menit per pertemuan
              <br />
              Total: <b>{totalJp} JP / {totalMinutes} menit</b>
            </div>

            {[
              ['cp', 'Capaian Pembelajaran', 'Tempelkan CP bila tersedia...'],
              ['tp', 'Tujuan Pembelajaran', 'Tuliskan TP yang ingin dicapai...'],
              ['initialCompetence', 'Kompetensi awal', 'Apa yang sudah dikuasai siswa?'],
              [
                'studentCharacteristics',
                'Karakteristik peserta didik',
                'Jumlah siswa, kesiapan, minat, kebutuhan aksesibilitas...',
              ],
            ].map(([name, label, placeholder]) => (
              <div className="mt-3" key={name}>
                <label className="field-label" htmlFor={name}>
                  {label}
                </label>
                <textarea
                  id={name}
                  className="field min-h-20"
                  placeholder={placeholder}
                  {...register(name as 'cp' | 'tp' | 'initialCompetence' | 'studentCharacteristics')}
                />
              </div>
            ))}
          </FormSection>

          <FormSection number={3} title="Kerangka Pembelajaran Mendalam">
            <fieldset>
              <legend className="field-label">Dimensi Profil Lulusan (pilih 2–3)</legend>
              <div className="flex flex-wrap gap-2">
                {dimensions.map((dimension) => (
                  <button
                    key={dimension}
                    type="button"
                    aria-pressed={selectedDimensions.includes(dimension)}
                    onClick={() => toggleDimension(dimension)}
                    className={`rounded-full border px-3 py-1.5 text-[10px] font-bold transition ${
                      selectedDimensions.includes(dimension)
                        ? 'border-brand-400 bg-brand-100 text-brand-800'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-brand-300'
                    }`}
                  >
                    {dimension}
                  </button>
                ))}
              </div>
              <FieldError message={errors.dimensions?.message} />
            </fieldset>

            <div className="mt-3">
              <label className="field-label" htmlFor="practice">
                Praktik pedagogis
              </label>
              <input
                id="practice"
                className="field"
                list="practices"
                {...register('pedagogicalPractice')}
              />
              <datalist id="practices">
                <option value="Inkuiri terbimbing" />
                <option value="Problem Based Learning (PBL)" />
                <option value="Project Based Learning (PjBL)" />
                <option value="Discovery Learning" />
                <option value="Diskusi kolaboratif" />
              </datalist>
            </div>

            {[
              ['localContext', 'Isu atau konteks lokal'],
              ['partnership', 'Kemitraan pembelajaran'],
              ['learningEnvironment', 'Lingkungan pembelajaran'],
              ['digitalUse', 'Pemanfaatan digital, batasan, dan etika'],
              ['crossDiscipline', 'Lintas disiplin'],
              ['resources', 'Media dan sumber belajar'],
            ].map(([name, label]) => (
              <div className="mt-3" key={name}>
                <label className="field-label" htmlFor={name}>
                  {label}
                </label>
                <textarea
                  id={name}
                  className="field min-h-16"
                  {...register(
                    name as
                      | 'localContext'
                      | 'partnership'
                      | 'learningEnvironment'
                      | 'digitalUse'
                      | 'crossDiscipline'
                      | 'resources',
                  )}
                />
              </div>
            ))}
          </FormSection>

          <FormSection number={4} title="Preferensi keluaran">
            <label className="field-label" htmlFor="output-level">
              Tingkat keluaran
            </label>
            <select
              id="output-level"
              className="field mb-3"
              {...register('outputLevel')}
            >
              <option value="ringkas">Ringkas</option>
              <option value="rinci">Rinci</option>
              <option value="sangat-rinci">Skenario Mengajar Sangat Rinci</option>
            </select>

            <div className="space-y-2.5">
              <Toggle
                label="Lengkapi data kosong dengan asumsi berlabel [ASUMSI]."
                registration={register('preferences.assumeMissing')}
              />
              <Toggle
                label="Aktifkan diferensiasi."
                registration={register('preferences.differentiation')}
              />
              <Toggle
                label="Integrasikan literasi dan numerasi jika relevan."
                registration={register('preferences.literacyNumeracy')}
              />
              <Toggle
                label="Integrasikan sosial-emosional dan kebiasaan baik."
                registration={register('preferences.socialEmotional')}
              />
              <Toggle
                label="Sertakan asesmen diagnostik."
                registration={register('preferences.diagnostic')}
              />
              <Toggle
                label="Sertakan asesmen formatif."
                registration={register('preferences.formative')}
              />
              <Toggle
                label="Sertakan as learning."
                registration={register('preferences.asLearning')}
              />
              <Toggle
                label="Sertakan asesmen sumatif."
                registration={register('preferences.summative')}
              />
              <Toggle
                label="Kerjakan satu pertemuan per respons."
                registration={register('preferences.stagedOutput')}
              />
            </div>

            <div className="mt-3">
              <label className="field-label" htmlFor="assessment-focus">
                Fokus asesmen/rubrik
              </label>
              <input
                id="assessment-focus"
                className="field"
                {...register('assessmentFocus')}
              />
            </div>
            <div className="mt-3">
              <label className="field-label" htmlFor="assessment-product">
                Produk/kinerja yang dinilai
              </label>
              <input
                id="assessment-product"
                className="field"
                {...register('assessmentProduct')}
              />
            </div>
            <div className="mt-3">
              <label className="field-label" htmlFor="media-format">
                Jenis media
              </label>
              <input id="media-format" className="field" {...register('mediaFormat')} />
            </div>
          </FormSection>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <h3 className="text-xs font-black text-slate-700">Checklist prompt</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {quality.map(([label, ready]) => (
                <span
                  key={label}
                  className={`text-[10px] font-semibold ${
                    ready ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {ready ? '●' : '○'} {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" type="submit" disabled={busy}>
              {busy ? 'Memproses...' : '⚡ Generate & Simpan'}
            </button>
            <button className="btn-secondary" type="button" onClick={previewPrompt} disabled={busy}>
              Pratinjau
            </button>
            <button className="btn-outline" type="button" onClick={saveProject} disabled={busy}>
              Simpan Proyek
            </button>
          </div>
        </form>

        <PromptEditor
          prompt={prompt}
          activeDocument={activeDocument}
          documents={documents}
          revisions={revisions}
          warnings={warnings}
          assumptions={assumptions}
          busy={busy}
          onPromptChange={setPrompt}
          onOpenDocument={(id) => void openPrompt(id)}
          onSaveRevision={() => void savePromptRevision()}
          onRestoreRevision={(id) => void restoreRevision(id)}
          onCopy={() => void copyPrompt()}
          onDownloadMarkdown={() =>
            download(prompt, 'text/markdown;charset=utf-8', 'md')
          }
          onDownloadDoc={() =>
            download(
              `<!doctype html><meta charset="UTF-8"><pre style="white-space:pre-wrap;font:11pt/1.5 Arial">${escapeHtml(prompt)}</pre>`,
              'application/msword;charset=utf-8',
              'doc',
            )
          }
          onOpenDestination={(destination) => void openDestination(destination)}
        />
      </div>

      <footer className="py-6 text-center text-[11px] text-slate-500">
        © 2026 GezyTech. Dikembangkan oleh PakGun.
      </footer>
    </div>
  )
}
