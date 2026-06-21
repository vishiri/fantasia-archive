export function scrollElementToMaxScrollTop (element: HTMLElement | null | undefined): void {
  if (element == null) {
    return
  }
  element.scrollTop = Math.max(0, element.scrollHeight - element.clientHeight)
}

export function scrollContainerToRevealLastItem (
  container: HTMLElement | null | undefined,
  itemSelector: string
): void {
  if (container == null) {
    return
  }
  const nodeList = container.querySelectorAll(itemSelector)
  const lastItem = nodeList[nodeList.length - 1]
  if (lastItem instanceof HTMLElement) {
    lastItem.scrollIntoView({
      block: 'end',
      inline: 'nearest'
    })
    return
  }
  scrollElementToMaxScrollTop(container)
}

export function scheduleScrollContainerToRevealLastItem (deps: {
  getContainer: () => HTMLElement | null
  itemSelector: string
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: FrameRequestCallback) => number
}): void {
  const revealLastItem = (): void => {
    scrollContainerToRevealLastItem(deps.getContainer(), deps.itemSelector)
  }

  void deps.nextTick().then(() => {
    deps.requestAnimationFrame(() => {
      revealLastItem()
      deps.requestAnimationFrame(revealLastItem)
    })
  })
}
