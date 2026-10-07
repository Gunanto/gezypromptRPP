import { promptInputSchema } from '@promptrpp/contracts'
import { composePrompt } from '@promptrpp/prompt-engine'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { z } from 'zod'
import {
  archiveProject,
  createProject,
  getLatestProjectVersionId,
  getProject,
  listProjects,
  saveProjectInput,
  setProjectFavorite,
} from './repositories/projects'
import {
  createGeneratedPrompt,
  getPromptDocument,
  listPromptDocuments,
  listPromptRevisions,
  restorePromptRevision,
  savePromptRevision,
} from './repositories/prompts'

const app = new Hono()

app.use('*', secureHeaders())
app.use(
  '/api/*',
  cors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'X-Request-Id'],
  }),
)

app.use('*', async (context, next) => {
  const requestId = context.req.header('X-Request-Id') ?? crypto.randomUUID()
  context.header('X-Request-Id', requestId)
  await next()
})

app.onError((error, context) => {
  const requestId = context.res.headers.get('X-Request-Id') ?? crypto.randomUUID()
  console.error(`Request ${requestId} failed:`, error instanceof Error ? error.message : 'Unknown error')
  return context.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Terjadi kesalahan pada server.',
        requestId,
      },
    },
    500,
  )
})

app.get('/api/v1/health', (context) =>
  context.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }),
)

app.post('/api/v1/prompts/compose', async (context) => {
  const body = await context.req.json().catch(() => null)
  const parsed = promptInputSchema.safeParse(body)
  if (!parsed.success) {
    return context.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Data pembelajaran belum valid.',
          fields: parsed.error.flatten().fieldErrors,
        },
      },
      400,
    )
  }
  return context.json(composePrompt(parsed.data))
})

app.get('/api/v1/projects', (context) => {
  const search = context.req.query('search')?.trim() ?? ''
  return context.json({ projects: listProjects(search) })
})

const projectBodySchema = z.object({
  title: z.string().trim().min(1).max(160),
  input: promptInputSchema,
})

app.post('/api/v1/projects', async (context) => {
  const parsed = projectBodySchema.safeParse(await context.req.json().catch(() => null))
  if (!parsed.success) {
    return context.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Proyek belum valid.',
          fields: parsed.error.flatten().fieldErrors,
        },
      },
      400,
    )
  }
  return context.json({ project: createProject(parsed.data.title, parsed.data.input) }, 201)
})

app.get('/api/v1/projects/:projectId', (context) => {
  const project = getProject(context.req.param('projectId'))
  if (!project) {
    return context.json({ error: { code: 'NOT_FOUND', message: 'Proyek tidak ditemukan.' } }, 404)
  }
  return context.json({
    project,
    prompts: listPromptDocuments(project.id),
  })
})

const updateProjectSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  input: promptInputSchema.optional(),
  isFavorite: z.boolean().optional(),
})

app.patch('/api/v1/projects/:projectId', async (context) => {
  const id = context.req.param('projectId')
  const current = getProject(id)
  if (!current) {
    return context.json({ error: { code: 'NOT_FOUND', message: 'Proyek tidak ditemukan.' } }, 404)
  }
  const parsed = updateProjectSchema.safeParse(await context.req.json().catch(() => null))
  if (!parsed.success) {
    return context.json({ error: { code: 'VALIDATION_ERROR', fields: parsed.error.flatten().fieldErrors } }, 400)
  }

  let project = current
  if (parsed.data.input || parsed.data.title) {
    const saved = saveProjectInput(
      id,
      parsed.data.title ?? current.title,
      parsed.data.input ?? current.input,
    )
    if (saved) project = saved.project
  }
  if (typeof parsed.data.isFavorite === 'boolean') {
    project = setProjectFavorite(id, parsed.data.isFavorite) ?? project
  }
  return context.json({ project })
})

app.delete('/api/v1/projects/:projectId', (context) => {
  const archived = archiveProject(context.req.param('projectId'))
  if (!archived) {
    return context.json({ error: { code: 'NOT_FOUND', message: 'Proyek tidak ditemukan.' } }, 404)
  }
  return context.body(null, 204)
})

