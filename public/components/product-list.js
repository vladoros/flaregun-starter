import { html } from 'lit'
import '/components/confirm-dialog.js'
import '/components/product-form.js'
import { api } from 'api'
import { BsElement } from '/components/bs-element.js'
import { snack } from '/components/toast.js'

export class ProductList extends BsElement {
  static properties = {
    products: { type: Array },
    searchQuery: { type: String },
    activeFilter: { type: String },
    loading: { type: Boolean },
    user: { type: Object },
    canManage: { type: Boolean, attribute: 'can-manage' },
    limit: { type: Number },
    editingProduct: { type: Object },
  }

  constructor() {
    super()
    this.products = []
    this.searchQuery = ''
    this.activeFilter = 'all'
    this.loading = true
    this.user = {}
    this.canManage = false
    this.limit = 0
    this.editingProduct = {}
  }

  connectedCallback() {
    super.connectedCallback()
    this.fetchData()
    this.checkAuth()
    this.onProductSaved = () => this.fetchData()
    window.addEventListener('product-saved', this.onProductSaved)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('product-saved', this.onProductSaved)
  }




  async checkAuth() {
    const user = await this.fetchSessionUser()
    if (user) {
      this.user = user
      this.canManage = true
    }
  }

  isLoggedIn() {
    return Boolean(this.canManage || super.isLoggedIn())
  }

  async fetchData() {
    this.loading = true
    try {
      let r = await api('/v1/products')
      this.products = r.products || []
    } catch (e) {
      console.error('Failed to fetch products', e)
    } finally {
      this.loading = false
    }
  }

  handleSearch(e) {
    this.searchQuery = (e.target.value || '').toLowerCase().trim()
  }

  setFilter(filter) {
    this.activeFilter = filter
  }

  get filteredProducts() {
    const filtered = this.products.filter((p) => {
      // Query filter
      if (this.searchQuery) {
        const nameMatch = (p.name || '').toLowerCase().includes(this.searchQuery)
        const descMatch = (p.description || '').toLowerCase().includes(this.searchQuery)
        const catMatch = (p.data?.category || '').toLowerCase().includes(this.searchQuery)
        if (!nameMatch && !descMatch && !catMatch) return false
      }

      // Chip filter
      if (this.activeFilter === 'instock') {
        return p.data?.inStock !== false
      }
      if (this.activeFilter === 'sale') {
        return Boolean(p.data?.discount && p.data.discount > 0)
      }
      return true
    })

    if (this.limit > 0) {
      return filtered.slice(0, this.limit)
    }
    return filtered
  }

  openCreateDialog() {
    this.editingProduct = {}
    this.querySelector('#dialogProductForm')?.resetForm()
    this.modal('#productDialog')?.show()
  }

  openEditDialog(product) {
    this.editingProduct = {
      ...product,
      data: { ...(product.data || {}) },
    }
    this.modal('#productDialog')?.show()
  }

  closeProductDialog() {
    this.modal('#productDialog')?.hide()
  }

  handleFormSaved() {
    this.closeProductDialog()
    this.fetchData()
  }

