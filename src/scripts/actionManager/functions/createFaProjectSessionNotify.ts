import type { I_faActiveProject } from 'app/types/I_faActiveProjectDomain'

export function createFaProjectSessionNotify (deps: {
  createNotify: (opts: { message: string; type: string }) => void
  formatProjectLabel: (project: I_faActiveProject | null) => string
  getActiveProject: () => I_faActiveProject | null
  t: (key: string, params: { projectName: string }) => string
}): {
    notifyFaProjectAlreadyActiveWarning: () => void
    notifyFaProjectCreatedPositive: () => void
    notifyFaProjectLoadedPositive: () => void
  } {
  const notifyFaProjectCreatedPositive = (): void => {
    const projectName = deps.formatProjectLabel(deps.getActiveProject())
    const message = deps.t(
      'globalFunctionality.faProjectSession.notifyProjectCreated',
      { projectName }
    )
    deps.createNotify({
      message,
      type: 'positive'
    })
  }

  const notifyFaProjectLoadedPositive = (): void => {
    const projectName = deps.formatProjectLabel(deps.getActiveProject())
    const message = deps.t(
      'globalFunctionality.faProjectSession.notifyProjectLoaded',
      { projectName }
    )
    deps.createNotify({
      message,
      type: 'positive'
    })
  }

  const notifyFaProjectAlreadyActiveWarning = (): void => {
    const projectName = deps.formatProjectLabel(deps.getActiveProject())
    const message = deps.t(
      'globalFunctionality.faProjectSession.openRejectedAlreadyActive',
      { projectName }
    )
    deps.createNotify({
      message,
      type: 'warning'
    })
  }

  return {
    notifyFaProjectAlreadyActiveWarning,
    notifyFaProjectCreatedPositive,
    notifyFaProjectLoadedPositive
  }
}
