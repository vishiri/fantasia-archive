import path from 'path'
import vue from '@vitejs/plugin-vue'
import type { StorybookConfig } from '@storybook/vue3-vite'

const quasarVariablesPath = path.resolve(__dirname, '../src/css/quasar.variables.scss').replaceAll('\\', '/')
const externalFileLoaderMockPath = path.resolve(__dirname, './mocks/externalFileLoader.ts')

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.ts'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
  async viteFinal (viteConfig) {
    return {
      ...viteConfig,
      plugins: [
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
          app: path.resolve(__dirname, '..'),
          src: path.resolve(__dirname, '../src'),
          components: path.resolve(__dirname, '../src/components'),
          'src-electron': path.resolve(__dirname, '../src-electron')
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
