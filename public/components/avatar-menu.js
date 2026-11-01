import { html } from 'lit'
import 'bootstrap'
import { api } from 'api'
import state from 'state'
import { signOut } from './auth-utils.js'
import { BsElement } from '/components/bs-element.js'

export class AvatarMenu extends BsElement {
  static properties = {
    user: { type: Object },
  }

  constructor() {
    super()
    this.user = {}
    this.onUserChange = (e) => {
      this.user = e.detail.value || {}
      this.requestUpdate()
    }
  }

  async connectedCallback() {
    super.connectedCallback()
    state.addEventListener('user', this.onUserChange)
    const initialUser = this.parseUser(this.user)
    if (initialUser && (initialUser.id || initialUser.email)) {
      state.set('user', initialUser, { skipStorage: true })
    } else if (!this.isLoggedIn() && /(?:^|;\s*)session=/.test(document.cookie)) {
      try {
        const res = await api('/v1/users/me')
        if (res?.user) {
          this.user = res.user
          state.set('user', res.user, { skipStorage: true })
          this.requestUpdate()
        }
      } catch (e) {}
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    state.removeEventListener('user', this.onUserChange)
  }

  isLoggedIn() {
    const user = this.getUser()
    return !!(user.id || user.email)
  }

  parseUser(u) {
    if (typeof u === 'string') {
      try {
        return JSON.parse(u)
      } catch (e) {
        return {}
      }
    }
    return u || {}
  }

  getUser() {
    const u = this.parseUser(this.user)
    if (u && (u.id || u.email)) {
      return u
    }
    return state.get('user') || {}
  }

  async handleSignOut(e) {
    e?.preventDefault()
    state.delete('user')
    signOut()
  }

  render() {
    if (!this.isLoggedIn()) {
      return html`<a href="/signin" class="btn btn-outline-primary">Sign In</a>`
    }

    const user = this.getUser()
    const imageUrl = user.image || user.avatarUrl || user.data?.image || user.data?.avatarUrl
    const initial = (user.name || user.email || 'U').charAt(0).toUpperCase()

    return html`
      <div class="dropdown">
        <button
          class="btn btn-primary rounded-circle p-0 overflow-hidden fw-semibold"
          style="width: 38px; height: 38px;"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          aria-label="User account menu">
          ${
            imageUrl
              ? html`<img src="${imageUrl}" class="w-100 h-100 object-fit-cover" alt="${user.name || 'User Avatar'}" />`
              : html`<span>${initial}</span>`
          }
        </button>

        <ul class="dropdown-menu dropdown-menu-end">
          <li class="px-3 py-2" style="min-width: 200px;">
            <div class="fw-semibold">${user.name || 'Account'}</div>
            <div class="small text-body-secondary text-truncate">${user.email || ''}</div>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <a href="/settings" class="dropdown-item flex aic g8"><i class="bi bi-gear"></i>Settings</a>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <a href="/signout" class="dropdown-item flex aic g8" @click=${this.handleSignOut}>
              <i class="bi bi-box-arrow-right"></i>Sign out
            </a>
          </li>
        </ul>
      </div>
    `
  }
}

customElements.define('avatar-menu', AvatarMenu)
