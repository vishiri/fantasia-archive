import type { I_vueApp, I_vuePlugin } from 'app/types/I_vueCompositionShims'

export function createRunQDraggableTableBoot (deps: {
  VuePlugin: unknown
}): (args: { app: I_vueApp }) => void {
  return function runQDraggableTableBoot ({ app }: { app: I_vueApp }): void {
    app.use(deps.VuePlugin as I_vuePlugin)
  }
}
