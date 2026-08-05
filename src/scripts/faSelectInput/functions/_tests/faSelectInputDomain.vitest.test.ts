/** @vitest-environment node */
import { expect, test } from 'vitest'

import { clearFaSelectInputIsNewFlags } from '../faSelectInputClearIsNew'
import { createFaSelectInputNewItem } from '../faSelectInputCreateNewItem'
import {
  appendFaSelectInputCreatedValue,
  createFaSelectInputChangePayload,
  resolveFaSelectInputChangeAction
} from '../faSelectInputModelChange'
import {
  createFaSelectInputEmptyModel,
  isFaSelectInputMediaModeStub,
  isFaSelectInputObjectMode,
  normalizeFaSelectInputOptions
} from '../faSelectInputModeNormalize'
import { shouldShowFaSelectInputSelectedChip } from '../faSelectInputSelectedChipVisibility'
import { splitFaSelectInputLabelForFilterHighlight } from '../faSelectInputLabelFilterHighlight'
import {
  filterFaSelectInputOptionsByQuery,
  isFaSelectInputObjectItem
} from '../filterFaSelectInputOptionsByQuery'

/**
 * filterFaSelectInputOptionsByQuery
 * Matches simple strings, object names, and id fallback; empty needle copies list.
 */
test('Test that filterFaSelectInputOptionsByQuery filters strings, names, and ids', () => {
  const items = [
    'one',
    'two',
    {
      id: 'a',
      name: 'Two Towers'
    },
    {
      id: 'uuid-match',
      name: 'other'
    }
  ] as const

  expect(filterFaSelectInputOptionsByQuery('', items)).toEqual([...items])
  expect(filterFaSelectInputOptionsByQuery('two', items)).toEqual([
    'two',
    {
      id: 'a',
      name: 'Two Towers'
    }
  ])
  expect(filterFaSelectInputOptionsByQuery('uuid-match', items)).toEqual([
    {
      id: 'uuid-match',
      name: 'other'
    }
  ])
})

/**
 * isFaSelectInputObjectItem
 * Distinguishes strings from object options.
 */
test('Test that isFaSelectInputObjectItem identifies object options', () => {
  expect(isFaSelectInputObjectItem('x')).toBe(false)
  expect(isFaSelectInputObjectItem({
    id: '1',
    name: 'n'
  })).toBe(true)
})

/**
 * normalizeFaSelectInputOptions / mode helpers
 * Media stub empties options; simple keeps strings; object modes keep objects.
 */
test('Test that normalizeFaSelectInputOptions and mode helpers respect scaffolding', () => {
  const mixed = [
    'plain',
    {
      id: '1',
      name: 'Doc',
      icon: 'mdi-file'
    }
  ] as const

  expect(normalizeFaSelectInputOptions('media', mixed)).toEqual([])
  expect(normalizeFaSelectInputOptions('simple', mixed)).toEqual(['plain'])
  expect(normalizeFaSelectInputOptions('document', mixed)).toEqual([
    {
      id: '1',
      name: 'Doc',
      icon: 'mdi-file'
    }
  ])
  expect(normalizeFaSelectInputOptions('otherType', mixed)).toEqual([
    {
      id: '1',
      name: 'Doc',
      icon: 'mdi-file'
    }
  ])
  expect(normalizeFaSelectInputOptions('tags', mixed)).toEqual([
    {
      id: '1',
      name: 'Doc',
      icon: 'mdi-file'
    }
  ])
  expect(isFaSelectInputMediaModeStub('media')).toBe(true)
  expect(isFaSelectInputMediaModeStub('simple')).toBe(false)
  expect(isFaSelectInputObjectMode('document')).toBe(true)
  expect(isFaSelectInputObjectMode('otherType')).toBe(true)
  expect(isFaSelectInputObjectMode('tags')).toBe(true)
  expect(isFaSelectInputObjectMode('simple')).toBe(false)
  expect(createFaSelectInputEmptyModel('simple', false)).toBe('')
  expect(createFaSelectInputEmptyModel('simple', true)).toEqual([])
  expect(createFaSelectInputEmptyModel('document', false)).toBeNull()
  expect(createFaSelectInputEmptyModel('document', true)).toEqual([])
})

/**
 * createFaSelectInputNewItem
 * Simple returns string; object modes return UUID item with isNew; blanks and media null.
 */
