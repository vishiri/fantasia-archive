import type { InjectionKey, Ref } from 'vue'

export const dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey: InjectionKey<Ref<string | null>> = Symbol(
  'dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTarget'
)

export function buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey (
  nodeKind: 'group' | 'template',
  nodeId: string
): string {
  return `${nodeKind}:${nodeId}`
}
