import { LitElement } from 'lit'
import { Modal } from 'bootstrap'
import { api } from 'api'
import state from 'state'

// Render in the light DOM so the page's Bootstrap CSS and JS apply to the component.
export class BsElement extends LitElement {
  createRenderRoot() {
    return this
  }

  modal(selector) {
    const el = this.querySelector(selector)
    return el ? Modal.getOrCreateInstance(el) : null
  }

  // `user` arrives as a JSON string attribute from the server-rendered page.
  parseUser(u) {
    if (typeof u === 'string') {
      try {
        return JSON.parse(u) || {}
      } catch (e) {
        return {}
      }
    }
    return u || {}
  }

  getUser() {
    const u = this.parseUser(this.user)
    return u.id || u.email ? u : this.parseUser(state.get('user'))
  }

  isLoggedIn() {
    const u = this.getUser()
    return !!(u.id || u.email)
  }

  // Looks up the signed-in user from the session cookie, or returns null.
  async fetchSessionUser() {
    if (this.isLoggedIn() || !/(?:^|;\s*)session=/.test(document.cookie)) return null
    try {
      return (await api('/v1/users/me'))?.user || null
    } catch (e) {
      return null
    }
  }
}
