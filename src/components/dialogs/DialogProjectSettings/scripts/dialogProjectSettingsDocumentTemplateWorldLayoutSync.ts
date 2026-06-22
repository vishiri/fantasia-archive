import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type {
  I_dialogProjectSettingsWorldDraft,
  I_dialogProjectSettingsWorldTemplateLayoutDraft
} from 'app/types/I_dialogProjectSettingsWorlds'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

import { resolveDialogProjectSettingsDocumentTemplateResolvedTitle } from './dialogProjectSettingsDocumentTemplatesDraft'
import { resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix } from './dialogProjectSettingsDocumentTemplateWorldAppendixDraft'
import { syncDialogProjectSettingsWorldTemplatePlacementTemplateDisplayNames } from './dialogProjectSettingsWorldTemplateLayoutDraft'

export function syncDialogProjectSettingsWorldTemplateLayoutPlacementLocalizedLabels (
  layout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  documentTemplates: readonly I_dialogProjectSettingsDocumentTemplateDraft[],
  languageCode: T_faUserSettingsLanguageCode
): I_dialogProjectSettingsWorldTemplateLayoutDraft {
  const templateById = new Map(documentTemplates.map((template) => {
    return [template.id, template] as const
  }))
  return {
    groups: layout.groups,
    placements: layout.placements.map((placement) => {
      const template = templateById.get(placement.documentTemplateId)
      if (template === undefined) {
        return placement
      }
      return {
        ...placement,
        templateDisplayName: resolveDialogProjectSettingsDocumentTemplateResolvedTitle(
          template,
          languageCode
        ),
        worldAppendix: resolveDialogProjectSettingsDocumentTemplateResolvedWorldAppendix(
          template,
          languageCode
        )
      }
    })
  }
}

export function syncDialogProjectSettingsWorldsTemplateLayoutPlacementLocalizedLabels (
  worlds: I_dialogProjectSettingsWorldDraft[],
  documentTemplates: readonly I_dialogProjectSettingsDocumentTemplateDraft[],
  languageCode: T_faUserSettingsLanguageCode
): I_dialogProjectSettingsWorldDraft[] {
  return worlds.map((world) => {
    return {
      ...world,
      templateLayout: syncDialogProjectSettingsWorldTemplateLayoutPlacementLocalizedLabels(
        world.templateLayout,
        documentTemplates,
        languageCode
      )
    }
  })
}

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
