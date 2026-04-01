import path from 'path'
import vue from '@vitejs/plugin-vue'
import type { StorybookConfig } from '@storybook/vue3-vite'

import { vitePluginServeRepoPublic } from './vitePluginServeRepoPublic'
import { vitePluginRewriteGlobEagerForStorybook } from './vitePluginRewriteGlobEager'

const repoRoot = path.resolve(__dirname, '../..')
const quasarVariablesPath = path.resolve(repoRoot, 'src/css/quasar.variables.scss').replaceAll('\\', '/')
const externalFileLoaderMockPath = path.resolve(__dirname, './mocks/externalFileLoader.ts')
/** Same as Quasar app: `public/` is served at `/` so `images/socialContactButtons/*.png` resolves. */
const publicDirPath = path.resolve(repoRoot, 'public')

const config: StorybookConfig = {
  stories: [
    '../../src/components/**/*.stories.ts',
    '../../src/layouts/**/*.stories.ts',
    '../../src/pages/**/*.stories.ts'
  ],
  /**
   * Relative to `configDir` only — Windows absolute paths break Storybook's `staticDirs` parser (`C:` / `to:` split).
   * Dev-time asset requests are also served by `vitePluginServeRepoPublic` (see `viteFinal`).
   */
  staticDirs: ['../../public'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions'
  ],
  docs: {
    autodocs: 'tag'
  },
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
  async viteFinal (viteConfig) {
    return {
      ...viteConfig,
      publicDir: publicDirPath,
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
            api: 'legacy',
            additionalData: `@import "${quasarVariablesPath}";\n`
          },
          sass: {
            ...(viteConfig.css?.preprocessorOptions?.sass ?? {}),
            api: 'legacy',
            additionalData: `@import "${quasarVariablesPath}"\n`
          }
        }
      },
      resolve: {
        ...(viteConfig.resolve ?? {}),
        alias: {
          ...(viteConfig.resolve?.alias ?? {}),
          'src/i18n/externalFileLoader': externalFileLoaderMockPath,
          'app/src/i18n/externalFileLoader': externalFileLoaderMockPath,
          app: repoRoot,
          src: path.resolve(repoRoot, 'src'),
          components: path.resolve(repoRoot, 'src/components'),
          'src-electron': path.resolve(repoRoot, 'src-electron')
        }
      },
      define: {
        ...(viteConfig.define ?? {}),
        'process.env.MODE': JSON.stringify('electron')
      }
    }
  }
}

export default config
