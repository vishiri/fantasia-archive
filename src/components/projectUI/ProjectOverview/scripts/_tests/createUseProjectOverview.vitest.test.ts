import type {
  StoreGeneric,
  T_piniaStoreToRefs
} from 'app/types/I_vuePiniaInjected'

import { beforeEach, expect, test, vi } from 'vitest'
import { computed, ref } from 'vue'

import { createUseProjectOverview } from '../../functions/createUseProjectOverview'

const pickRandomTipCaptionMock = vi.fn(() => 'Random tip.')

const activeProjectRef = ref<{ name: string } | null>(null)
const appSettingsDialogPreviewRef = ref<{ hideTooltipsProject?: boolean } | null>(null)
const settingsRef = ref<{ hidePlushes: boolean, hideTooltipsProject: boolean } | null>({
  hidePlushes: false,
  hideTooltipsProject: false
})

const onMountedHooks: Array<() => void> = []

const useProjectOverview = createUseProjectOverview({
  S_FaActiveProject: () => ({
    activeProject: activeProjectRef.value
  }) as unknown as StoreGeneric,
  S_FaUserSettings: () => ({
    settings: settingsRef.value
  }) as unknown as StoreGeneric,
  computed,
  onMounted: (hook) => {
    onMountedHooks.push(hook)
  },
  pickRandomTipCaption: pickRandomTipCaptionMock,
  ref,
  storeToRefs: ((store) => {
    if ('activeProject' in store) {
      return { activeProject: activeProjectRef }
    }
    return {
      appSettingsDialogPreview: appSettingsDialogPreviewRef,
      settings: settingsRef
    }
  }) as T_piniaStoreToRefs,
  t: (key) => key
})

beforeEach(() => {
  onMountedHooks.length = 0
  activeProjectRef.value = null
  appSettingsDialogPreviewRef.value = null
  settingsRef.value = {
    hidePlushes: false,
    hideTooltipsProject: false
  }
  pickRandomTipCaptionMock.mockClear()
})

/**
 * createUseProjectOverview
 * Uses the active project name when a session is loaded.
 */
test('Test that useProjectOverview exposes the active project display name', () => {
  activeProjectRef.value = { name: 'FA, Ralia, Age of Magic Reborn' }

  const state = useProjectOverview()

  expect(state.projectDisplayName.value).toBe('FA, Ralia, Age of Magic Reborn')
})

/**
 * createUseProjectOverview
 * Falls back to the no-project label when nothing is loaded.
 */
test('Test that useProjectOverview uses the no-project label without an active project', () => {
  const state = useProjectOverview()

  expect(state.projectDisplayName.value).toBe('projectUI.projectOverview.noActiveProjectName')
})

/**
 * createUseProjectOverview
 * Picks a random tip on mount and respects hideTooltipsProject.
 */
test('Test that useProjectOverview loads a random tip and hides the card when disabled', () => {
  const state = useProjectOverview()

  expect(state.showTipCard.value).toBe(true)

  onMountedHooks.forEach((hook) => hook())
  expect(pickRandomTipCaptionMock).toHaveBeenCalledTimes(1)
  expect(state.randomTipCaption.value).toBe('Random tip.')

  settingsRef.value = {
    hidePlushes: true,
    hideTooltipsProject: true
  }

  expect(useProjectOverview().showTipCard.value).toBe(false)
  expect(useProjectOverview().showMascotInTipCard.value).toBe(false)
})

/**
 * createUseProjectOverview
 * App Settings dialog preview overrides persisted hideTooltipsProject until the dialog closes.
 */
test('Test that useProjectOverview hides the tip card from app settings dialog preview', () => {
  settingsRef.value = {
    hidePlushes: false,
    hideTooltipsProject: false
  }
  appSettingsDialogPreviewRef.value = {
    hideTooltipsProject: true
  }

  expect(useProjectOverview().showTipCard.value).toBe(false)
})
