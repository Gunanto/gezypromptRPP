import type { PromptInput, ProjectSummary } from '@promptrpp/contracts'
import { db } from '../db/client'

type ProjectRow = {
  id: string
  title: string
  document_type: PromptInput['documentType']
  curriculum: string
  subject: string
  level: string
  phase: string
  classroom: string
  semester: string
  topic: string
  input_json: string
  is_favorite: number
  archived_at: string | null
  created_at: string
  updated_at: string
}

export type ProjectRecord = {
  id: string
  title: string
  input: PromptInput
  isFavorite: boolean
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

function mapProject(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    title: row.title,
    input: JSON.parse(row.input_json) as PromptInput,
    isFavorite: row.is_favorite === 1,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function writeProjectFields(input: PromptInput) {
  return {
    documentType: input.documentType,
    curriculum: input.curriculum,
    subject: input.subject,
    level: input.level,
    phase: input.phase,
    classroom: input.classroom,
    semester: input.semester,
    topic: input.topic,
    inputJson: JSON.stringify(input),
  }
}

export function listProjects(search = ''): ProjectSummary[] {
  const query = db.query(
    `
      SELECT id, title, document_type, subject, level, classroom, topic,
             is_favorite, updated_at
      FROM projects
      WHERE archived_at IS NULL
        AND ($search = '' OR title LIKE $pattern OR subject LIKE $pattern OR topic LIKE $pattern)
      ORDER BY is_favorite DESC, updated_at DESC
      LIMIT 100
    `,
  )
  const rows = query.all({
    search,
    pattern: `%${search}%`,
  }) as Array<{
    id: string
    title: string
    document_type: PromptInput['documentType']
    subject: string
    level: string
    classroom: string
    topic: string
    is_favorite: number
    updated_at: string
  }>

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    documentType: row.document_type,
    subject: row.subject,
    level: row.level,
    classroom: row.classroom,
    topic: row.topic,
    isFavorite: row.is_favorite === 1,
    updatedAt: row.updated_at,
  }))
}

export function getProject(id: string): ProjectRecord | null {
  const row = db.query('SELECT * FROM projects WHERE id = $id').get({ id }) as ProjectRow | null
  return row ? mapProject(row) : null
}

export function getLatestProjectVersionId(projectId: string): string | null {
  const row = db
    .query(
      'SELECT id FROM project_versions WHERE project_id = $projectId ORDER BY version_number DESC LIMIT 1',
    )
    .get({ projectId }) as { id: string } | null
  return row?.id ?? null
}

export function createProject(title: string, input: PromptInput): ProjectRecord {
  const id = crypto.randomUUID()
  const versionId = crypto.randomUUID()
  const now = new Date().toISOString()
  const fields = writeProjectFields(input)

  const create = db.transaction(() => {
    db.query(
      `
        INSERT INTO projects (
          id, title, document_type, curriculum, subject, level, phase,
          classroom, semester, topic, input_json, created_at, updated_at
        ) VALUES (
          $id, $title, $documentType, $curriculum, $subject, $level, $phase,
          $classroom, $semester, $topic, $inputJson, $now, $now
        )
      `,
    ).run({ id, title, ...fields, now })

    db.query(
      `
        INSERT INTO project_versions (
          id, project_id, version_number, input_json, change_note, created_at
        ) VALUES ($id, $projectId, 1, $inputJson, $changeNote, $createdAt)
      `,
    ).run({
      id: versionId,
      projectId: id,
      inputJson: fields.inputJson,
      changeNote: 'Proyek dibuat',
      createdAt: now,
    })
  })
  create.immediate()

  return getProject(id) as ProjectRecord
}

export function saveProjectInput(
  id: string,
  title: string,
  input: PromptInput,
  changeNote = 'Input proyek diperbarui',
): { project: ProjectRecord; versionId: string; versionNumber: number } | null {
  if (!getProject(id)) return null
  const versionId = crypto.randomUUID()
  const now = new Date().toISOString()
  const fields = writeProjectFields(input)

  const current = db
    .query(
      'SELECT COALESCE(MAX(version_number), 0) AS version_number FROM project_versions WHERE project_id = $projectId',
    )
    .get({ projectId: id }) as { version_number: number }
  const versionNumber = current.version_number + 1

  const save = db.transaction(() => {
    db.query(
      `
        UPDATE projects
        SET title = $title,
            document_type = $documentType,
            curriculum = $curriculum,
            subject = $subject,
            level = $level,
            phase = $phase,
            classroom = $classroom,
            semester = $semester,
            topic = $topic,
            input_json = $inputJson,
            updated_at = $now
        WHERE id = $id
      `,
    ).run({ id, title, ...fields, now })

    db.query(
      `
        INSERT INTO project_versions (
          id, project_id, version_number, input_json, change_note, created_at
        ) VALUES ($id, $projectId, $versionNumber, $inputJson, $changeNote, $createdAt)
      `,
    ).run({
      id: versionId,
      projectId: id,
      versionNumber,
      inputJson: fields.inputJson,
      changeNote,
      createdAt: now,
    })
  })
  save.immediate()

  return {
    project: getProject(id) as ProjectRecord,
    versionId,
    versionNumber,
  }
}

export function setProjectFavorite(id: string, isFavorite: boolean): ProjectRecord | null {
  const now = new Date().toISOString()
  const result = db
    .query(
      'UPDATE projects SET is_favorite = $isFavorite, updated_at = $now WHERE id = $id',
    )
    .run({ id, isFavorite: isFavorite ? 1 : 0, now })
  return result.changes > 0 ? getProject(id) : null
}

export function archiveProject(id: string): boolean {
  const now = new Date().toISOString()
  const result = db
    .query('UPDATE projects SET archived_at = $now, updated_at = $now WHERE id = $id')
    .run({ id, now })
  return result.changes > 0
}
