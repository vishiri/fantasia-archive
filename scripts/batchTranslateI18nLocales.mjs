/**
 * Batch-translates i18n locale trees from corrected en-US sources.
 * Protects vue-i18n placeholders and product tokens before machine translation.
 *
 * Usage: node scripts/batchTranslateI18nLocales.mjs de fr it ...
 *        node scripts/batchTranslateI18nLocales.mjs   (all non-en-US selector locales)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const enUsRoot = path.join(repoRoot, 'i18n', 'en-US')

const ALL_TARGET_LOCALES = [
  'de',
  'fr',
  'it',
  'sv',
  'fi',
  'nb',
  'pt',
  'es',
  'el',
  'uk',
  'ar',
  'zh',
  'ja',
  'hi',
  'ru'
]

const LOCALE_TO_GOOGLE = {
  de: 'de',
  fr: 'fr',
  it: 'it',
  sv: 'sv',
  fi: 'fi',
  nb: 'no',
  pt: 'pt',
  es: 'es',
  el: 'el',
  uk: 'uk',
  ar: 'ar',
  zh: 'zh-CN',
  ja: 'ja',
  hi: 'hi',
  ru: 'ru'
}

const PROTECTED_TOKENS = [
  'Fantasia Archive',
  'FA 2.0',
  'FA 1.0',
  'FA',
  'CSS',
  'Electron',
  'Monaco',
  'SQLite',
  'Patreon',
  'Ko-Fi',
  'GitHub',
  'Discord',
  'Reddit',
  'Storybook',
  'TypeScript',
  'Vue',
  'Quasar',
  'Playwright',
  'Vitest',
  'macOS',
  'Windows',
  'Linux',
  'DevTools',
  'GPL',
  'Ctrl+Shift+F',
  'Ctrl',
  'Shift',
  'Alt',
  'Meta',
  'QMenu',
  'QDialog',
  'Notify',
  'Pinia',
  'a11y'
]

const translationCache = new Map()

function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function protectString (input) {
  let text = input
  const tokens = []

  const placeholderRe = /\{[a-zA-Z0-9_]+\}/g
  text = text.replace(placeholderRe, (match) => {
    const id = `__PH${tokens.length}__`
    tokens.push({
      id,
      value: match
    })
    return id
  })

  for (const token of PROTECTED_TOKENS) {
    if (!text.includes(token)) {
      continue
    }
    const id = `__TK${tokens.length}__`
    tokens.push({
      id,
      value: token
    })
    text = text.split(token).join(id)
  }

  text = text.replace(/\\\|/g, () => {
    const id = `__PIPE${tokens.length}__`
    tokens.push({
      id,
      value: '\\|'
    })
    return id
  })

  return {
    text,
    tokens
  }
}

function restoreString (input, tokens) {
  let text = input
  for (const token of tokens) {
    text = text.split(token.id).join(token.value)
  }
  return text
}

async function googleTranslate (text, targetLang) {
  const cacheKey = `${targetLang}::${text}`
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)
  }

  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' +
    `${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`

  let lastError = null
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Translate HTTP ${response.status} for ${targetLang}`)
      }

      const payload = await response.json()
      const translated = payload?.[0]?.map((row) => row?.[0]).join('') ?? text
      translationCache.set(cacheKey, translated)
      await sleep(180 + attempt * 120)
      return translated
    } catch (error) {
      lastError = error
      await sleep(800 + attempt * 1200)
    }
  }

  throw lastError ?? new Error(`Translate failed for ${targetLang}`)
}

async function translateString (english, targetLang) {
  if (!english.trim()) {
    return english
  }

  const protectedBundle = protectString(english)
  const translated = await googleTranslate(protectedBundle.text, targetLang)
  return restoreString(translated, protectedBundle.tokens)
}

function escapeTsString (value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')
}

async function translateTsFileContentsAsync (source, targetLang) {
  const lines = source.split('\n')
  const output = []
  let pendingKey = null

  for (const line of lines) {
    const inlineMatch = line.match(/^(\s{2,})([A-Za-z0-9_]+):\s+'((?:\\'|[^'])*)',?\s*$/)
    if (inlineMatch) {
      pendingKey = null
      const indent = inlineMatch[1]
      const key = inlineMatch[2]
      const english = inlineMatch[3].replace(/\\'/g, '\'')
      const translated = await translateString(english, targetLang)
      output.push(`${indent}${key}: '${escapeTsString(translated)}',`)
      continue
    }

    const keyOnlyMatch = line.match(/^(\s{2,})([A-Za-z0-9_]+):\s*$/)
    if (keyOnlyMatch) {
      pendingKey = {
        indent: keyOnlyMatch[1],
        key: keyOnlyMatch[2]
      }
      continue
    }

    const valueOnlyMatch = pendingKey && line.match(/^(\s+)'((?:\\'|[^'])*)',?\s*$/)
    if (valueOnlyMatch) {
      const english = valueOnlyMatch[2].replace(/\\'/g, '\'')
      const translated = await translateString(english, targetLang)
      output.push(`${pendingKey.indent}${pendingKey.key}: '${escapeTsString(translated)}',`)
      pendingKey = null
      continue
    }

    if (pendingKey) {
      output.push(`${pendingKey.indent}${pendingKey.key}:`)
      pendingKey = null
    }

    output.push(line)
  }

  return output.join('\n')
}

function chunkText (text, maxLength = 1200) {
  if (text.length <= maxLength) {
    return [text]
  }

  const parts = []
  let cursor = 0
  while (cursor < text.length) {
    let end = Math.min(cursor + maxLength, text.length)
    if (end < text.length) {
      const splitAt = text.lastIndexOf('\n', end)
      if (splitAt > cursor + 200) {
        end = splitAt
      }
    }
    parts.push(text.slice(cursor, end))
    cursor = end
  }
  return parts
}

async function translateMarkdownFile (sourcePath, targetPath, targetLang) {
  const source = fs.readFileSync(sourcePath, 'utf8')
  const paragraphs = source.split(/(\n\n+)/)
  const translatedParagraphs = []

  for (const paragraph of paragraphs) {
    if (/^\n+$/.test(paragraph) || paragraph.trim().length === 0) {
      translatedParagraphs.push(paragraph)
      continue
    }

    const chunks = chunkText(paragraph)
    const translatedChunks = []
    for (const chunk of chunks) {
      translatedChunks.push(await translateString(chunk, targetLang))
    }
    translatedParagraphs.push(translatedChunks.join(''))
  }

  fs.writeFileSync(targetPath, translatedParagraphs.join(''), 'utf8')
}

function walkTsFiles (dir, rel = '') {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name)
    const relPath = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      files.push(...walkTsFiles(entryPath, relPath))
      continue
    }
    if (entry.name.startsWith('L_') && entry.name.endsWith('.ts')) {
      files.push({
        relPath,
        absPath: entryPath
      })
    }
  }
  return files
}

async function translateLocale (localeCode, options) {
  const targetLang = LOCALE_TO_GOOGLE[localeCode]
  if (!targetLang) {
    throw new Error(`No Google translate mapping for ${localeCode}`)
  }

  const targetRoot = path.join(repoRoot, 'i18n', localeCode)
  const documentsOnly = options.documentsOnly === true
  const markdownOnly = options.markdownOnly

  if (!documentsOnly) {
    const tsFiles = walkTsFiles(enUsRoot)

    for (const file of tsFiles) {
      const source = fs.readFileSync(file.absPath, 'utf8')
      const targetPath = path.join(targetRoot, file.relPath)
      const translated = await translateTsFileContentsAsync(source, targetLang)
      fs.writeFileSync(targetPath, translated, 'utf8')
      console.log(`  ${file.relPath}`)
    }
  }

  const markdownFiles = markdownOnly
    ? [markdownOnly]
    : [
        'advancedSearchCheatSheet.md',
        'advancedSearchGuide.md',
        'tipsTricksTrivia.md',
        'changeLog.md'
      ]

  for (const markdownFile of markdownFiles) {
    const sourcePath = path.join(enUsRoot, 'documents', markdownFile)
    const targetPath = path.join(targetRoot, 'documents', markdownFile)
    console.log(`  documents/${markdownFile}`)
    await translateMarkdownFile(sourcePath, targetPath, targetLang)
  }
}

const cliArgs = process.argv.slice(2)
const documentsOnly = cliArgs.includes('--documents-only')
const markdownOnlyArg = cliArgs.find((arg) => arg.startsWith('--markdown='))
const markdownOnly = markdownOnlyArg ? markdownOnlyArg.slice('--markdown='.length) : undefined
const cliLocales = cliArgs.filter((arg) => !arg.startsWith('--'))
const locales = cliLocales.length > 0 ? cliLocales : ALL_TARGET_LOCALES

for (const localeCode of locales) {
  console.log(`Translating ${localeCode}...`)
  await translateLocale(localeCode, {
    documentsOnly,
    markdownOnly
  })
  console.log(`Done ${localeCode}`)
}
