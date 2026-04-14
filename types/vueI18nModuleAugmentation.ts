import messages from 'app/i18n'

/**
 * Locale keys available in the composed vue-i18n message tree.
 */
export type MessageLanguages = keyof typeof messages

/**
 * Schema shape for the default English locale (used for typed message keys).
 */
export type MessageSchema = typeof messages['en-US']

/**
 * Augments vue-i18n message typing to match the live locale modules.
 */
export interface I_defineLocaleMessage extends MessageSchema {}

/**
 * Placeholder for datetime format schema augmentation (reserved for vue-i18n advanced typing).
 */
export interface I_defineDateTimeFormat {}

/**
 * Placeholder for number format schema augmentation (reserved for vue-i18n advanced typing).
 */
export interface I_defineNumberFormat {}

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends I_defineLocaleMessage {}
  export interface DefineDateTimeFormat extends I_defineDateTimeFormat {}
  export interface DefineNumberFormat extends I_defineNumberFormat {}
}
