import { html } from 'lit'
import '/components/confirm-dialog.js'
import { api } from 'api'
import { BsElement } from '/components/bs-element.js'

export class FlagsPage extends BsElement {
  static properties = {
    user: { type: Object },
    loading: { type: Boolean },
    message: { type: Object },
  }

  constructor() {
    super()
    this.user = {}
    this.loading = false
    this.message = null
  }

  async connectedCallback() {
    super.connectedCallback()
    this.classList.add('d-block', 'w-100', 'mx-auto')
    this.style.maxWidth = '680px'
    this.initUser()
    if (!this.user?.id) {
      await this.fetchUser()
    }
  }

  initUser() {
    if (typeof this.user === 'string') {
      try {
        this.user = JSON.parse(this.user)
      } catch (e) {
        this.user = {}
      }
    }
  }

  async fetchUser() {
    try {
      const res = await api('/v1/users/me')
      if (res?.user) {
        this.user = {
          ...this.user,
          ...res.user,
        }
        this.requestUpdate()
      }
    } catch (e) {
      console.error('Failed to fetch user', e)
    }
  }

  get flags() {
    const rawFlags = this.user?.data?.flags
    if (rawFlags && typeof rawFlags === 'object' && !Array.isArray(rawFlags)) {
      return Object.keys(rawFlags).filter((k) => rawFlags[k])
    }
    if (Array.isArray(rawFlags)) {
      return rawFlags
    }
    if (typeof rawFlags === 'string') {
      try {
        const parsed = JSON.parse(rawFlags)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return Object.keys(parsed).filter((k) => parsed[k])
        }
        if (Array.isArray(parsed)) return parsed
      } catch (e) {}
    }
    return []
  }

  handleKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      this.addFlag()
    }
  }

  async addFlag(e) {
    if (e) e.preventDefault()
    if (this.loading) return
    const input = this.querySelector('#new-flag-input')
    const flagName = (input?.value || '').trim()

    if (!flagName) {
      this.message = { type: 'error', text: 'Please enter a flag name.' }
      return
    }

    if (this.flags.includes(flagName)) {
      this.message = { type: 'error', text: `Flag "${flagName}" is already set.` }
      return
    }

    this.loading = true
    this.message = null

    try {
      const res = await api('/v1/users/me', {
        method: 'POST',
        body: {
          user: {
            data: {
              flags: {
                [flagName]: true,
              },
            },
          },
        },
      })

      if (res?.user) {
        this.user = res.user
      } else {
        const currentFlags =
          this.user?.data?.flags && typeof this.user.data.flags === 'object' && !Array.isArray(this.user.data.flags)
            ? { ...this.user.data.flags, [flagName]: true }
            : { [flagName]: true }
        this.user = {
          ...this.user,
          data: {
            ...(this.user?.data || {}),
            flags: currentFlags,
          },
        }
      }

      if (input) {
        input.value = ''
      }
      this.message = { type: 'success', text: `Flag "${flagName}" added.` }
    } catch (err) {
      console.error(err)
      this.message = { type: 'error', text: err.message || 'Failed to add flag' }
    } finally {
      this.loading = false
      this.requestUpdate()
    }
  }

  async deleteFlag(flagName) {
    if (this.loading) return
    const dialog = this.querySelector('#confirmDialog')
    if (dialog) {
      const confirmed = await dialog.confirm({
        headline: 'Remove Flag',
        message: `Are you sure you want to remove flag "${flagName}"?`,
        confirmText: 'Remove',
        destructive: true,
        icon: 'trash',
      })
      if (!confirmed) return
    }

    this.loading = true
    this.message = null

    try {
      const res = await api('/v1/users/me', {
        method: 'POST',
        body: {
          user: {
            data: {
              flags: {
                [flagName]: null,
              },
            },
          },
        },
      })

      if (res?.user) {
        this.user = res.user
      } else {
        const currentFlags =
          this.user?.data?.flags && typeof this.user.data.flags === 'object' ? { ...this.user.data.flags } : {}
        delete currentFlags[flagName]
        this.user = {
          ...this.user,
          data: {
            ...(this.user?.data || {}),
            flags: currentFlags,
          },
        }
      }

      this.message = { type: 'success', text: `Flag "${flagName}" removed.` }
    } catch (err) {
      console.error(err)
      this.message = { type: 'error', text: err.message || 'Failed to remove flag' }
    } finally {
      this.loading = false
      this.requestUpdate()
    }
  }

  render() {
    const flags = this.flags

    return html`
      <confirm-dialog id="confirmDialog"></confirm-dialog>

      <div class="flex fcol g24 w100">
        <h1 class="fs-3 mb-0">Feature Flags</h1>

        <div class="card p24 w100">
          <div class="flex fcol g16">
            <div class="fs-5">User Flags</div>
            <div class="text-body-secondary small">
              Manage custom feature flags for your user profile. These flags are stored in <code>user.data.flags</code>.
            </div>

            ${this.message
              ? html`<div class="alert alert-${this.message.type === 'success' ? 'success' : 'danger'} py-2 mb-0" role="alert">
                  ${this.message.text}
                </div>`
              : ''}

            <form class="flex g12 aic flexw mt8" @submit=${this.addFlag}>
              <input
                class="form-control"
                style="flex: 1; min-width: 240px;"
                id="new-flag-input"
                aria-label="Flag name"
                placeholder="Flag name, e.g. beta-feature"
                ?disabled=${this.loading}
                @keydown=${this.handleKeydown} />
              <button type="button" class="btn btn-primary" ?disabled=${this.loading} @click=${this.addFlag}>
                <i class="bi bi-plus-lg"></i> Add Flag
              </button>
            </form>

            <hr class="my-2" />

            <div class="fw-medium mt8">Set Flags (${flags.length})</div>

            <div class="flex fcol g12">
              ${flags.length === 0
                ? html`
                    <div class="p24 text-center bg-body-tertiary rounded text-body-secondary">
                      No flags set yet. Enter a flag name above and click "Add Flag" to enable one.
                    </div>
                  `
                : flags.map(
                    (flag) => html`
                      <div class="flex aic jcsb px-3 py-2 rounded bg-body-tertiary border">
                        <div class="flex aic g12">
                          <div
                            class="rounded-circle bg-primary-subtle text-primary-emphasis flex aic jcc flex-shrink-0"
                            style="width: 40px; height: 40px;">
                            <i class="bi bi-flag"></i>
                          </div>
                          <span class="font-monospace fw-semibold text-break">${flag}</span>
                        </div>
                        <button
                          type="button"
                          class="btn btn-sm btn-outline-danger"
                          title="Delete Flag"
                          aria-label="Delete ${flag}"
                          ?disabled=${this.loading}
                          @click=${() => this.deleteFlag(flag)}>
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    `,
                  )}
            </div>
          </div>
        </div>
      </div>
    `
  }
}

customElements.define('flags-page', FlagsPage)
