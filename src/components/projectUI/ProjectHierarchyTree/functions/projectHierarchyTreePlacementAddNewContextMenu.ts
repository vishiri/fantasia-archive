import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faProjectDocumentTemplateTitleSingularTranslations } from 'app/types/I_faProjectDocumentTemplateTitleSingularTranslations'
import type { I_faProjectDocumentTemplateTitleTranslations } from 'app/types/I_faProjectDocumentTemplateTitleTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

function readAddNewChildLabel (
  placement: I_faProjectHierarchyTreeHeTreeNode
): string | null {
  for (const child of placement.children) {
    if (child.nodeKind === 'addNewDocument') {
      return child.label
    }
  }
  return null
}

/**
 * Label and icon for the add-new action on a template placement context menu.
 */
export function createResolveProjectHierarchyTreePlacementAddNewContextMenuRow (deps: {
  addNewDocumentIcon: string
  resolveAddNewRowLabel: (input: {
    preferredLanguageCode: T_faUserSettingsLanguageCode
    titlePluralTranslations: I_faProjectDocumentTemplateTitleTranslations
    titleSingularTranslations: I_faProjectDocumentTemplateTitleSingularTranslations
  }) => string
}) {
  function resolveProjectHierarchyTreePlacementAddNewContextMenuRow (input: {
    placement: I_faProjectHierarchyTreeHeTreeNode
    preferredLanguageCode: T_faUserSettingsLanguageCode
  }): { icon: string, label: string } | null {
    if (input.placement.nodeKind !== 'templatePlacement') {
      return null
    }
    const loadedAddNewLabel = readAddNewChildLabel(input.placement)
    const label = loadedAddNewLabel ?? deps.resolveAddNewRowLabel({
      preferredLanguageCode: input.preferredLanguageCode,
      titlePluralTranslations: input.placement.titlePluralTranslations ?? {},
      titleSingularTranslations: input.placement.titleSingularTranslations ?? {}
    })
    return {
      icon: deps.addNewDocumentIcon,
      label
    }
  }

  return resolveProjectHierarchyTreePlacementAddNewContextMenuRow
}
