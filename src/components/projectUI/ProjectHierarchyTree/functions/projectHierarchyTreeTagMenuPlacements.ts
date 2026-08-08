import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeTagAddDocumentPlacementOption
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

/**
 * Collects templatePlacement rows in a world for the tag add-document submenu.
 * Labels come from resolveAddNewRowLabel (singular template title as stored; not Add-new chrome).
 */
export function collectProjectHierarchyTreeTagAddDocumentPlacementOptions (input: {
  preferredLanguageCode: T_faUserSettingsLanguageCode
  resolveAddNewRowLabel: (labelInput: {
    preferredLanguageCode: T_faUserSettingsLanguageCode
    titlePluralTranslations: Record<string, string>
    titleSingularTranslations: Record<string, string>
  }) => string
  treeNodes: readonly I_faProjectHierarchyTreeHeTreeNode[]
  worldId: string
}): I_faProjectHierarchyTreeTagAddDocumentPlacementOption[] {
  const options: I_faProjectHierarchyTreeTagAddDocumentPlacementOption[] = []

  function visit (nodes: readonly I_faProjectHierarchyTreeHeTreeNode[]): void {
    for (const node of nodes) {
      if (
        node.nodeKind === 'templatePlacement' &&
        node.worldId === input.worldId &&
        typeof node.documentTemplateId === 'string' &&
        node.documentTemplateId.length > 0
      ) {
        options.push({
          icon: node.icon,
          label: input.resolveAddNewRowLabel({
            preferredLanguageCode: input.preferredLanguageCode,
            titlePluralTranslations: node.titlePluralTranslations ?? {},
            titleSingularTranslations: node.titleSingularTranslations ?? {}
          }),
          nodeId: node.id,
          templateId: node.documentTemplateId,
          worldId: node.worldId
        })
      }
      visit(node.children)
    }
  }

  visit(input.treeNodes)
  return options.sort((left, right) => left.label.localeCompare(right.label, undefined, {
    sensitivity: 'base'
  }))
}
