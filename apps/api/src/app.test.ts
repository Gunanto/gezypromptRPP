import { afterAll, describe, expect, test } from 'bun:test'
import type { PromptInput } from '@promptrpp/contracts'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const testDirectory = mkdtempSync(join(tmpdir(), 'promptrpp-api-'))
process.env.DATABASE_PATH = join(testDirectory, 'test.sqlite')
process.env.WEB_ORIGIN = 'http://localhost:5173'

const [{ default: app }, { closeDatabase }] = await Promise.all([
  import('./app'),
  import('./db/client'),
])

const input: PromptInput = {
  documentType: 'rpp',
  outputLevel: 'sangat-rinci',
  curriculum: 'Kurikulum Merdeka',
  subject: 'Matematika',
  level: 'SMP/MTs',
  phase: 'D',
  classroom: '8',
  semester: '1',
  topic: 'Persamaan Linear Satu Variabel',
  locale: 'Sleman',
  meetings: 2,
  jpPerMeeting: 2,
  minutesPerJp: 40,
  cp: 'Memahami persamaan linear.',
  tp: 'Menyelesaikan PLSV.',
  initialCompetence: 'Operasi bentuk aljabar.',
  studentCharacteristics: '32 siswa dengan kesiapan beragam.',
  dimensions: ['Penalaran Kritis', 'Kolaborasi'],
  pedagogicalPractice: 'Inkuiri terbimbing',
  localContext: 'Harga di pasar lokal.',
  partnership: '',
  learningEnvironment: '',
  digitalUse: '',
  crossDiscipline: '',
  resources: 'LKPD dan kartu soal.',
  assessmentFocus: 'Formatif',
  assessmentProduct: 'Penyelesaian masalah',
  mediaFormat: '',
  preferences: {
    assumeMissing: true,
    differentiation: true,
    literacyNumeracy: true,
    socialEmotional: true,
    diagnostic: true,
    formative: true,
    asLearning: true,
    summative: false,
    stagedOutput: true,
  },
}

function jsonRequest(path: string, method: string, body?: unknown) {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) init.body = JSON.stringify(body)
  return app.request(path, init)
}

afterAll(() => {
  closeDatabase()
  rmSync(testDirectory, { recursive: true, force: true })
})

describe('PromptRPP API', () => {
  test('health dan compose prompt', async () => {
    const health = await app.request('/api/v1/health')
    expect(health.status).toBe(200)

    const response = await jsonRequest('/api/v1/prompts/compose', 'POST', input)
    expect(response.status).toBe(200)
    const body = (await response.json()) as { prompt: string; engineVersion: string }
    expect(body.prompt).toContain('LANGKAH PEMBELAJARAN SANGAT RINCI')
    expect(body.engineVersion).toBe('1.0.0')
  })

  test('buat proyek, generate, edit, dan pulihkan revisi prompt', async () => {
    const createResponse = await jsonRequest('/api/v1/projects', 'POST', {
      title: 'RPP PLSV Kelas VIII',
      input,
    })
    expect(createResponse.status).toBe(201)
    const created = (await createResponse.json()) as { project: { id: string } }
    const projectId = created.project.id

    const generateResponse = await jsonRequest(
      `/api/v1/projects/${projectId}/generations`,
      'POST',
      { title: 'RPP PLSV Kelas VIII', input },
    )
    expect(generateResponse.status).toBe(201)
    const generated = (await generateResponse.json()) as {
      prompt: string
      document: { id: string; currentRevision: number }
    }
    expect(generated.document.currentRevision).toBe(1)
    const promptId = generated.document.id
    const originalPrompt = generated.prompt

    const editResponse = await jsonRequest(`/api/v1/prompts/${promptId}`, 'PATCH', {
      contentMarkdown: `${originalPrompt}\n\nCATATAN EDIT GURU`,
      expectedRevision: 1,
    })
    expect(editResponse.status).toBe(200)
    const edited = (await editResponse.json()) as {
      document: { currentRevision: number; contentMarkdown: string }
      revisions: Array<{ id: string; revisionNumber: number }>
    }
    expect(edited.document.currentRevision).toBe(2)
    expect(edited.document.contentMarkdown).toContain('CATATAN EDIT GURU')
    expect(edited.revisions).toHaveLength(2)

    const firstRevision = edited.revisions.find((revision) => revision.revisionNumber === 1)
    expect(firstRevision).toBeDefined()
    const restoreResponse = await jsonRequest(
      `/api/v1/prompts/${promptId}/revisions/${firstRevision!.id}/restore`,
      'POST',
      { expectedRevision: 2 },
    )
    expect(restoreResponse.status).toBe(200)
    const restored = (await restoreResponse.json()) as {
      document: { currentRevision: number; contentMarkdown: string }
      revisions: unknown[]
    }
    expect(restored.document.currentRevision).toBe(3)
    expect(restored.document.contentMarkdown).toBe(originalPrompt)
    expect(restored.revisions).toHaveLength(3)

    const projectResponse = await app.request(`/api/v1/projects/${projectId}`)
    expect(projectResponse.status).toBe(200)
    const project = (await projectResponse.json()) as { prompts: unknown[] }
    expect(project.prompts).toHaveLength(1)
  })

  test('menolak penyimpanan dengan nomor revisi lama', async () => {
    const createResponse = await jsonRequest('/api/v1/projects', 'POST', {
      title: 'Konflik revisi',
      input,
    })
    const created = (await createResponse.json()) as { project: { id: string } }
    const generatedResponse = await jsonRequest(
      `/api/v1/projects/${created.project.id}/generations`,
      'POST',
      { title: 'Konflik revisi', input },
    )
    const generated = (await generatedResponse.json()) as { document: { id: string } }

    const firstSave = await jsonRequest(`/api/v1/prompts/${generated.document.id}`, 'PATCH', {
      contentMarkdown: 'Edit pertama',
      expectedRevision: 1,
    })
    expect(firstSave.status).toBe(200)

    const staleSave = await jsonRequest(`/api/v1/prompts/${generated.document.id}`, 'PATCH', {
      contentMarkdown: 'Edit dari versi lama',
      expectedRevision: 1,
    })
    expect(staleSave.status).toBe(409)
  })
})
