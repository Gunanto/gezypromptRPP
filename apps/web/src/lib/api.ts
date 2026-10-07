import type {
  ComposePromptResult,
  PromptDocument,
  PromptInput,
  PromptRevision,
  ProjectSummary,
} from '@promptrpp/contracts'

export type ProjectRecord = {
  id: string
  title: string
  input: PromptInput
  isFavorite: boolean
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (response.status === 204) return undefined as T
  const body = (await response.json().catch(() => null)) as
    | { error?: { message?: string; fields?: unknown } }
    | null

  if (!response.ok) {
    throw new ApiError(
      body?.error?.message ?? `Permintaan gagal (HTTP ${response.status}).`,
      response.status,
      body?.error,
    )
  }
  return body as T
}

export const api = {
  compose(input: PromptInput) {
    return request<ComposePromptResult>('/api/v1/prompts/compose', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  listProjects(search = '') {
    return request<{ projects: ProjectSummary[] }>(
      `/api/v1/projects?search=${encodeURIComponent(search)}`,
    )
  },

  createProject(title: string, input: PromptInput) {
    return request<{ project: ProjectRecord }>('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify({ title, input }),
    })
  },

  getProject(id: string) {
    return request<{ project: ProjectRecord; prompts: PromptDocument[] }>(
      `/api/v1/projects/${id}`,
    )
  },

  updateProject(id: string, title: string, input: PromptInput, isFavorite?: boolean) {
    return request<{ project: ProjectRecord }>(`/api/v1/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title, input, isFavorite }),
    })
  },

  archiveProject(id: string) {
    return request<void>(`/api/v1/projects/${id}`, { method: 'DELETE' })
  },

  generateAndSave(id: string, title: string, input: PromptInput) {
    return request<
      ComposePromptResult & {
        project: ProjectRecord
        document: PromptDocument
      }
    >(`/api/v1/projects/${id}/generations`, {
      method: 'POST',
      body: JSON.stringify({ title, input }),
    })
  },

  getPrompt(id: string) {
    return request<{ document: PromptDocument; revisions: PromptRevision[] }>(
      `/api/v1/prompts/${id}`,
    )
  },

  savePrompt(id: string, contentMarkdown: string, expectedRevision: number) {
    return request<{ document: PromptDocument; revisions: PromptRevision[] }>(
      `/api/v1/prompts/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ contentMarkdown, expectedRevision }),
      },
    )
  },

  restoreRevision(promptId: string, revisionId: string, expectedRevision: number) {
    return request<{ document: PromptDocument; revisions: PromptRevision[] }>(
      `/api/v1/prompts/${promptId}/revisions/${revisionId}/restore`,
      {
        method: 'POST',
        body: JSON.stringify({ expectedRevision }),
      },
    )
  },
}