  render() {
    const list = this.filteredProducts
    const loggedIn = this.isLoggedIn()
    const isEditing = Boolean(this.editingProduct?.id)
    const filters = [
      ['all', `All (${this.products.length})`, 'list-ul'],
      ['instock', 'In Stock', 'check-circle'],
      ['sale', 'On Sale', 'tag'],
    ]

    return html`
      <confirm-dialog id="confirmDialog"></confirm-dialog>

      ${loggedIn
        ? html`
            <div class="modal fade" id="productDialog" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">${isEditing ? 'Edit Product' : 'New Product'}</h5>
                    <button type="button" class="btn-close" aria-label="Close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <product-form
                      id="dialogProductForm"
                      embedded
                      show-cancel
                      .product=${this.editingProduct}
                      @saved=${this.handleFormSaved}
                      @cancel=${this.closeProductDialog}></product-form>
                  </div>
                </div>
              </div>
            </div>
          `
        : ''}

      <div class="flex fcol g16 w100">
        <div class="flex fcol g12">
          <input
            type="search"
            class="form-control"
            placeholder="Search products by title, category, or description..."
            @input=${this.handleSearch} />

          <div class="flex jcsb aic flexw g12">
            <div class="btn-group" role="group" aria-label="Filter products">
              ${filters.map(
                ([key, label, icon]) => html`
                  <button
                    type="button"
                    class="btn btn-outline-primary ${this.activeFilter === key ? 'active' : ''}"
                    aria-pressed=${this.activeFilter === key}
                    @click=${() => this.setFilter(key)}>
                    <i class="bi bi-${icon}"></i> ${label}
                  </button>
                `,
              )}
            </div>

            <div class="flex aic g8">
              ${loggedIn
                ? html`
                    <button type="button" class="btn btn-primary" @click=${() => this.openCreateDialog()}>
                      <i class="bi bi-plus-lg"></i> New Product
                    </button>
                  `
                : html`
                    <a href="/signin" class="btn btn-outline-secondary">
                      <i class="bi bi-box-arrow-in-right"></i> Sign in to add or edit
                    </a>
                  `}
            </div>
          </div>
        </div>

        ${this.loading
          ? html`
              <div class="flex fcol aic jcc p40 g16">
                <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
                <div class="text-body-secondary">Loading products...</div>
              </div>
            `
          : list.length === 0
            ? html`
                <div class="card p24 text-center">
                  <div class="flex fcol aic g12 p16">
                    <div class="text-body-secondary">
                      ${this.searchQuery || this.activeFilter !== 'all'
                        ? 'No products match your search or filter.'
                        : loggedIn
                          ? 'No products yet. Click "New Product" to add your first item!'
                          : 'No products available yet. Sign in to add the first product!'}
                    </div>
                    ${loggedIn && !this.searchQuery && this.activeFilter === 'all'
                      ? html`
                          <button type="button" class="btn btn-primary" @click=${() => this.openCreateDialog()}>
                            <i class="bi bi-plus-lg"></i> Create First Product
                          </button>
                        `
                      : ''}
                  </div>
                </div>
              `
            : html`
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                  ${list.map((p) => {
                    const isOutOfStock = p.data?.inStock === false
                    const discount = p.data?.discount || 0
                    const category = p.data?.category

                    return html`
                      <div class="card p16 flex fcol jcsb w100 g12">
                        <div class="flex fcol g8">
                          <div class="flex jcsb g8">
                            <div class="flex fcol g4">
                              <div class="fs-5 fw-semibold">
                                <a href="/products/${p.id}">${p.name}</a>
                              </div>
                              <div class="flex g8 aic flexw mt4">
                                ${category
                                  ? html`<span class="badge rounded-pill text-bg-secondary text-capitalize">${category}</span>`
                                  : ''}
                                <span class="badge rounded-pill text-bg-${isOutOfStock ? 'danger' : 'success'}">
                                  ${isOutOfStock ? 'Out of stock' : 'In stock'}
                                </span>
                                ${discount > 0
                                  ? html`<span class="badge rounded-pill text-bg-warning">${discount}% OFF</span>`
                                  : ''}
                              </div>
                            </div>

                            ${loggedIn
                              ? html`
                                  <div class="flex aic g4">
                                    <button
                                      type="button"
                                      class="btn btn-sm btn-outline-secondary"
                                      title="Edit product"
                                      aria-label="Edit product"
                                      @click=${() => this.openEditDialog(p)}>
                                      <i class="bi bi-pencil"></i>
                                    </button>
                                    <button
                                      type="button"
                                      class="btn btn-sm btn-outline-danger"
                                      title="Delete product"
                                      aria-label="Delete product"
                                      @click=${() => this.deleteProduct(p.id)}>
                                      <i class="bi bi-trash"></i>
                                    </button>
                                  </div>
                                `
                              : ''}
                          </div>

                          ${p.description ? html`<div class="text-body-secondary">${p.description}</div>` : ''}
                        </div>

                        <div class="flex aic jcsb mt8 pt12 border-top">
                          <div class="flex aic g8">
                            <span class="fs-5 fw-bold text-primary">$${Number(p.price).toFixed(2)}</span>
                            ${discount > 0 && discount < 100
                              ? html`
                                  <span class="text-decoration-line-through text-body-secondary small">
                                    $${(p.price / (1 - discount / 100)).toFixed(2)}
                                  </span>
                                `
                              : ''}
                          </div>
                          <a href="/products/${p.id}" class="btn btn-sm btn-link">
                            View Details <i class="bi bi-arrow-right"></i>
                          </a>
                        </div>
                      </div>
                    `
                  })}
                </div>
              `}
      </div>
    `
  }

  async deleteProduct(id) {
    const dialog = this.querySelector('#confirmDialog')
    const confirmed = await dialog.confirm({
      headline: 'Delete Product',
      message: 'Are you sure you want to delete this product?',
      confirmText: 'Delete',
      destructive: true,
      icon: 'trash',
    })
    if (!confirmed) return

    const response = await fetch(`/v1/products/${id}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      snack('Product deleted successfully')
      this.products = this.products.filter((p) => p.id !== id)
      this.requestUpdate()
    } else {
      console.error('Failed to delete product')
      snack('Failed to delete product.')
    }
  }
}

customElements.define('product-list', ProductList)
