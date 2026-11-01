// Server-side router emulating Cloudflare Pages Functions routing on Cloudflare Workers,
// with additional handlers for queues and scheduled cron events.
import { createWorker } from 'flaregun'

// flaregun matches route files by their `.js` suffix, so expose the .ts modules under .js keys.
const modules = Object.fromEntries(
  Object.entries(import.meta.glob('../functions/**/*.ts')).map(([key, load]) => [key.replace(/\.ts$/, '.js'), load]),
)

export default createWorker({ modules })
