import type { RouteRecordRaw } from 'vue-router'

import 'app/types/vueRouterRouteMetaAugmentation'

const routes: RouteRecordRaw[] = [

  /**
   * Welcome / splash (first screen on startup — same chrome as MainLayout)
   */
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      meta: {
        faMainLayoutHideDrawer: true
      },
      component: () => import('pages/SplashPage.vue')
    }]
  },

  /**
   * Legacy dev home / future workspace entry
   */
  {
    path: '/home',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/IndexPage.vue')
    }]
  },

  /**
   * Component testing pathing
   * ONLY for singular component testing purposes
   */
  {
    path: '/componentTesting/:componentName',
    component: () => import('layouts/ComponentTestingLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/ComponentTesting.vue')
      }
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
