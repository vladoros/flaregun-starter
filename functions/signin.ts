import { html, stringifyAttribute } from 'rend'
import { escapeHtml, isLocalPath } from './utils.js'

export async function onRequestGet(c) {
  let afterLoginHref = '/'
  if (c.request) {
    try {
      const url = new URL(c.request.url)
      const redirect = url.searchParams.get('redirect')
      if (isLocalPath(redirect)) {
        afterLoginHref = escapeHtml(redirect)
      }
    } catch (e) {}
  }

  return await c.data.rend.html({
    title: 'Sign In',
    main: render,
    afterLoginHref,
  })
}

function render(d) {
  const href = d.afterLoginHref || '/'
  return html`
    <script type="module">
      import '/components/sign-in.js'
    </script>

    <div class="flex fcol aic jcc p16 mt40">
      <div class="headline-medium mb24">Sign In</div>
      ${
        d.user
          ? html`<sign-in
              baseURL="/auth"
              afterLoginHref="${href}"
              user="${stringifyAttribute(d.user)}"></sign-in>`
          : html`<sign-in baseURL="/auth" afterLoginHref="${href}"></sign-in>`
      }
    </div>
  `
}
