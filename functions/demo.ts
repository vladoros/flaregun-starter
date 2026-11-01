import { html } from 'rend'

export async function onRequestGet(c) {
  return await c.data.rend.html({
    title: 'Bootstrap Demo',
    main: render,
  })
}

function render(d) {
  return html`
    <script type="module">
      import '/components/bootstrap-demo.js'
    </script>

    <div class="flex fcol p16 mt12">
      <bootstrap-demo></bootstrap-demo>
    </div>
  `
}
