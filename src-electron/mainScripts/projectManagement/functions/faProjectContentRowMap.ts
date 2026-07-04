import type { I_faProjectContentNamedEntity } from 'app/types/I_faProjectContentShared'
import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import type { I_faProjectDocumentTemplateWorldAppendixTranslations } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'
import type { I_faProjectWorldTemplateGroupDisplayNameTranslations } from 'app/types/I_faProjectWorldTemplateGroupDisplayNameTranslations'
import type { I_faProjectDocumentTemplateTitleSingularTranslations } from 'app/types/I_faProjectDocumentTemplateTitleSingularTranslations'
import type { I_faProjectWorldTemplatePlacementNicknameSingularTranslations } from 'app/types/I_faProjectWorldTemplatePlacementNicknameSingularTranslations'
import type { I_faProjectWorldTemplatePlacementNicknameTranslations } from 'app/types/I_faProjectWorldTemplatePlacementNicknameTranslations'
import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'
import type {
  I_faProjectWorldTemplateGroup,
  I_faProjectWorldTemplatePlacementForProjectSettings
} from 'app/types/I_faProjectWorldTemplateLayoutDomain'
import type { I_faSqlDocumentTemplateRow } from 'app/types/I_faProjectContentRowMap'
import type { I_faSqlNamedEntityRow } from 'app/types/I_faProjectContentRowMap'
import type { I_faSqlProjectDocumentRow } from 'app/types/I_faProjectContentRowMap'
import type { I_faSqlWorldRow } from 'app/types/I_faProjectContentRowMap'
import type { I_faSqlWorldTemplateGroupRow } from 'app/types/I_faProjectContentRowMap'
import type { I_faSqlWorldTemplatePlacementJoinRow } from 'app/types/I_faProjectContentRowMap'

export function createMapFaProjectDocumentTemplateRow (deps: {
  parseTitlePluralTranslationsJson: (raw: string) => I_faProjectDocumentTemplateTitleTranslations
  parseTitleSingularTranslationsJson: (
    raw: string
  ) => I_faProjectDocumentTemplateTitleSingularTranslations
  parseWorldAppendixTranslationsJson: (
    raw: string
  ) => I_faProjectDocumentTemplateWorldAppendixTranslations
}): (row: I_faSqlDocumentTemplateRow) => I_faProjectDocumentTemplate {
  return function mapFaProjectDocumentTemplateRow (
    row: I_faSqlDocumentTemplateRow
  ): I_faProjectDocumentTemplate {
    return {
      id: row.id,
      displayName: row.display_name,
      titlePluralTranslations: deps.parseTitlePluralTranslationsJson(row.title_translations_json),
      titleSingularTranslations: deps.parseTitleSingularTranslationsJson(
        row.title_singular_translations_json
      ),
      sortOrder: row.sort_order,
      worldAppendix: row.world_appendix,
      worldAppendixTranslations: deps.parseWorldAppendixTranslationsJson(
        row.world_appendix_translations_json
      ),
      icon: row.icon,
      createdAtMs: row.created_at_ms,
      updatedAtMs: row.updated_at_ms
    }
  }
}

export function createMapFaProjectWorldRow (deps: {
  parseDisplayNameTranslationsJson: (raw: string) => I_faProjectWorldDisplayNameTranslations
}): (row: I_faSqlWorldRow) => I_faProjectWorld {
  return function mapFaProjectWorldRow (row: I_faSqlWorldRow): I_faProjectWorld {
    return {
      id: row.id,
      displayName: row.display_name,
      displayNameTranslations: deps.parseDisplayNameTranslationsJson(
        row.display_name_translations_json
      ),
      color: row.color,
      colorPallete: row.color_pallete,
      sortOrder: row.sort_order,
      createdAtMs: row.created_at_ms,
      updatedAtMs: row.updated_at_ms
    }
  }
}

export function mapFaProjectNamedEntityRow (
  row: I_faSqlNamedEntityRow
): I_faProjectContentNamedEntity {
  return {
    id: row.id,
    displayName: row.display_name,
    createdAtMs: row.created_at_ms,
    updatedAtMs: row.updated_at_ms
  }
}

export function mapFaProjectDocumentRow (row: I_faSqlProjectDocumentRow): I_faProjectDocument {
  return {
    id: row.id,
    worldId: row.world_id,
    templateId: row.template_id,
    placementId: row.tree_placement_id,
    parentDocumentId: row.tree_parent_document_id,
    sortOrder: row.tree_custom_sort_order,
    displayName: row.display_name,
    createdAtMs: row.created_at_ms,
    updatedAtMs: row.updated_at_ms
  }
}

export function createMapFaProjectWorldTemplateGroupRow (deps: {
  parseDisplayNameTranslationsJson: (
    raw: string
  ) => I_faProjectWorldTemplateGroupDisplayNameTranslations
}): (row: I_faSqlWorldTemplateGroupRow) => I_faProjectWorldTemplateGroup {
  return function mapFaProjectWorldTemplateGroupRow (
    row: I_faSqlWorldTemplateGroupRow
  ): I_faProjectWorldTemplateGroup {
    return {
      id: row.id,
      worldId: row.world_id,
      displayName: row.display_name,
      displayNameTranslations: deps.parseDisplayNameTranslationsJson(
        row.display_name_translations_json
      ),
      rootSortOrder: row.root_sort_order,
      createdAtMs: row.created_at_ms,
      updatedAtMs: row.updated_at_ms
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
}): (row: I_faSqlWorldTemplatePlacementJoinRow, documentCountInWorld: number) => I_faProjectWorldTemplatePlacementForProjectSettings {
  return function mapFaProjectWorldTemplatePlacementForProjectSettingsRow (
    row: I_faSqlWorldTemplatePlacementJoinRow,
    documentCountInWorld: number
  ): I_faProjectWorldTemplatePlacementForProjectSettings {
    return {
      id: row.id,
      worldId: row.world_id,
      documentTemplateId: row.document_template_id,
      groupId: row.group_id,
      rootSortOrder: row.root_sort_order,
      groupSortOrder: row.group_sort_order,
      displayName: row.display_name,
      nickname: row.nickname,
      nicknamePluralTranslations: deps.parseNicknamePluralTranslationsJson(row.nickname_translations_json),
      nicknameSingularTranslations: deps.parseNicknameSingularTranslationsJson(
        row.nickname_singular_translations_json
      ),
      worldAppendix: row.world_appendix,
      icon: row.icon,
      documentCountInWorld,
      createdAtMs: row.created_at_ms,
      updatedAtMs: row.updated_at_ms
    }
  }
}
