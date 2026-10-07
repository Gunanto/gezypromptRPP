import app from './app'
import { closeDatabase } from './db/client'

const port = Number(process.env.API_PORT ?? 3001)

process.on('SIGINT', () => {
  closeDatabase()
  process.exit(0)
})

process.on('SIGTERM', () => {
  closeDatabase()
  process.exit(0)
})

export default {
  port,
  fetch: app.fetch,
  maxRequestBodySize: 2 * 1024 * 1024,
}
