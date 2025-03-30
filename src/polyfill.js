const isBrowser = !window.extraEnvVariables
// document.querySelectorAll("script").forEach(e=>{e.dataset.src = e.src; e.removeAttribute("src");})

if (isBrowser)document.querySelectorAll('script[browser]').forEach(e => { e.src = e.dataset.src })
document.querySelectorAll('script').forEach(e => { if (e.hasAttribute('src') || e.hasAttribute('browser')) return; e.src = e.dataset.src })
window.extraEnvVariables = window.extraEnvVariables || {
  'ELECTRON_MAIN_FILEPATH': 'not used',
  'FA_FRONTEND_RENDER_TIMER': 3000,
  'TEST_ENV': false,
  'COMPONENT_NAME': false,
  'COMPONENT_PROPS': false
}
window.__dirname = window.__dirname || './'
if (isBrowser && window.extraEnvVariables.TEST_ENV) {
  const ws = new WebSocket('ws://' + location.hostname + ':9301')
  const apis = ['faWindowControlAPI', 'faServerControl'],
    cache = {},
    handler = {
      get (target, prop, receiver) {
        return function (...args) {
          ws.send(JSON.stringify(args))
          ws.addEventListener('message', (e) => { cache[prop] = e.data })
          return cache[prop]
        }
      }
    }
  for (const api of apis) {
    window[api] = new Proxy({}, handler)
  }
}
