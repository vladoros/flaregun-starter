import { test, expect } from 'vitest'
import { baseUrl } from './helper.js'

test('demo page route /demo is served and renders bootstrap-demo component', async () => {
  const res = await fetch(`${baseUrl}/demo`)
  expect(res.status).toBe(200)
  const html = await res.text()

  expect(html).toContain('Bootstrap Demo')
  expect(html).toContain('/components/bootstrap-demo.js')
  expect(html).toContain('<bootstrap-demo></bootstrap-demo>')
})

test('bootstrap-demo component is served and uses Bootstrap components', async () => {
  const res = await fetch(`${baseUrl}/components/bootstrap-demo.js`)
  expect(res.status).toBe(200)
  const code = await res.text()

  expect(code).toContain("customElements.define('bootstrap-demo', BootstrapDemo)")
  expect(code).toContain("import { Tooltip } from 'bootstrap'")
  for (const marker of ['btn-group', 'dropdown-menu', 'form-switch', 'form-range', 'nav-tabs', 'modal fade', 'progress-bar', 'accordion', 'list-group']) {
    expect(code).toContain(marker)
  }
})

test('product-form component uses Bootstrap select, switch, range, and toast', async () => {
  const res = await fetch(`${baseUrl}/components/product-form.js`)
  expect(res.status).toBe(200)
  const code = await res.text()

  expect(code).toContain("import { snack } from '/components/toast.js'")
  expect(code).toContain('class="form-select')
  expect(code).toContain('form-switch')
  expect(code).toContain('class="form-range"')
})

test('product-list component uses Bootstrap search, filter button group, and badges', async () => {
  const res = await fetch(`${baseUrl}/components/product-list.js`)
  expect(res.status).toBe(200)
  const code = await res.text()

  expect(code).toContain('type="search"')
  expect(code).toContain('class="btn-group"')
  expect(code).toContain('badge rounded-pill')
})

test('toast helper is served and imports Bootstrap', async () => {
  const res = await fetch(`${baseUrl}/components/toast.js`)
  expect(res.status).toBe(200)
  expect(await res.text()).toContain("import { Toast } from 'bootstrap'")
})

test('layout navbar includes navigation links for Products and Components Demo', async () => {
  const res = await fetch(`${baseUrl}/`)
  expect(res.status).toBe(200)
  const html = await res.text()

  expect(html).toContain('Products')
  expect(html).toContain('Components Demo')
  expect(html).toContain('href="/demo"')
})
