import { html } from 'lit'
import { BsElement } from '/components/bs-element.js'

export class ConfirmDialog extends BsElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    headline: { type: String },
    message: { type: String },
    confirmText: { type: String, attribute: 'confirm-text' },
    cancelText: { type: String, attribute: 'cancel-text' },
    destructive: { type: Boolean, reflect: true },
    icon: { type: String },
  }

  constructor() {
    super()
    this.open = false
    this.headline = 'Confirm'
    this.message = ''
    this.confirmText = 'Confirm'
    this.cancelText = 'Cancel'
    this.destructive = false
    this.icon = ''
    this._resolve = null
  }

  static async confirm(options = {}) {
    const dialog = document.createElement('confirm-dialog')
    document.body.appendChild(dialog)
    try {
      return await dialog.confirm(options)
    } finally {
      // Removing mid-fade would leave Bootstrap's backdrop behind.
      await new Promise((done) => {
        dialog.addEventListener('hidden.bs.modal', done, { once: true })
        setTimeout(done, 600)
      })
      dialog.remove()
    }
  }

  _applyOptions(options = {}) {
    if (typeof options === 'string') {
      this.message = options
      return
    }
    if (options.headline !== undefined) this.headline = options.headline
    else if (options.title !== undefined) this.headline = options.title
    if (options.message !== undefined) this.message = options.message
    if (options.confirmText !== undefined) this.confirmText = options.confirmText
    if (options.cancelText !== undefined) this.cancelText = options.cancelText
    if (options.destructive !== undefined) this.destructive = options.destructive
    if (options.icon !== undefined) this.icon = options.icon
  }

  show(options = {}) {
    this._applyOptions(options)
    this.open = true
    return this
  }

  close() {
    this.open = false
  }

  confirm(options = {}) {
    this._applyOptions(options)
    this.open = true
    return new Promise((resolve) => {
      this._resolve = resolve
    })
  }

  _onConfirm() {
    this.open = false
    this.dispatchEvent(new CustomEvent('confirm', { bubbles: true, composed: true }))
    this.dispatchEvent(new CustomEvent('close', { detail: { action: 'confirm' }, bubbles: true, composed: true }))
    if (this._resolve) {
      const resolve = this._resolve
      this._resolve = null
      resolve(true)
    }
  }

  _onCancel() {
    this.open = false
    this.dispatchEvent(new CustomEvent('cancel', { bubbles: true, composed: true }))
    this.dispatchEvent(new CustomEvent('close', { detail: { action: 'cancel' }, bubbles: true, composed: true }))
    if (this._resolve) {
      const resolve = this._resolve
      this._resolve = null
      resolve(false)
    }
  }

  _handleClose(e) {
    this.open = false
    if (this._resolve) {
      const resolve = this._resolve
      this._resolve = null
      resolve(false)
    }
  }

  firstUpdated() {
    this.addEventListener('hidden.bs.modal', (e) => this._handleClose(e))
  }

  updated(changed) {
    if (!changed.has('open')) return
    const modal = this.modal('.modal')
    if (this.open) modal?.show()
    else modal?.hide()
  }

  render() {
    return html`
      <div class="modal fade" tabindex="-1" aria-labelledby="confirm-title" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title flex aic g8" id="confirm-title">
                ${this.icon ? html`<i class="bi bi-${this.icon} ${this.destructive ? 'text-danger' : ''}"></i>` : ''}
                ${this.headline}
              </h5>
              <button type="button" class="btn-close" aria-label="Close" @click=${this._onCancel}></button>
            </div>
            <div class="modal-body">${this.message}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click=${this._onCancel}>${this.cancelText}</button>
              <button
                type="button"
                class="btn ${this.destructive ? 'btn-danger' : 'btn-primary'}"
                @click=${this._onConfirm}>
                ${this.confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('confirm-dialog', ConfirmDialog)
