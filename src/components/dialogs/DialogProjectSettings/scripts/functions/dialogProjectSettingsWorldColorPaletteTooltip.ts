import type { I_dialogProjectSettingsWorldColorPaletteTooltipContent } from 'app/types/I_dialogProjectSettingsWorlds'

/** Builds structured and flattened world color palette help tooltip copy. */
export function buildDialogProjectSettingsWorldColorPaletteTooltipContent (parts: {
  deletionLabel: string
  duplicationLabel: string
  intro: string
  rightClickIntro: string
}): I_dialogProjectSettingsWorldColorPaletteTooltipContent {
  const deletionBullet = `- ${parts.deletionLabel}`
  const duplicationBullet = `- ${parts.duplicationLabel}`
  const flatText = [
    parts.intro,
    '',
    parts.rightClickIntro,
    deletionBullet,
    duplicationBullet
  ].join('\n')

  return {
    deletionBullet,
    duplicationBullet,
    flatText,
    intro: parts.intro,
    rightClickIntro: parts.rightClickIntro
  }
}
