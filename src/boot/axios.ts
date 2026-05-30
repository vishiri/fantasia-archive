import { defineBoot } from '#q-app/wrappers'

import { api, runAxiosBoot } from './scripts/axiosBoot_manager'

export default defineBoot(runAxiosBoot)

export { api }
