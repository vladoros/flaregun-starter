import { html, slot, stringifyAttribute } from 'rend'
import { escapeHtml } from './utils.js'

export async function layout(d) {
  let title = d.title ? d.title + ' - Flaregun' : 'Flaregun Starter Kit'
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/images/flaregun2.png" />

        <script>
          const dark = matchMedia('(prefers-color-scheme: dark)')
          const setTheme = () => (document.documentElement.dataset.bsTheme = dark.matches ? 'dark' : 'light')
          setTheme()
          dark.addEventListener('change', setTheme)
        </script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/css/bootstrap.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11/font/bootstrap-icons.min.css" />
        <link rel="stylesheet" href="/css/styles.css" />

        <script type="importmap">
          {
            "imports": {
              "lit": "https://cdn.jsdelivr.net/npm/lit@3/index.js",
              "lit/": "https://cdn.jsdelivr.net/npm/lit@3/",
              "@lit/localize": "https://cdn.jsdelivr.net/npm/@lit/localize/lit-localize.js",
              "@lit/reactive-element": "https://cdn.jsdelivr.net/npm/@lit/reactive-element@2/reactive-element.js",
              "@lit/reactive-element/": "https://cdn.jsdelivr.net/npm/@lit/reactive-element@2/",
              "lit-element/lit-element.js": "https://cdn.jsdelivr.net/npm/lit-element@4/lit-element.js",
              "lit-html": "https://cdn.jsdelivr.net/npm/lit-html@3/lit-html.js",
              "lit-html/": "https://cdn.jsdelivr.net/npm/lit-html@3/",
              "bootstrap": "https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/js/bootstrap.esm.min.js",
              "@popperjs/core": "https://cdn.jsdelivr.net/npm/@popperjs/core@2/dist/esm/index.js",
              "api": "https://cdn.jsdelivr.net/gh/treeder/api@1/api.js",
              "state": "https://cdn.jsdelivr.net/gh/treeder/state@3/state.js",
              "models": "https://cdn.jsdelivr.net/gh/treeder/models@1/index.js",
              "passkeys/": "https://cdn.jsdelivr.net/gh/treeder/passkeys@6/"
            }
          }
        </script>
      </head>
      <body>
        <script type="module">
          import '/components/avatar-menu.js'
        </script>
        <div class="flex g12 jcsb mb20 topnav border-bottom p16">
          <div class="flex g16 aic flexw">
            <a href="/">
              <div class="flex g8 jcc aic">
                <img src="/images/flaregun2.png" style="height: 40px;" />
                <div class="title-large">Flaregun Starter Kit</div>
              </div>
            </a>
            <nav class="nav nav-pills g8 aic">
              <a href="/" class="nav-link ${d.path === '/' ? 'active' : ''}">Home</a>
              <a href="/products" class="nav-link ${d.path?.startsWith('/products') ? 'active' : ''}">Products</a>
              <a href="/demo" class="nav-link ${d.path === '/demo' ? 'active' : ''}">Components Demo</a>
            </nav>
          </div>
          <div class="flex g8 jcc aic">
            <div>
              ${
                d.user
                  ? html`<avatar-menu user="${stringifyAttribute(d.user)}"></avatar-menu>`
                  : html`<avatar-menu></avatar-menu>`
              }
            </div>
          </div>
        </div>

        ${await slot('main', d)}
      </body>
    </html> `
}
