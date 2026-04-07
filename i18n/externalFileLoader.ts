import { createI18n } from 'vue-i18n'
import messages from 'app/i18n'

export const i18n = createI18n({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  legacy: false,
  warnHtmlMessage: false,
  messages
})
