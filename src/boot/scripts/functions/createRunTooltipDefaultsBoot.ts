export function createRunTooltipDefaultsBoot (deps: {
  QTooltip: {
    props: {
      delay: {
        default: number
      }
    }
  }
  faQTooltipDelayMs: number
}): () => void {
  return function runTooltipDefaultsBoot (): void {
    deps.QTooltip.props.delay.default = deps.faQTooltipDelayMs
  }
}
