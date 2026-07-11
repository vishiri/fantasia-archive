import { Notify } from 'quasar'

export function notifyCreateForFaActionDefinitionHandlers (
  options: Parameters<typeof Notify.create>[0]
): ReturnType<typeof Notify.create> {
  return Notify.create(options)
}
