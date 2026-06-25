type T_buildFaActionPayloadPreview = (payload: unknown, maxLength?: number) => string

export function createBuildFaActionPayloadPreviewWithUserSettingsCap (deps: {
  buildFaActionPayloadPreview: T_buildFaActionPayloadPreview
  resolveFaActionPayloadPreviewMaxLength: (isErrorOrWarning?: boolean) => number
}): {
    buildFaActionPayloadPreview: T_buildFaActionPayloadPreview
    buildFaActionErrorOrWarningPayloadPreview: (payload: unknown) => string
  } {
  const buildFaActionPayloadPreviewWithUserSettingsCap: T_buildFaActionPayloadPreview = (
    payload,
    maxLength
  ) => {
    const effectiveMaxLength = maxLength ?? deps.resolveFaActionPayloadPreviewMaxLength(false)
    return deps.buildFaActionPayloadPreview(payload, effectiveMaxLength)
  }

  const buildFaActionErrorOrWarningPayloadPreview = (payload: unknown): string => {
    const effectiveMaxLength = deps.resolveFaActionPayloadPreviewMaxLength(true)
    return deps.buildFaActionPayloadPreview(payload, effectiveMaxLength)
  }

  return {
    buildFaActionErrorOrWarningPayloadPreview,
    buildFaActionPayloadPreview: buildFaActionPayloadPreviewWithUserSettingsCap
  }
}
