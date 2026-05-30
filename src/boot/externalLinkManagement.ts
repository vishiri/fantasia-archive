import { defineBoot } from '#q-app/wrappers'

import {
  handleFaExternalLinkMouseEvent,
  runExternalLinkManagementBoot
} from './scripts/externalLinkManagement_manager'

export { handleFaExternalLinkMouseEvent }

export default defineBoot(runExternalLinkManagementBoot)
