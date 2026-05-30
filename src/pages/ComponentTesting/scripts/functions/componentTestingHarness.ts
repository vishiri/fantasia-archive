import type { T_componentTestingSfcDefault } from 'app/types/I_componentTestingHarness'

export function readComponentTestingPropsFromSnapshot (
  raw: unknown
): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }

  return {}
}

export function resolveComponentTestingSfcByName (
  componentList: Record<string, { default: T_componentTestingSfcDefault }>,
  componentName: string
): T_componentTestingSfcDefault | null {
  for (const loopPath in componentList) {
    const loopComponent = componentList[loopPath].default
    if (loopComponent.__name === componentName) {
      return loopComponent
    }
  }

  return null
}
