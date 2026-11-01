import { html, stringifyAttribute } from 'rend'
import { escapeHtml } from './utils.js'

export async function onRequestGet(c) {
  return await c.data.rend.html({
    main: render,
  })
}

function render(d) {
  const userAttr = stringifyAttribute(d.user)

  return html`
    <script type="module">
      import '/components/product-form.js'
      import '/components/product-list.js'
      import '/components/confirm-dialog.js'
    </script>

    <div class="flex fcol g32 p16" style="max-width: 1120px; margin: 0 auto;">
      <!-- Hero Section -->
      <div
        class="flex fcol aic tac g20 p24 bg-body-tertiary border rounded-4"
        style="padding: 48px 24px;">
        <div class="flex aic g8 badge rounded-pill text-bg-secondary fw-medium px-3 py-2">
          <i class="bi bi-lightning-charge-fill"></i>
          <span>Full-Stack Cloudflare Workers Starter</span>
        </div>

        <h1 class="display-5 fw-bold" style="max-width: 760px;">
          ${d.user
            ? `Welcome back, ${escapeHtml(d.user.name || d.user.email || 'Builder')}!`
            : 'Build fast, modern edge apps with Flaregun'}
        </h1>

        <div class="lead text-body-secondary" style="max-width: 680px;">
          ${d.user
            ? 'You are signed in. You can now create, edit, and delete products below or manage your full catalog.'
            : 'Everything you need to ship on Cloudflare Workers—D1 database models, KV, R2 storage, Passkey authentication, and Bootstrap 5 with Lit web components.'}
        </div>

        <div class="flex flexw jcc aic g12 mt8">
          ${d.user
            ? html`
                <a href="/products" class="btn btn-primary"><i class="bi bi-box-seam"></i> Manage Products</a>
                <a href="/demo" class="btn btn-outline-primary"><i class="bi bi-grid"></i> View Components Showcase</a>
                <a href="/settings" class="btn btn-link"><i class="bi bi-gear"></i> Account Settings</a>
              `
            : html`
                <a href="/signin" class="btn btn-primary"><i class="bi bi-box-arrow-in-right"></i> Sign In to Get Started</a>
                <a href="/products" class="btn btn-secondary"><i class="bi bi-shop"></i> Browse Products</a>
                <a href="/demo" class="btn btn-outline-primary"><i class="bi bi-grid"></i> View Components Showcase</a>
              `}
        </div>
      </div>

      <!-- Feature Highlights -->
      <div class="grid g16" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
        <div class="card p20 flex fcol g8">
          <div class="flex aic g8 text-primary">
            <i class="bi bi-database"></i>
            <div class="title-medium" style="font-weight: 600;">D1, KV &amp; R2 Built-In</div>
          </div>
          <div class="text-body-secondary" style="line-height: 1.5;">
            Zero-boilerplate wrappers for Cloudflare D1 SQL models, JSON merge patches, scoped KV storage, and R2 buckets.
          </div>
        </div>

        <div class="card p20 flex fcol g8">
          <div class="flex aic g8 text-primary">
            <i class="bi bi-key"></i>
            <div class="title-medium" style="font-weight: 600;">Passkeys &amp; Magic Links</div>
          </div>
          <div class="text-body-secondary" style="line-height: 1.5;">
            Passwordless authentication out of the box with WebAuthn passkeys, email verification, and user profile management.
          </div>
        </div>

        <div class="card p20 flex fcol g8">
          <div class="flex aic g8 text-primary">
            <i class="bi bi-grid"></i>
            <div class="title-medium" style="font-weight: 600;">Bootstrap Web Components</div>
          </div>
          <div class="text-body-secondary" style="line-height: 1.5;">
            Bootstrap 5 styling with Lit ESM components and no client build step required. Explore the <a href="/demo">interactive demo</a>.
          </div>
        </div>
      </div>

      <!-- Recent Products Section -->
      <div class="flex fcol g16">
        <div class="flex jcsb aic flexw g12">
          <div class="flex fcol g4">
            <div class="headline-medium" style="font-weight: 600;">Recent Products</div>
            <div class="text-body-secondary">
              ${d.user
                ? 'Manage your product catalog—add new items, edit details, or remove products.'
                : 'Explore recent items from the store. Sign in to add, edit, or delete products.'}
            </div>
          </div>
          <a href="/products" class="btn btn-link">View All Products <i class="bi bi-arrow-right"></i></a>
        </div>

        <product-list
          user="${userAttr}"
          limit="6"
          ${d.user ? 'can-manage' : ''}></product-list>
      </div>
    </div>
  `
}
