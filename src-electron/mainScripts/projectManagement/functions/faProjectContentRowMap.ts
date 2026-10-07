import type { I_faProjectContentNamedEntity } from 'app/types/I_faProjectContentShared'
import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import type { I_faProjectDocumentTemplateWorldAppendixTranslations } from 'app/types/I_faProjectDocumentTemplateWorldAppendixTranslations'
import type {
  I_faProjectMedia,
  T_faProjectMediaExternalType,
  T_faProjectMediaInternalType,
  T_faProjectMediaType
} from 'app/types/I_faProjectMediaDomain'
import type { I_faProjectWorldDisplayNameTranslations } from 'app/types/I_faProjectWorldDisplayNameTranslations'
import type { I_faProjectDocumentTemplateTitleSingularTranslations } from 'app/types/I_faProjectDocumentTemplateTitleSingularTranslations'
import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'
import type { I_faSqlDocumentTemplateRow } from 'app/types/I_faProjectContentRowMap'
import type { I_faSqlMediaRow } from 'app/types/I_faProjectContentRowMap'
import type { I_faSqlNamedEntityRow } from 'app/types/I_faProjectContentRowMap'
import type { I_faSqlWorldRow } from 'app/types/I_faProjectContentRowMap'

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
    const id = row.id
    const displayName = row.display_name
    const titlePluralTranslations = deps.parseTitlePluralTranslationsJson(row.title_translations_json)
    const titleSingularTranslations = deps.parseTitleSingularTranslationsJson(
      row.title_singular_translations_json
    )
    const sortOrder = row.sort_order
    const worldAppendix = row.world_appendix
    const worldAppendixTranslations = deps.parseWorldAppendixTranslationsJson(
      row.world_appendix_translations_json
    )
    const icon = row.icon
    const createdAtMs = row.created_at_ms
    const updatedAtMs = row.updated_at_ms
    return {
      id,
      displayName,
      titlePluralTranslations,
      titleSingularTranslations,
      sortOrder,
      worldAppendix,
      worldAppendixTranslations,
      icon,
      createdAtMs,
      updatedAtMs
    }
  }
}

export function createMapFaProjectWorldRow (deps: {
  parseDisplayNameTranslationsJson: (raw: string) => I_faProjectWorldDisplayNameTranslations
}): (row: I_faSqlWorldRow) => I_faProjectWorld {
  return function mapFaProjectWorldRow (row: I_faSqlWorldRow): I_faProjectWorld {
    const id = row.id
    const displayName = row.display_name
    const displayNameTranslations = deps.parseDisplayNameTranslationsJson(
      row.display_name_translations_json
    )
    const color = row.color
    const colorPalette = row.color_palette
    const sortOrder = row.sort_order
    const createdAtMs = row.created_at_ms
    const updatedAtMs = row.updated_at_ms
    return {
      id,
      displayName,
      displayNameTranslations,
      color,
      colorPalette,
      sortOrder,
      createdAtMs,
      updatedAtMs
    }
  }
}

export function mapFaProjectNamedEntityRow (
  row: I_faSqlNamedEntityRow
): I_faProjectContentNamedEntity {
  const id = row.id
  const displayName = row.display_name
  const createdAtMs = row.created_at_ms
  const updatedAtMs = row.updated_at_ms
  return {
    id,
    displayName,
    createdAtMs,
    updatedAtMs
  }
}

function mapFaProjectMediaType (raw: string): T_faProjectMediaType {
  if (raw === 'internal') {
    return 'internal'
  }
  return 'external'
}

function mapFaProjectMediaInternalType (raw: string): T_faProjectMediaInternalType {
  if (
    raw === 'embedded' ||
    raw === 'linked_outside' ||
    raw === 'linked_in_project'
  ) {
    return raw
  }
  return ''
}

function mapFaProjectMediaExternalType (raw: string): T_faProjectMediaExternalType {
  if (raw === 'linked' || raw === 'embed') {
    return raw
  }
  return ''
}

function mapFaProjectMediaInternalEmbed (raw: Uint8Array | null): Uint8Array | null {
  if (raw === null) {
    return null
  }
  if (raw instanceof Uint8Array && raw.byteLength > 0) {
    return raw
  }
  return null
}

export function mapFaProjectMediaRow (row: I_faSqlMediaRow): I_faProjectMedia {
  const type = mapFaProjectMediaType(row.type)
  const internalType = mapFaProjectMediaInternalType(row.internal_type)
  const externalType = mapFaProjectMediaExternalType(row.external_type)
  const internalEmbed = mapFaProjectMediaInternalEmbed(row.internal_embed)
  const id = row.id
  const displayName = row.display_name
  const externalLink = row.external_link
  const externalEmbed = row.external_embed
  const internalLink = row.internal_link
  const createdAtMs = row.created_at_ms
  const updatedAtMs = row.updated_at_ms
  return {
    id,
    displayName,
    type,
    internalType,
    externalType,
    externalLink,
    externalEmbed,
    internalLink,
    internalEmbed,
    createdAtMs,
    updatedAtMs
  }
}
