/**
 * Optional project-switch guards for a debounced persist.
 * Omit both callbacks for app-scoped windows so a project change does not drop that save.
 */
export interface I_faProjectContentEpochPersistGuards {
  isProjectReplacementInFlight?: () => boolean
  readProjectContentEpoch?: () => number
}
