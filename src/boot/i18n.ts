import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'

import messages from 'app/i18n'
import type { MessageLanguages, MessageSchema } from './i18n.types'

export type { MessageLanguages, MessageSchema }

export default defineBoot(({ app }) => {
  const i18n = createI18n({
    locale: 'en-US',
    fallbackLocale: 'en-US',
    legacy: false,
    warnHtmlMessage: false,
    messages
  })

  // Set i18n instance on app
  app.use(i18n)
})
