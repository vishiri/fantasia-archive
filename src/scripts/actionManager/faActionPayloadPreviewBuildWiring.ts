type T_buildFaActionPayloadPreview = (payload: unknown, maxLength?: number) => string

export function createBuildFaActionPayloadPreviewWithUserSettingsCap (deps: {
  buildFaActionPayloadPreview: T_buildFaActionPayloadPreview
  resolveFaActionPayloadPreviewMaxLength: () => number
}): T_buildFaActionPayloadPreview {
  const buildFaActionPayloadPreviewWithUserSettingsCap: T_buildFaActionPayloadPreview = (
    payload,
    maxLength
  ) => {
    const effectiveMaxLength = maxLength ?? deps.resolveFaActionPayloadPreviewMaxLength()
    return deps.buildFaActionPayloadPreview(payload, effectiveMaxLength)
  }
  return buildFaActionPayloadPreviewWithUserSettingsCap
}
