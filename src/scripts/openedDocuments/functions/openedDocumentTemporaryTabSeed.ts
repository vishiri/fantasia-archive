import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectDocumentTagAssignmentInput } from 'app/types/I_faProjectTagDomain'

type T_normalizeOpenedDocumentNullableStringFromDb = (
  value: string | null | undefined
) => string

type T_temporaryOpenedDocumentTabCopySeedInput = {
  displayName: string
  documentBackgroundColor: string | null | undefined
  documentId: string
  documentTextColor: string | null | undefined
  isCategory?: boolean | undefined
  isDead?: boolean | undefined
  isFinished?: boolean | undefined
  isMinor?: boolean | undefined
  parentDocumentId: string | null
  tabLabel: string
  templateIcon: string
  templateId: string
  temporaryParentResolveDocumentIds?: readonly string[] | undefined
  treeOrderNumber?: number | null | undefined
  extraClasses?: string | null | undefined
  worldId: string
}

type T_temporaryOpenedDocumentTabSeedInput = {
  displayName: string
  documentId: string
  parentDocumentId: string | null
  tabLabel: string
  templateIcon: string
  templateId: string
  temporaryParentResolveDocumentIds?: readonly string[] | undefined
  worldId: string
  initialTagsDraft?: readonly I_faProjectDocumentTagAssignmentInput[] | undefined
}

/**
 * Seeds a temporary opened document tab copied from a source document or opened tab.
 * Starts clean like other temporary documents; drafts mark dirty on edit.
 * Copies appearance colors, Custom order, Category, and status flags from the source.
 */
export function createCreateTemporaryOpenedDocumentTabCopySeed (deps: {
  emptyTreeOrderNumber: number
  normalizeNullableStringFromDb: T_normalizeOpenedDocumentNullableStringFromDb
}): (input: T_temporaryOpenedDocumentTabCopySeedInput) => I_faOpenedDocumentTab {
  return function createTemporaryOpenedDocumentTabCopySeed (
    input: T_temporaryOpenedDocumentTabCopySeedInput
  ): I_faOpenedDocumentTab {
    const documentTextColor = deps.normalizeNullableStringFromDb(input.documentTextColor)
    const documentBackgroundColor = deps.normalizeNullableStringFromDb(
      input.documentBackgroundColor
    )
    const parentDocumentId = deps.normalizeNullableStringFromDb(input.parentDocumentId)
    const temporaryParentResolveDocumentIds = input.temporaryParentResolveDocumentIds === undefined
      ? undefined
      : [...input.temporaryParentResolveDocumentIds]
    const savedTreeOrderNumber = input.treeOrderNumber === null || input.treeOrderNumber === undefined
      ? deps.emptyTreeOrderNumber
      : input.treeOrderNumber
    const treeOrderNumberDraft = savedTreeOrderNumber === deps.emptyTreeOrderNumber
      ? ''
      : String(savedTreeOrderNumber)
    const isCategory = input.isCategory === true
    const isFinished = input.isFinished === true
    const isMinor = input.isMinor === true
    const isDead = input.isDead === true
    const savedExtraClasses = deps.normalizeNullableStringFromDb(input.extraClasses)
    return {
      displayNameDraft: input.displayName,
      documentId: input.documentId,
      documentBackgroundColorDraft: documentBackgroundColor,
      documentTextColorDraft: documentTextColor,
      editState: true,
      hasUnsavedChanges: false,
      isCategoryDraft: isCategory,
      isFinishedDraft: isFinished,
      isMinorDraft: isMinor,
      isDeadDraft: isDead,
      parentDocumentId: input.parentDocumentId,
      parentDocumentIdDraft: parentDocumentId,
      savedParentDocumentId: parentDocumentId,
      persistenceState: 'temporary',
      savedDisplayName: input.displayName,
      savedDocumentBackgroundColor: documentBackgroundColor,
      savedDocumentTextColor: documentTextColor,
      savedIsCategory: isCategory,
      savedIsFinished: isFinished,
      savedIsMinor: isMinor,
      savedIsDead: isDead,
      treeOrderNumberDraft,
      savedTreeOrderNumber,
      extraClassesDraft: savedExtraClasses,
      savedExtraClasses,
      tagsDraft: [],
      savedTags: [],
      tabLabel: input.tabLabel,
      templateIcon: input.templateIcon,
      templateId: input.templateId,
      temporaryParentResolveDocumentIds,
      worldId: input.worldId
    }
  }
}

/**
 * Seeds a temporary opened document tab in edit mode without dirty state until the user edits.
 */
export function createCreateTemporaryOpenedDocumentTabSeed (deps: {
  emptyTreeOrderNumber: number
  normalizeNullableStringFromDb: T_normalizeOpenedDocumentNullableStringFromDb
}): (input: T_temporaryOpenedDocumentTabSeedInput) => I_faOpenedDocumentTab {
  return function createTemporaryOpenedDocumentTabSeed (
    input: T_temporaryOpenedDocumentTabSeedInput
  ): I_faOpenedDocumentTab {
    const parentDocumentId = deps.normalizeNullableStringFromDb(input.parentDocumentId)
    const initialTagsDraft = input.initialTagsDraft === undefined
      ? []
      : input.initialTagsDraft.map((tag) => {
        return {
          id: tag.id,
          name: tag.name,
          ...(tag.isNew === true ? { isNew: true as const } : {})
        }
      })
    const hasInitialTags = initialTagsDraft.length > 0
    return {
      displayNameDraft: input.displayName,
      documentId: input.documentId,
      documentBackgroundColorDraft: '',
      documentTextColorDraft: '',
      editState: true,
      hasUnsavedChanges: hasInitialTags,
      isCategoryDraft: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      parentDocumentId: input.parentDocumentId,
      parentDocumentIdDraft: parentDocumentId,
      savedParentDocumentId: parentDocumentId,
      persistenceState: 'temporary',
      savedDisplayName: input.displayName,
      savedDocumentBackgroundColor: '',
      savedDocumentTextColor: '',
      savedIsCategory: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: deps.emptyTreeOrderNumber,
      extraClassesDraft: '',
      savedExtraClasses: '',
      tagsDraft: initialTagsDraft,
      savedTags: [],
      tabLabel: input.tabLabel,
      templateIcon: input.templateIcon,
      templateId: input.templateId,
      temporaryParentResolveDocumentIds: input.temporaryParentResolveDocumentIds,
      worldId: input.worldId
    }
  }
}
