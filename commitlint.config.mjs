/**
 * Commit message policy aligned with .cursor/rules/git-conventional-commits.mdc and AGENTS.md.
 * Enforced locally via Husky (.husky/commit-msg) after yarn install (prepare script).
 */
export default {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    (message) => message.startsWith('Merge '),
    (message) => message.startsWith('Revert ')
  ],
  rules: {
    'subject-case': [0],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-enum': [
      2,
      'always',
      [
        'chore',
        'docs',
        'feat',
        'fix',
        'refactor',
        'style',
        'test'
      ]
    ]
  }
}