test('Test that createFaSelectInputNewItem builds simple strings and object isNew items', () => {
  expect(createFaSelectInputNewItem('simple', '  hello  ', () => 'uuid')).toBe('hello')
  expect(createFaSelectInputNewItem('simple', '   ', () => 'uuid')).toBeNull()
  expect(createFaSelectInputNewItem('document', 'Hero', () => 'uuid-1')).toEqual({
    id: 'uuid-1',
    isNew: true,
    name: 'Hero'
  })
  expect(createFaSelectInputNewItem('otherType', 'T', () => 'uuid-2')).toEqual({
    id: 'uuid-2',
    isNew: true,
    name: 'T'
  })
  expect(createFaSelectInputNewItem('tags', 'Tag', () => 'uuid-3')).toEqual({
    id: 'uuid-3',
    isNew: true,
    name: 'Tag'
  })
  expect(createFaSelectInputNewItem('media', 'x', () => 'uuid')).toBeNull()
})

/**
 * clearFaSelectInputIsNewFlags
 * Strips isNew for matching ids across array/single models and preserves extra fields.
 */
test('Test that clearFaSelectInputIsNewFlags strips isNew for matching ids', () => {
  const model = [
    {
      id: 'a',
      name: 'A',
      isNew: true,
      documentType: 'tpl',
      icon: 'mdi-a',
      otherType: 'documentTemplate'
    },
    {
      id: 'b',
      name: 'B',
      isNew: true
    }
  ]
  const cleared = clearFaSelectInputIsNewFlags(model, ['a'])
  expect(cleared).toEqual([
    {
      id: 'a',
      name: 'A',
      documentType: 'tpl',
      icon: 'mdi-a',
      otherType: 'documentTemplate'
    },
    {
      id: 'b',
      name: 'B',
      isNew: true
    }
  ])
  expect(clearFaSelectInputIsNewFlags(model, ['z'])).toBe(model)
  expect(clearFaSelectInputIsNewFlags(model, [])).toBe(model)
  expect(clearFaSelectInputIsNewFlags(['plain'], ['a'])).toEqual(['plain'])
  expect(clearFaSelectInputIsNewFlags([], ['a'])).toEqual([])
  expect(clearFaSelectInputIsNewFlags(null, ['a'])).toBeNull()
  expect(clearFaSelectInputIsNewFlags('plain', ['a'])).toBe('plain')

  const singleNew = {
    id: 'a',
    name: 'A',
    isNew: true,
    icon: 'mdi-x'
  }
  expect(clearFaSelectInputIsNewFlags(singleNew, ['a'])).toEqual({
    id: 'a',
    name: 'A',
    icon: 'mdi-x'
  })
  expect(clearFaSelectInputIsNewFlags(singleNew, ['z'])).toBe(singleNew)
  expect(clearFaSelectInputIsNewFlags({
    id: 'a',
    name: 'A'
  }, ['a'])).toEqual({
    id: 'a',
    name: 'A'
  })
  expect(clearFaSelectInputIsNewFlags([{
    id: 'c',
    name: 'C',
    isNew: true,
    documentType: 'tpl'
  }], ['c'])).toEqual([{
    id: 'c',
    name: 'C',
    documentType: 'tpl'
  }])
})

/**
 * resolveFaSelectInputChangeAction / append / payload
 * Classifies single and multi transitions; append dedupes created values.
 */
