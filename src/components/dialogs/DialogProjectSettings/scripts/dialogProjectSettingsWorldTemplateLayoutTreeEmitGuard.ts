import type {
  I_dialogProjectSettingsWorldTemplateLayoutDraft,
  I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
} from 'app/types/I_dialogProjectSettingsWorlds'
import type { T_dialogProjectSettingsWorldTemplateLayoutTreeTemplatePlacement } from 'app/types/I_dialogProjectSettingsWorldTemplateLayoutTreeWalk'

function nodeHasDocumentTemplateId (
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode,
  documentTemplateId: string
): boolean {
  return node.nodeKind === 'template' && node.documentTemplateId === documentTemplateId
}

function findInGroupChildren (
  groupNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode,
  documentTemplateId: string
): boolean {
  return groupNode.children.some((child) => {
    return nodeHasDocumentTemplateId(child, documentTemplateId)
  })
}

export function findDialogProjectSettingsWorldTemplateLayoutTreeTemplatePlacement (
  nodes: readonly I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[],
  documentTemplateId: string
): T_dialogProjectSettingsWorldTemplateLayoutTreeTemplatePlacement {
  let foundAtRoot = false
  for (const node of nodes) {
    if (node.nodeKind === 'group' && findInGroupChildren(node, documentTemplateId)) {
      return 'group'
    }
    if (nodeHasDocumentTemplateId(node, documentTemplateId)) {
      foundAtRoot = true
    }
  }
  if (foundAtRoot) {
    return 'root'
  }
  return 'missing'
}

export function shouldBlockDialogProjectSettingsWorldTemplateLayoutEmit (
  priorLayout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  nextLayout: I_dialogProjectSettingsWorldTemplateLayoutDraft,
  treeNodes: readonly I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[]
): boolean {
  for (const priorPlacement of priorLayout.placements) {
    if (priorPlacement.groupId === null) {
      continue
    }
    const nextPlacement = nextLayout.placements.find((placement) => {
      return placement.id === priorPlacement.id
    })
    if (nextPlacement === undefined) {
      continue
    }
    if (nextPlacement.groupId !== null) {
      continue
    }
    const treePlacement = findDialogProjectSettingsWorldTemplateLayoutTreeTemplatePlacement(
      treeNodes,
      priorPlacement.documentTemplateId
    )
    if (treePlacement === 'group') {
      return true
    }
  }
  return false
}
