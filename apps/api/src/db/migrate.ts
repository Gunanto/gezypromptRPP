import { closeDatabase, databasePath, migrateDatabase } from './client'

migrateDatabase()
console.log(`Database siap: ${databasePath}`)
closeDatabase()
