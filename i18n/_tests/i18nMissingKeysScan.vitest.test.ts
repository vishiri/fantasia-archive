import messages from 'app/i18n'
import { expect, test } from 'vitest'

function flattenKeys (obj: unknown, prefix = ''): string[] {
  const keys: string[] = []
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return keys
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (prefix === 'documents' && key === 'changeLog') {
      continue
    }
    const nextPath = prefix.length > 0 ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      keys.push(nextPath)
      continue
    }
    if (typeof value === 'object') {
      keys.push(...flattenKeys(value, nextPath))
    }
  }
  return keys
}

function getAtPath (obj: unknown, keyPath: string): unknown {
  return keyPath.split('.').reduce<unknown>((current, key) => {
    if (current !== null && current !== undefined && typeof current === 'object') {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

test('non-en-US locales include every en-US key except changeLog', () => {
  const enKeys = flattenKeys(messages['en-US'])
  const locales = Object.keys(messages).filter((locale) => locale !== 'en-US').sort()
  const report: Record<string, string[]> = {}

  for (const locale of locales) {
    const localeMessages = messages[locale as keyof typeof messages]
    const missing = enKeys.filter((key) => {
      const value = getAtPath(localeMessages, key)
      return value === undefined || value === ''
    })
    if (missing.length > 0) {
      report[locale] = missing
    }
  }

  expect(report).toEqual({})
})
