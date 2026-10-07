export type Migration = {
  version: string
  sql: string
}

export const migrations: Migration[] = [
  {
    version: '0001_initial',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        display_name TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        document_type TEXT NOT NULL,
        curriculum TEXT NOT NULL,
        subject TEXT NOT NULL,
        level TEXT NOT NULL,
        phase TEXT NOT NULL DEFAULT '',
        classroom TEXT NOT NULL,
        semester TEXT NOT NULL DEFAULT '',
        topic TEXT NOT NULL,
        input_json TEXT NOT NULL,
        is_favorite INTEGER NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
        archived_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_projects_owner_updated
        ON projects(owner_id, updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_projects_search
        ON projects(document_type, subject, level, archived_at);

      CREATE TABLE IF NOT EXISTS project_versions (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        input_json TEXT NOT NULL,
        change_note TEXT,
        created_at TEXT NOT NULL,
        UNIQUE(project_id, version_number)
      );

      CREATE TABLE IF NOT EXISTS prompt_generations (
        id TEXT PRIMARY KEY,
        project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
        project_version_id TEXT REFERENCES project_versions(id) ON DELETE SET NULL,
        document_type TEXT NOT NULL,
        output_level TEXT NOT NULL,
        engine_version TEXT NOT NULL,
        prompt_markdown TEXT NOT NULL,
        warnings_json TEXT NOT NULL DEFAULT '[]',
        assumptions_json TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_generations_project_created
        ON prompt_generations(project_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS prompt_documents (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        source_generation_id TEXT REFERENCES prompt_generations(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        document_type TEXT NOT NULL,
        content_markdown TEXT NOT NULL,
        current_revision INTEGER NOT NULL DEFAULT 1,
        archived_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_prompt_documents_project_updated
        ON prompt_documents(project_id, updated_at DESC);

      CREATE TABLE IF NOT EXISTS prompt_revisions (
        id TEXT PRIMARY KEY,
        prompt_document_id TEXT NOT NULL REFERENCES prompt_documents(id) ON DELETE CASCADE,
        revision_number INTEGER NOT NULL,
        content_markdown TEXT NOT NULL,
        change_source TEXT NOT NULL CHECK (change_source IN ('generated', 'manual-edit', 'restored')),
        created_at TEXT NOT NULL,
        UNIQUE(prompt_document_id, revision_number)
      );

      CREATE INDEX IF NOT EXISTS idx_prompt_revisions_document
        ON prompt_revisions(prompt_document_id, revision_number DESC);

      CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        owner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        document_type TEXT,
        subject TEXT,
        level TEXT,
        input_json TEXT NOT NULL,
        is_system INTEGER NOT NULL DEFAULT 0 CHECK (is_system IN (0, 1)),
        is_favorite INTEGER NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
        archived_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        default_destination TEXT,
        export_format TEXT,
        preferences_json TEXT NOT NULL DEFAULT '{}',
        updated_at TEXT NOT NULL
      );
    `,
  },
]
