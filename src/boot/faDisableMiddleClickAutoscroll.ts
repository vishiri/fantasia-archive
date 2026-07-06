import { defineBoot } from '#q-app/wrappers'

import {
  handleFaDisableMiddleClickAutoscrollMouseDown,
  runFaDisableMiddleClickAutoscrollBoot
} from './scripts/faDisableMiddleClickAutoscroll_manager'

export { handleFaDisableMiddleClickAutoscrollMouseDown }

export default defineBoot(runFaDisableMiddleClickAutoscrollBoot)
