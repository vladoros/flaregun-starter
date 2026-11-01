import { html } from 'lit'
import { Tooltip } from 'bootstrap'
import { BsElement } from '/components/bs-element.js'
import { snack } from '/components/toast.js'

const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']

export class BootstrapDemo extends BsElement {
  static properties = {
    sliderVal: { type: Number },
  }

  constructor() {
    super()
    this.sliderVal = 45
  }

  connectedCallback() {
    super.connectedCallback()
    this.classList.add('d-block', 'w-100', 'mx-auto')
    this.style.maxWidth = '1100px'
  }

  firstUpdated() {
    this.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => new Tooltip(el))
  }

  section(title, description, body) {
    return html`
      <section class="card p24 mb24">
        <h2 class="fs-4 fw-semibold mb-1">${title}</h2>
        <p class="text-body-secondary">${description}</p>
        ${body}
      </section>
    `
  }

  render() {
    return html`
      <div class="flex fcol w100">
        <div class="flex jcsb aic flexw g12 mb24">
          <div>
            <h1 class="fs-3 mb-1">Bootstrap Components</h1>
            <div class="text-body-secondary">
              A showcase of the Bootstrap 5.3 components used by this starter. Prefer these over custom HTML controls.
            </div>
          </div>
          <a class="btn btn-outline-secondary" href="https://getbootstrap.com/docs/5.3/" target="_blank" rel="noopener">
            <i class="bi bi-box-arrow-up-right"></i> Bootstrap Docs
          </a>
        </div>

        ${this.section(
          'Buttons & Actions',
          'Solid, outline, and link buttons, sizes, groups, and split dropdowns.',
          html`
            <div class="flexw g12 aic mb16">
              ${variants.map((v) => html`<button type="button" class="btn btn-${v}">${v}</button>`)}
            </div>
            <div class="flexw g12 aic mb16">
              ${variants.slice(0, 6).map((v) => html`<button type="button" class="btn btn-outline-${v}">${v}</button>`)}
              <button type="button" class="btn btn-link">link</button>
              <button type="button" class="btn btn-primary" disabled>disabled</button>
            </div>
            <div class="flexw g12 aic mb16">
              <button type="button" class="btn btn-primary btn-lg">Large</button>
              <button type="button" class="btn btn-primary">Default</button>
              <button type="button" class="btn btn-primary btn-sm">Small</button>
              <button type="button" class="btn btn-primary rounded-pill"><i class="bi bi-heart"></i> Pill</button>
              <button type="button" class="btn btn-primary" aria-label="Add"><i class="bi bi-plus-lg"></i></button>
            </div>
            <div class="flexw g12 aic">
              <div class="btn-group" role="group" aria-label="Button group">
                <button type="button" class="btn btn-outline-primary">Left</button>
                <button type="button" class="btn btn-outline-primary">Middle</button>
                <button type="button" class="btn btn-outline-primary">Right</button>
              </div>
              <div class="btn-group">
                <button type="button" class="btn btn-primary">Split action</button>
                <button
                  type="button"
                  class="btn btn-primary dropdown-toggle dropdown-toggle-split"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
                  <span class="visually-hidden">Toggle dropdown</span>
                </button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item" href="#">Action</a></li>
                  <li><a class="dropdown-item" href="#">Another action</a></li>
                  <li><hr class="dropdown-divider" /></li>
                  <li><a class="dropdown-item" href="#">Separated link</a></li>
                </ul>
              </div>
            </div>
          `,
        )}
        ${this.section(
          'Form Controls',
          'Text inputs, selects, textareas, validation, and input groups.',
          html`
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label" for="demo-name">Name</label>
                <input class="form-control" id="demo-name" placeholder="Ada Lovelace" />
              </div>
              <div class="col-md-6">
                <label class="form-label" for="demo-email">Email</label>
                <input class="form-control" id="demo-email" type="email" placeholder="ada@example.com" />
              </div>
              <div class="col-md-6">
                <label class="form-label" for="demo-select">Category</label>
                <select class="form-select" id="demo-select">
                  <option>Electronics</option>
                  <option>Apparel</option>
                  <option>Books</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label" for="demo-price">Price</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input class="form-control" id="demo-price" type="number" value="19.99" />
                </div>
              </div>
              <div class="col-12">
                <label class="form-label" for="demo-notes">Notes</label>
                <textarea class="form-control" id="demo-notes" rows="3"></textarea>
              </div>
              <div class="col-md-6">
                <input class="form-control is-valid" value="Looks good" aria-label="Valid example" />
              </div>
              <div class="col-md-6">
                <input class="form-control is-invalid" value="Needs attention" aria-label="Invalid example" />
              </div>
            </div>
          `,
        )}
        ${this.section(
          'Selection Controls & Range',
          'Switches, checkboxes, radios, and range sliders.',
          html`
            <div class="flexw g24 mb16">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="demo-switch" checked />
                <label class="form-check-label" for="demo-switch">Notifications</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="demo-check" checked />
                <label class="form-check-label" for="demo-check">Accept terms</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="demo-radio" id="demo-radio-1" checked />
                <label class="form-check-label" for="demo-radio-1">Option one</label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="demo-radio" id="demo-radio-2" />
                <label class="form-check-label" for="demo-radio-2">Option two</label>
              </div>
            </div>
            <label class="form-label" for="demo-range">Volume: ${this.sliderVal}</label>
            <input
              type="range"
              class="form-range"
              id="demo-range"
              min="0"
              max="100"
              .value=${String(this.sliderVal)}
              @input=${(e) => (this.sliderVal = Number(e.target.value))} />
          `,
        )}
        ${this.section(
          'Tabs & Navigation',
          'Tab panes, pills, and breadcrumbs.',
          html`
            <ul class="nav nav-tabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#demo-tab-1" type="button" role="tab">
                  Overview
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#demo-tab-2" type="button" role="tab">
                  Details
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#demo-tab-3" type="button" role="tab">
                  Reviews
                </button>
              </li>
            </ul>
            <div class="tab-content border border-top-0 rounded-bottom p16 mb16">
              <div class="tab-pane fade show active" id="demo-tab-1" role="tabpanel">Overview content.</div>
              <div class="tab-pane fade" id="demo-tab-2" role="tabpanel">Details content.</div>
              <div class="tab-pane fade" id="demo-tab-3" role="tabpanel">Reviews content.</div>
            </div>
            <ul class="nav nav-pills mb16">
              <li class="nav-item"><a class="nav-link active" href="#">Active</a></li>
              <li class="nav-item"><a class="nav-link" href="#">Link</a></li>
              <li class="nav-item"><a class="nav-link disabled" aria-disabled="true">Disabled</a></li>
            </ul>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item"><a href="/">Home</a></li>
                <li class="breadcrumb-item"><a href="/products">Products</a></li>
                <li class="breadcrumb-item active" aria-current="page">Demo</li>
              </ol>
            </nav>
          `,
        )}
        ${this.section(
          'Feedback, Badges & Dialogs',
          'Badges, alerts, tooltips, modals, and toasts.',
          html`
            <div class="flexw g8 aic mb16">
              ${variants.slice(0, 6).map((v) => html`<span class="badge text-bg-${v}">${v}</span>`)}
              <span class="badge rounded-pill text-bg-primary">pill</span>
              <button type="button" class="btn btn-primary position-relative">
                Inbox
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger">9</span>
              </button>
            </div>
            <div class="alert alert-info" role="alert">A simple info alert.</div>
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
              A dismissible warning alert.
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            <div class="flexw g12 aic">
              <button
                type="button"
                class="btn btn-outline-secondary"
                data-bs-toggle="tooltip"
                data-bs-title="Tooltip on top">
                Hover for tooltip
              </button>
              <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#demo-modal">
                Open dialog
              </button>
              <button type="button" class="btn btn-secondary" @click=${() => snack('Hello from a toast!')}>
                Show toast
              </button>
            </div>

            <div class="modal fade" id="demo-modal" tabindex="-1" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Dialog title</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">Dialog content goes here.</div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                  </div>
                </div>
              </div>
            </div>
          `,
        )}
        ${this.section(
          'Progress & Loading',
          'Spinners and progress bars.',
          html`
            <div class="flexw g16 aic mb16">
              <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
              <div class="spinner-grow text-secondary" role="status"><span class="visually-hidden">Loading...</span></div>
              <button class="btn btn-primary" type="button" disabled>
                <span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Loading...
              </button>
            </div>
            <div class="progress mb-2" role="progressbar" aria-label="Progress" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar" style="width: 65%">65%</div>
            </div>
            <div class="progress" role="progressbar" aria-label="Animated progress" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" style="width: 40%"></div>
            </div>
          `,
        )}
        ${this.section(
          'Cards & Lists',
          'Cards, list groups, and accordions.',
          html`
            <div class="row g-3 mb16">
              ${['Starter', 'Pro', 'Team'].map(
                (name) => html`
                  <div class="col-md-4">
                    <div class="card h-100">
                      <div class="card-body">
                        <h5 class="card-title">${name}</h5>
                        <p class="card-text text-body-secondary">Card content for the ${name} plan.</p>
                        <a href="#" class="btn btn-primary btn-sm">Choose</a>
                      </div>
                    </div>
                  </div>
                `,
              )}
            </div>
            <ul class="list-group mb16">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                D1 database <span class="badge text-bg-primary rounded-pill">SQL</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                KV storage <span class="badge text-bg-primary rounded-pill">Key/Value</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                R2 storage <span class="badge text-bg-primary rounded-pill">Objects</span>
              </li>
            </ul>
            <div class="accordion" id="demo-accordion">
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#demo-acc-1">
                    What is Flaregun?
                  </button>
                </h2>
                <div id="demo-acc-1" class="accordion-collapse collapse show" data-bs-parent="#demo-accordion">
                  <div class="accordion-body">A starter kit for full-stack apps on Cloudflare Workers.</div>
                </div>
              </div>
              <div class="accordion-item">
                <h2 class="accordion-header">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#demo-acc-2">
                    Which UI library does it use?
                  </button>
                </h2>
                <div id="demo-acc-2" class="accordion-collapse collapse" data-bs-parent="#demo-accordion">
                  <div class="accordion-body">Bootstrap 5.3 with Lit web components.</div>
                </div>
              </div>
            </div>
          `,
        )}
      </div>
    `
  }
}

customElements.define('bootstrap-demo', BootstrapDemo)
