import type { Pinia } from 'app/types/I_vuePiniaInjected'

import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

export function createRegisterFaE2eActiveProjectSnapshotProbe (deps: {
  getActivePinia: () => Pinia | undefined
  getActiveProjectFromStore: (pinia: Pinia) => I_faActiveProject | null
  setE2eSnapshotGetter: (
    getter: () => I_faActiveProject | null
  ) => void
}): {
    registerFaE2eActiveProjectSnapshotProbe: () => void
  } {
  const registerFaE2eActiveProjectSnapshotProbe = (): void => {
    deps.setE2eSnapshotGetter((): I_faActiveProject | null => {
      const pinia = deps.getActivePinia()
      if (pinia === undefined) {
        return null
      }
      return deps.getActiveProjectFromStore(pinia)
    })
  }

  return {
    registerFaE2eActiveProjectSnapshotProbe
  }
}
