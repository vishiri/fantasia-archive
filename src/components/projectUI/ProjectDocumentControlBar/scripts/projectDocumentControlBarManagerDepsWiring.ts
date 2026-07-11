import { Notify } from 'quasar'

import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

export function notifyCreateForProjectDocumentControlBar (
  options: Parameters<typeof Notify.create>[0]
): ReturnType<typeof Notify.create> {
  return Notify.create(options)
}

export function getProjectDocumentControlBarKeybindsSnapshot () {
  return S_FaKeybinds().snapshot
}
