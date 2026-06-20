// Heuristic audit: hard-coded px/rem lengths and hex colors in consumer SCSS/Vue styles.
// Token definition files (_variables.scss, *.variables.scss, app.palette.scss) are excluded.
// Run: yarn audit:scss-literals
// Exit 1 when any hit (use before ship; not wired into testbatch:verify by default).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.join(__dirname, '..')

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  '.quasar',
  'coverage',
  'test-results',
  'storybook-static',
  '.git',
  'foundation'
])

const TOKEN_FILE_RE = /(^|\/)(_variables|.*\.variables)\.scss$|\/app\.palette\.scss$/

/** @typedef {{ file: string, line: number, sample: string, kind: 'length' | 'hex' }} Hit */

/**
 * @param {string} dir
 * @param {string[]} acc
 */
function walkScssVue (dir, acc = []) {
  if (!fs.existsSync(dir)) {
    return acc
  }
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) {
      continue
    }
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      walkScssVue(full, acc)
    } else if (/\.(scss|vue)$/.test(ent.name)) {
      acc.push(full)
    }
  }
  return acc
}

/**
 * @param {string} filePath
 */
function isTokenDefinitionFile (filePath) {
  const rel = path.relative(repoRoot, filePath).replace(/\\/g, '/')
  return TOKEN_FILE_RE.test(rel)
}

/**
 * @param {string} text
 * @returns {string}
 */
function extractStyleBlocksFromVue (text) {
  const blocks = []
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let m
  while ((m = re.exec(text)) !== null) {
    if (!m[1].includes('src=')) {
      blocks.push(m[1])
    }
  }
  return blocks.join('\n')
}

const LENGTH_LITERAL_RE = /^\s*[\w-]+:\s*(?![^;]*\$)[^;{]*\d+(?:\.\d+)?px\b/
const HEX_LITERAL_RE = /^\s*[\w-]+:\s*(?![^;]*\$)[^;{]*#[0-9a-fA-F]{3,8}\b/

/** @type {Hit[]} */
const hits = []

const roots = [
  path.join(repoRoot, 'src', 'css'),
  path.join(repoRoot, 'src', 'components'),
  path.join(repoRoot, 'src', 'layouts'),
  path.join(repoRoot, 'src', 'pages'),
  path.join(repoRoot, '.storybook-workspace', '.storybook')
]

for (const root of roots) {
  for (const filePath of walkScssVue(root)) {
    const rel = path.relative(repoRoot, filePath).replace(/\\/g, '/')
    if (rel.includes('/_tests/') || rel.includes('.stories.')) {
      continue
    }
    if (filePath.endsWith('.scss') && isTokenDefinitionFile(filePath)) {
      continue
    }

    const raw = fs.readFileSync(filePath, 'utf8')
    const styleText = filePath.endsWith('.vue')
      ? extractStyleBlocksFromVue(raw)
      : raw

    if (!styleText.trim()) {
      continue
    }

    const lines = styleText.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
        continue
      }
      if (trimmed.includes('calc(') && /\d+px/.test(trimmed)) {
        continue
      }
      if (LENGTH_LITERAL_RE.test(line)) {
        hits.push({
          file: rel,
          line: i + 1,
          sample: trimmed.slice(0, 120),
          kind: 'length'
        })
      } else if (HEX_LITERAL_RE.test(line)) {
        hits.push({
          file: rel,
          line: i + 1,
          sample: trimmed.slice(0, 120),
          kind: 'hex'
        })
      }
    }
  }
}

const outPath = path.join(repoRoot, 'test-results', 'scss-consumer-literals-audit.json')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify({
  hitCount: hits.length,
  hits
}, null, 2))

console.log(`SCSS consumer literal audit: ${hits.length} hit(s)`)
for (const h of hits) {
  console.log(`  [${h.kind}] ${h.file}:${h.line} ${h.sample}`)
}
console.log(`JSON: ${path.relative(repoRoot, outPath)}`)

process.exit(hits.length > 0 ? 1 : 0)
