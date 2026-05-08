import { getActivePinia } from 'pinia'

import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

/**
 * Playwright E2E reads Pinia session state via page.evaluate; attach a snapshot getter only when
 * boot installs probes for TEST_ENV === 'e2e'.
 */
export function registerFaE2eActiveProjectSnapshotProbe (): void {
  window.__faE2eGetActiveProjectSnapshot = (): I_faActiveProject | null => {
    const pinia = getActivePinia()
    if (pinia === undefined) {
      return null
    }
    const store = S_FaActiveProject(pinia)
    const project = store.activeProject
    if (project === null) {
      return null
    }
    return {
      filePath: project.filePath,
      id: project.id,
      name: project.name
    }
  }
}
