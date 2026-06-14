import fs from 'node:fs'
import path from 'node:path'

function walk (dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      walk(p, out)
    } else if (/\.(ts|vue)$/.test(ent.name)) {
      out.push(p)
    }
  }
  return out
}

const root = path.resolve('src/components/dialogs/DialogProjectSettings')
const pattern = /(\n\s*color: [^\n]+,)(\n\s*displayName:)/g
const replacement = '$1\n  colorPallete: \'\',$2'

for (const file of walk(root)) {
  const text = fs.readFileSync(file, 'utf8')
  if (!text.includes('documentCount:') || text.includes('colorPallete:')) {
    continue
  }
  const fixed = text.replace(pattern, replacement)
  if (fixed !== text) {
    fs.writeFileSync(file, fixed)
    console.log('updated', file)
  }
}
