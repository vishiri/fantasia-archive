import { defineBoot } from '#q-app/wrappers'

import { dispatchFaExternalLinkMouseEvent } from './faExternalLinkMouseDispatch'

const getBrowserWindowForFaExternalLinks = (): Window | undefined => {
  return (globalThis as unknown as { window?: Window }).window
}

export function handleFaExternalLinkMouseEvent (event: MouseEvent): void {
  dispatchFaExternalLinkMouseEvent(event, getBrowserWindowForFaExternalLinks)
}

export default defineBoot(() => {
  document.addEventListener('click', handleFaExternalLinkMouseEvent)

  document.addEventListener('auxclick', handleFaExternalLinkMouseEvent)
})
