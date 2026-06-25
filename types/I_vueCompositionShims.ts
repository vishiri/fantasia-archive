import type { ComputedRef, Ref } from 'vue'

/**
 * Structural ref types for level-1 functions/ factories (Vue APIs injected by managers).
 * Aliased to Vue Ref types so composable return shapes match SFC script and template usage.
 */
export type I_ref<T> = Ref<T>

export type I_computedRef<T> = ComputedRef<T>

/**
 * Subset of Vue App used by boot factories (structural; managers pass the real App).
 */
export interface I_vueApp {
  config: {
    globalProperties: Record<string, unknown>
  }
  use: (plugin: I_vuePlugin) => I_vueApp
}

export interface I_vuePlugin {
  install: (app: I_vueApp) => void
}

/**
 * Minimal component type for dynamic component maps in tests/pages.
 */
export interface I_vueComponent {
  name?: string | undefined
}

export interface I_vueComponentPublicInstance {
  $el?: Element | undefined
}
