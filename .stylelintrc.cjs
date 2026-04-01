'use strict'

/**
 * SCSS in `src/css/**` plus `<style lang="scss">` blocks in Vue SFCs.
 * BEM-style class names (e.g. `socialContactSingleButton__text`) are allowed.
 */
module.exports = {
  extends: ['stylelint-config-standard-scss', 'stylelint-config-standard-vue/scss'],
  rules: {
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    // Quasar / legacy SCSS conventions (kebab rules fight `$primary`, `lighten()`, partial @import paths).
    'scss/at-import-partial-extension': null,
    'scss/dollar-variable-colon-space-before': null,
    'scss/dollar-variable-empty-line-before': null,
    'scss/dollar-variable-pattern': null,
    'scss/no-global-function-names': null,
    'color-function-notation': null,
    'alpha-value-notation': null,
    'block-no-empty': null,
    'property-no-vendor-prefix': null,
    'shorthand-property-no-redundant-values': null,
    'no-descending-specificity': null,
    'comment-empty-line-before': null,
    'selector-no-vendor-prefix': null
  },
  ignoreFiles: ['**/node_modules/**', '**/dist/**', '**/.quasar/**', '**/storybook-static/**']
}
