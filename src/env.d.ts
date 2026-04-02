/// <reference path="../.quasar/shims-vue.d.ts" />

declare module '@quasar/quasar-ui-qmarkdown/dist/index.css'

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}
