import {
  computed,
  nextTick,
  ref
} from 'vue'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FA_APP_SHELL_DRAWER_TRANSITION_MS } from 'app/src/scripts/appRouting/faAppShellPageTransition'
import { useAppShellLayoutDrawerRail } from 'app/src/layouts/MainLayout/scripts/appShellLayoutDrawerRail'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

/**
 * appShellLayoutDrawerRail
 * Welcome route keeps lowercase l in QLayout view (no drawer rail).
 */
test('Test that useAppShellLayoutDrawerRail keeps lpr view while workspace drawer is closed', async () => {
  const showWorkspaceDrawer = computed(() => false)
  const { appShellLayoutQuasarView } = useAppShellLayoutDrawerRail(showWorkspaceDrawer)

  await nextTick()

  expect(appShellLayoutQuasarView.value).toBe('hHh lpr lFf')
})

/**
 * appShellLayoutDrawerRail
 * Workspace route delays capital L until the drawer slide duration elapses.
 */
test('Test that useAppShellLayoutDrawerRail switches to Lpr after drawer transition ms', async () => {
  const showWorkspaceDrawer = computed(() => true)
  const { appShellLayoutQuasarView } = useAppShellLayoutDrawerRail(showWorkspaceDrawer)

  await nextTick()

  expect(appShellLayoutQuasarView.value).toBe('hHh lpr lFf')

  vi.advanceTimersByTime(FA_APP_SHELL_DRAWER_TRANSITION_MS)
  await nextTick()

  expect(appShellLayoutQuasarView.value).toBe('hHh Lpr lFf')
})

/**
 * appShellLayoutDrawerRail
 * Leaving workspace clears the rail immediately for the hide transition.
 */
test('Test that useAppShellLayoutDrawerRail drops Lpr when workspace drawer closes', async () => {
  const showWorkspaceDrawer = ref(true)
  const { appShellLayoutQuasarView } = useAppShellLayoutDrawerRail(showWorkspaceDrawer)

  await nextTick()
  vi.advanceTimersByTime(FA_APP_SHELL_DRAWER_TRANSITION_MS)
  await nextTick()
  expect(appShellLayoutQuasarView.value).toBe('hHh Lpr lFf')

  showWorkspaceDrawer.value = false
  await nextTick()

  expect(appShellLayoutQuasarView.value).toBe('hHh lpr lFf')
})
