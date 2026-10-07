/**
 * Drop Quasar QSelect activeClass (text-{color}) so selected option labels stay idle color.
 * Selection chrome is side bars in FaSelectInput menu SCSS — not brighter text.
 */
export function stripFaSelectInputOptionItemActiveClass <
  T extends Record<string, unknown>
> (itemProps: T): Omit<T, 'activeClass'> {
  const rest = { ...itemProps }
  delete rest.activeClass
  return rest as Omit<T, 'activeClass'>
}

type T_faSelectInputOptionItemClick = (evt: Event) => void
type T_faSelectInputOptionItemKeydown = (evt: Event) => void

function isFaSelectInputEnterKeyEvent (evt: Event): evt is KeyboardEvent {
  if (!('key' in evt) && !('keyCode' in evt)) {
    return false
  }
  const keyEvent = evt as KeyboardEvent
  return keyEvent.key === 'Enter' || keyEvent.keyCode === 13
}

/**
 * Strip activeClass and wrap onClick/onKeydown so parents learn about option activation even when
 * Quasar skips update:modelValue for an already-selected single value.
 * Enter on a portaled option row (menu Teleport) never bubbles to q-select — handle it here.
 * With skipQuasarSelect, only onActivate runs (no model update / popup hide).
 */
export function bindFaSelectInputOptionItemActivateProps <
  T extends Record<string, unknown>
> (
  itemProps: T,
  onActivate: () => void,
  options?: { skipQuasarSelect?: boolean }
): Omit<T, 'activeClass' | 'onClick' | 'onKeydown'> & {
  onClick: T_faSelectInputOptionItemClick
  onKeydown: T_faSelectInputOptionItemKeydown
} {
  const withoutActiveClass = stripFaSelectInputOptionItemActiveClass(itemProps)
  const previousOnClick = withoutActiveClass.onClick
  const previousOnKeydown = withoutActiveClass.onKeydown
  const rest = { ...withoutActiveClass } as Record<string, unknown>
  delete rest.onClick
  delete rest.onKeydown
  const skipQuasarSelect = options?.skipQuasarSelect === true

  function onClick (evt: Event): void {
    // Quasar option rows must not treat middle/right as select (trailing action buttons use auxclick).
    if (
      'button' in evt &&
      typeof (evt as MouseEvent).button === 'number' &&
      (evt as MouseEvent).button !== 0
    ) {
      return
    }
    if (!skipQuasarSelect && typeof previousOnClick === 'function') {
      (previousOnClick as T_faSelectInputOptionItemClick)(evt)
    }
    onActivate()
  }

  function onKeydown (evt: Event): void {
    if (!isFaSelectInputEnterKeyEvent(evt)) {
      if (typeof previousOnKeydown === 'function') {
        (previousOnKeydown as T_faSelectInputOptionItemKeydown)(evt)
      }
      return
    }
    if (skipQuasarSelect) {
      evt.preventDefault()
      onActivate()
      return
    }
    // Prefer click path so Quasar select + option-activate share one branch (reselect included).
    onClick(evt)
  }

  const bound = {
    ...rest,
    onClick,
    onKeydown
  }
  return bound as Omit<T, 'activeClass' | 'onClick' | 'onKeydown'> & {
    onClick: T_faSelectInputOptionItemClick
    onKeydown: T_faSelectInputOptionItemKeydown
  }
}
