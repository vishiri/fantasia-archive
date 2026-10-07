import { expect, test, vi } from 'vitest'

import { maybeAutoOpenFilledNoteboard } from 'app/src/scripts/floatingWindows/functions/shouldAutoOpenFilledNoteboard'
import { hydrateMainLayoutProjectSurfacesWithAutoOpen } from '../mainLayoutNoteboardHydrateWiring'

function projectSurfaceDeps (input: {
  isProjectReplacementInFlight: () => boolean
  readProjectContentEpoch: () => number
  setWindowOpen: (open: boolean) => void
}) {
  return {
    awaitWelcomeScreenAutoLoadBootCompletion: async () => undefined,
    canOpenFloatingWindowWhileNoModal: () => true,
    hydrateFromBridgeOrReport: async (runner: () => Promise<unknown>) => {
      await runner()
    },
    maybeAutoOpenFilledNoteboard,
    S_FaActiveProject: () => ({
      hasActiveProject: true,
      isProjectReplacementInFlight: input.isProjectReplacementInFlight,
      readProjectContentEpoch: input.readProjectContentEpoch
    }),
    S_FaAppNoteboard: () => ({
      refreshNoteboard: async () => false,
      setWindowOpen: vi.fn(),
      text: ''
    }),
    S_FaProjectNoteboard: () => ({
      refreshProjectNoteboard: async () => true,
      setWindowOpen: input.setWindowOpen,
      text: 'saved notes'
    }),
    S_FaProjectSidebar: () => ({
      refreshProjectSidebar: async () => undefined
    }),
    S_FaProjectStyling: () => ({
      refreshProjectStyling: async () => undefined
    }),
    S_FaRecentProjects: () => ({
      refreshRecentProjects: async () => undefined
    }),
    S_FaUserSettings: () => ({
      settings: {
        preventFilledAppNoteBoardPopup: false,
        preventFilledProjectNoteBoardPopup: false
      }
    })
  }
}

test('Test that project surface hydrate auto-opens a filled project noteboard', async () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectManagement: {}
      }
    },
    writable: true
  })
  const setWindowOpen = vi.fn()
  await hydrateMainLayoutProjectSurfacesWithAutoOpen(projectSurfaceDeps({
    isProjectReplacementInFlight: () => false,
    readProjectContentEpoch: () => 1,
    setWindowOpen
  }))
  expect(setWindowOpen).toHaveBeenCalledWith(true)
})

test('Test that project surface hydrate does not auto-open the noteboard when a project switch is in flight', async () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectManagement: {}
      }
    },
    writable: true
  })
  const setWindowOpen = vi.fn()
  await hydrateMainLayoutProjectSurfacesWithAutoOpen(projectSurfaceDeps({
    isProjectReplacementInFlight: () => true,
    readProjectContentEpoch: () => 1,
    setWindowOpen
  }))
  expect(setWindowOpen).not.toHaveBeenCalled()
})
