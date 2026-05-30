import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { I_appMenuItem, I_appMenuList } from 'app/types/I_appMenusDataList'
import type { I_faKeybindsSnapshot, T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

const APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS = 250

type T_createAppControlSingleMenuDeps = {
  appControlShouldShowSeparatorAltBeforeItem: (
    menuData: I_appMenuList['data'],
    itemIndex: number
  ) => boolean
  computed: <T>(getter: () => T) => I_computedRef<T>
  formatFaKeybindCommandLabelFromSnapshot: (opts: {
    commandId: T_faKeybindCommandId | undefined
    snapshot: I_faKeybindsSnapshot | null
  }) => string | null
  getFaKeybindsStore: () => { snapshot: I_faKeybindsSnapshot | null }
  ref: <T>(value: T) => I_ref<T>
}

function createAppControlSingleMenuSubmenuHover (deps: T_createAppControlSingleMenuDeps): {
  onRootMenuHide: () => void
  onSubmenuActivatorEnter: (index: number) => void
  onSubmenuActivatorLeave: () => void
  onSubmenuContentEnter: () => void
  onSubmenuContentLeave: () => void
  onSubmenuModelUpdate: (index: number, shown: boolean) => void
  openSubmenuRowIndex: I_ref<number | null>
} {
  const openSubmenuRowIndex = deps.ref<number | null>(null)
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  function clearHideTimer (): void {
    if (hideTimer !== null) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  function scheduleHide (): void {
    clearHideTimer()
    hideTimer = setTimeout(() => {
      openSubmenuRowIndex.value = null
      hideTimer = null
    }, APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS)
  }

  return {
    onRootMenuHide: () => {
      clearHideTimer()
      openSubmenuRowIndex.value = null
    },
    onSubmenuActivatorEnter: (index) => {
      clearHideTimer()
      openSubmenuRowIndex.value = index
    },
    onSubmenuActivatorLeave: scheduleHide,
    onSubmenuContentEnter: clearHideTimer,
    onSubmenuContentLeave: scheduleHide,
    onSubmenuModelUpdate: (index, shown) => {
      if (shown) {
        clearHideTimer()
        openSubmenuRowIndex.value = index
        return
      }
      if (openSubmenuRowIndex.value === index) {
        openSubmenuRowIndex.value = null
      }
    },
    openSubmenuRowIndex
  }
}

function trimmedSecondaryHintText (hint: string | undefined): string | null {
  const trimmed = hint?.trim()
  if (trimmed === undefined || trimmed.length === 0) {
    return null
  }
  return trimmed
}

interface I_useAppControlSingleMenuReturn {
  appControlShouldShowSeparatorAltBeforeItem: (
    menuData: I_appMenuList['data'],
    itemIndex: number
  ) => boolean
  hasProperDataInput: I_computedRef<boolean>
  keybindHintLabel: (commandId: T_faKeybindCommandId | undefined) => string | null
  menuData: I_computedRef<I_appMenuList['data']>
  menuTitle: I_computedRef<string>
  onMenuRowMouseEnter: (menuItem: I_appMenuItem, itemIndex: number) => void
  onMenuRowMouseLeave: (menuItem: I_appMenuItem) => void
  onRootMenuHide: () => void
  onSubmenuContentEnter: () => void
  onSubmenuContentLeave: () => void
  onSubmenuModelUpdate: (index: number, shown: boolean) => void
  openSubmenuRowIndex: I_ref<number | null>
  trimmedSecondaryHintText: (hint: string | undefined) => string | null
}

function useAppControlSingleMenu (
  deps: T_createAppControlSingleMenuDeps,
  props: { dataInput: I_appMenuList }
): I_useAppControlSingleMenuReturn {
  const faKeybindsStore = deps.getFaKeybindsStore()
  const submenuHover = createAppControlSingleMenuSubmenuHover(deps)

  function onMenuRowMouseEnter (menuItem: I_appMenuItem, itemIndex: number): void {
    if (menuItem.submenu === undefined) {
      return
    }
    submenuHover.onSubmenuActivatorEnter(itemIndex)
  }

  function onMenuRowMouseLeave (menuItem: I_appMenuItem): void {
    if (menuItem.submenu === undefined) {
      return
    }
    submenuHover.onSubmenuActivatorLeave()
  }

  function keybindHintLabel (commandId: T_faKeybindCommandId | undefined): string | null {
    return deps.formatFaKeybindCommandLabelFromSnapshot({
      commandId,
      snapshot: faKeybindsStore.snapshot
    })
  }

  const componentData = deps.computed(() => props.dataInput)

  return {
    appControlShouldShowSeparatorAltBeforeItem: deps.appControlShouldShowSeparatorAltBeforeItem,
    hasProperDataInput: deps.computed(() => {
      return !!(componentData.value.title && componentData.value.data)
    }),
    keybindHintLabel,
    menuData: deps.computed(() => componentData.value.data),
    menuTitle: deps.computed(() => componentData.value.title),
    onMenuRowMouseEnter,
    onMenuRowMouseLeave,
    onRootMenuHide: submenuHover.onRootMenuHide,
    onSubmenuContentEnter: submenuHover.onSubmenuContentEnter,
    onSubmenuContentLeave: submenuHover.onSubmenuContentLeave,
    onSubmenuModelUpdate: submenuHover.onSubmenuModelUpdate,
    openSubmenuRowIndex: submenuHover.openSubmenuRowIndex,
    trimmedSecondaryHintText
  }
}

export function createAppControlSingleMenu (deps: T_createAppControlSingleMenuDeps): {
  APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS: number
  createAppControlSingleMenuSubmenuHover: () => ReturnType<typeof createAppControlSingleMenuSubmenuHover>
  useAppControlSingleMenu: (props: { dataInput: I_appMenuList }) => I_useAppControlSingleMenuReturn
} {
  return {
    APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS,
    createAppControlSingleMenuSubmenuHover: () => createAppControlSingleMenuSubmenuHover(deps),
    useAppControlSingleMenu: (props) => useAppControlSingleMenu(deps, props)
  }
}
