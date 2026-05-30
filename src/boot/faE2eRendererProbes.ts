import { defineBoot } from '#q-app/wrappers'

import { runFaE2eRendererProbesBoot } from './scripts/faE2eRendererProbes_manager'

export default defineBoot(runFaE2eRendererProbesBoot)
