/**
 * True when every key on 'patch' matches the same property on 'retrieved' (strict equality).
 */
export function didObjectPatchPersist<T extends object> (
  patch: Partial<T>,
  retrieved: T
): boolean {
  const patchKeys = Object.keys(patch) as Array<keyof T>
  return patchKeys.every((key) => retrieved[key] === patch[key])
}

/**
 * True when persisted CSS equals the value the editor attempted to save.
 */
export function didCssPatchPersist (expectedCss: string, retrievedCss: string): boolean {
  return retrievedCss === expectedCss
}

/**
 * True when the live preview still matches the CSS that was just saved.
 * A newer preview typed during the save must stay.
 */
export function shouldClearCssLivePreviewAfterSave (
  livePreview: string | null,
  savedCss: string
): boolean {
  return livePreview === null || livePreview === savedCss
}
