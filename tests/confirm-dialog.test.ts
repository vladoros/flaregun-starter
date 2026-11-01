import { test, expect } from 'vitest'
import { baseUrl } from './helper.js'

test('confirm-dialog component is served and structured properly', async () => {
  const res = await fetch(`${baseUrl}/components/confirm-dialog.js`)
  expect(res.status).toBe(200)
  const code = await res.text()

  expect(code).toContain("customElements.define('confirm-dialog', ConfirmDialog)")
  expect(code).toContain("import { BsElement } from '/components/bs-element.js'")
  expect(code).toContain('class="modal fade"')
  expect(code).toContain('hidden.bs.modal')
  expect(code).toContain('confirm(options = {})')
  expect(code).toContain('static async confirm(options = {})')
  expect(code).not.toContain('md-')
})

test('product-list component uses confirm-dialog for delete confirmation', async () => {
  const res = await fetch(`${baseUrl}/components/product-list.js`)
  expect(res.status).toBe(200)
  const code = await res.text()

  expect(code).toContain("import '/components/confirm-dialog.js'")
  expect(code).toContain('<confirm-dialog id="confirmDialog"></confirm-dialog>')
  expect(code).toContain('dialog.confirm(')
  expect(code).not.toContain("if (confirm('Are you sure")
})

test('index page includes confirm-dialog component script', async () => {
  const res = await fetch(`${baseUrl}/`)
  expect(res.status).toBe(200)
  const html = await res.text()

  expect(html).toContain('/components/confirm-dialog.js')
  expect(html).toContain('product-list')
})
