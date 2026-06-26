import {
  computed,
  nextTick,
  ref
} from 'vue'
import { expect, test } from 'vitest'

import { useAppShellLayoutDrawerRail } from 'app/src/layouts/MainLayout/scripts/mainLayout_manager'

/**
 * appShellLayoutDrawerRail
 * Welcome and workspace both use lpr — QSplitter owns left width, not the layout drawer rail.
 */
test('Test that useAppShellLayoutDrawerRail keeps lpr view while workspace drawer is closed', async () => {
  const showWorkspaceDrawer = computed(() => false)
  const { appShellLayoutQuasarView } = useAppShellLayoutDrawerRail(showWorkspaceDrawer)

  await nextTick()

  expect(appShellLayoutQuasarView.value).toBe('hHh lpr lFf')
})

/**
 * appShellLayoutDrawerRail
 * Workspace route keeps lpr because the resizable sidebar is a QSplitter child, not a layout drawer slot.
 */
test('Test that useAppShellLayoutDrawerRail keeps lpr when workspace drawer is open', async () => {
  const showWorkspaceDrawer = computed(() => true)
  const { appShellLayoutQuasarView } = useAppShellLayoutDrawerRail(showWorkspaceDrawer)

  await nextTick()

  expect(appShellLayoutQuasarView.value).toBe('hHh lpr lFf')
})

/**
 * appShellLayoutDrawerRail
 * Leaving workspace keeps the same layout view string.
 */
test('Test that useAppShellLayoutDrawerRail keeps lpr when workspace drawer closes', async () => {
  const showWorkspaceDrawer = ref(true)
  const { appShellLayoutQuasarView } = useAppShellLayoutDrawerRail(showWorkspaceDrawer)

  await nextTick()
  expect(appShellLayoutQuasarView.value).toBe('hHh lpr lFf')

  showWorkspaceDrawer.value = false
  await nextTick()

  expect(appShellLayoutQuasarView.value).toBe('hHh lpr lFf')
})
