import type { StoreGeneric } from 'pinia'
import { Result } from 'neverthrow'

import { S_DialogComponent } from 'app/src/stores/S_Dialog'

/**
 * Safe store lookup for dialogs that optionally respond to centralized dialog routing.
 * Mirrors previous inline neverthrow unwrap so accessors that throw collapse to null.
 */
export function resolveDialogComponentStoreOrNull (): StoreGeneric | null {
  const result = Result.fromThrowable(
    (): StoreGeneric => S_DialogComponent(),
    (): null => null
  )()
  return result.unwrapOr(null)
}
