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
  placementId?: string | null | undefined
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
  placementId?: string | null | undefined
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
    const displayNameDraft = input.displayName
    const documentId = input.documentId
    const rawParentDocumentId = input.parentDocumentId
    const tabLabel = input.tabLabel
    const templateIcon = input.templateIcon
    const templateId = input.templateId
    const worldId = input.worldId
    const tagsDraft: I_faOpenedDocumentTab['tagsDraft'] = []
    const savedTags: I_faOpenedDocumentTab['savedTags'] = []
    const placementId = input.placementId
    const tab: I_faOpenedDocumentTab = {
      displayNameDraft,
      documentId,
      documentBackgroundColorDraft: documentBackgroundColor,
      documentTextColorDraft: documentTextColor,
      editState: true,
      hasUnsavedChanges: false,
      isCategoryDraft: isCategory,
      isFinishedDraft: isFinished,
      isMinorDraft: isMinor,
      isDeadDraft: isDead,
      parentDocumentId: rawParentDocumentId,
      parentDocumentIdDraft: parentDocumentId,
      savedParentDocumentId: parentDocumentId,
      persistenceState: 'temporary',
      savedDisplayName: displayNameDraft,
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
      tagsDraft,
      savedTags,
      tabLabel,
      templateIcon,
      templateId,
      temporaryParentResolveDocumentIds,
      worldId
    }
    if (placementId !== undefined) {
      tab.placementId = placementId
    }
    return tab
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
        const id = tag.id
        const name = tag.name
        if (tag.isNew === true) {
          return {
            id,
            isNew: true,
            name
          }
        }
        return {
          id,
          name
        }
      })
    const hasInitialTags = initialTagsDraft.length > 0
    const displayNameDraft = input.displayName
    const documentId = input.documentId
    const rawParentDocumentId = input.parentDocumentId
    const savedTreeOrderNumber = deps.emptyTreeOrderNumber
    const savedTags: I_faOpenedDocumentTab['savedTags'] = []
    const tabLabel = input.tabLabel
    const templateIcon = input.templateIcon
    const templateId = input.templateId
    const temporaryParentResolveDocumentIds = input.temporaryParentResolveDocumentIds
    const worldId = input.worldId
    const placementId = input.placementId
    const tab: I_faOpenedDocumentTab = {
      displayNameDraft,
      documentId,
      documentBackgroundColorDraft: '',
      documentTextColorDraft: '',
      editState: true,
      hasUnsavedChanges: hasInitialTags,
      isCategoryDraft: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      parentDocumentId: rawParentDocumentId,
      parentDocumentIdDraft: parentDocumentId,
      savedParentDocumentId: parentDocumentId,
      persistenceState: 'temporary',
      savedDisplayName: displayNameDraft,
      savedDocumentBackgroundColor: '',
      savedDocumentTextColor: '',
      savedIsCategory: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      treeOrderNumberDraft: '',
      savedTreeOrderNumber,
      extraClassesDraft: '',
      savedExtraClasses: '',
      tagsDraft: initialTagsDraft,
      savedTags,
      tabLabel,
      templateIcon,
      templateId,
      temporaryParentResolveDocumentIds,
      worldId
    }
    if (placementId !== undefined) {
      tab.placementId = placementId
    }
    return tab
  }
}
