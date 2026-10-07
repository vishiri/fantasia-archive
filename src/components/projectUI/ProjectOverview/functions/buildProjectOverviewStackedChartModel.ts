import type {
  I_faProjectDocumentDistributionCountCell,
  I_faProjectDocumentDistributionResult,
  I_faProjectDocumentDistributionTemplateCategory,
  I_faProjectDocumentDistributionWorldSeries
} from 'app/types/I_faProjectDocumentLastOpenedDomain'
import type {
  I_faProjectOverviewStackedChartModel
} from 'app/types/I_faProjectOverviewChart'

/**
 * Blank world.color chart series paint — same token as hierarchy/tree world icons.
 */
const FA_PROJECT_OVERVIEW_WORLD_COLOR_PRIMARY_BRIGHT_FALLBACK =
  'var(--fa-color-primary-bright)'

/**
 * Resolves a plural template title for chart categories from a translations JSON map.
 */
export function resolveProjectOverviewTemplatePluralLabel (
  titlePluralTranslationsJson: string,
  preferredLanguageCode: string,
  parseTranslationsJson: (raw: string) => Record<string, string>
): string {
  const map = parseTranslationsJson(titlePluralTranslationsJson)
  const preferred = map[preferredLanguageCode]?.trim()
  if (preferred) {
    return preferred
  }
  const en = map['en-US']?.trim()
  if (en) {
    return en
  }
  return resolveProjectOverviewFallbackTranslation(map, preferredLanguageCode)
}

/**
 * After preferred and en-US, use language-code order.
 * Matches locale translation fallback. JSON key order must not win.
 */
function resolveProjectOverviewFallbackTranslation (
  map: Record<string, string>,
  preferredLanguageCode: string
): string {
  const sortedCodes = Object.keys(map).sort((left, right) => {
    return left.localeCompare(right)
  })
  for (const languageCode of sortedCodes) {
    if (languageCode === preferredLanguageCode || languageCode === 'en-US') {
      continue
    }
    const trimmed = map[languageCode]?.trim() ?? ''
    if (trimmed.length > 0) {
      return trimmed
    }
  }
  return ''
}

/**
 * Resolves a world display name from translations JSON for chart legend series.
 */
export function resolveProjectOverviewWorldDisplayLabel (
  displayNameTranslationsJson: string,
  preferredLanguageCode: string,
  parseTranslationsJson: (raw: string) => Record<string, string>
): string {
  return resolveProjectOverviewTemplatePluralLabel(
    displayNameTranslationsJson,
    preferredLanguageCode,
    parseTranslationsJson
  )
}

function buildCountLookup (
  counts: readonly I_faProjectDocumentDistributionCountCell[]
): Map<string, number> {
  const lookup = new Map<string, number>()
  for (const cell of counts) {
    lookup.set(`${cell.templateId}\0${cell.worldId}`, cell.documentCount)
  }
  return lookup
}

function sortTemplatesBySortOrder (
  templates: readonly I_faProjectDocumentDistributionTemplateCategory[]
): I_faProjectDocumentDistributionTemplateCategory[] {
  return [...templates].sort((left, right) => left.sortOrder - right.sortOrder)
}

function sortWorldsBySortOrder (
  worlds: readonly I_faProjectDocumentDistributionWorldSeries[]
): I_faProjectDocumentDistributionWorldSeries[] {
  return [...worlds].sort((left, right) => left.sortOrder - right.sortOrder)
}

/**
 * Builds Apex stacked-bar categories + per-world series from distribution IPC payload.
 * Template categories follow Project Settings document-template sort_order.
 * Equal sort_order keeps the query order (created_at_ms, then id).
 */
export function buildProjectOverviewStackedChartModel (input: {
  distribution: I_faProjectDocumentDistributionResult
  preferredLanguageCode: string
  parseTranslationsJson: (raw: string) => Record<string, string>
}): I_faProjectOverviewStackedChartModel {
  const templates = sortTemplatesBySortOrder(input.distribution.templates)
  const worlds = sortWorldsBySortOrder(input.distribution.worlds)
  const countLookup = buildCountLookup(input.distribution.counts)

  const categories = templates.map((template) => {
    return resolveProjectOverviewTemplatePluralLabel(
      template.titlePluralTranslationsJson,
      input.preferredLanguageCode,
      input.parseTranslationsJson
    )
  })

  const series = worlds.map((world) => {
    const name = resolveProjectOverviewWorldDisplayLabel(
      world.displayNameTranslationsJson,
      input.preferredLanguageCode,
      input.parseTranslationsJson
    )
    const data = templates.map((template) => {
      return countLookup.get(`${template.templateId}\0${world.worldId}`) ?? 0
    })
    const trimmedColor = world.color.trim()
    const color = trimmedColor.length > 0
      ? trimmedColor
      : FA_PROJECT_OVERVIEW_WORLD_COLOR_PRIMARY_BRIGHT_FALLBACK
    return {
      name,
      color,
      data
    }
  })

  const totalDocumentCount = input.distribution.totalDocumentCount
  return {
    categories,
    series,
    totalDocumentCount
  }
}
