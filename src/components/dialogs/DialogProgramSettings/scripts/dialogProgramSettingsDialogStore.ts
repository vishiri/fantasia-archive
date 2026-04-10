import type { StoreGeneric } from 'pinia'

import { S_DialogComponent } from 'src/stores/S_Dialog'

/**
 * Resolves the component-dialog Pinia store when the app has an active Pinia instance; returns null if the store cannot be constructed (for example outside a component or without Pinia).
 */
export function resolveDialogComponentStore (): StoreGeneric | null {
  try {
    return S_DialogComponent()
  } catch {
    return null
  }
}
