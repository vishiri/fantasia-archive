/**
 * Local ESLint plugin: two-level functions + managers architecture.
 * See .cursor/rules/fa-two-level-architecture.mdc
 */

import fs from 'node:fs'
import path from 'node:path'

import {
  getFaTwoLevelFeatureRootFromVue,
  getFaTwoLevelMainScriptsAreaFromFile,
  getFaTwoLevelScriptsDirFromFile,
  isFaTwoLevelAllowedMainScriptsSiblingFile,
  isFaTwoLevelAllowedVueImportSource,
  isFaTwoLevelExcludedLintPath,
  isFaTwoLevelFunctionsFile,
  isFaTwoLevelManagerFile,
  isFaTwoLevelPiniaStoreManager,
  isFaTwoLevelStoreBridgeScript,
  isFaTwoLevelTypesImportSource,
  normalizeFaTwoLevelPath
} from './faTwoLevelPathUtils.mjs'

const FA_TWO_LEVEL_DOC = 'See .cursor/rules/fa-two-level-architecture.mdc'

function scriptsDirHasFunctionsFolder (scriptsDir, cwd) {
  const functionsDir = path.join(cwd, scriptsDir, 'functions')

  try {
    return fs.statSync(functionsDir).isDirectory()
  } catch {
    return false
  }
}

function scriptsDirHasManagerFile (scriptsDir, cwd) {
  const absoluteScriptsDir = path.join(cwd, scriptsDir)

  try {
    const entries = fs.readdirSync(absoluteScriptsDir)

    return entries.some((name) => name.endsWith('_manager.ts'))
  } catch {
    return false
  }
}

function resolveFeatureManagerExists (featureRoot, cwd) {
  if (featureRoot === 'src') {
    const appManager = path.join(cwd, 'src', 'scripts', 'app_manager.ts')

    return fs.existsSync(appManager)
  }

  return scriptsDirHasManagerFile(`${featureRoot}/scripts`, cwd)
}

