'use strict'

/**
 * SCSS in `src/css/**` plus `<style lang="scss">` blocks in Vue SFCs.
 * BEM-style class names (e.g. `socialContactSingleButton__text`) are allowed.
 *
 * Declaration order: `stylelint-order` enforces alphabetical properties (with
 * shorthand/prefix exceptions per rule docs). Autofix: `yarn lint:stylelint:fix`.
 */
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-standard-vue/scss',
    '@stylistic/stylelint-config'
  ],
  plugins: ['stylelint-order'],
  overrides: [
    {
      customSyntax: 'postcss-sass',
      files: ['**/*.sass']
    }
  ],
  rules: {
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'scss/load-partial-extension': null,
    'scss/dollar-variable-colon-space-before': null,
    'scss/dollar-variable-empty-line-before': null,
    'scss/dollar-variable-pattern': null,
    'scss/no-global-function-names': null,
    'color-function-notation': null,
    'color-function-alias-notation': null,
    'alpha-value-notation': null,
    'declaration-property-value-keyword-no-deprecated': null,
    'block-no-empty': null,
    'property-no-vendor-prefix': null,
    'shorthand-property-no-redundant-values': null,
    'no-descending-specificity': null,
    'comment-empty-line-before': null,
    'selector-no-vendor-prefix': null,
    '@stylistic/max-line-length': null,
    '@stylistic/string-quotes': null,
    'order/custom-properties-alphabetical-order': true,
    'order/properties-alphabetical-order': true
  },
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.quasar/**',
    '**/storybook-static/**',
    '.storybook-workspace/storybook-static/**'
  ]
}
