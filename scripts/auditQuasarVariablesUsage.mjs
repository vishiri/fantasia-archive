/**
 * Reports SCSS variables defined in feature colocated `styles/_variables.scss` files
 * (under `src/components/**` and `src/layouts/**`) that have no references anywhere else
 * in the repo (with Sass-safe $name boundaries), including dependency closure for
 * internal-only $ chains between those custom definitions.
 *
 * Skips: the barrel `quasar.variables.scss`, `app.palette.scss`, and
 * `src/css/theme/quasar-components/**` when looking for *references* (definitions are
 * only read from `styles/_variables.scss`).
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

function isColocatedFeatureVariablesFile (
  relPosix
) {
  const n = relPosix.replaceAll(
    '\\',
    '/'
  )
  if (!n.endsWith('styles/_variables.scss')) {
    return false
  }
  return n.startsWith('src/components/') || n.startsWith('src/layouts/')
}

function main () {
  const allTextFiles = walkFiles(ROOT)
  const defFileAbs = allTextFiles.filter(
    (abs) => isColocatedFeatureVariablesFile(
      relative(
        ROOT,
        abs
      )
    )
  )
  if (defFileAbs.length === 0) {
    throw new Error('No feature styles/_variables.scss files found; expected colocated custom tokens under src/components or src/layouts')
  }
  const defs = []
  for (const abs of defFileAbs) {
    const text = readFileSync(
      abs,
      'utf8'
    )
    for (const line of text.split(/\n/)) {
      const lhs = parseLhsFromDefinitionLine(line)
      if (lhs) {
        defs.push({
          lhs,
          line
        })
      }
    }
  }
  const defined = defs.map((d) => d.lhs)
  if (new Set(defined).size !== defined.length) {
    const dupes = defined.filter(
      (n, i) => defined.indexOf(n) !== i
    )
    throw new Error(`Duplicate custom SCSS variable names: ${[...new Set(dupes)].join(', ')}`)
  }
  const defFileRelSet = new Set(
    defFileAbs.map(
      (a) => relative(
        ROOT,
        a
      )
        .replaceAll(
          '\\',
          '/'
        )
    )
  )
  const skipRefScanRel = new Set(
    [
      CATALOGUE_REL,
      join(
        'src',
        'css',
        'app.palette.scss'
      ),
      ...defFileRelSet
    ]
  )
  const outsideTexts = []
  for (const abs of allTextFiles) {
    const rel = relative(
      ROOT,
      abs
    ).replaceAll(
      '\\',
      '/'
    )
    if (skipRefScanRel.has(rel)) {
      continue
    }
    if (rel.startsWith('src/css/theme/quasar-components/')) {
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
      definitionFiles: [
        ...defFileRelSet
      ].map(
        (p) => p.replaceAll(
          '\\',
          '/'
        )
      ).toSorted(
        (a, b) => a.localeCompare(
          b
        )
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
