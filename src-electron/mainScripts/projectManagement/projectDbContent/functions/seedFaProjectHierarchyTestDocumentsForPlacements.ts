import type {
  I_faProjectHierarchyTestDocumentInsertPlan,
  I_faProjectHierarchyTestPlacementSeedContext,
  I_faProjectHierarchyTestPlacementSeedInput
} from 'app/types/I_faProjectHierarchyTestDocumentSeedDomain'

const FA_PROJECT_HIERARCHY_TEST_DOCUMENT_SEED_MAX = 10

function formatFaProjectHierarchyTestDocumentSuffix (suffix: number): string {
  return suffix < 10 ? `0${suffix}` : '10'
}

function buildFaProjectHierarchyTestDocumentDisplayName (
  templateDisplayName: string,
  suffix: number
): string {
  return `Test Document - ${templateDisplayName} ${formatFaProjectHierarchyTestDocumentSuffix(suffix)}`
}

function listFaProjectHierarchyLowestFreeSeedSuffixes (
  usedSuffixes: number[],
  neededCount: number
): number[] {
  const used = new Set(usedSuffixes)
  const free: number[] = []
  for (let suffix = 1; suffix <= FA_PROJECT_HIERARCHY_TEST_DOCUMENT_SEED_MAX; suffix += 1) {
    if (!used.has(suffix)) {
      free.push(suffix)
      if (free.length >= neededCount) {
        break
      }
    }
  }
  return free
}

/**
 * Pure insert plan for dev-only hierarchy test documents (01-10 suffixes per placement).
 */
export function planFaProjectHierarchyTestDocumentInserts (
  deps: {
    generateUuid: () => string
    nowMs: () => number
  },
  placement: I_faProjectHierarchyTestPlacementSeedInput,
  context: I_faProjectHierarchyTestPlacementSeedContext
): I_faProjectHierarchyTestDocumentInsertPlan[] {
  if (placement.templateDisplayName.trim().length === 0) {
    return []
  }
  if (context.existingSeedCount >= FA_PROJECT_HIERARCHY_TEST_DOCUMENT_SEED_MAX) {
    return []
  }
  const insertCount = FA_PROJECT_HIERARCHY_TEST_DOCUMENT_SEED_MAX - context.existingSeedCount
  const suffixes = listFaProjectHierarchyLowestFreeSeedSuffixes(context.usedSuffixes, insertCount)
  const baseSort = context.maxSortOrder === null ? -1 : context.maxSortOrder
  const timestamp = deps.nowMs()
  const plans: I_faProjectHierarchyTestDocumentInsertPlan[] = []
  suffixes.forEach((suffix, index) => {
    plans.push({
      id: deps.generateUuid(),
      displayName: buildFaProjectHierarchyTestDocumentDisplayName(
        placement.templateDisplayName,
        suffix
      ),
      worldId: placement.worldId,
      templateId: placement.documentTemplateId,
      placementId: placement.placementId,
      parentDocumentId: null,
      sortOrder: baseSort + index + 1,
      createdAtMs: timestamp,
      updatedAtMs: timestamp
    })
  })
  return plans
}

export function buildFaProjectHierarchyTestDocumentSeedNamePattern (
  escapeRegex: (value: string) => string,
  templateDisplayName: string
): string {
  return `^Test Document - ${escapeRegex(templateDisplayName)} (0[1-9]|10)$`
}
