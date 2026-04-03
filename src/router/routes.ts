import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [

  /**
   * Default pathing
   */
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }]
  },

  /**
   * Component testing pathing
   * ONLY for singular component testing purposes
   */
  {
    path: '/componentTesting/:componentName',
    component: () => import('layouts/ComponentTestingLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ComponentTesting.vue') }
    ]
  },

  /**
   * Error page - 404
   * Always leave this as last one, but you can also remove it
   */
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
