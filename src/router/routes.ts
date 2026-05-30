import type { RouteRecordRaw } from 'vue-router'

import 'app/types/vueRouterRouteMetaAugmentation'

const routes: RouteRecordRaw[] = [

  /**
   * Welcome / splash (shared MainLayout shell; drawer hidden until /home)
   */
  {
    path: '/',
    component: () => import('layouts/MainLayout/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/SplashPage/SplashPage.vue')
    }]
  },

  /**
   * Workspace shell (same MainLayout with left drawer)
   */
  {
    path: '/home',
    component: () => import('layouts/MainLayout/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/IndexPage/IndexPage.vue')
    }]
  },

  /**
   * Component testing pathing
   * ONLY for singular component testing purposes
   */
  {
    path: '/componentTesting/:componentName',
    component: () => import('layouts/ComponentTestingLayout/ComponentTestingLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/ComponentTesting/ComponentTesting.vue')
      }
    ]
  },

  /**
   * Error page - 404 (shared MainLayout shell; no workspace drawer)
   * Always leave this as last one, but you can also remove it
   */
  {
    path: '/:catchAll(.*)*',
    component: () => import('layouts/MainLayout/MainLayout.vue'),
    children: [{
      path: '',
      component: () => import('pages/ErrorNotFound/ErrorNotFound.vue')
    }]
  }
]

export default routes
