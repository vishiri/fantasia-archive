import { defineBoot } from '#q-app/wrappers'

import { runQmarkdownBoot } from './scripts/qmarkdownBoot_manager'

export default defineBoot(runQmarkdownBoot)
