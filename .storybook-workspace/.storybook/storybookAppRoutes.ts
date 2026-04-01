import type { RouteRecordRaw } from 'vue-router'
import { defineComponent, h } from 'vue'

import ComponentTestingLayout from '../../src/layouts/ComponentTestingLayout.vue'
import MainLayout from '../../src/layouts/MainLayout.vue'
import ComponentTesting from '../../src/pages/ComponentTesting.vue'
import ErrorNotFound from '../../src/pages/ErrorNotFound.vue'
import IndexPage from '../../src/pages/IndexPage.vue'

/**
 * Minimal outlet so `MainLayout` can be previewed without loading the full index page.
 */
export const StoryEmptyOutlet = defineComponent({
  name: 'StoryEmptyOutlet',
  setup () {
    return () =>
      h(
        'div',
        { class: 'q-pa-md text-body2 text-white' },
        'Empty outlet — Storybook preview (add a child route to show a page).'
      )
  }
})

/**
 * Single route table for all layout/page previews. Stories switch view via `initialPath` + `router.replace`.
 */
export const STORYBOOK_APP_ROUTES: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [{ path: '', name: 'storybook-home', component: IndexPage }]
  },
  {
    path: '/main-empty',
    component: MainLayout,
    children: [{ path: '', name: 'storybook-main-empty', component: StoryEmptyOutlet }]
  },
  {
    path: '/componentTesting/:componentName',
    component: ComponentTestingLayout,
    children: [{ path: '', name: 'storybook-component-testing', component: ComponentTesting }]
  },
  {
    path: '/error-not-found',
    component: ErrorNotFound
  }
]
