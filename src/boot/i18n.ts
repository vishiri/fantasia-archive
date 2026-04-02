import { defineBoot } from '#q-app/wrappers'
import { createI18n } from 'vue-i18n'

import messages from 'src/i18n'

export type MessageLanguages = keyof typeof messages
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = typeof messages['en-US']

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}

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
