/**
 * ESLint plugin: shared TypeScript types live under repository-root types/.
 */

function isTypesFolderPath (filename) {
  const normalized = filename.replace(/\\/g, '/')
  return (
    normalized.includes('/types/') ||
    normalized.endsWith('/types') ||
    /^types\//.test(normalized)
  )
}

function isDeclarationFile (filename) {
  return filename.endsWith('.d.ts')
}

function isI18nPath (filename) {
  return filename.replace(/\\/g, '/').includes('/i18n/')
}

const noExportedTypesOutsideTypes = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow export type/interface outside repository-root types/ (use app/types/... imports).'
    },
    schema: []
  },
  create (context) {
    const filename = context.filename ?? context.getFilename()

    if (isTypesFolderPath(filename) || isDeclarationFile(filename) || isI18nPath(filename)) {
      return {}
    }

    return {
      ExportNamedDeclaration (node) {
        if (node.exportKind === 'type') {
          context.report({
            node,
            message:
              'Export type aliases from repository-root types/ (import with app/types/...), not from implementation modules.'
          })
          return
        }

        if (node.declaration?.type === 'TSInterfaceDeclaration') {
          context.report({
            node,
            message:
              'Export interfaces from repository-root types/ (import with app/types/...), not from implementation modules.'
          })
        }
      }
    }
  }
}

export const typesFolderPlugin = {
  meta: { name: 'types-folder' },
  rules: {
    'no-exported-types-outside-types': noExportedTypesOutsideTypes
  }
}
