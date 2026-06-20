import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'

import { syncDialogProjectSettingsWorldTemplatePlacementTemplateDisplayNames } from './dialogProjectSettingsWorldTemplateLayoutDraft'

export function syncDialogProjectSettingsWorldDraftTemplateLayoutPlacementDisplayNames (
  worlds: I_dialogProjectSettingsWorldDraft[],
  documentTemplateId: string,
  templateDisplayName: string
): I_dialogProjectSettingsWorldDraft[] {
  return worlds.map((world) => {
    return {
      ...world,
      templateLayout: syncDialogProjectSettingsWorldTemplatePlacementTemplateDisplayNames(
        world.templateLayout,
        documentTemplateId,
        templateDisplayName
      )
    }
  })
}
