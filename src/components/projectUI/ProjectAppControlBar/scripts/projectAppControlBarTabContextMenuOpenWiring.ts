import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Ref } from 'vue'

const PROJECT_APP_CONTROL_BAR_TAB_CONTEXT_MENU_TARGET_SELECTOR =
  '.projectAppControlBarTabs__tab'

export function createProjectAppControlBarTabContextMenuOpenWiring (deps: {
  tabContextMenuMountRef: Ref<HTMLElement | null>
}): {
    isTabContextMenuOpen: Ref<boolean>
    tabMenuTargetElement: Ref<HTMLElement | null>
  } {
  const isTabContextMenuOpen = ref(false)
  const tabMenuTargetElement = ref<HTMLElement | null>(null)
  let tabElement: HTMLElement | null = null

  function onTabContextMenuCapture (event: MouseEvent): void {
    event.preventDefault()
    event.stopPropagation()
    isTabContextMenuOpen.value = true
  }

  onMounted(() => {
    tabElement = deps.tabContextMenuMountRef.value?.closest(
      PROJECT_APP_CONTROL_BAR_TAB_CONTEXT_MENU_TARGET_SELECTOR
    ) ?? null
    tabMenuTargetElement.value = tabElement
    if (tabElement !== null) {
      tabElement.addEventListener('contextmenu', onTabContextMenuCapture, { capture: true })
    }
  })

  onBeforeUnmount(() => {
    if (tabElement !== null) {
      tabElement.removeEventListener('contextmenu', onTabContextMenuCapture, { capture: true })
    }
  })

  return {
    isTabContextMenuOpen,
    tabMenuTargetElement
  }
}
