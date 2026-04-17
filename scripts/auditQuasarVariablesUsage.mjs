/**
 * Reports SCSS variables defined under "=== 4. CUSTOM" in quasar.variables.scss
 * that have no references anywhere in the repo (with Sass-safe $name boundaries),
 * excluding internal-only chains that never reach outside the catalogue file.
 *
 * Usage: node scripts/auditQuasarVariablesUsage.mjs
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const CATALOGUE_REL = join(
  'src',
  'css',
  'quasar.variables.scss'
)
const CATALOGUE_ABS = join(
  ROOT,
  CATALOGUE_REL
)

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  '.quasar',
  'dist',
  'storybook-static',
  'coverage',
  'test-results',
  'release'
])

const TEXT_EXT = new Set([
  '.vue',
  '.scss',
  '.sass',
  '.css',
  '.ts',
  '.mts',
  '.cts',
  '.js',
  '.mjs',
  '.cjs',
  '.md',
  '.json',
  '.html'
])

function walkFiles (
  dir,
  out = []
) {
  const entries = readdirSync(
    dir,
    {
      withFileTypes: true
    }
  )
  for (const ent of entries) {
    const name = ent.name
    const full = join(
      dir,
      name
    )
    if (ent.isDirectory()) {
      if (SKIP_DIR_NAMES.has(name)) {
        continue
      }
      walkFiles(
        full,
        out
      )
    } else if (ent.isFile()) {
      const lower = name.toLowerCase()
      const dot = lower.lastIndexOf('.')
      const ext = dot >= 0 ? lower.slice(dot) : ''
      if (TEXT_EXT.has(ext)) {
        out.push(full)
      }
    }
  }
  return out
}

function makeVarRefRegex (
  varName
) {
  const escaped = varName.replaceAll(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  )
  return new RegExp(
    `\\$${escaped}(?=[^a-zA-Z0-9-]|$)`,
    'g'
  )
}

function collectVarRefsInText (
  text,
  knownNames
) {
  const found = new Set()
  for (const name of knownNames) {
    const re = makeVarRefRegex(name)
    re.lastIndex = 0
    if (re.test(text)) {
      found.add(name)
    }
  }
  return found
}

function parseLhsFromDefinitionLine (
  line
) {
  const trimmed = line.trim()
  const m = /^(\$[a-zA-Z0-9-]+)\s*:/u.exec(trimmed)
  if (!m) {
    return null
  }
  return m[1].slice(1)
}

function main () {
  const catalogueText = readFileSync(
    CATALOGUE_ABS,
    'utf8'
  )
  const lines = catalogueText.split(/\n/)
  const section4Start = lines.findIndex((l) =>
    l.includes('/* === 4. CUSTOM')
  )
  if (section4Start < 0) {
    throw new Error('Could not find section 4 header in quasar.variables.scss')
  }
  const section4Body = lines.slice(section4Start).join('\n')

  const defs = []
  const defLines = section4Body.split(/\n/)
  for (const line of defLines) {
    const lhs = parseLhsFromDefinitionLine(line)
    if (lhs) {
      defs.push({
        lhs,
        line
      })
    }
  }
  const defined = defs.map((d) => d.lhs)

  const allFiles = walkFiles(ROOT)
  const outsideTexts = []
  for (const abs of allFiles) {
    const rel = relative(
      ROOT,
      abs
    ).replaceAll(
      '\\',
      '/'
    )
    if (rel === CATALOGUE_REL.replaceAll(
      '\\',
      '/'
    )) {
      continue
    }
    try {
      outsideTexts.push({
        text: readFileSync(
          abs,
          'utf8'
        )
      })
    } catch {
      // skip unreadable
    }
  }

  const externallyReferenced = new Set()
  for (const { text } of outsideTexts) {
    const hits = collectVarRefsInText(
      text,
      defined
    )
    for (const h of hits) {
      externallyReferenced.add(h)
    }
  }

  const rhsByLhs = new Map()
  for (const {
    lhs,
    line
  } of defs) {
    const idx = line.indexOf(':')
    const rhs = idx >= 0 ? line.slice(idx + 1) : ''
    rhsByLhs.set(
      lhs,
      rhs
    )
  }

  const needed = new Set(externallyReferenced)
  let changed = true
  while (changed) {
    changed = false
    for (const lhs of needed) {
      const rhs = rhsByLhs.get(lhs) ?? ''
      const refs = collectVarRefsInText(
        rhs,
        defined
      )
      for (const r of refs) {
        if (!needed.has(r)) {
          needed.add(r)
          changed = true
        }
      }
    }
  }

  const dead = defined.filter((n) => !needed.has(n))

  console.log(JSON.stringify(
    {
      catalogue: CATALOGUE_REL.replaceAll(
        '\\',
        '/'
      ),
      definedCustomVarCount: defined.length,
      externallyReferencedCount: externallyReferenced.size,
      deadCount: dead.length,
      dead
    },
    null,
    2
  ))
}

main()
