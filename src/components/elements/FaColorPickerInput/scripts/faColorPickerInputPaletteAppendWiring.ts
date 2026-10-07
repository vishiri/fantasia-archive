import { getActivePinia } from 'pinia'
import { ResultAsync } from 'neverthrow'

async function readPalettePersistActiveProject (): Promise<{
  isProjectReplacementInFlight: () => boolean
  readProjectContentEpoch: () => number
} | null> {
  if (getActivePinia() === undefined) {
    return null
  }
  const activeProjectModule = await import('app/src/stores/S_FaActiveProject')
  return activeProjectModule.S_FaActiveProject()
}

function palettePersistSuperseded (
  activeProject: {
    isProjectReplacementInFlight: () => boolean
    readProjectContentEpoch: () => number
  },
  epochAtStart: number
): boolean {
  if (activeProject.isProjectReplacementInFlight()) {
    return true
  }
  return activeProject.readProjectContentEpoch() !== epochAtStart
}

async function persistWorldColorPalette (
  worldId: string,
  colorPalette: string
): Promise<boolean> {
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.updateWorld !== 'function') {
    return false
  }
  const activeProject = await readPalettePersistActiveProject()
  let epochAtStart: number | undefined
  if (activeProject !== null) {
    epochAtStart = activeProject.readProjectContentEpoch()
    if (palettePersistSuperseded(activeProject, epochAtStart)) {
      return false
    }
  }
  const saved = await ResultAsync.fromPromise(
    api.updateWorld(worldId, { colorPalette }),
    () => undefined
  )
  if (!saved.isOk()) {
    return false
  }
  if (activeProject === null || epochAtStart === undefined) {
    return true
  }
  const supersededAfterWrite = palettePersistSuperseded(activeProject, epochAtStart)
  return !supersededAfterWrite
}

async function noopRefreshProjectColorPalette (): Promise<void> {
  await Promise.resolve()
}

export const faColorPickerInputPaletteAppendWiring = {
  noopRefreshProjectColorPalette,
  persistWorldColorPalette
}
