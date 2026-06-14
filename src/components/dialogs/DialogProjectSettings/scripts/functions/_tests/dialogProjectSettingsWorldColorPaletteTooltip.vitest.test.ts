import { expect, test } from 'vitest'

import { buildDialogProjectSettingsWorldColorPaletteTooltipContent } from '../dialogProjectSettingsWorldColorPaletteTooltip'

/**
 * buildDialogProjectSettingsWorldColorPaletteTooltipContent
 */

test('Test that buildDialogProjectSettingsWorldColorPaletteTooltipContent formats multiline flat text', () => {
  const tooltip = buildDialogProjectSettingsWorldColorPaletteTooltipContent({
    deletionLabel: 'Deletion',
    duplicationLabel: 'Duplication',
    intro: 'Palette intro.',
    rightClickIntro: 'Right-click actions:'
  })

  expect(tooltip.intro).toBe('Palette intro.')
  expect(tooltip.rightClickIntro).toBe('Right-click actions:')
  expect(tooltip.deletionBullet).toBe('- Deletion')
  expect(tooltip.duplicationBullet).toBe('- Duplication')
  expect(tooltip.flatText).toBe(
    'Palette intro.\n\nRight-click actions:\n- Deletion\n- Duplication'
  )
})
