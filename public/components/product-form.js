import { html } from 'lit'
import { api } from 'api'
import { BsElement } from '/components/bs-element.js'
import { snack } from '/components/toast.js'

export class ProductForm extends BsElement {
  static properties = {
    product: { type: Object },
    submitting: { type: Boolean },
    discount: { type: Number },
    embedded: { type: Boolean },
    showCancel: { type: Boolean, attribute: 'show-cancel' },
  }

  constructor() {
    super()
    this.product = {}
    this.submitting = false
    this.discount = 0
    this.embedded = false
    this.showCancel = false
    this._uid = `pf-${Math.random().toString(36).slice(2, 8)}`
  }

  updated(changedProperties) {
    if (changedProperties.has('product')) {
      const p = this.getProductObj()
      this.discount = Number(p.data?.discount) || 0
      this.syncFields(p)
    }
  }

  getProductObj() {
    if (typeof this.product === 'string') {
      try {
        return JSON.parse(this.product)
      } catch (e) {
        return {}
      }
    }
    return this.product || {}
  }

  field(name) {
    return this.querySelector(`[name="${name}"]`)
  }

  syncFields(p = this.getProductObj()) {
    const set = (name, prop, value) => {
      const el = this.field(name)
      if (el) el[prop] = value
    }
    set('name', 'value', p.name || '')
    set('description', 'value', p.description || '')
    set('price', 'value', p.price !== undefined && p.price !== null ? String(p.price) : '')
    set('category', 'value', p.data?.category || 'electronics')
    set('inStock', 'checked', p.data?.inStock !== false)
    set('discount', 'value', Number(p.data?.discount) || 0)
  }

  resetForm() {
    this.product = {}
    this.discount = 0
    const f = this.querySelector('form')
    if (f) f.reset()
    this.syncFields({})
  }

  handleCancel() {
    this.dispatchEvent(new CustomEvent('cancel', { bubbles: true, composed: true }))
  }

  renderFormContent() {
    const p = this.getProductObj()
    const isEditing = Boolean(p.id)
    const category = p.data?.category || 'electronics'
    const categories = [
      ['electronics', 'Electronics'],
      ['apparel', 'Apparel'],
      ['books', 'Books & Media'],
      ['home', 'Home & Kitchen'],
      ['accessories', 'Accessories'],
    ]

    return html`
      <form
        class="w100"
        @submit=${(e) => {
          e.preventDefault()
          this.submit()
        }}>
        <div class="flex fcol g16">
          <label class="form-label mb-0">
            Name
            <input
              class="form-control mt-1"
              name="name"
              .value=${p.name || ''}
              required
              minlength="2"
              placeholder="e.g. Wireless Headphones" />
          </label>

          <label class="form-label mb-0">
            Category
            <select class="form-select mt-1" name="category" required>
              ${categories.map(
                ([value, label]) => html`<option value=${value} ?selected=${category === value}>${label}</option>`,
              )}
            </select>
          </label>

          <label class="form-label mb-0">
            Description
            <input
              class="form-control mt-1"
              name="description"
              .value=${p.description || ''}
              placeholder="Brief description of the product" />
          </label>

          <label class="form-label mb-0">
            Price ($)
            <input
              class="form-control mt-1"
              name="price"
              type="number"
              .value=${String(p.price ?? '')}
              required
              placeholder="1.0"
              step="0.01"
              min="0.01"
              max="1000000" />
          </label>

          <div class="form-check form-switch">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              id="${this._uid}-inStock"
              name="inStock"
              ?checked=${p.data?.inStock !== false} />
            <label class="form-check-label" for="${this._uid}-inStock">In Stock</label>
            <div class="text-body-secondary small">Show item as immediately available</div>
          </div>

          <div class="flex fcol g4">
            <div class="flex jcsb aic">
              <label class="form-label mb-0" for="${this._uid}-discount">Discount</label>
              <span class="text-body-secondary small">${this.discount}% off</span>
            </div>
            <input
              type="range"
              class="form-range"
              id="${this._uid}-discount"
              name="discount"
              min="0"
              max="75"
              step="5"
              .value=${String(this.discount)}
              @input=${(e) => {
                this.discount = Number(e.target.value) || 0
              }} />
          </div>

          ${this.submitting ? html`<div class="progress" style="height: 4px;"><div class="progress-bar progress-bar-striped progress-bar-animated w-100"></div></div>` : ''}

          <div class="flex jce g8 mt8">
            ${this.showCancel
              ? html`
                  <button type="button" class="btn btn-link" @click=${this.handleCancel} ?disabled=${this.submitting}>
                    Cancel
                  </button>
                `
              : ''}
            <button type="submit" class="btn btn-primary" ?disabled=${this.submitting}>
              <i class="bi bi-${isEditing ? 'check-lg' : 'save'}"></i>
              ${this.submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </div>
      </form>
    `
  }

  render() {
    if (this.embedded) {
      return this.renderFormContent()
    }
    return html`
      <div class="card p16 w100 mb24">${this.renderFormContent()}</div>
    `
  }

  async submit() {
    const f = this.querySelector('form')
    if (!f.reportValidity()) return

    const current = this.getProductObj()
    const isEditing = Boolean(current.id)
    const categoryEl = this.field('category')
    const inStockEl = this.field('inStock')
    const discountEl = this.field('discount')

    this.submitting = true
    try {
      const payload = {
        name: this.field('name').value,
        description: this.field('description').value,
        price: parseFloat(this.field('price').value),
        data: {
          ...(current.data || {}),
          category: categoryEl ? categoryEl.value : current.data?.category || 'electronics',
          inStock: inStockEl ? inStockEl.checked : true,
          discount: discountEl ? Number(discountEl.value) : this.discount,
        },
      }

      let r
      if (isEditing) {
        r = await api(`/v1/products/${current.id}`, {
          method: 'PUT',
          body: {
            product: payload,
          },
        })
        snack('Product updated successfully!')
      } else {
        r = await api('/v1/products', {
          method: 'POST',
          body: {
            product: payload,
          },
        })
        snack('Product saved successfully!')
      }

      this.product = r.product

      // Dispatch events for in-page and dialog listeners
      window.dispatchEvent(new CustomEvent('product-saved', { detail: r.product }))
      this.dispatchEvent(new CustomEvent('saved', { detail: r.product, bubbles: true, composed: true }))

      if (!isEditing) {
        this.resetForm()
      }
    } catch (err) {
      console.error(err)
      snack(err.message || 'Failed to save product')
    } finally {
      this.submitting = false
    }
  }
}

customElements.define('product-form', ProductForm)
