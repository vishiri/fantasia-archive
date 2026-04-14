import { defineBoot } from '#q-app/wrappers'

import { i18n } from 'app/i18n/externalFileLoader'
import 'app/types/vueI18nModuleAugmentation'
import type { MessageLanguages, MessageSchema } from 'app/types/vueI18nModuleAugmentation'

export type { MessageLanguages, MessageSchema }

export default defineBoot(({ app }) => {
  app.use(i18n)
})
