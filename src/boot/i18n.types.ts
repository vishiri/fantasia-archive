import messages from 'src/i18n'

export type MessageLanguages = keyof typeof messages
export type MessageSchema = typeof messages['en-US']

export interface I_defineLocaleMessage extends MessageSchema {}
export interface I_defineDateTimeFormat {}
export interface I_defineNumberFormat {}

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends I_defineLocaleMessage {}
  export interface DefineDateTimeFormat extends I_defineDateTimeFormat {}
  export interface DefineNumberFormat extends I_defineNumberFormat {}
}
