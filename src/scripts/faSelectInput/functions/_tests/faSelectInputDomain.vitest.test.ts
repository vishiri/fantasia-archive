/** @vitest-environment node */
import { expect, test, vi } from 'vitest'

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
import {
  filterFaSelectInputOptionsByQuery,
  isFaSelectInputObjectItem,
  splitFaSelectInputLabelForFilterHighlight
} from '../filterFaSelectInputOptionsByQuery'
import { resolveFaSelectInputOptionIcon } from '../resolveFaSelectInputOptionIcon'
import { resolveFaSelectInputEnterActivateOption } from '../resolveFaSelectInputEnterActivateOption'
import {
  bindFaSelectInputOptionItemActivateProps,
  stripFaSelectInputOptionItemActiveClass
} from '../stripFaSelectInputOptionItemActiveClass'

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
 * filterFaSelectInputOptionsByQuery
 * FA 1.0 multi-token AND: each space-separated query word claims unused label words.
 */
test('Test that filterFaSelectInputOptionsByQuery matches FA 1.0 multi-word queries', () => {
  const items = [
    {
      id: '1',
      name: 'The Eldritch Dialogs'
    },
    {
      id: '2',
      name: 'Eldritch Deities'
    },
    {
      id: '3',
      name: 'Plain Name'
    },
    {
      id: '4',
      name: 'Eldritch Dialogs'
    }
  ] as const

  expect(filterFaSelectInputOptionsByQuery('el d', items)).toEqual([
    {
      id: '1',
      name: 'The Eldritch Dialogs'
    },
    {
      id: '2',
      name: 'Eldritch Deities'
    },
    {
      id: '4',
      name: 'Eldritch Dialogs'
    }
  ])
  expect(filterFaSelectInputOptionsByQuery('el d', items).map((item) => {
    return typeof item === 'string' ? item : item.name
  })).not.toContain('Plain Name')
  expect(filterFaSelectInputOptionsByQuery('eldritch dialogs', items)[0]).toEqual({
    id: '4',
    name: 'Eldritch Dialogs'
  })
  expect(filterFaSelectInputOptionsByQuery('red red', [
    {
      id: 'repeat',
      name: 'Red Red'
    },
    {
      id: 'once',
      name: 'Red Blue'
    }
  ])).toEqual([
    {
      id: 'repeat',
      name: 'Red Red'
    }
  ])
  expect(filterFaSelectInputOptionsByQuery('zzz apple pie', [
    {
      id: 'pie',
      name: 'apple pie'
    }
  ])).toEqual([])
})

/**
 * filterFaSelectInputOptionsByQuery
 * Id fallback is contiguous full needle only — not per-token UUID hex includes.
 */
test('Test that filterFaSelectInputOptionsByQuery does not false-match UUID hex tokens', () => {
  const items = [
    {
      id: 'c0af11de-1234-4abc-9def-000000000001',
      name: 'Events #9'
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      name: 'Afflictions / Boons / Conditions #11'
    },
    {
      id: 'uuid-match-af 11-end',
      name: 'other'
    }
  ] as const

  expect(filterFaSelectInputOptionsByQuery('af 11', items)).toEqual([
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      name: 'Afflictions / Boons / Conditions #11'
    },
    {
      id: 'uuid-match-af 11-end',
      name: 'other'
    }
  ])
})

/**
 * filterFaSelectInputOptionsByQuery
 * Ranks full-word hits above partial-only includes (FA 1.0 sort).
 */
