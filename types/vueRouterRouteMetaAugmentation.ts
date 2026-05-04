/**
 * Extends vue-router RouteMeta for layout feature flags (see MainLayout and src/router/routes).
 */
export {}

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * When true, MainLayout omits the left navigation drawer (welcome / splash).
     */
    faMainLayoutHideDrawer?: boolean
  }
}
