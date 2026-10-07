import type { I_faProjectWorldTemplateGroupDisplayNameTranslations } from 'app/types/I_faProjectWorldTemplateGroupDisplayNameTranslations'
import type { I_faProjectWorldTemplatePlacementNicknameSingularTranslations } from 'app/types/I_faProjectWorldTemplatePlacementNicknameSingularTranslations'
import type { I_faProjectWorldTemplatePlacementNicknameTranslations } from 'app/types/I_faProjectWorldTemplatePlacementNicknameTranslations'
import type {
  I_faProjectWorldTemplateGroup,
  I_faProjectWorldTemplatePlacementForProjectSettings
} from 'app/types/I_faProjectWorldTemplateLayoutDomain'
import type { I_faSqlWorldTemplateGroupRow } from 'app/types/I_faProjectContentRowMap'
import type { I_faSqlWorldTemplatePlacementJoinRow } from 'app/types/I_faProjectContentRowMap'

export function createMapFaProjectWorldTemplateGroupRow (deps: {
  parseDisplayNameTranslationsJson: (
    raw: string
  ) => I_faProjectWorldTemplateGroupDisplayNameTranslations
}): (row: I_faSqlWorldTemplateGroupRow) => I_faProjectWorldTemplateGroup {
  return function mapFaProjectWorldTemplateGroupRow (
    row: I_faSqlWorldTemplateGroupRow
  ): I_faProjectWorldTemplateGroup {
    const id = row.id
    const worldId = row.world_id
    const displayName = row.display_name
    const displayNameTranslations = deps.parseDisplayNameTranslationsJson(
      row.display_name_translations_json
    )
    const rootSortOrder = row.root_sort_order
    const createdAtMs = row.created_at_ms
    const updatedAtMs = row.updated_at_ms
    return {
      id,
      worldId,
      displayName,
      displayNameTranslations,
      rootSortOrder,
      createdAtMs,
      updatedAtMs
    }
  }
}

export function createMapFaProjectWorldTemplatePlacementForProjectSettingsRow (deps: {
  parseNicknamePluralTranslationsJson: (
    raw: string
  ) => I_faProjectWorldTemplatePlacementNicknameTranslations
  parseNicknameSingularTranslationsJson: (
    raw: string
  ) => I_faProjectWorldTemplatePlacementNicknameSingularTranslations
}): (
    row: I_faSqlWorldTemplatePlacementJoinRow,
    counts: { categoryCountInWorld: number, documentCountInWorld: number }
  ) => I_faProjectWorldTemplatePlacementForProjectSettings {
  return function mapFaProjectWorldTemplatePlacementForProjectSettingsRow (
    row: I_faSqlWorldTemplatePlacementJoinRow,
    counts: { categoryCountInWorld: number, documentCountInWorld: number }
  ): I_faProjectWorldTemplatePlacementForProjectSettings {
    const id = row.id
    const worldId = row.world_id
    const documentTemplateId = row.document_template_id
    const groupId = row.group_id
    const rootSortOrder = row.root_sort_order
    const groupSortOrder = row.group_sort_order
    const displayName = row.display_name
    const nickname = row.nickname
    const nicknamePluralTranslations = deps.parseNicknamePluralTranslationsJson(
      row.nickname_translations_json
    )
    const nicknameSingularTranslations = deps.parseNicknameSingularTranslationsJson(
      row.nickname_singular_translations_json
    )
    const worldAppendix = row.world_appendix
    const icon = row.icon
    const categoryCountInWorld = counts.categoryCountInWorld
    const documentCountInWorld = counts.documentCountInWorld
    const createdAtMs = row.created_at_ms
    const updatedAtMs = row.updated_at_ms
    return {
      id,
      worldId,
      documentTemplateId,
      groupId,
      rootSortOrder,
      groupSortOrder,
      displayName,
      nickname,
      nicknamePluralTranslations,
      nicknameSingularTranslations,
      worldAppendix,
      icon,
      categoryCountInWorld,
      documentCountInWorld,
      createdAtMs,
      updatedAtMs
    }
  }
}
