import type {
  ComposePromptResult,
  DocumentType,
  PromptDocument,
  PromptInput,
  PromptRevision,
} from '@promptrpp/contracts'
import { db } from '../db/client'

type PromptDocumentRow = {
  id: string
  project_id: string
  source_generation_id: string | null
  title: string
  document_type: DocumentType
  content_markdown: string
  current_revision: number
  created_at: string
  updated_at: string
}

function mapPromptDocument(row: PromptDocumentRow): PromptDocument {
  return {
    id: row.id,
    projectId: row.project_id,
    sourceGenerationId: row.source_generation_id,
    title: row.title,
    documentType: row.document_type,
    contentMarkdown: row.content_markdown,
    currentRevision: row.current_revision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function listPromptDocuments(projectId: string): PromptDocument[] {
  const rows = db
    .query(
      `
        SELECT * FROM prompt_documents
        WHERE project_id = $projectId AND archived_at IS NULL
        ORDER BY updated_at DESC
      `,
    )
    .all({ projectId }) as PromptDocumentRow[]
  return rows.map(mapPromptDocument)
}

export function getPromptDocument(id: string): PromptDocument | null {
  const row = db
    .query('SELECT * FROM prompt_documents WHERE id = $id AND archived_at IS NULL')
    .get({ id }) as PromptDocumentRow | null
  return row ? mapPromptDocument(row) : null
}

export function listPromptRevisions(promptDocumentId: string): PromptRevision[] {
  const rows = db
    .query(
      `
        SELECT id, revision_number, change_source, created_at
        FROM prompt_revisions
        WHERE prompt_document_id = $promptDocumentId
        ORDER BY revision_number DESC
      `,
    )
    .all({ promptDocumentId }) as Array<{
    id: string
    revision_number: number
    change_source: PromptRevision['changeSource']
    created_at: string
  }>
  return rows.map((row) => ({
    id: row.id,
    revisionNumber: row.revision_number,
    changeSource: row.change_source,
    createdAt: row.created_at,
  }))
}

export function createGeneratedPrompt(
  projectId: string,
  projectVersionId: string,
  input: PromptInput,
  result: ComposePromptResult,
): PromptDocument {
  const generationId = crypto.randomUUID()
  const documentId = crypto.randomUUID()
  const revisionId = crypto.randomUUID()
  const now = new Date().toISOString()
  const title = `${input.topic} — ${input.documentType.toUpperCase()}`

  const create = db.transaction(() => {
    db.query(
      `
        INSERT INTO prompt_generations (
          id, project_id, project_version_id, document_type, output_level,
          engine_version, prompt_markdown, warnings_json, assumptions_json, created_at
        ) VALUES (
          $id, $projectId, $projectVersionId, $documentType, $outputLevel,
          $engineVersion, $promptMarkdown, $warningsJson, $assumptionsJson, $createdAt
        )
      `,
    ).run({
      id: generationId,
      projectId,
      projectVersionId,
      documentType: input.documentType,
      outputLevel: input.outputLevel,
      engineVersion: result.engineVersion,
      promptMarkdown: result.prompt,
      warningsJson: JSON.stringify(result.validation.warnings),
      assumptionsJson: JSON.stringify(result.validation.assumptions),
      createdAt: now,
    })

    db.query(
      `
        INSERT INTO prompt_documents (
          id, project_id, source_generation_id, title, document_type,
          content_markdown, current_revision, created_at, updated_at
        ) VALUES (
          $id, $projectId, $sourceGenerationId, $title, $documentType,
          $contentMarkdown, 1, $createdAt, $updatedAt
        )
      `,
    ).run({
      id: documentId,
      projectId,
      sourceGenerationId: generationId,
      title,
      documentType: input.documentType,
      contentMarkdown: result.prompt,
      createdAt: now,
      updatedAt: now,
    })

    db.query(
      `
        INSERT INTO prompt_revisions (
          id, prompt_document_id, revision_number, content_markdown, change_source, created_at
        ) VALUES ($id, $promptDocumentId, 1, $contentMarkdown, 'generated', $createdAt)
      `,
    ).run({
      id: revisionId,
      promptDocumentId: documentId,
      contentMarkdown: result.prompt,
      createdAt: now,
    })
  })
  create.immediate()

  return getPromptDocument(documentId) as PromptDocument
}

export type SaveRevisionResult =
  | { status: 'ok'; document: PromptDocument }
  | { status: 'not-found' }
  | { status: 'conflict'; currentRevision: number }

export function savePromptRevision(
  id: string,
  contentMarkdown: string,
  expectedRevision: number,
  changeSource: 'manual-edit' | 'restored' = 'manual-edit',
): SaveRevisionResult {
  const current = getPromptDocument(id)
  if (!current) return { status: 'not-found' }
  if (current.currentRevision !== expectedRevision) {
    return { status: 'conflict', currentRevision: current.currentRevision }
  }

  const revisionNumber = current.currentRevision + 1
  const revisionId = crypto.randomUUID()
  const now = new Date().toISOString()
  const save = db.transaction(() => {
    const update = db
      .query(
        `
          UPDATE prompt_documents
          SET content_markdown = $contentMarkdown,
              current_revision = $revisionNumber,
              updated_at = $updatedAt
          WHERE id = $id AND current_revision = $expectedRevision
        `,
      )
      .run({
        id,
        contentMarkdown,
        revisionNumber,
        updatedAt: now,
        expectedRevision,
      })
    if (update.changes !== 1) throw new Error('REVISION_CONFLICT')

    db.query(
      `
        INSERT INTO prompt_revisions (
          id, prompt_document_id, revision_number, content_markdown, change_source, created_at
        ) VALUES (
          $id, $promptDocumentId, $revisionNumber, $contentMarkdown, $changeSource, $createdAt
        )
      `,
    ).run({
      id: revisionId,
      promptDocumentId: id,
      revisionNumber,
      contentMarkdown,
      changeSource,
      createdAt: now,
    })
  })

  try {
    save.immediate()
  } catch (error) {
    if (error instanceof Error && error.message === 'REVISION_CONFLICT') {
      const latest = getPromptDocument(id)
      return { status: 'conflict', currentRevision: latest?.currentRevision ?? expectedRevision }
    }
    throw error
  }

  return { status: 'ok', document: getPromptDocument(id) as PromptDocument }
}

export function restorePromptRevision(
  promptDocumentId: string,
  revisionId: string,
  expectedRevision: number,
): SaveRevisionResult {
  const row = db
    .query(
      `
        SELECT content_markdown
        FROM prompt_revisions
        WHERE id = $revisionId AND prompt_document_id = $promptDocumentId
      `,
    )
    .get({ revisionId, promptDocumentId }) as { content_markdown: string } | null
  if (!row) return { status: 'not-found' }
  return savePromptRevision(promptDocumentId, row.content_markdown, expectedRevision, 'restored')
}
