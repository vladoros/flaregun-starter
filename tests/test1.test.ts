import { test, expect } from 'vitest'
import { c, baseUrl } from './helper.js'

test('test1 - /v1/users removed and /v1/users/me requires auth', async () => {
  // Unauthenticated /v1/users endpoints are removed
  const removedPost = await fetch(`${baseUrl}/v1/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: { name: 'John Wick', email: 'john@wick.com' } }),
  })
  expect(removedPost.status).toBe(404)

  const removedGet = await fetch(`${baseUrl}/v1/users/some-id`)
  expect(removedGet.status).toBe(404)

  // Authenticate and verify /v1/users/me works
  const email = `john-${Date.now()}@wick.com`
  const startRes = await fetch(`${baseUrl}/auth/email/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  expect(startRes.status).toBe(200)
  const startData = await startRes.json()
  const verifyRes = await fetch(startData.link, { redirect: 'manual' })
  const setCookieHeaders = verifyRes.headers.getSetCookie?.() || [verifyRes.headers.get('set-cookie')].filter(Boolean)
  const cookieHeader = setCookieHeaders.map((sc) => sc.split(';')[0]).join('; ')

  let r = await c.api.fetch(`/v1/users/me`, {
    method: 'POST',
    headers: { Cookie: cookieHeader },
    body: { user: { name: 'John Wick' } },
  })
  expect(r.user).toBeDefined()
  expect(r.user.name).toBe('John Wick')

  r = await c.api.fetch(`/v1/users/me`, {
    headers: { Cookie: cookieHeader },
  })
  expect(r.user).toBeDefined()
  expect(r.user.name).toBe('John Wick')
  expect(r.user.email).toBe(email)
})

test('signin page renders centered layout and starter component', async () => {
  const res = await fetch(`${baseUrl}/signin`)
  expect(res.status).toBe(200)
  const html = await res.text()
  expect(html).toContain('Sign In - Flaregun')
  expect(html).toContain('flex fcol aic jcc')
  expect(html).toContain('/components/sign-in.js')
  expect(html).toContain('<sign-in baseURL="/auth" afterLoginHref="/"></sign-in>')

  const compRes = await fetch(`${baseUrl}/components/sign-in.js`)
  expect(compRes.status).toBe(200)
  const compCode = await compRes.text()
  expect(compCode).toContain("customElements.define('sign-in', SignIn)")
  expect(compCode).toContain('class="card')
  expect(compCode).not.toContain('md-')
})

test('layout loads Bootstrap and styles carry no Material tokens', async () => {
  const pageRes = await fetch(`${baseUrl}/`)
  const page = await pageRes.text()
  expect(page).toContain('bootstrap@5.3/dist/css/bootstrap.min.css')
  expect(page).toContain('bootstrap-icons')
  expect(page).toContain('"bootstrap": "https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/js/bootstrap.esm.min.js"')
  expect(page).not.toContain('material/')

  const cssRes = await fetch(`${baseUrl}/css/styles.css`)
  expect(cssRes.status).toBe(200)
  const cssText = await cssRes.text()
  expect(cssText).toContain('.fcol')
  expect(cssText).not.toContain('--md-')
  expect(cssText).not.toContain('md-card')
})

test('navbar includes padding for demo', async () => {
  const res = await fetch(`${baseUrl}/`)
  expect(res.status).toBe(200)
  const html = await res.text()
  expect(html).toMatch(/class="[^"]*topnav[^"]*p16[^"]*"/)

  const cssRes = await fetch(`${baseUrl}/css/styles.css`)
  expect(cssRes.status).toBe(200)
  const cssText = await cssRes.text()
  expect(cssText).toMatch(/\.topnav\s*\{[^}]*padding:\s*16px;/)
})
