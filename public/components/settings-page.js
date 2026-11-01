import { html } from 'lit'
import '/components/confirm-dialog.js'
import { api } from 'api'
import state from 'state'
import { startRegistration } from 'passkeys/public/js/auth.js'
import { BsElement } from '/components/bs-element.js'

export class SettingsPage extends BsElement {
  static properties = {
    user: { type: Object },
    passkeys: { type: Array },
    loadingAvatar: { type: Boolean },
    loadingProfile: { type: Boolean },
    loadingPasskeys: { type: Boolean },
    profileMessage: { type: Object },
    avatarMessage: { type: Object },
    passkeyMessage: { type: Object },
  }

  constructor() {
    super()
    this.user = {}
    this.passkeys = []
    this.loadingAvatar = false
    this.loadingProfile = false
    this.loadingPasskeys = false
    this.profileMessage = null
    this.avatarMessage = null
    this.passkeyMessage = null
  }

  async connectedCallback() {
    super.connectedCallback()
    this.classList.add('d-block', 'w-100', 'mx-auto')
    this.style.maxWidth = '680px'
    this.initUser()
    this.fetchPasskeys()
    if (!this.user?.email) {
      await this.fetchUser()
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
        state.set('user', this.user, { skipStorage: true })
      }
    } catch (e) {
      console.error('Failed to fetch user profile', e)
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
    if (!this.user?.id && !this.user?.email) {
      const sUser = state.get('user')
      if (sUser) {
        this.user = sUser
      }
    } else {
      state.set('user', this.user, { skipStorage: true })
    }
  }

  async fetchPasskeys() {
    this.loadingPasskeys = true
    try {
      const res = await api('/auth/passkeys/list')
      this.passkeys = res.passkeys || []
    } catch (e) {
      console.error('Failed to fetch passkeys', e)
    } finally {
      this.loadingPasskeys = false
    }
  }

  triggerAvatarUpload() {
    const input = this.querySelector('#avatar-file-input')
    if (input) {
      input.click()
    }
  }

