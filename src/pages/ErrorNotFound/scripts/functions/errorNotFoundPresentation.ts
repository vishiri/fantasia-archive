export function resolveErrorNotFoundCardDetails (
  translate: (key: string) => string
): string {
  return `${translate('errorNotFound.subTitleFirst')}\n${translate('errorNotFound.subTitleSecond')}`
}

export function resolveErrorNotFoundShowResumeCurrentProject (
  hasActiveProject: boolean,
  filePath: string | undefined
): boolean {
  if (hasActiveProject !== true) {
    return false
  }

  const trimmed = (filePath ?? '').trim()

  return trimmed.length > 0
}

export function resolveErrorNotFoundReturnButtonMarginClass (
  showResumeCurrentProject: boolean
): string {
  if (showResumeCurrentProject === true) {
    return 'q-mt-lg'
  }

  return 'q-mt-xl'
}
