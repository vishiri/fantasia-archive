import type { I_vuePlugin } from 'app/types/I_vueCompositionShims'

import { i18n } from 'app/i18n/externalFileLoader'

import { createRunI18nBoot } from './functions/createRunI18nBoot'

const i18nPlugin = i18n as unknown as I_vuePlugin

export const runI18nBoot = createRunI18nBoot({
  i18n: i18nPlugin
})
