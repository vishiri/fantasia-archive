import type { Plugin } from 'vite'

/**
 * Vite 5+ removed import.meta.globEager in favor of eager import.meta.glob. Production
 * ComponentTesting.vue already uses the supported API on Vite 8 (Quasar app-vite v2). This
 * Storybook-only transform remains so legacy globEager usage in that page still previews in the
 * nested workspace if it is reintroduced.
 */
export function vitePluginRewriteGlobEagerForStorybook (): Plugin {
  return {
    name: 'fa-rewrite-glob-eager-storybook',
    enforce: 'pre',
    transform (code, id) {
      const normalized = id.replace(/\\/g, '/')
      if (!normalized.includes('/src/pages/ComponentTesting.vue')) return
      if (!code.includes('globEager')) return
      const next = code.replace(
        /import\.meta\.globEager\(\s*(['"])components\/\*\*\/\*\.vue\1\s*\)/,
        'import.meta.glob($1components/**/*.vue$1, { eager: true })'
      )
      return next === code ? undefined : next
    }
  }
}
