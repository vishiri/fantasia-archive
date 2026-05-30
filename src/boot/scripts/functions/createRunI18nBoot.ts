import type { I_vueApp, I_vuePlugin } from 'app/types/I_vueCompositionShims'

export function createRunI18nBoot (deps: {
  i18n: I_vuePlugin
}): (args: { app: I_vueApp }) => void {
  return function runI18nBoot ({ app }: { app: I_vueApp }): void {
    app.use(deps.i18n)
  }
}
