import { describe, it, expect } from 'vitest'
import { baseUrl } from './helper.js'
import { domainLevels, isLocalPath } from '../functions/utils.js'

const json = { 'Content-Type': 'application/json' }

async function signIn(extra = {}) {
  const email = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`
  const startRes = await fetch(`${baseUrl}/auth/email/start`, {
    method: 'POST',
    headers: json,
    body: JSON.stringify({ email, ...extra }),
  })
  const start = await startRes.json()
  const verify = await fetch(start.link, { redirect: 'manual' })
  const cookie = verify.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ')
  return { email, cookie, location: verify.headers.get('location') }
}

function png(size = 0) {
  const bytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89,
  ])
  return new File([bytes, new Uint8Array(size)], 'avatar.png', { type: 'image/png' })
}

async function uploadAvatar(cookie: string, file = png()) {
  const body = new FormData()
  body.append('file', file)
  return await fetch(`${baseUrl}/v1/users/avatar`, { method: 'POST', headers: { Cookie: cookie }, body })
}

describe('cookie domain and redirect helpers', () => {
  it('uses three domain levels for two-part endings like .co.uk', () => {
    expect(domainLevels('app.example.co.uk')).toBe(3)
    expect(domainLevels('shop.example.com.au')).toBe(3)
    expect(domainLevels('app.example.com')).toBe(2)
    expect(domainLevels('my-app.orgname.workers.dev')).toBe(3)
  })

  it('accepts only same-site paths as redirect targets', () => {
    expect(isLocalPath('/products')).toBe(true)
    expect(isLocalPath('https://evil.example')).toBe(false)
    expect(isLocalPath('//evil.example')).toBe(false)
    expect(isLocalPath('/\\evil.example')).toBe(false)
    expect(isLocalPath(undefined)).toBe(false)
  })
})

describe('email sign-in redirect', () => {
  it('drops an off-site afterLoginHref and keeps a local one', async () => {
    const evil = await signIn({ afterLoginHref: 'https://evil.example/phish' })
    expect(evil.location).not.toContain('evil.example')

    const local = await signIn({ afterLoginHref: '/products' })
    expect(local.location).toBe('/products')
  })
})

describe('API validation', () => {
  it('rejects values the product form forbids', async () => {
    const { cookie } = await signIn()
    const create = (product) =>
      fetch(`${baseUrl}/v1/products`, {
        method: 'POST',
        headers: { ...json, Cookie: cookie },
        body: JSON.stringify({ product }),
      })

    expect((await create({ name: 'Negative', price: -5 })).status).toBe(400)
    expect((await create({ name: 'Huge', price: 1e9 })).status).toBe(400)
    expect((await create({ name: 'Discount', price: 5, data: { discount: 150 } })).status).toBe(400)
    expect((await create({ name: 'x'.repeat(201), price: 5 })).status).toBe(400)
    expect((await create({ name: 'Fine', price: 5, data: { discount: 20 } })).status).toBe(200)
  })

  it('returns 400 for malformed JSON instead of 500', async () => {
    const { cookie } = await signIn()
    for (const path of ['/v1/products', '/v1/users/me']) {
      const res = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: { ...json, Cookie: cookie },
        body: '{not json',
      })
      expect(res.status).toBe(400)
    }
  })

  it('rejects an oversized user data object', async () => {
    const { cookie } = await signIn()
    const res = await fetch(`${baseUrl}/v1/users/me`, {
      method: 'POST',
      headers: { ...json, Cookie: cookie },
      body: JSON.stringify({ user: { data: { blob: 'x'.repeat(20_000) } } }),
    })
    expect(res.status).toBe(400)
  })
})

describe('avatars and R2', () => {
  it('deletes the previous avatar on re-upload and on remove', async () => {
    const { cookie } = await signIn()
    const first = await (await uploadAvatar(cookie)).json()
    const second = await (await uploadAvatar(cookie)).json()
    expect(first.image).not.toBe(second.image)

    expect((await fetch(`${baseUrl}${first.image}`)).status).toBe(404)
    expect((await fetch(`${baseUrl}${second.image}`)).status).toBe(200)

    const del = await fetch(`${baseUrl}/v1/users/avatar`, { method: 'DELETE', headers: { Cookie: cookie } })
    expect(del.status).toBe(200)
    expect((await fetch(`${baseUrl}${second.image}`)).status).toBe(404)
  })

  it('never deletes a file that belongs to another user', async () => {
    const a = await signIn()
    const b = await signIn()
    const bAvatar = await (await uploadAvatar(b.cookie)).json()

    await fetch(`${baseUrl}/v1/users/me`, {
      method: 'POST',
      headers: { ...json, Cookie: a.cookie },
      body: JSON.stringify({ user: { image: bAvatar.image } }),
    })
    await fetch(`${baseUrl}/v1/users/avatar`, { method: 'DELETE', headers: { Cookie: a.cookie } })

    expect((await fetch(`${baseUrl}${bAvatar.image}`)).status).toBe(200)
  })

  it('rejects an oversized upload', async () => {
    const { cookie } = await signIn()
    const res = await uploadAvatar(cookie, png(11 * 1024 * 1024))
    expect(res.status).toBeGreaterThanOrEqual(400)
    expect(JSON.stringify(await res.json())).toContain('10MB')
  })

  it('serves avatars with a long cache header and does not 500 on a literal percent sign', async () => {
    const { cookie } = await signIn()
    const { image } = await (await uploadAvatar(cookie)).json()
    const res = await fetch(`${baseUrl}${image}`)
    expect(res.headers.get('cache-control')).toContain('immutable')

    const odd = await fetch(`${baseUrl}/r2/%25zz`)
    expect(odd.status).toBe(404)
  })
})

describe('scheduled handler', () => {
  it('runs through boot() and completes', async () => {
    const res = await fetch(`${baseUrl}/cdn-cgi/local/explorer/api/local/scheduled?worker=flaregun`, {
      method: 'POST',
      headers: json,
      body: JSON.stringify({ cron: '* * * * *' }),
    })
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.result.outcome).toBe('ok')
  })
})
