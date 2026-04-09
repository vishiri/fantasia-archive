import { defineConfig } from '#q-app/wrappers'
import { fileURLToPath } from 'node:url'

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { checker } from 'vite-plugin-checker'

// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

// Vite 'Plugin' types differ between the hoisted 'vite' package and '@quasar/app-vite' nested copy; the config is valid at runtime.
// @ts-expect-error TS2345 — duplicate Vite type graphs (see vite-plugin-checker + Quasar)
export default defineConfig((ctx) => {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ['i18n', 'axios', 'externalLinkManager', 'notify-defaults', 'qmarkdown'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'mdi-v5',
      'fontawesome-v6',
      'roboto-font-latin-ext',
      'material-icons'
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node22'
      },

      typescript: {
        strict: false,
        vueShim: true
      },

      vueRouterMode: 'history',

      viteVuePluginOptions: {
        template: {
          compilerOptions: {
            isPreTag: (tag: string) =>
              tag === 'pre' || tag === 'q-markdown' || tag === 'QMarkdown'
          }
        }
      },

      vitePlugins: [
        VueI18nPlugin({
          include: [fileURLToPath(new URL('./i18n', import.meta.url))],
          runtimeOnly: false,
          ssr: ctx.modeName === 'ssr'
        }),
        checker({
          eslint: {
            useFlatConfig: true,
            lintCommand: 'eslint src i18n src-electron quasar.config.ts'
          }
        })
      ],

      extendViteConf (viteConf) {
        if (ctx.dev) {
          return
        }

        viteConf.logLevel = 'warn'

        viteConf.build ??= {}
        viteConf.build.reportCompressedSize = false

        const rolldownOpts = viteConf.build.rolldownOptions ?? {}
        viteConf.build.rolldownOptions = {
          ...rolldownOpts,
          checks: {
            ...rolldownOpts.checks,
            pluginTimings: false
          }
        }
      }
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      open: false
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {
        ripple: true,
        dark: true
      },

      plugins: ['Dialog', 'Notify', 'Dark']
    },

    // https://v2.quasar.dev/options/animations
    animations: 'all',

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,
      prodPort: 3000,
      middlewares: ['render']
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {},

    // https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      inspectPort: 5858,

      bundler: 'builder',

      packager: {},

      builder: {
        appId: 'fantasia-archive',
        productName: 'Fantasia Archive',
        win: {
          icon: 'src-electron/icons/icon.ico'
        },
        mac: {
          icon: 'src-electron/icons/icon.icns'
        },
        linux: {
          target: ['AppImage', 'deb', 'rpm'],
          category: 'Utility',
          synopsis: 'A worldbuilding database manager',
          description: 'A worldbuilding database manager',
          icon: 'src-electron/icons',
          // electron-builder 26+: desktop fields live under 'entry' (LinuxDesktopFile)
          desktop: {
            entry: {
              Name: 'Fantasia Archive',
              Comment: 'A worldbuilding database manager',
              StartupNotify: 'true',
              Terminal: 'false',
              StartupWMClass: 'fantasia-archive'
            }
          }
        }
      },

      preloadScripts: ['electron-preload']
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {}
  }
})
