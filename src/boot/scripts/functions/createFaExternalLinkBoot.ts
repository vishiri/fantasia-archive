import type { T_faExternalLinkGetBrowserWindow } from 'app/types/I_faExternalLinkBoot'

export function createFaExternalLinkBoot (deps: {
  addDocumentListener: (
    type: 'click' | 'auxclick',
    listener: (event: MouseEvent) => void
  ) => void
  dispatchFaExternalLinkMouseEvent: (
    event: MouseEvent,
    getBrowserWindow: T_faExternalLinkGetBrowserWindow
  ) => void
  getBrowserWindow: T_faExternalLinkGetBrowserWindow
}): {
    handleFaExternalLinkMouseEvent: (event: MouseEvent) => void
    runExternalLinkManagementBoot: () => void
  } {
  const handleFaExternalLinkMouseEvent = (event: MouseEvent): void => {
    deps.dispatchFaExternalLinkMouseEvent(event, deps.getBrowserWindow)
  }

  const runExternalLinkManagementBoot = (): void => {
    deps.addDocumentListener('click', handleFaExternalLinkMouseEvent)
    deps.addDocumentListener('auxclick', handleFaExternalLinkMouseEvent)
  }

  return {
    handleFaExternalLinkMouseEvent,
    runExternalLinkManagementBoot
  }
}
