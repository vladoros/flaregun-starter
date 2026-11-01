import { html } from 'lit'
import '/components/confirm-dialog.js'
import '/components/product-form.js'
import { BsElement } from '/components/bs-element.js'
import { snack } from '/components/toast.js'

export class ProductDetail extends BsElement {
  static properties = {
    product: { type: Object },
    user: { type: Object },
    canManage: { type: Boolean, attribute: 'can-manage' },
  }

  constructor() {
    super()
    this.product = {}
    this.user = {}
    this.canManage = false
  }

  connectedCallback() {
    super.connectedCallback()
    this.checkAuth()
  }


  async checkAuth() {
    const user = await this.fetchSessionUser()
    if (user) {
      this.user = user
      this.canManage = Boolean(this.getProduct().userId === user.id)
    }
  }

  isLoggedIn() {
    return Boolean(this.canManage || super.isLoggedIn())
  }

  getProduct() {
    if (typeof this.product === 'string') {
      if (!this.product) return {}
      try {
        return JSON.parse(this.product)
      } catch (e) {
        return {}
      }
    }
    return this.product || {}
  }



  canManageProduct() {
    const p = this.getProduct()
    const u = this.getUser()
    if (this.canManage) return true
    return Boolean(u.id && p.userId && u.id === p.userId)
  }

  openEditDialog() {
    this.modal('#editDialog')?.show()
  }

  closeEditDialog() {
    this.modal('#editDialog')?.hide()
  }

  handleSaved(e) {
    if (e.detail) {
      this.product = e.detail
    }
    this.closeEditDialog()
  }

  async deleteProduct() {
    const p = this.getProduct()
    if (!p.id) return

    const dialog = this.querySelector('#confirmDialog')
    const confirmed = await dialog.confirm({
      headline: 'Delete Product',
      message: `Are you sure you want to delete "${p.name}"?`,
      confirmText: 'Delete',
      destructive: true,
      icon: 'trash',
    })
    if (!confirmed) return

    const res = await fetch(`/v1/products/${p.id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      snack('Product deleted')
      window.location.href = '/products'
    } else {
      snack('Failed to delete product')
    }
  }

  render() {
    const p = this.getProduct()
    const loggedIn = this.isLoggedIn()
    const canEdit = this.canManageProduct()

    if (!p || !p.id) {
      return html`
        <div class="card p24 text-center">
          <div class="flex fcol aic g16">
            <div class="fs-4">Product Not Found</div>
            <div class="text-body-secondary">The product you are looking for does not exist or has been removed.</div>
            <a href="/products" class="btn btn-primary"><i class="bi bi-arrow-left"></i> Back to Products</a>
          </div>
        </div>
      `
    }

    const isOutOfStock = p.data?.inStock === false
    const discount = p.data?.discount || 0
    const category = p.data?.category

    return html`
      <confirm-dialog id="confirmDialog"></confirm-dialog>

      ${canEdit
        ? html`
            <div class="modal fade" id="editDialog" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Edit Product</h5>
                    <button type="button" class="btn-close" aria-label="Close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <product-form
                      embedded
                      show-cancel
                      .product=${p}
                      @saved=${this.handleSaved}
                      @cancel=${this.closeEditDialog}></product-form>
                  </div>
                </div>
              </div>
            </div>
          `
        : ''}

      <div class="flex fcol g20">
        <div class="flex aic jcsb flexw g12">
          <a href="/products" class="btn btn-link"><i class="bi bi-arrow-left"></i> Back to Products</a>

          ${canEdit
            ? html`
                <div class="flex aic g8">
                  <button type="button" class="btn btn-secondary" @click=${this.openEditDialog}>
                    <i class="bi bi-pencil"></i> Edit Product
                  </button>
                  <button type="button" class="btn btn-outline-danger" @click=${this.deleteProduct}>
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </div>
              `
            : !loggedIn
              ? html`
                  <a href="/signin?redirect=/products/${p.id}" class="btn btn-secondary">
                    <i class="bi bi-box-arrow-in-right"></i> Sign in to edit
                  </a>
                `
              : ''}
        </div>

        <div class="card p24 flex fcol g16">
          <div class="flex fcol g8">
            <div class="flex g8 aic flexw">
              ${category ? html`<span class="badge rounded-pill text-bg-secondary text-capitalize">${category}</span>` : ''}
              <span class="badge rounded-pill text-bg-${isOutOfStock ? 'danger' : 'success'}">
                ${isOutOfStock ? 'Out of stock' : 'In stock'}
              </span>
              ${discount > 0 ? html`<span class="badge rounded-pill text-bg-warning">${discount}% OFF</span>` : ''}
            </div>

            <h1 class="fs-2 fw-semibold mt8 mb-0">${p.name}</h1>
          </div>

          <div class="flex aic g12">
            <span class="fs-3 fw-bold text-primary">$${Number(p.price).toFixed(2)}</span>
            ${discount > 0 && discount < 100
              ? html`
                  <span class="text-decoration-line-through text-body-secondary">
                    $${(p.price / (1 - discount / 100)).toFixed(2)}
                  </span>
                `
              : ''}
          </div>

          <hr class="m-0" />

          <div class="flex fcol g8">
            <div class="fw-medium">Description</div>
            <div class="text-body-secondary">${p.description || 'No description provided.'}</div>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('product-detail', ProductDetail)
