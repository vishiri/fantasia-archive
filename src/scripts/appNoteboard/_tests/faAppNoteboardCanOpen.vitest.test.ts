/** @vitest-environment jsdom */
import { beforeEach, expect, test } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { canOpenFloatingWindowWhileNoModal } from 'app/src/scripts/appNoteboard/appNoteboard_manager'
import { S_DialogComponent, S_DialogMarkdown } from 'app/src/stores/S_Dialog'

beforeEach(() => {
  setActivePinia(createPinia())
})

test('canOpenFloatingWindowWhileNoModal is true when no modal dialogs are open', () => {
  expect(canOpenFloatingWindowWhileNoModal()).toBe(true)
})

test('canOpenFloatingWindowWhileNoModal is false when a markdown dialog is open', () => {
  S_DialogMarkdown().onMarkdownDialogBecameVisible()
  expect(canOpenFloatingWindowWhileNoModal()).toBe(false)
})

test('canOpenFloatingWindowWhileNoModal is false when a component dialog is open', () => {
  S_DialogComponent().onComponentDialogBecameVisible()
  expect(canOpenFloatingWindowWhileNoModal()).toBe(false)
})
