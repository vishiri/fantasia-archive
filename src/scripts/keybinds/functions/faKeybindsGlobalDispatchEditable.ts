/**
 * True when the event target is an editable control where shortcuts should not fire by default.
 */
export function faKeybindIsEditableTarget (target: EventTarget | null): boolean {
  if (target === null || !(target instanceof HTMLElement)) {
    return false
  }
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true
  }
  if (target.isContentEditable) {
    return true
  }
  return target.closest('[contenteditable="true"]') !== null
}
