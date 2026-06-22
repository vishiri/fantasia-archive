export function resolveDialogProjectSettingsWorldTemplatePlacementUsesNicknameFromResolved (params: {
  resolvedNickname: string
}): boolean {
  return params.resolvedNickname.trim().length > 0
}

export function resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabelFromResolved (params: {
  resolvedNickname: string
  templateDisplayName: string
}): string {
  const trimmedNickname = params.resolvedNickname.trim()
  if (trimmedNickname.length > 0) {
    return trimmedNickname
  }
  return params.templateDisplayName
}
