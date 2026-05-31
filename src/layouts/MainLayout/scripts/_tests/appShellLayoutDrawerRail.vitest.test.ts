import {
  computed,
  nextTick,
  ref
} from 'vue'
import { expect, test } from 'vitest'

import { useAppShellLayoutDrawerRail } from 'app/src/layouts/MainLayout/scripts/mainLayout_manager'

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
 * Workspace route reserves drawer rail in the layout view immediately.
 */
test('Test that useAppShellLayoutDrawerRail uses Lpr when workspace drawer is open', async () => {
  const showWorkspaceDrawer = computed(() => true)
  const { appShellLayoutQuasarView } = useAppShellLayoutDrawerRail(showWorkspaceDrawer)

  await nextTick()

  expect(appShellLayoutQuasarView.value).toBe('hHh Lpr lFf')
})

/**
 * appShellLayoutDrawerRail
 * Leaving workspace clears the rail when the drawer closes.
 */
test('Test that useAppShellLayoutDrawerRail drops Lpr when workspace drawer closes', async () => {
  const showWorkspaceDrawer = ref(true)
  const { appShellLayoutQuasarView } = useAppShellLayoutDrawerRail(showWorkspaceDrawer)

  await nextTick()
  expect(appShellLayoutQuasarView.value).toBe('hHh Lpr lFf')

  showWorkspaceDrawer.value = false
  await nextTick()

  expect(appShellLayoutQuasarView.value).toBe('hHh lpr lFf')
})