const functionsOnlyTypeImports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Level-1 functions/*.ts may only use import type from types/'
    },
    schema: []
  },
  create (context) {
    const filename = normalizeFaTwoLevelPath(context.filename)

    if (!isFaTwoLevelFunctionsFile(filename) || isFaTwoLevelExcludedLintPath(filename)) {
      return {}
    }

    return {
      ImportDeclaration (node) {
        if (node.importKind === 'type') {
          if (isFaTwoLevelTypesImportSource(node.source.value)) {
            return
          }

          context.report({
            node,
            message: `functions/ allows import type only from app/types/ (or types/). ${FA_TWO_LEVEL_DOC}`
          })

          return
        }

        context.report({
          node,
          message: `functions/ must not use value imports. Pass dependencies via manager-injected arguments. ${FA_TWO_LEVEL_DOC}`
        })
      },
      ExportNamedDeclaration (node) {
        if (node.source === null) {
          return
        }

        context.report({
          node,
          message: `functions/ must not re-export from other modules. ${FA_TWO_LEVEL_DOC}`
        })
      },
      ExportAllDeclaration (node) {
        context.report({
          node,
          message: `functions/ must not re-export from other modules. ${FA_TWO_LEVEL_DOC}`
        })
      }
    }
  }
}

const featureScriptsLayout = {
  meta: {
    type: 'problem',
    docs: {
      description: 'When scripts/functions/ exists, sibling scripts/*.ts must be *_manager.ts only'
    },
    schema: []
  },
  create (context) {
    const cwd = context.cwd ?? process.cwd()
    const filename = normalizeFaTwoLevelPath(context.filename)

    if (isFaTwoLevelExcludedLintPath(filename)) {
      return {}
    }

    if (filename.includes('/scripts/_tests/') || filename.includes('/_tests/')) {
      return {}
    }

    const scriptsDir = getFaTwoLevelScriptsDirFromFile(filename)

    if (scriptsDir === null) {
      return {}
    }

    if (!scriptsDirHasFunctionsFolder(scriptsDir, cwd)) {
      return {}
    }

    if (isFaTwoLevelFunctionsFile(filename)) {
      return {}
    }

    if (isFaTwoLevelManagerFile(filename)) {
      return {}
    }

    const mainScriptsArea = getFaTwoLevelMainScriptsAreaFromFile(filename)

    if (mainScriptsArea !== null &&
      isFaTwoLevelAllowedMainScriptsSiblingFile(filename, mainScriptsArea)) {
      return {}
    }

    if (!filename.startsWith(`${scriptsDir}/`) || !filename.endsWith('.ts')) {
      return {}
    }

    return {
      Program (node) {
        context.report({
          node,
          message: `Legacy script module is not allowed beside scripts/functions/ (or mainScripts/<area>/functions/). Move logic into functions/ and wire from a *_manager.ts or *Wiring.ts sibling. ${FA_TWO_LEVEL_DOC}`
        })
      }
    }
  }
}

const requireManagerWhenFunctions = {
  meta: {
    type: 'problem',
    docs: {
      description: 'scripts/functions/ requires at least one scripts/*_manager.ts'
    },
    schema: []
  },
  create (context) {
    const cwd = context.cwd ?? process.cwd()
    const filename = normalizeFaTwoLevelPath(context.filename)

    if (!isFaTwoLevelFunctionsFile(filename) || isFaTwoLevelExcludedLintPath(filename)) {
      return {}
    }

    const scriptsDir = getFaTwoLevelScriptsDirFromFile(filename)

    if (scriptsDir === null) {
      return {}
    }

    if (!scriptsDirHasFunctionsFolder(scriptsDir, cwd)) {
      return {}
    }

    if (scriptsDirHasManagerFile(scriptsDir, cwd)) {
      return {}
    }

    return {
      Program (node) {
        context.report({
          node,
          message: `scripts/functions/ requires a sibling scripts/*_manager.ts entry module. ${FA_TWO_LEVEL_DOC}`
        })
      }
    }
  }
}

const vueScriptImportAllowlist = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Vue SFC script imports are allowlisted when a feature manager exists'
    },
    schema: []
  },
  create (context) {
    const cwd = context.cwd ?? process.cwd()
    const filename = normalizeFaTwoLevelPath(context.filename)

    if (!filename.endsWith('.vue') || isFaTwoLevelExcludedLintPath(filename)) {
      return {}
    }

    const isTargetVue = filename.startsWith('src/components/') ||
      filename.startsWith('src/layouts/') ||
      filename.startsWith('src/pages/') ||
      filename === 'src/App.vue'

    if (!isTargetVue) {
      return {}
    }

    const featureRoot = getFaTwoLevelFeatureRootFromVue(filename)

    if (featureRoot === null) {
      return {}
    }

    if (!resolveFeatureManagerExists(featureRoot, cwd)) {
      return {}
    }

    return {
      ImportDeclaration (node) {
        if (node.importKind === 'type') {
          if (isFaTwoLevelTypesImportSource(node.source.value)) {
            return
          }

          context.report({
            node,
            message: `Vue script may only import types from app/types/ when using a manager. ${FA_TWO_LEVEL_DOC}`
          })

          return
        }

        if (isFaTwoLevelAllowedVueImportSource(node.source.value)) {
          return
        }

        context.report({
          node,
          message: `Vue script may only import the feature *_manager.ts, child *.vue, or app/types/. ${FA_TWO_LEVEL_DOC}`
        })
      }
    }
  }
}

const noFunctionsImportManager = {
  meta: {
    type: 'problem',
    docs: {
      description: 'functions/ must not import managers or Pinia stores'
    },
    schema: []
  },
  create (context) {
    const filename = normalizeFaTwoLevelPath(context.filename)

    if (!isFaTwoLevelFunctionsFile(filename) || isFaTwoLevelExcludedLintPath(filename)) {
      return {}
    }

    return {
      ImportDeclaration (node) {
        const source = node.source.value.replace(/\\/g, '/')

        if (source.includes('_manager')) {
          context.report({
            node,
            message: `functions/ must not import managers. ${FA_TWO_LEVEL_DOC}`
          })
        }

        if (/\/S_[^/]+\.ts$/.test(source) || source.includes('/stores/S_')) {
          context.report({
            node,
            message: `functions/ must not import Pinia stores. ${FA_TWO_LEVEL_DOC}`
          })
        }
      }
    }
  }
}

function isManagerWiringAllowedInitializer (init) {
  if (init === null || init === undefined) {
    return true
  }

  if (init.type === 'TSAsExpression' || init.type === 'TSSatisfiesExpression') {
    return isManagerWiringAllowedInitializer(init.expression)
  }

  const allowed = new Set([
    'CallExpression',
    'Identifier',
    'MemberExpression',
    'ConditionalExpression',
    'LogicalExpression',
    'BinaryExpression',
    'UnaryExpression',
    'TemplateLiteral',
    'Literal',
    'ArrayExpression',
    'ObjectExpression'
  ])

  return allowed.has(init.type)
}

function isManagerTopLevelStatement (node) {
  const parent = node.parent

  if (parent?.type === 'Program') {
    return true
  }

  if (parent?.type === 'ExportNamedDeclaration') {
    return true
  }

  return false
}

function isDomainBarrelManagerBody (body) {
  if (body.length === 0) {
    return true
  }

  return body.every((node) => {
    if (node.type === 'ImportDeclaration') {
      return true
    }

    if (node.type === 'ExportAllDeclaration') {
      return true
    }

    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration === null && node.source !== null) {
        return true
      }

      if (node.declaration?.type === 'TSInterfaceDeclaration' ||
        node.declaration?.type === 'TSTypeAliasDeclaration') {
        return true
      }
    }

    return false
  })
}

const managerWiringOnly = {
  meta: {
    type: 'problem',
    docs: {
      description: '*_manager.ts must not define functions; only import, invoke factories, export const bindings'
    },
    schema: []
  },
  create (context) {
    const filename = normalizeFaTwoLevelPath(context.filename)

    if (!isFaTwoLevelManagerFile(filename) || isFaTwoLevelExcludedLintPath(filename)) {
      return {}
    }

    const reportLocalFunction = (node, kind) => {
      context.report({
        node,
        message: `*_manager.ts must not define ${kind}. Move logic to functions/ (or sibling wiring modules under src-electron/mainScripts when functions/ cannot import shared deps) and export const bindings from factory calls. ${FA_TWO_LEVEL_DOC}`
      })
    }

    return {
      Program (node) {
        if (isDomainBarrelManagerBody(node.body)) {
          // Domain barrel *_manager.ts files may re-export sibling managers; no local fn check here.
        }
      },
      FunctionDeclaration (node) {
        reportLocalFunction(node, 'a function')
      },
      ExportNamedDeclaration (node) {
        if (node.declaration?.type === 'FunctionDeclaration') {
          reportLocalFunction(node, 'export function')
        }

        if (node.declaration?.type === 'VariableDeclaration') {
          for (const declarator of node.declaration.declarations) {
            if (declarator.init?.type === 'ArrowFunctionExpression' ||
              declarator.init?.type === 'FunctionExpression') {
              reportLocalFunction(declarator, 'export const with a function expression')
            } else if (!isManagerWiringAllowedInitializer(declarator.init)) {
              reportLocalFunction(declarator, 'export const with inline logic')
            }
          }
        }
      },
      ExportDefaultDeclaration (node) {
        if (node.declaration?.type === 'FunctionDeclaration' ||
          node.declaration?.type === 'ArrowFunctionExpression') {
          reportLocalFunction(node, 'export default function')
        }
      },
      VariableDeclaration (node) {
        if (!isManagerTopLevelStatement(node)) {
          return
        }

        if (node.kind !== 'const' && node.kind !== 'let') {
          return
        }

        for (const declarator of node.declarations) {
          if (declarator.init?.type === 'ArrowFunctionExpression' ||
            declarator.init?.type === 'FunctionExpression') {
            reportLocalFunction(declarator, 'a local const/let with a function expression')
          } else if (declarator.init !== null && declarator.init !== undefined &&
            !isManagerWiringAllowedInitializer(declarator.init)) {
            reportLocalFunction(declarator, 'local const/let with inline logic')
          }
        }
      },
      ClassDeclaration (node) {
        if (!isManagerTopLevelStatement(node)) {
          return
        }

        reportLocalFunction(node, 'a class')
      }
    }
  }
}

const storesFunctionsLayout = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Only store managers and bridge scripts may import src/stores/functions/'
    },
    schema: []
  },
  create (context) {
    const filename = normalizeFaTwoLevelPath(context.filename)

    if (isFaTwoLevelExcludedLintPath(filename)) {
      return {}
    }

    return {
      ImportDeclaration (node) {
        const source = node.source.value.replace(/\\/g, '/')

        if (!source.includes('/stores/functions/') && !source.includes('stores/functions/')) {
          return
        }

        if (isFaTwoLevelPiniaStoreManager(filename) || isFaTwoLevelStoreBridgeScript(filename)) {
          return
        }

        if (isFaTwoLevelFunctionsFile(filename) && filename.includes('/src/stores/functions/')) {
          return
        }

        if (/\.vitest\.test\.ts$/.test(filename)) {
          return
        }

        context.report({
          node,
          message: `Only src/stores/S_*.ts or stores/scripts/*Bridge*.ts may import stores/functions/. ${FA_TWO_LEVEL_DOC}`
        })
      }
    }
  }
}

export const faTwoLevelPlugin = {
  rules: {
    'functions-only-type-imports': functionsOnlyTypeImports,
    'feature-scripts-layout': featureScriptsLayout,
    'require-manager-when-functions': requireManagerWhenFunctions,
    'vue-script-import-allowlist': vueScriptImportAllowlist,
    'no-functions-import-manager': noFunctionsImportManager,
    'stores-functions-layout': storesFunctionsLayout,
    'manager-wiring-only': managerWiringOnly
  }
}
