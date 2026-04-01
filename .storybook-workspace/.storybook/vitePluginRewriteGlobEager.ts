import type { Plugin } from 'vite'

/**
 * `import.meta.globEager` was removed in Vite 5+ (Storybook 8’s bundler). The Quasar app
 * still uses Vite 2.9, which supports `globEager` in source. Rewrite only under Storybook so
 * `ComponentTesting.vue` keeps working in production without upgrading the app Vite major yet.
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