test('Test that model change helpers classify actions and append created values', () => {
  expect(resolveFaSelectInputChangeAction([], ['a'], true)).toBe('add')
  expect(resolveFaSelectInputChangeAction([], 'a', false)).toBe('add')
  expect(resolveFaSelectInputChangeAction(['a'], [], false)).toBe('remove')
  expect(resolveFaSelectInputChangeAction(['a', 'b'], ['a'], true)).toBe('remove')
  expect(resolveFaSelectInputChangeAction(['a'], ['b'], true)).toBe('replace')
  expect(resolveFaSelectInputChangeAction('', 'a', false)).toBe('add')
  expect(resolveFaSelectInputChangeAction('a', '', false)).toBe('remove')
  expect(resolveFaSelectInputChangeAction('a', 'b', false)).toBe('replace')
  expect(resolveFaSelectInputChangeAction(null, {
    id: '1',
    name: 'n'
  }, false)).toBe('add')
  expect(resolveFaSelectInputChangeAction({
    id: '1',
    name: 'n'
  }, null, false)).toBe('remove')
  expect(resolveFaSelectInputChangeAction('', 'a', true)).toBe('add')
  expect(resolveFaSelectInputChangeAction('a', '', true)).toBe('remove')
  expect(resolveFaSelectInputChangeAction('a', 'b', true)).toBe('replace')
  expect(resolveFaSelectInputChangeAction({
    id: '1',
    name: 'n'
  }, {
    id: '2',
    name: 'm'
  }, true)).toBe('replace')
  expect(resolveFaSelectInputChangeAction(null, {
    id: '1',
    name: 'n'
  }, true)).toBe('add')
  expect(resolveFaSelectInputChangeAction({
    id: '1',
    name: 'n'
  }, null, true)).toBe('remove')

  expect(createFaSelectInputChangePayload([], ['a'], true)).toEqual({
    action: 'add',
    value: ['a']
  })

  expect(appendFaSelectInputCreatedValue(['a'], 'b', true)).toEqual(['a', 'b'])
  expect(appendFaSelectInputCreatedValue(['a'], 'a', true)).toEqual(['a'])
  expect(appendFaSelectInputCreatedValue('x', 'b', true)).toEqual(['b'])
  expect(appendFaSelectInputCreatedValue(null, {
    id: '1',
    name: 'n',
    isNew: true
  }, false)).toEqual({
    id: '1',
    name: 'n',
    isNew: true
  })
  expect(appendFaSelectInputCreatedValue([{
    id: '1',
    name: 'n'
  }], {
    id: '1',
    name: 'dup-id'
  }, true)).toEqual([{
    id: '1',
    name: 'n'
  }])
  expect(appendFaSelectInputCreatedValue([{
    id: '1',
    name: 'n'
  }], {
    id: '2',
    name: 'n'
  }, true)).toEqual([{
    id: '1',
    name: 'n'
  }])
  expect(appendFaSelectInputCreatedValue([{
    id: '1',
    name: 'n'
  }], {
    id: '2',
    name: 'm'
  }, true)).toEqual([
    {
      id: '1',
      name: 'n'
    },
    {
      id: '2',
      name: 'm'
    }
  ])
  expect(appendFaSelectInputCreatedValue(null, {
    id: '2',
    name: 'm'
  }, true)).toEqual([{
    id: '2',
    name: 'm'
  }])
})

/**
 * shouldShowFaSelectInputSelectedChip
 * Empty single string / null / invalid hide chip; real values show.
 */
test('Test that shouldShowFaSelectInputSelectedChip hides empty single selection', () => {
  expect(shouldShowFaSelectInputSelectedChip('')).toBe(false)
  expect(shouldShowFaSelectInputSelectedChip(null)).toBe(false)
  expect(shouldShowFaSelectInputSelectedChip(undefined)).toBe(false)
  expect(shouldShowFaSelectInputSelectedChip('test 1')).toBe(true)
  expect(shouldShowFaSelectInputSelectedChip({
    id: '1',
    name: 'Doc'
  })).toBe(true)
  expect(shouldShowFaSelectInputSelectedChip({
    id: '1',
    name: '   '
  })).toBe(false)
  expect(shouldShowFaSelectInputSelectedChip([] as unknown as string)).toBe(false)
  expect(shouldShowFaSelectInputSelectedChip({
    id: '1',
    name: 1
  } as unknown as { id: string, name: string })).toBe(false)
})

/**
 * splitFaSelectInputLabelForFilterHighlight
 * Highlights whole words that contain the filter needle.
 */
test('Test that splitFaSelectInputLabelForFilterHighlight marks whole matching words', () => {
  expect(splitFaSelectInputLabelForFilterHighlight('Highlands', '')).toEqual([
    {
      isMatch: false,
      text: 'Highlands'
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight('', 'high')).toEqual([
    {
      isMatch: false,
      text: ''
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight('Highlands', '   ')).toEqual([
    {
      isMatch: false,
      text: 'Highlands'
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight('Highlands', 'high')).toEqual([
    {
      isMatch: true,
      text: 'Highlands'
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight(' Highlands ', 'high')).toEqual([
    {
      isMatch: false,
      text: ' '
    },
    {
      isMatch: true,
      text: 'Highlands'
    },
    {
      isMatch: false,
      text: ' '
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight('Highland Path', 'high')).toEqual([
    {
      isMatch: true,
      text: 'Highland'
    },
    {
      isMatch: false,
      text: ' '
    },
    {
      isMatch: false,
      text: 'Path'
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight('AbaB', 'ab')).toEqual([
    {
      isMatch: true,
      text: 'AbaB'
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight('Two Towers', 'tow')).toEqual([
    {
      isMatch: false,
      text: 'Two'
    },
    {
      isMatch: false,
      text: ' '
    },
    {
      isMatch: true,
      text: 'Towers'
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight('Two Towers', 'two tow')).toEqual([
    {
      isMatch: true,
      text: 'Two'
    },
    {
      isMatch: false,
      text: ' '
    },
    {
      isMatch: true,
      text: 'Towers'
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight('plain', 'zzz')).toEqual([
    {
      isMatch: false,
      text: 'plain'
    }
  ])
})
