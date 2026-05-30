import { dispatchFaExternalLinkMouseEvent } from './functions/faExternalLinkMouseDispatch'
import { getBrowserWindowForFaExternalLinks } from './functions/faExternalLinkGetBrowserWindow'
import { createFaExternalLinkBoot } from './functions/createFaExternalLinkBoot'

const faExternalLinkBoot = createFaExternalLinkBoot({
  addDocumentListener: (type, listener) => {
    document.addEventListener(type, listener)
  },
  dispatchFaExternalLinkMouseEvent,
  getBrowserWindow: getBrowserWindowForFaExternalLinks
})

export const handleFaExternalLinkMouseEvent =
  faExternalLinkBoot.handleFaExternalLinkMouseEvent

export const runExternalLinkManagementBoot =
  faExternalLinkBoot.runExternalLinkManagementBoot