  async handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    this.loadingAvatar = true
    this.avatarMessage = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/v1/users/avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error?.message || data.message || 'Avatar upload failed')
      }

      this.user = {
        ...this.user,
        image: data.image,
      }
      this.avatarMessage = { type: 'success', text: 'Avatar updated successfully!' }
      state.set('user', this.user, { skipStorage: true })
    } catch (err) {
      console.error(err)
      this.avatarMessage = { type: 'error', text: err.message || 'Failed to upload avatar' }
    } finally {
      this.loadingAvatar = false
      const input = this.querySelector('#avatar-file-input')
      if (input) {
        input.value = ''
      }
    }
  }

  async removeAvatar() {
    const dialog = this.querySelector('#confirmDialog')
    const confirmed = await dialog.confirm({
      headline: 'Remove Avatar',
      message: 'Are you sure you want to remove your profile photo?',
      confirmText: 'Remove',
      destructive: true,
      icon: 'trash',
    })
    if (!confirmed) return

    this.loadingAvatar = true
    this.avatarMessage = null

    try {
      const res = await fetch('/v1/users/avatar', {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to remove avatar')
      }

      this.user = {
        ...this.user,
        image: null,
      }
      this.avatarMessage = { type: 'success', text: 'Avatar removed.' }
      state.set('user', this.user, { skipStorage: true })
    } catch (err) {
      console.error(err)
      this.avatarMessage = { type: 'error', text: err.message || 'Failed to remove avatar' }
    } finally {
      this.loadingAvatar = false
    }
  }

  async saveProfile() {
    const nameField = this.querySelector('#name-field')
    const name = nameField ? nameField.value.trim() : ''

    this.loadingProfile = true
    this.profileMessage = null

    try {
      const res = await api('/v1/users/me', {
        method: 'POST',
        body: { user: { name } },
      })

      this.user = {
        ...this.user,
        name: res.user?.name || name,
      }
      this.profileMessage = { type: 'success', text: 'Profile updated successfully!' }
      state.set('user', this.user, { skipStorage: true })
    } catch (err) {
      console.error(err)
      this.profileMessage = { type: 'error', text: err.message || 'Failed to update profile' }
    } finally {
      this.loadingProfile = false
    }
  }

  async addPasskey() {
    this.passkeyMessage = null
    try {
      const regOptions = await api('/auth/passkeys/new', {
        method: 'POST',
        body: {},
      })

      const attResp = await startRegistration({
        optionsJSON: regOptions,
      })

      const createRes = await api('/auth/passkeys/create', {
        method: 'POST',
        body: {
          credential: attResp,
          userId: regOptions.user.id,
        },
      })

      if (!createRes.verified) {
        throw new Error('Passkey verification failed.')
      }

      this.passkeyMessage = { type: 'success', text: 'Passkey successfully added!' }
      await this.fetchPasskeys()
    } catch (err) {
      console.error(err)
      if (err.name !== 'AbortError' && !err.message?.includes('cancelled')) {
        this.passkeyMessage = { type: 'error', text: err.message || 'Failed to register passkey' }
      }
    }
  }

  async deletePasskey(passkeyId) {
    const dialog = this.querySelector('#confirmDialog')
    const confirmed = await dialog.confirm({
      headline: 'Remove Passkey',
      message: 'Are you sure you want to remove this passkey? You will no longer be able to sign in with it.',
      confirmText: 'Remove',
      destructive: true,
      icon: 'trash',
    })
    if (!confirmed) return

    try {
      await api('/auth/passkeys/delete', {
        method: 'POST',
        body: { id: passkeyId },
      })
      this.passkeyMessage = { type: 'success', text: 'Passkey removed.' }
      await this.fetchPasskeys()
    } catch (err) {
      console.error(err)
      this.passkeyMessage = { type: 'error', text: err.message || 'Failed to remove passkey' }
    }
  }

  feedback(msg) {
    return msg
      ? html`<div class="alert alert-${msg.type === 'success' ? 'success' : 'danger'} py-2 mb-0" role="alert">
          ${msg.text}
        </div>`
      : ''
  }

  render() {
    const user = this.user || {}
    const initial = (user.name || user.email || 'U').charAt(0).toUpperCase()
    const imageUrl = user.image || user.avatarUrl || user.data?.image

    return html`
      <confirm-dialog id="confirmDialog"></confirm-dialog>

      <div class="flex fcol g24 w100">
        <h1 class="fs-3 mb-0">Account Settings</h1>

        <!-- Section 1: Profile & Avatar -->
        <div class="card p24 w100">
          <div class="flex fcol g16">
            <div class="fs-5">Profile</div>
            <div class="text-body-secondary small">Manage your public avatar and profile details.</div>

            ${this.feedback(this.avatarMessage)}

            <div class="flex aic g20 mt8">
              <div
                class="rounded-circle border bg-primary-subtle text-primary-emphasis flex aic jcc fs-2 fw-semibold overflow-hidden flex-shrink-0"
                style="width: 96px; height: 96px;">
                ${imageUrl
                  ? html`<img
                      src="${imageUrl}"
                      class="w-100 h-100 object-fit-cover"
                      alt="${user.name || 'User Avatar'}" />`
                  : html`<span>${initial}</span>`}
              </div>
              <div class="flex fcol g8">
                <input
                  type="file"
                  id="avatar-file-input"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                  hidden
                  @change=${this.handleAvatarChange} />
                <div class="flex g8 flexw">
                  <button
                    type="button"
                    class="btn btn-primary"
                    @click=${this.triggerAvatarUpload}
                    ?disabled=${this.loadingAvatar}>
                    <i class="bi bi-cloud-upload"></i> ${this.loadingAvatar ? 'Uploading...' : 'Upload New Photo'}
                  </button>
                  ${imageUrl
                    ? html`
                        <button
                          type="button"
                          class="btn btn-outline-danger"
                          @click=${this.removeAvatar}
                          ?disabled=${this.loadingAvatar}>
                          <i class="bi bi-trash"></i> Remove
                        </button>
                      `
                    : ''}
                </div>
                <div class="text-body-secondary small">Allowed formats: JPG, PNG, WEBP, AVIF, GIF. Max size 10MB.</div>
              </div>
            </div>

            <hr class="my-2" />

            ${this.feedback(this.profileMessage)}

            <form
              id="profile-form"
              class="flex fcol g16 w100"
              @submit=${(e) => {
                e.preventDefault()
                this.saveProfile()
              }}>
              <label class="form-label mb-0">
                Full Name
                <input
                  class="form-control mt-1"
                  id="name-field"
                  .value=${user.name || ''}
                  placeholder="Enter your full name" />
              </label>

              <label class="form-label mb-0">
                Email
                <input class="form-control mt-1" id="email-field" .value=${user.email || ''} disabled />
                <div class="form-text">Email address cannot be changed</div>
              </label>

              <div class="flex jce mt8">
                <button type="button" class="btn btn-primary" @click=${this.saveProfile} ?disabled=${this.loadingProfile}>
                  ${this.loadingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Section 2: Passkeys & Security -->
        <div class="card p24 w100">
          <div class="flex fcol g16">
            <div class="flex jcsb aic flexw g8">
              <div>
                <div class="fs-5">Passkeys</div>
                <div class="text-body-secondary small mt4">
                  Passkeys provide fast and secure sign-in using biometric authentication or security keys.
                </div>
              </div>
              <button type="button" class="btn btn-primary" @click=${this.addPasskey}>
                <i class="bi bi-plus-lg"></i> Add Passkey
              </button>
            </div>

            ${this.feedback(this.passkeyMessage)}

            <div class="flex fcol g12 mt8">
              ${this.loadingPasskeys
                ? html`<div class="text-body-secondary p16 text-center">Loading passkeys...</div>`
                : this.passkeys.length === 0
                  ? html`
                      <div class="text-body-secondary p16 text-center bg-body-tertiary rounded">
                        No passkeys configured yet. Add one to sign in seamlessly without entering your email every
                        time.
                      </div>
                    `
                  : this.passkeys.map(
                      (pk) => html`
                        <div class="flex aic jcsb px-3 py-2 rounded bg-body-tertiary border">
                          <div class="flex aic g12">
                            <div
                              class="rounded-circle bg-primary-subtle text-primary-emphasis flex aic jcc flex-shrink-0"
                              style="width: 40px; height: 40px;">
                              <i class="bi bi-fingerprint"></i>
                            </div>
                            <div class="flex fcol g4">
                              <div class="fw-medium">${pk.name || 'Passkey'}</div>
                              <div class="flex g8 aic flexw">
                                <span class="badge rounded-pill text-bg-secondary">
                                  ${pk.deviceType === 'multiDevice' ? 'Synced Passkey' : 'Security Key'}
                                </span>
                                ${pk.createdAt
                                  ? html`<span class="text-body-secondary small"
                                      >Added on ${new Date(pk.createdAt).toLocaleDateString()}</span
                                    >`
                                  : ''}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            title="Remove Passkey"
                            aria-label="Remove Passkey"
                            @click=${() => this.deletePasskey(pk.id)}>
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

customElements.define('settings-page', SettingsPage)
