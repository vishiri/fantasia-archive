// This file has been automatically migrated to valid ESM format by Storybook.
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import type { StorybookConfig } from '@storybook/vue3-vite'

import { vitePluginServeRepoPublic } from './vitePluginServeRepoPublic.ts'
import { vitePluginRewriteGlobEagerForStorybook } from './vitePluginRewriteGlobEager.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const repoRoot = path.resolve(__dirname, '../..')
const quasarScssDir = path.resolve(repoRoot, 'src/css')
const quasarVariablesUseUrl = pathToFileURL(
  path.join(quasarScssDir, 'quasar.variables.scss')
).href
const quasarVariablesImportPath = path
  .join(quasarScssDir, 'quasar.variables.scss')
  .replaceAll('\\', '/')

/**
 * Prepend theme variables so Quasar components render with the project palette.
 *
 * For Quasar's own 'index.sass' we must use '@import' (not '@use') so that
 * '$dark', '$primary', etc. land in the same global scope before 'variables.sass'
 * evaluates its '!default' assignments. This matches '@quasar/vite-plugin'
 * 'scss-transform.js' behavior that Quasar CLI relies on.
 *
 * For project SCSS/Sass (Vue SFCs, standalone files) we keep '@use ... as *' so
 * variables are available without polluting the global scope.
 */
function quasarVariablesAdditionalData (source: string, filepath: string): string {
  const norm = filepath.replaceAll('\\', '/')
  if (norm.includes('/node_modules/quasar/src/css/index.sass')) {
    return `@import '${quasarVariablesImportPath}'\n${source}`
  }
  if (norm.includes('/node_modules/')) {
    return source
  }
  if (norm.endsWith('/src/css/app.scss')) {
    return source
  }
  return `@use "${quasarVariablesUseUrl}" as *;\n${source}`
}
const externalFileLoaderMockPath = path.resolve(__dirname, './mocks/externalFileLoader.ts')
/** Same as Quasar app: 'public/' is served at '/' so 'images/socialContactButtons/*.png' resolves. */
const publicDirPath = path.resolve(repoRoot, 'public')

/** Align with '@quasar/app-vite': Quasar 'index.sass' still uses '@import'; silence until upstream migrates. */
const sassSilenceDeprecations = ['import', 'global-builtin'] as const

const config: StorybookConfig = {
  /**
   * Story modules live under each feature's '_tests/' folder (same area as Vitest and Playwright),
   * not beside '.vue' sources. Keep these globs in sync with AGENTS.md and '.cursor/rules/storybook-stories.mdc'.
   */
  stories: [
    '../../src/components/**/_tests/*.stories.ts',
    '../../src/layouts/**/_tests/*.stories.ts',
    '../../src/pages/**/_tests/*.stories.ts'
  ],

  /**
   * Relative to 'configDir' only — Windows absolute paths break Storybook 'staticDirs' parser ('C:' / 'to:' split).
   * Dev-time asset requests are also served by 'vitePluginServeRepoPublic' (see 'viteFinal').
   */
  staticDirs: ['../../public'],

  addons: ['@storybook/addon-docs'],

  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },

  /** Suppresses What's New toasts and the settings-gear notification dot for version/ecosystem updates. */
  core: {
    disableWhatsNewNotifications: true
  },

  features: {
    sidebarOnboardingChecklist: false
  },

  async viteFinal (viteConfig, { configType }) {
    const productionPreview = configType === 'PRODUCTION'

    return {
      ...viteConfig,
      ...(productionPreview
        ? {
            logLevel: 'warn' as const,
            build: {
              ...(viteConfig.build ?? {}),
              reportCompressedSize: false,
              chunkSizeWarningLimit: 5000,
              rolldownOptions: {
                ...(viteConfig.build?.rolldownOptions ?? {}),
                checks: {
                  ...(viteConfig.build?.rolldownOptions?.checks ?? {}),
                  pluginTimings: false
                }
              }
            }
          }
        : {}),
      publicDir: publicDirPath,
      server: {
        ...(viteConfig.server ?? {}),
        fs: {
          ...(viteConfig.server?.fs ?? {}),
          allow: Array.from(
            new Set([
              ...(Array.isArray(viteConfig.server?.fs?.allow)
                ? viteConfig.server.fs.allow
                : []),
              repoRoot
            ])
          )
        }
      },
      plugins: [
        vitePluginServeRepoPublic(publicDirPath),
        vitePluginRewriteGlobEagerForStorybook(),
        ...(viteConfig.plugins ?? []),
        vue()
      ],
      css: {
        ...(viteConfig.css ?? {}),
        preprocessorOptions: {
          ...(viteConfig.css?.preprocessorOptions ?? {}),
          scss: {
            ...(viteConfig.css?.preprocessorOptions?.scss ?? {}),
            silenceDeprecations: [
              ...sassSilenceDeprecations,
              ...(viteConfig.css?.preprocessorOptions?.scss?.silenceDeprecations ?? [])
            ],
            additionalData: quasarVariablesAdditionalData
          },
          sass: {
            ...(viteConfig.css?.preprocessorOptions?.sass ?? {}),
            silenceDeprecations: [
              ...sassSilenceDeprecations,
              ...(viteConfig.css?.preprocessorOptions?.sass?.silenceDeprecations ?? [])
            ],
            additionalData: quasarVariablesAdditionalData
          }
        }
      },
      resolve: {
        ...(viteConfig.resolve ?? {}),
        /**
         * Storybook workspace installs its own 'pinia' / 'vue' under '.storybook-workspace/node_modules'.
         * Preview sources under 'src/' can resolve the repo-root copies, yielding two Pinia singletons:
         * 'preview.ts' activates one instance while 'S_Dialog*' stores bind to the other, so
         * 'S_DialogComponent()' throws (undefined internal '_s') and dialog stories never mount.
         */
        alias: {
          ...(viteConfig.resolve?.alias ?? {}),
          'app/i18n/externalFileLoader': externalFileLoaderMockPath,
          app: repoRoot,
          src: path.resolve(repoRoot, 'src'),
          components: path.resolve(repoRoot, 'src/components'),
          'src-electron': path.resolve(repoRoot, 'src-electron'),
          pinia: path.resolve(repoRoot, 'node_modules/pinia'),
          vue: path.resolve(repoRoot, 'node_modules/vue')
        },
        dedupe: Array.from(
          new Set([
            ...(viteConfig.resolve?.dedupe ?? []),
            'pinia',
            'vue'
          ])
        )
      },
      define: {
        ...(viteConfig.define ?? {}),
        'process.env.MODE': JSON.stringify('electron')
      }
    }
  }
}

export default config
