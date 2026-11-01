import { Passkeys } from 'passkeys'
import { hostURL, domainLevels, isLocalPath } from '../utils.js'
import { User } from '../data/users.js'

const EMAIL_START_LIMIT = 5 // per IP per minute

// shortcut: KV is not atomic, so this limit is approximate; use a Workers Rate Limiting binding if abused
async function tooManyEmailStarts(c) {
  if (c.data.env === 'dev') return false
  const ip = c.request.headers.get('cf-connecting-ip') || 'unknown'
  const key = `rl-email-start-${ip}-${Math.floor(Date.now() / 60000)}`
  const n = Number(await c.env.KV.get(key)) || 0
  if (n >= EMAIL_START_LIMIT) return true
  await c.env.KV.put(key, String(n + 1), { expirationTtl: 120 })
  return false
}

// The library redirects to whatever afterLoginHref it is given, so keep only same-site paths.
async function withLocalRedirect(c) {
  const input = await c.request
    .clone()
    .json()
    .catch(() => null)
  if (!input || typeof input !== 'object') return c
  for (const key of ['afterLoginHref', 'redir', 'redirect']) {
    if (input[key] !== undefined && !isLocalPath(input[key])) delete input[key]
  }
  return { ...c, request: new Request(c.request, { body: JSON.stringify(input) }) }
}

export async function onRequest(c) {
  let p = c.params.catchall
  console.log('CATCHALL', p)
  let passkeys = new Passkeys({
    appName: 'Flaregun',
    baseURL: `${hostURL(c)}/auth`,
    domainLevels: domainLevels(c),
    kv: c.env.KV,
    // Without a mailer the library returns the sign-in link in the response, so only allow that in dev.
    // Replace ConsoleMailer with your own mailer instance with a send() function.
    mailer: c.data.env === 'dev' ? undefined : c.data.mailer,
    logger: c.data.logger,
    emailStart: async ({ email }) => {
      let normalized = (email || '').toLowerCase().trim()
      let user = await c.data.d1.first(User, { where: { email: normalized } })
      if (!user) {
        user = await c.data.d1.insert(User, {
          email: normalized,
          name: normalized.split('@')[0],
        })
      }
      return { userId: user.id }
    },
  })

  if (p[0] == 'email') {
    if (p[1] == 'start') {
      if (await tooManyEmailStarts(c)) {
        return Response.json({ error: { message: 'Too many requests, try again in a minute' } }, { status: 429 })
      }
      return await passkeys.emailStart(await withLocalRedirect(c))
    }
    if (p[1] == 'verify') {
      return await passkeys.emailVerify(c)
    }
  } else if (p[0] == 'passkeys') {
    if (p[1] == 'new') {
      return await passkeys.new(c)
    }
    if (p[1] == 'start') {
      return await passkeys.start(c)
    }
    if (p[1] == 'create') {
      return await passkeys.create(c)
    }
    if (p[1] == 'verify') {
      return await passkeys.verify(c)
    }
    if (p[1] == 'check') {
      return await passkeys.check(c)
    }
    if (p[1] == 'list' && c.request.method === 'GET') {
      return await passkeys.list(c)
    }
    if ((p[1] == 'delete' || p[1] == 'remove') && (c.request.method === 'POST' || c.request.method === 'DELETE')) {
      return await passkeys.delete(c)
    }
  }

  return Response.json({ error: { message: 'Not found' } }, { status: 404 })
}
