import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

/** Outcome of finalizeFaActiveProjectOpenResult after IPC open. */
export type T_faActiveProjectOpenFlowOutcome = 'opened' | 'canceled' | 'reused' | 'superseded'

/** Pinia callbacks used when committing or reusing the active project session. */
export type T_faActiveProjectOpenFlowHandlers = {
  commitActiveProjectSnapshot: (next: I_faActiveProject) => void
  reuseActiveProjectSession: (next: I_faActiveProject) => void
}
