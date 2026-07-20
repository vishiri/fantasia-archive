/* eslint-disable vue/one-component-per-file -- local route leaf plus Router shell for MainLayout Vitest mounts */
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import {
  createMemoryHistory,
  createRouter,
  RouterView
} from 'vue-router'

import MainLayout from '../MainLayout/MainLayout.vue'

const mainLayoutVitestLeaf = defineComponent({
  name: 'MainLayoutVitestLeaf',
  template: '<div data-test-locator="mainLayout-vitest-leaf" />'
})

import type { T_mainLayoutVitestInitialPath } from 'app/types/I_vitestMainLayoutMount'

/**
 * Mounts MainLayout behind a real vue-router instance so layout code that calls useRoute() behaves like production.
 */
export async function mountMainLayoutForVitest (
  initialPath: T_mainLayoutVitestInitialPath = '/home'
): Promise<ReturnType<typeof mount>> {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        component: MainLayout,
        children: [
          {
            path: '',
            component: mainLayoutVitestLeaf
          }
        ]
      },
      {
        path: '/home',
        component: MainLayout,
        children: [
          {
            path: '',
            component: mainLayoutVitestLeaf
          }
        ]
      }
    ]
  })

  await router.push(initialPath)
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
        },
        ProjectAppControlBar: {
          template: '<div data-test-locator="projectAppControlBar" />'
        },
        ProjectHierarchyTreeSearch: {
          template: '<div data-test-locator="projectHierarchyTreeSearch" />'
        },
        ProjectHierarchyTree: {
          template: '<div data-test-locator="projectHierarchyTree" />'
        },
        QSplitter: {
          emits: ['update:modelValue'],
          props: ['modelValue', 'unit', 'limits'],
          template: `
            <div
              data-test-locator="mainLayout-sidebarSplitter"
              :limits="Array.isArray(limits) ? limits.join(',') : limits"
            >
              <slot name="before" />
              <button
                data-test-locator="mainLayout-sidebarSplitter-resize"
                type="button"
                @click="$emit('update:modelValue', 420)"
              />
              <slot name="separator" />
              <slot name="after" />
            </div>
          `
        }
      }
    }
  })
}
