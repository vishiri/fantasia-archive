import { isMiddleMouseButton } from 'app/src/scripts/dom/dom_manager'

import { createFaDisableMiddleClickAutoscrollBoot } from './functions/createFaDisableMiddleClickAutoscrollBoot'
import { createHandleFaDisableMiddleClickAutoscrollMouseDown } from './faDisableMiddleClickAutoscrollMouseDownWiring'

const handleFaDisableMiddleClickAutoscrollMouseDown = createHandleFaDisableMiddleClickAutoscrollMouseDown({
  isMiddleMouseButton
})

const faDisableMiddleClickAutoscrollBoot = createFaDisableMiddleClickAutoscrollBoot({
  addDocumentListener: (type, listener, options) => {
    document.addEventListener(type, listener, options)
  },
  handleFaDisableMiddleClickAutoscrollMouseDown
})

export const runFaDisableMiddleClickAutoscrollBoot =
  faDisableMiddleClickAutoscrollBoot.runFaDisableMiddleClickAutoscrollBoot

export { handleFaDisableMiddleClickAutoscrollMouseDown }
