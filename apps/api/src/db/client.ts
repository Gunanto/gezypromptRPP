import { Database } from 'bun:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { migrations } from './migrations'

const defaultPath = resolve(import.meta.dir, '../../../../data/promptrpp.sqlite')
const databasePath = resolve(process.env.DATABASE_PATH ?? defaultPath)

mkdirSync(dirname(databasePath), { recursive: true })

export const db = new Database(databasePath, {
  create: true,
  strict: true,
})

db.exec('PRAGMA foreign_keys = ON;')
db.exec('PRAGMA journal_mode = WAL;')
db.exec('PRAGMA busy_timeout = 5000;')

export function migrateDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `)

  const hasMigration = db.query('SELECT version FROM schema_migrations WHERE version = $version')
  const recordMigration = db.query(
    'INSERT INTO schema_migrations (version, applied_at) VALUES ($version, $appliedAt)',
  )

  for (const migration of migrations) {
    if (hasMigration.get({ version: migration.version })) continue
    const apply = db.transaction(() => {
      db.exec(migration.sql)
      recordMigration.run({
        version: migration.version,
        appliedAt: new Date().toISOString(),
      })
    })
    apply.immediate()
  }
}

migrateDatabase()

export function closeDatabase(): void {
  db.close(false)
}

export { databasePath }
