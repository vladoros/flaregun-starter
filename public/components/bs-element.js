import { LitElement } from 'lit'
import { Modal } from 'bootstrap'

// Render in the light DOM so the page's Bootstrap CSS and JS apply to the component.
export class BsElement extends LitElement {
  createRenderRoot() {
    return this
  }

  modal(selector) {
    const el = this.querySelector(selector)
    return el ? Modal.getOrCreateInstance(el) : null
  }
}
