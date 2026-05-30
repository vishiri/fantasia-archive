import { defineBoot } from '#q-app/wrappers'

import 'app/types/vueI18nModuleAugmentation'

import { runI18nBoot } from './scripts/i18nBoot_manager'

export default defineBoot(runI18nBoot)
