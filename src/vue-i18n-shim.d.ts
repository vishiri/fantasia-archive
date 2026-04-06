/**
 * vue-i18n v11 augments declare module 'vue' with $t / $d / $n / etc.; 'tsc' picks that up, but the Volar IDE template-checker resolves ComponentCustomProperties through @vue/runtime-core, so the same properties are re-declared here for both code paths.
 *
 * Types are pulled from Composer (the Composition-API surface of vue-i18n) because it is a proper top-level export of the package.
 */
import type { Composer, ExportedGlobalComposer } from 'vue-i18n'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: Composer['t']
    $rt: Composer['rt']
    $te: Composer['te']
    $tm: Composer['tm']
    $d: Composer['d']
    $n: Composer['n']
    $i18n: ExportedGlobalComposer
  }
}
