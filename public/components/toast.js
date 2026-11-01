import { Toast } from 'bootstrap'

export function snack(message, { delay = 4000 } = {}) {
  let host = document.getElementById('toast-host')
  if (!host) {
    host = document.createElement('div')
    host.id = 'toast-host'
    host.className = 'toast-container position-fixed bottom-0 start-50 translate-middle-x p-3'
    document.body.append(host)
  }
  const el = document.createElement('div')
  el.className = 'toast'
  el.setAttribute('role', 'status')
  el.innerHTML = `<div class="d-flex"><div class="toast-body"></div>
    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`
  el.querySelector('.toast-body').textContent = message
  host.append(el)
  el.addEventListener('hidden.bs.toast', () => el.remove())
  new Toast(el, { delay }).show()
}
