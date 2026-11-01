import { html } from 'lit'
import { api } from 'api'
import state from 'state'
import { startRegistration, startAuthentication } from 'passkeys/public/js/auth.js'
import { signOut } from './auth-utils.js'
import { BsElement } from '/components/bs-element.js'

export class SignIn extends BsElement {
  static properties = {
    baseURL: { type: String },
    afterLoginHref: { type: String },
    user: { type: Object },
    capable: { type: Boolean },
    hasPasskey: { type: Boolean },
    error: { type: Object },
    success: { type: Object },
  }

  constructor() {
    super()
    this.baseURL = ''
    this.afterLoginHref = '/'
    this.user = null
    this.capable = false
    this.hasPasskey = false
    this.error = null
    this.success = null
  }

  connectedCallback() {
    super.connectedCallback()
    this.classList.add('d-block', 'w-100')
    this.style.maxWidth = '400px'
    if (this.user) {
      let u = this.user
      if (typeof u === 'string') {
        try {
          u = JSON.parse(u)
        } catch (e) {
          u = null
        }
      }
      if (u && (u.id || u.email)) {
        state.set('user', u, { skipStorage: true })
      }
    }
    this.checkCapabilities()
  }

  async checkCapabilities() {
    if (window.PublicKeyCredential) {
      this.capable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    }
    if (!this.capable) return

    if (!this.isLoggedIn()) {
      this.signin2(true) // Start conditional UI / autofill
    } else {
      try {
        let r = await api(`${this.baseURL}/passkeys/check`, {
          method: 'POST',
          body: {},
        })
        if (r.numPasskeys > 0) {
          this.hasPasskey = true
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  render() {
    let err = ''
    if (this.error) {
      err = html`<div class="alert alert-danger mb-0" role="alert">${this.error.message}</div>`
    }

    if (this.success) {
      return html`
        <div class="card p24 w100">
          <div class="success">
            ${this.success.message}
            ${this.success.link ? html`<br /><br /><a href="${this.success.link}">Click to verify</a>` : ''}
          </div>
        </div>
      `
    }

    if (this.isLoggedIn()) {
      if (!this.capable) {
        return html`
          <div class="card p24 w100">
            <div class="flex fcol g16 aic tac">
              ${err}
              <div>
                You are signed in.<br /><br />
                <a href="${this.afterLoginHref}">Continue to dashboard</a>.
              </div>
            </div>
          </div>
        `
      }

      return html`
        <div class="card p24 w100">
          <div class="flex fcol g16 aic tac">
            ${err}
            ${
              this.hasPasskey
                ? html`
                    <div>
                      You already have a passkey.<br /><br />
                      <a href="${this.afterLoginHref}">Continue to dashboard</a>.
                    </div>
                  `
                : html`
                    <div>
                      <a href="${this.afterLoginHref}">Skip this and create passkey later</a>
                    </div>
                  `
            }
            <div>
              <button type="button" class="btn btn-primary" @click=${this.createPasskey}>Create Passkey</button>
            </div>
          </div>
        </div>
      `
    }

    return html`
      <div class="card p24 w100">
        <form
          class="w100"
          @submit=${(e) => {
            e.preventDefault()
            this.emailStart()
          }}>
          <div class="flex fcol g16">
            ${err}
            <label class="form-label mb-0">
              Email
              <input
                class="form-control mt-1"
                type="email"
                id="email"
                @keyup=${this.keyUpHandler}
                required
                autocomplete="${this.capable ? 'webauthn' : 'email'}" />
            </label>
            <button type="button" class="btn btn-primary mt8" @click=${this.emailStart}>Continue</button>
            ${
              this.capable
                ? html`
                    <div class="flex aic g12 text-body-secondary small">
                      <hr class="flex-grow-1 m-0" />OR<hr class="flex-grow-1 m-0" />
                    </div>
                    <button type="button" class="btn btn-outline-primary" @click=${this.signin}>
                      Sign in with Passkey
                    </button>
                  `
                : ''
            }
          </div>
        </form>
      </div>
    `
  }


  signOut() {
    state.delete('user')
    signOut()
  }

  keyUpHandler(e) {
    if (e.key === 'Enter') {
      this.emailStart()
    }
  }

  async emailStart() {
    this.error = null
    let emailF = this.querySelector('#email')
    if (!emailF.reportValidity()) {
      return
    }
    let email = emailF.value.trim().toLowerCase()
    try {
      let r = await api(`${this.baseURL}/email/start`, {
        method: 'POST',
        body: { email: email, afterLoginHref: this.afterLoginHref },
      })
      this.success = r
    } catch (e) {
      console.error(e)
      this.error = e
    }
  }

  async signin() {
    this.signin2(false)
  }

  async signin2(conditionalUI = false) {
    this.error = null
    let challenge
    try {
      challenge = await api(`${this.baseURL}/passkeys/start`, {
        method: 'POST',
        body: {},
      })

      let cred
      try {
        cred = await startAuthentication({
          optionsJSON: challenge,
          useBrowserAutofill: conditionalUI,
          verifyBrowserAutofillInput: false,
        })
      } catch (e) {
        if (conditionalUI && e.name === 'AbortError') {
          return
        }
        throw e
      }

      let r = await api(`${this.baseURL}/passkeys/verify`, {
        method: 'POST',
        body: {
          credential: cred,
        },
      })
      if (!r.verified) {
        this.error = { message: 'Not verified' }
      } else {
        this.success = { message: 'You signed in with a passkey!' }
      }
      window.location.href = this.afterLoginHref || '/'
    } catch (e) {
      console.error(e)
      if (!(e.message?.includes('autofill') || e.message?.includes('autocomplete'))) {
        this.error = e
      }
    }
  }

  async createPasskey() {
    this.error = null
    let regOptions
    try {
      regOptions = await api(`${this.baseURL}/passkeys/new`, {
        method: 'POST',
        body: {},
      })
    } catch (e) {
      console.error(e)
      this.error = e
      return
    }
    let userId = regOptions.user.id

    let attResp = null
    try {
      attResp = await startRegistration({
        optionsJSON: regOptions,
      })
    } catch (error) {
      console.error(error)
      this.error = error
      throw error
    }

    try {
      let r = await api(`${this.baseURL}/passkeys/create`, {
        method: 'POST',
        body: {
          credential: attResp,
          userId: userId,
        },
      })
      if (!r.verified) {
        this.error = { message: 'Not verified' }
      } else {
        this.success = {
          message: html`Passkey created! Next time you can sign in with it. <br /><br /><a href="${this.afterLoginHref}"
              >Continue to dashboard</a
            >`,
        }
      }
    } catch (e) {
      console.error(e)
      this.error = e
    }
  }
}

customElements.define('sign-in', SignIn)
