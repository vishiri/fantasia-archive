export function createFaDisableMiddleClickAutoscrollBoot (deps: {
  addDocumentListener: (
    type: 'mousedown',
    listener: (event: MouseEvent) => void,
    options: { capture: boolean }
  ) => void
  handleFaDisableMiddleClickAutoscrollMouseDown: (event: MouseEvent) => void
}): {
    handleFaDisableMiddleClickAutoscrollMouseDown: (event: MouseEvent) => void
    runFaDisableMiddleClickAutoscrollBoot: () => void
  } {
  const runFaDisableMiddleClickAutoscrollBoot = (): void => {
    deps.addDocumentListener(
      'mousedown',
      deps.handleFaDisableMiddleClickAutoscrollMouseDown,
      { capture: true }
    )
  }

  return {
    handleFaDisableMiddleClickAutoscrollMouseDown: deps.handleFaDisableMiddleClickAutoscrollMouseDown,
    runFaDisableMiddleClickAutoscrollBoot
  }
}
