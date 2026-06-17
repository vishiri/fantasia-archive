import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'

import { renameDocumentTemplatePlacementsInWorldTemplateLayoutDraft } from './dialogProjectSettingsWorldTemplateLayoutDraft'

export function syncDialogProjectSettingsWorldDraftTemplateLayoutPlacementDisplayNames (
  worlds: I_dialogProjectSettingsWorldDraft[],
  documentTemplateId: string,
  displayName: string
): I_dialogProjectSettingsWorldDraft[] {
  return worlds.map((world) => {
    return {
      ...world,
      templateLayout: renameDocumentTemplatePlacementsInWorldTemplateLayoutDraft(
        world.templateLayout,
        documentTemplateId,
        displayName
      )
    }
  })
}
