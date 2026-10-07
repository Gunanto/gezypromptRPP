import type { ProjectSummary } from '@promptrpp/contracts'

type Props = {
  projects: ProjectSummary[]
  activeProjectId: string | null
  search: string
  loading: boolean
  onSearch: (value: string) => void
  onNew: () => void
  onSelect: (id: string) => void
}

export function ProjectSidebar({
  projects,
  activeProjectId,
  search,
  loading,
  onSearch,
  onNew,
  onSelect,
}: Props) {
  return (
    <aside className="card h-fit p-4 xl:sticky xl:top-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-brand-900">Proyek</h2>
          <p className="text-[11px] text-slate-500">{projects.length} proyek aktif</p>
        </div>
        <button className="btn-primary !min-h-8 !px-3" type="button" onClick={onNew}>
          + Baru
        </button>
      </div>

      <label className="sr-only" htmlFor="project-search">
        Cari proyek
      </label>
      <input
        id="project-search"
        className="field mb-3"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Cari proyek..."
      />

      <div className="max-h-[68vh] space-y-2 overflow-y-auto pr-1">
        {loading && <p className="p-3 text-xs text-slate-500">Memuat proyek...</p>}
        {!loading && projects.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs leading-5 text-slate-500">
            Belum ada proyek tersimpan.
          </div>
        )}
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelect(project.id)}
            className={`w-full rounded-xl border p-3 text-left transition ${
              activeProjectId === project.id
                ? 'border-brand-400 bg-brand-50'
                : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="line-clamp-2 text-xs font-extrabold text-slate-800">
                {project.title}
              </span>
              {project.isFavorite && <span title="Favorit">★</span>}
            </div>
            <p className="mt-1 truncate text-[10px] text-slate-500">
              {project.subject} · {project.level} kelas {project.classroom}
            </p>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-wide text-brand-600">
              {project.documentType}
            </p>
          </button>
        ))}
      </div>
    </aside>
  )
}