app.post('/api/v1/projects/:projectId/generations', async (context) => {
  const id = context.req.param('projectId')
  const current = getProject(id)
  if (!current) {
    return context.json({ error: { code: 'NOT_FOUND', message: 'Proyek tidak ditemukan.' } }, 404)
  }
  const parsed = projectBodySchema.safeParse(await context.req.json().catch(() => null))
  if (!parsed.success) {
    return context.json({ error: { code: 'VALIDATION_ERROR', fields: parsed.error.flatten().fieldErrors } }, 400)
  }

  const unchanged =
    current.title === parsed.data.title &&
    JSON.stringify(current.input) === JSON.stringify(parsed.data.input)
  const saved = unchanged
    ? {
        project: current,
        versionId: getLatestProjectVersionId(id),
      }
    : saveProjectInput(id, parsed.data.title, parsed.data.input, 'Generate prompt')
  if (!saved?.versionId) {
    return context.json(
      { error: { code: 'PROJECT_VERSION_ERROR', message: 'Versi proyek tidak tersedia.' } },
      409,
    )
  }
  const result = composePrompt(parsed.data.input)
  const document = createGeneratedPrompt(id, saved.versionId, parsed.data.input, result)
  return context.json({ ...result, project: saved.project, document }, 201)
})

app.get('/api/v1/projects/:projectId/prompts', (context) => {
  const project = getProject(context.req.param('projectId'))
  if (!project) {
    return context.json({ error: { code: 'NOT_FOUND', message: 'Proyek tidak ditemukan.' } }, 404)
  }
  return context.json({ prompts: listPromptDocuments(project.id) })
})

app.get('/api/v1/prompts/:promptId', (context) => {
  const document = getPromptDocument(context.req.param('promptId'))
  if (!document) {
    return context.json({ error: { code: 'NOT_FOUND', message: 'Prompt tidak ditemukan.' } }, 404)
  }
  return context.json({
    document,
    revisions: listPromptRevisions(document.id),
  })
})

const savePromptSchema = z.object({
  contentMarkdown: z.string().min(1),
  expectedRevision: z.number().int().positive(),
})

app.patch('/api/v1/prompts/:promptId', async (context) => {
  const parsed = savePromptSchema.safeParse(await context.req.json().catch(() => null))
  if (!parsed.success) {
    return context.json({ error: { code: 'VALIDATION_ERROR', fields: parsed.error.flatten().fieldErrors } }, 400)
  }
  const result = savePromptRevision(
    context.req.param('promptId'),
    parsed.data.contentMarkdown,
    parsed.data.expectedRevision,
  )
  if (result.status === 'not-found') {
    return context.json({ error: { code: 'NOT_FOUND', message: 'Prompt tidak ditemukan.' } }, 404)
  }
  if (result.status === 'conflict') {
    return context.json(
      {
        error: {
          code: 'REVISION_CONFLICT',
          message: 'Prompt telah diubah pada sesi lain. Muat ulang sebelum menyimpan.',
          currentRevision: result.currentRevision,
        },
      },
      409,
    )
  }
  return context.json({
    document: result.document,
    revisions: listPromptRevisions(result.document.id),
  })
})

app.get('/api/v1/prompts/:promptId/revisions', (context) => {
  const document = getPromptDocument(context.req.param('promptId'))
  if (!document) {
    return context.json({ error: { code: 'NOT_FOUND', message: 'Prompt tidak ditemukan.' } }, 404)
  }
  return context.json({ revisions: listPromptRevisions(document.id) })
})

app.post('/api/v1/prompts/:promptId/revisions/:revisionId/restore', async (context) => {
  const body = z
    .object({ expectedRevision: z.number().int().positive() })
    .safeParse(await context.req.json().catch(() => null))
  if (!body.success) {
    return context.json({ error: { code: 'VALIDATION_ERROR' } }, 400)
  }
  const result = restorePromptRevision(
    context.req.param('promptId'),
    context.req.param('revisionId'),
    body.data.expectedRevision,
  )
  if (result.status === 'not-found') {
    return context.json({ error: { code: 'NOT_FOUND', message: 'Revisi tidak ditemukan.' } }, 404)
  }
  if (result.status === 'conflict') {
    return context.json(
      { error: { code: 'REVISION_CONFLICT', currentRevision: result.currentRevision } },
      409,
    )
  }
  return context.json({
    document: result.document,
    revisions: listPromptRevisions(result.document.id),
  })
})

export default app
