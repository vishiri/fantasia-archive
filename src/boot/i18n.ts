import { defineBoot } from '#q-app/wrappers'

import { i18n } from 'app/i18n/externalFileLoader'
import type { MessageLanguages, MessageSchema } from './i18n.types'

export type { MessageLanguages, MessageSchema }

export default defineBoot(({ app }) => {
  app.use(i18n)
})
