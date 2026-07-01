import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import { PROJECT_HIERARCHY_TREE_ROOT_CLASS } from '../functions/projectHierarchyTreeConstants'

function clearProjectHierarchyTreeHeTreeNodeTabIndex (host: HTMLElement | null): void {
  if (host === null) {
    return
  }
  const treeRoot = host.querySelector(`.${PROJECT_HIERARCHY_TREE_ROOT_CLASS}`)
  if (treeRoot === null) {
    return
  }
  const treeNodes = treeRoot.querySelectorAll('.tree-node')
  for (const node of treeNodes) {
    if (!(node instanceof HTMLElement)) {
      continue
    }
    if (node.tabIndex !== -1) {
      node.tabIndex = -1
    }
    if (document.activeElement === node) {
      node.blur()
    }
  }
}

export function bindProjectHierarchyTreeHeTreeNodeTabIndexGuard (deps: {
  onUnmounted: (hook: () => void) => void
  treeScrollHostRef: Ref<HTMLElement | null>
  watch: typeof watchFn
}): void {
  let observer: MutationObserver | null = null

  const disconnectObserver = (): void => {
    observer?.disconnect()
    observer = null
  }

  const syncTreeNodeTabIndex = (): void => {
    clearProjectHierarchyTreeHeTreeNodeTabIndex(deps.treeScrollHostRef.value)
  }

  deps.watch(deps.treeScrollHostRef, (host) => {
    disconnectObserver()
    if (host === null) {
      return
    }
    syncTreeNodeTabIndex()
    observer = new MutationObserver(syncTreeNodeTabIndex)
    observer.observe(host, {
      attributeFilter: ['tabindex'],
      attributes: true,
      childList: true,
      subtree: true
    })
  }, {
    immediate: true
  })

  deps.onUnmounted(disconnectObserver)
}

export const clearProjectHierarchyTreeHeTreeNodeTabIndexForTests =
  clearProjectHierarchyTreeHeTreeNodeTabIndex
