import type { I_dialogComponentStoreLike } from 'app/types/I_dialogComponentStoreLike'
import type { T_injectedResultFromThrowable } from 'app/types/I_injectedNeverthrow'

export function createResolveDialogComponentStore (deps: {
  fromThrowable: T_injectedResultFromThrowable
  getDialogComponentStore: () => I_dialogComponentStoreLike
}): {
    resolveDialogComponentStore: () => I_dialogComponentStoreLike | null
  } {
  const resolveDialogComponentStore = (): I_dialogComponentStoreLike | null => {
    const resolved = deps.fromThrowable(
      (): I_dialogComponentStoreLike => deps.getDialogComponentStore(),
      (): null => null
    )()
    if (resolved.isErr()) {
      return null
    }
    return resolved.value
  }

  return {
    resolveDialogComponentStore
  }
}
