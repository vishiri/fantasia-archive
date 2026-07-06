export function createHandleFaDisableMiddleClickAutoscrollMouseDown (deps: {
  isMiddleMouseButton: (event: Pick<MouseEvent, 'button'>) => boolean
}): (event: MouseEvent) => void {
  return function handleFaDisableMiddleClickAutoscrollMouseDown (event: MouseEvent): void {
    if (!deps.isMiddleMouseButton(event)) {
      return
    }

    event.preventDefault()
  }
}
