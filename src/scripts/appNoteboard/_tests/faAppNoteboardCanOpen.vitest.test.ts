/** @vitest-environment jsdom */
import { beforeEach, expect, test } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { canOpenAppNoteboardFloatingWindow } from 'app/src/scripts/appNoteboard/faAppNoteboardCanOpen'
import { S_DialogComponent, S_DialogMarkdown } from 'app/src/stores/S_Dialog'

beforeEach(() => {
  setActivePinia(createPinia())
})

test('canOpenAppNoteboardFloatingWindow is true when no modal dialogs are open', () => {
  expect(canOpenAppNoteboardFloatingWindow()).toBe(true)
})

test('canOpenAppNoteboardFloatingWindow is false when a markdown dialog is open', () => {
  S_DialogMarkdown().onMarkdownDialogBecameVisible()
  expect(canOpenAppNoteboardFloatingWindow()).toBe(false)
})

test('canOpenAppNoteboardFloatingWindow is false when a component dialog is open', () => {
  S_DialogComponent().onComponentDialogBecameVisible()
  expect(canOpenAppNoteboardFloatingWindow()).toBe(false)
})
