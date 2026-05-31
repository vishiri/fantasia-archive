import { defineBoot } from '#q-app/wrappers'

import { runFaChromiumForwardedKeyChordBoot } from './scripts/faChromiumForwardedKeyChord_manager'

export default defineBoot(runFaChromiumForwardedKeyChordBoot)
