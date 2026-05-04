/* eslint-disable vue/one-component-per-file -- local route leaf plus Router shell for MainLayout Vitest mounts */
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import {
  type RouteMeta,
  createMemoryHistory,
  createRouter,
  RouterView
} from 'vue-router'

import 'app/types/vueRouterRouteMetaAugmentation'

import MainLayout from '../MainLayout.vue'

export type T_mainLayoutVitestMountOptions = {
  childRouteMeta?: Partial<RouteMeta>
}

const mainLayoutVitestLeaf = defineComponent({
  name: 'MainLayoutVitestLeaf',
  template: '<div data-test-locator="mainLayout-vitest-leaf" />'
})

/**
 * Mounts MainLayout behind a real vue-router instance so layout code that calls useRoute() behaves like production.
 */
export async function mountMainLayoutForVitest (
  options?: T_mainLayoutVitestMountOptions
): Promise<ReturnType<typeof mount>> {
  const childRouteMeta = options?.childRouteMeta ?? {}

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/vitest-main-layout-shell',
        component: MainLayout,
        children: [
          {
            path: '',
            component: mainLayoutVitestLeaf,
            meta: childRouteMeta
          }
        ]
      }
    ]
  })

  await router.push('/vitest-main-layout-shell')
  await router.isReady()

  const rootComponent = defineComponent({
    name: 'MainLayoutVitestApp',
    setup () {
      return () => h(RouterView)
    }
  })

  return mount(rootComponent, {
    global: {
      plugins: [router],
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        AppControlMenus: {
          template: '<div data-test-stub="app-control-menus" />'
        },
        GlobalLanguageSelector: {
          template: '<div data-test-stub="global-language-selector" />'
        },
        GlobalWindowButtons: {
          template: '<div data-test-stub="global-window-buttons" />'
        }
      }
    }
  })
}
