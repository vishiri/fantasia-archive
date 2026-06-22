import { expect, test, vi } from 'vitest'

import {
  buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations,
  createNormalizeFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations,
  createResolveFaProjectWorldTemplatePlacementNicknameFromFields
} from '../faProjectWorldTemplatePlacementNicknameSingularPlural'

test('Test that buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations pairs plural and singular maps', () => {
  expect(buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
    nicknamePluralTranslations: { 'en-US': 'Heroes' },
    nicknameSingularTranslations: { 'en-US': 'Hero' }
  })).toEqual({
    plural: { 'en-US': 'Heroes' },
    singular: { 'en-US': 'Hero' }
  })
})

test('Test that createNormalizeFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations normalizes both maps', () => {
  const normalizePlural = vi.fn((translations: Record<string, string>) => translations)
  const normalizeSingular = vi.fn((translations: Record<string, string>) => translations)
  const normalize = createNormalizeFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations({
    normalizePlural,
    normalizeSingular
  })
  const input = {
    nicknamePluralTranslations: { 'en-US': 'Heroes' },
    nicknameSingularTranslations: { 'en-US': 'Hero' }
  }
  expect(normalize(input)).toEqual(input)
  expect(normalizePlural).toHaveBeenCalledWith(input.nicknamePluralTranslations)
  expect(normalizeSingular).toHaveBeenCalledWith(input.nicknameSingularTranslations)
})

test('Test that createResolveFaProjectWorldTemplatePlacementNicknameFromFields resolves combined maps', () => {
  const resolveNickname = vi.fn(() => 'Resolved nickname')
  const resolve = createResolveFaProjectWorldTemplatePlacementNicknameFromFields({
    buildSingularPlural: buildFaProjectWorldTemplatePlacementNicknameSingularPluralTranslations,
    resolveNickname
  })
  expect(resolve({ 'en-US': 'Heroes' }, { 'en-US': 'Hero' }, 'en-US')).toBe('Resolved nickname')
  expect(resolveNickname).toHaveBeenCalledWith({
    plural: { 'en-US': 'Heroes' },
    singular: { 'en-US': 'Hero' }
  }, 'en-US')
})
