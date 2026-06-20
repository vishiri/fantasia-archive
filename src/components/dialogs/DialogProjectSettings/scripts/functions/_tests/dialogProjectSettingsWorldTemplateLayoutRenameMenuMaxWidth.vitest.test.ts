import { expect, test } from 'vitest'

import { resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuWidthPx } from '../dialogProjectSettingsWorldTemplateLayoutRenameMenuMaxWidth'

const fallbackParams = {
  actionButtonSizePx: 24,
  actionButtonsCount: 2,
  actionButtonsGapPx: 4,
  actionsPaddingPx: 12
}

test('Test that rename menu width subtracts two action buttons gap and padding', () => {
  const width = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuWidthPx({
    ...fallbackParams,
    anchor: {
      anchorClientWidth: 400,
      anchorLeftPx: 0,
      actionsLeftPx: null
    }
  })

  expect(width).toBe(400 - 24 * 2 - 4 - 12)
})

test('Test that rename menu width uses actions column position when available', () => {
  const width = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuWidthPx({
    ...fallbackParams,
    anchor: {
      anchorClientWidth: 400,
      anchorLeftPx: 100,
      actionsLeftPx: 450
    }
  })

  expect(width).toBe(450 - 100 - 12)
})

test('Test that rename menu width never goes below zero', () => {
  const width = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuWidthPx({
    ...fallbackParams,
    anchor: {
      anchorClientWidth: 40,
      anchorLeftPx: 0,
      actionsLeftPx: null
    }
  })

  expect(width).toBe(0)
})