test('Test that filterFaSelectInputOptionsByQuery ranks full-word matches above partial', () => {
  const items = [
    {
      id: '1',
      name: 'Superhero'
    },
    {
      id: '2',
      name: 'Hero'
    }
  ] as const

  expect(filterFaSelectInputOptionsByQuery('hero', items)).toEqual([
    {
      id: '2',
      name: 'Hero'
    },
    {
      id: '1',
      name: 'Superhero'
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
      color: '#112233',
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
      color: '#112233',
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
  expect(splitFaSelectInputLabelForFilterHighlight('The Eldritch Dialogs', 'el d')).toEqual([
    {
      isMatch: false,
      text: 'The'
    },
    {
      isMatch: false,
      text: ' '
    },
    {
      isMatch: true,
      text: 'Eldritch'
    },
    {
      isMatch: false,
      text: ' '
    },
    {
      isMatch: true,
      text: 'Dialogs'
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight('Eldritch Deities', 'el d')).toEqual([
    {
      isMatch: true,
      text: 'Eldritch'
    },
    {
      isMatch: false,
      text: ' '
    },
    {
      isMatch: true,
      text: 'Deities'
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight('plain', 'zzz')).toEqual([
    {
      isMatch: false,
      text: 'plain'
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight('Eldritch Dialogs', 'eldritch dialogs')).toEqual([
    {
      isMatch: true,
      text: 'Eldritch Dialogs'
    }
  ])
  expect(splitFaSelectInputLabelForFilterHighlight('  ', 'hero')).toEqual([
    {
      isMatch: false,
      text: '  '
    }
  ])
})

/**
 * resolveFaSelectInputOptionIcon
 * Document mode always shows a glyph; empty icon uses placeholder.
 */
test('Test that resolveFaSelectInputOptionIcon falls back in document mode', () => {
  expect(resolveFaSelectInputOptionIcon('plain', 'document', 'mdi-file-outline')).toBeNull()
  expect(resolveFaSelectInputOptionIcon({
    id: '1',
    name: 'Hero'
  }, 'document', 'mdi-file-outline')).toBe('mdi-file-outline')
  expect(resolveFaSelectInputOptionIcon({
    icon: '',
    id: '1',
    name: 'Hero'
  }, 'document', 'mdi-file-outline')).toBe('mdi-file-outline')
  expect(resolveFaSelectInputOptionIcon({
    icon: 'mdi-account',
    id: '1',
    name: 'Hero'
  }, 'document', 'mdi-file-outline')).toBe('mdi-account')
})

/**
 * resolveFaSelectInputOptionIcon
 * Non-document object modes hide when icon key is absent.
 */
test('Test that resolveFaSelectInputOptionIcon hides absent icons outside document mode', () => {
  expect(resolveFaSelectInputOptionIcon({
    id: '1',
    name: 'Tag'
  }, 'tags', 'mdi-file-outline')).toBeNull()
  expect(resolveFaSelectInputOptionIcon({
    icon: '  ',
    id: '1',
    name: 'Tag'
  }, 'tags', 'mdi-file-outline')).toBe('mdi-file-outline')
  expect(resolveFaSelectInputOptionIcon({
    icon: '  mdi-tag  ',
    id: '1',
    name: 'Tag'
  }, 'tags', 'mdi-file-outline')).toBe('mdi-tag')
})

/**
 * resolveFaSelectInputEnterActivateOption
 * Prefer highlighted index; fall back to single model match in filtered options.
 */
test('Test that resolveFaSelectInputEnterActivateOption prefers index then model', () => {
  expect(resolveFaSelectInputEnterActivateOption({
    filteredOptions: ['Mars', 'Venus'],
    getOptionIndex: () => 1,
    modelValue: 'Mars'
  })).toBe('Venus')

  expect(resolveFaSelectInputEnterActivateOption({
    filteredOptions: ['Mars', 'Venus'],
    getOptionIndex: () => -1,
    modelValue: 'Venus'
  })).toBe('Venus')

  expect(resolveFaSelectInputEnterActivateOption({
    filteredOptions: ['Mars', 'Venus'],
    getOptionIndex: () => -1,
    modelValue: null
  })).toBeUndefined()

  const worldA = {
    id: 'world-a',
    name: 'Alpha'
  }
  const worldB = {
    id: 'world-b',
    name: 'Beta'
  }
  expect(resolveFaSelectInputEnterActivateOption({
    filteredOptions: [worldA, worldB],
    getOptionIndex: () => 99,
    modelValue: {
      id: 'world-b',
      name: 'Beta renamed'
    }
  })).toEqual(worldB)

  expect(resolveFaSelectInputEnterActivateOption({
    filteredOptions: [worldA, worldB],
    getOptionIndex: () => -1,
    modelValue: [worldA]
  })).toBeUndefined()
})

/**
 * stripFaSelectInputOptionItemActiveClass
 * Removes Quasar text-{color} activeClass; keeps other itemProps.
 */
test('Test that stripFaSelectInputOptionItemActiveClass drops activeClass only', () => {
  expect(stripFaSelectInputOptionItemActiveClass({
    active: true,
    activeClass: 'text-primary-bright',
    clickable: true
  })).toEqual({
    active: true,
    clickable: true
  })
  expect(stripFaSelectInputOptionItemActiveClass({
    clickable: true
  })).toEqual({
    clickable: true
  })
})

/**
 * bindFaSelectInputOptionItemActivateProps
 * Keeps Quasar onClick and always runs onActivate (reselect path).
 */
test('Test that bindFaSelectInputOptionItemActivateProps wraps onClick and strips activeClass', () => {
  const previousOnClick = vi.fn()
  const onActivate = vi.fn()
  const bound = bindFaSelectInputOptionItemActivateProps({
    active: true,
    activeClass: 'text-primary-bright',
    onClick: previousOnClick
  }, onActivate)

  expect(bound).not.toHaveProperty('activeClass')
  const evt = new Event('click')
  bound.onClick(evt)
  expect(previousOnClick).toHaveBeenCalledWith(evt)
  expect(onActivate).toHaveBeenCalledTimes(1)
})

/**
 * bindFaSelectInputOptionItemActivateProps
 * skipQuasarSelect runs only onActivate (stay-open menus keep filter).
 */
test('Test that bindFaSelectInputOptionItemActivateProps can skip Quasar select', () => {
  const previousOnClick = vi.fn()
  const onActivate = vi.fn()
  const bound = bindFaSelectInputOptionItemActivateProps({
    onClick: previousOnClick
  }, onActivate, { skipQuasarSelect: true })

  const evt = new Event('click')
  bound.onClick(evt)
  expect(previousOnClick).not.toHaveBeenCalled()
  expect(onActivate).toHaveBeenCalledTimes(1)
})

/**
 * bindFaSelectInputOptionItemActivateProps
 * Middle/right mouse must not select the option (trailing actions use auxclick).
 */
test('Test that bindFaSelectInputOptionItemActivateProps ignores non-primary mouse buttons', () => {
  const previousOnClick = vi.fn()
  const onActivate = vi.fn()
  const bound = bindFaSelectInputOptionItemActivateProps({
    onClick: previousOnClick
  }, onActivate)

  bound.onClick({
    button: 1,
    type: 'auxclick'
  } as unknown as Event)
  bound.onClick({
    button: 2,
    type: 'click'
  } as unknown as Event)
  expect(previousOnClick).not.toHaveBeenCalled()
  expect(onActivate).not.toHaveBeenCalled()
})

/**
 * bindFaSelectInputOptionItemActivateProps
 * Still emits onActivate when Quasar itemProps omit onClick.
 */
test('Test that bindFaSelectInputOptionItemActivateProps runs onActivate without prior onClick', () => {
  const onActivate = vi.fn()
  const bound = bindFaSelectInputOptionItemActivateProps({
    active: false
  }, onActivate)

  bound.onClick(new Event('click'))
  expect(onActivate).toHaveBeenCalledTimes(1)
})

/**
 * bindFaSelectInputOptionItemActivateProps
 * Enter on a portaled option row activates (menu Teleport never bubbles to q-select).
 */
test('Test that bindFaSelectInputOptionItemActivateProps Enter keydown activates option', () => {
  const previousOnClick = vi.fn()
  const previousOnKeydown = vi.fn()
  const onActivate = vi.fn()
  const bound = bindFaSelectInputOptionItemActivateProps({
    onClick: previousOnClick,
    onKeydown: previousOnKeydown
  }, onActivate)

  const enterEvent = {
    key: 'Enter'
  } as unknown as Event
  bound.onKeydown(enterEvent)
  expect(previousOnKeydown).not.toHaveBeenCalled()
  expect(previousOnClick).toHaveBeenCalledWith(enterEvent)
  expect(onActivate).toHaveBeenCalledTimes(1)

  onActivate.mockClear()
  previousOnClick.mockClear()
  const arrowEvent = {
    key: 'ArrowDown'
  } as unknown as Event
  bound.onKeydown(arrowEvent)
  expect(previousOnKeydown).toHaveBeenCalledWith(arrowEvent)
  expect(previousOnClick).not.toHaveBeenCalled()
  expect(onActivate).not.toHaveBeenCalled()
})

/**
 * bindFaSelectInputOptionItemActivateProps
 * activateOnly Enter skips Quasar onClick and still activates.
 */
test('Test that bindFaSelectInputOptionItemActivateProps Enter can skip Quasar select', () => {
  const previousOnClick = vi.fn()
  const onActivate = vi.fn()
  const bound = bindFaSelectInputOptionItemActivateProps({
    onClick: previousOnClick
  }, onActivate, { skipQuasarSelect: true })

  const enterEvent = {
    key: 'Enter',
    preventDefault: vi.fn()
  }
  bound.onKeydown(enterEvent as unknown as Event)
  expect(previousOnClick).not.toHaveBeenCalled()
  expect(onActivate).toHaveBeenCalledTimes(1)
  expect(enterEvent.preventDefault).toHaveBeenCalledTimes(1)
})
