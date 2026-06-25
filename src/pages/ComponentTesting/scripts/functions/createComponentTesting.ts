import type { T_componentTestingSfcDefault } from 'app/types/I_componentTestingHarness'
import type { I_ref, I_vueComponent } from 'app/types/I_vueCompositionShims'

export function createComponentTesting (deps: {
  computed: <T>(getter: () => T) => I_ref<T>
  onMounted: (hook: () => void | Promise<void>) => void
  readComponentTestingPropsFromSnapshot: (raw: unknown) => Record<string, unknown>
  ref: <T>(value: T) => I_ref<T>
  resolveComponentTestingSfcByName: (
    componentList: Record<string, { default: T_componentTestingSfcDefault }>,
    componentName: string
  ) => T_componentTestingSfcDefault | null
  useRoute: () => { params?: Record<string, string | string[] | undefined> }
}): {
    useComponentTesting: (
      componentList: Record<string, { default: T_componentTestingSfcDefault }>
    ) => {
      currentComponent: I_ref<I_vueComponent | null>
      propList: I_ref<Record<string, unknown>>
    }
  } {
  function readInitialComponentProps (): Record<string, unknown> {
    const raw = window.faContentBridgeAPIs?.extraEnvVariables?.getCachedSnapshot?.()?.COMPONENT_PROPS
    return deps.readComponentTestingPropsFromSnapshot(raw)
  }

  function useComponentTesting (
    componentList: Record<string, { default: T_componentTestingSfcDefault }>
  ) {
    const propList = deps.ref<Record<string, unknown>>(readInitialComponentProps())
    const route = deps.useRoute()

    const currentComponent = deps.computed((): I_vueComponent | null => {
      const componentNameParam = route.params?.componentName
      const componentName = Array.isArray(componentNameParam)
        ? (componentNameParam[0] ?? '')
        : (componentNameParam ?? '')

      const resolved = deps.resolveComponentTestingSfcByName(componentList, componentName)
      if (resolved === null) {
        return null
      }

      return resolved as I_vueComponent
    })

    deps.onMounted(async () => {
      const bridge = window.faContentBridgeAPIs?.extraEnvVariables
      if (!bridge?.getSnapshot) {
        return
      }
      const snap = await bridge.getSnapshot()
      if (snap.COMPONENT_PROPS) {
        propList.value = deps.readComponentTestingPropsFromSnapshot(snap.COMPONENT_PROPS)
      }
    })

    return {
      currentComponent,
      propList
    }
  }

  return {
    useComponentTesting
  }
}
