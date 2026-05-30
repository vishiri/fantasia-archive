import { defineBoot } from '#q-app/wrappers'

import { runFaRoutingEnvBoot } from './scripts/faRoutingEnv_manager'

export default defineBoot(runFaRoutingEnvBoot)
