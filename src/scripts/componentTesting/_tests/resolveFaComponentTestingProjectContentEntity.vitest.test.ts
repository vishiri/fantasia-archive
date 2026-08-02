import { describe, expect, test } from 'vitest'

import {
  hasFaComponentTestingProjectContentOverrides,
  resolveFaComponentTestingProjectContentEntity
} from '../functions/resolveFaComponentTestingProjectContentEntity'

describe('resolveFaComponentTestingProjectContentEntity', () => {
  test('Test that resolveFaComponentTestingProjectContentEntity returns undefined for missing map', () => {
    expect(resolveFaComponentTestingProjectContentEntity(undefined, 'doc-1')).toBeUndefined()
  })

  test('Test that resolveFaComponentTestingProjectContentEntity returns seeded entity by id', () => {
    expect(resolveFaComponentTestingProjectContentEntity({
      'doc-1': { id: 'doc-1' }
    }, 'doc-1')).toEqual({ id: 'doc-1' })
  })

  test('Test that hasFaComponentTestingProjectContentOverrides is false for null', () => {
    expect(hasFaComponentTestingProjectContentOverrides(null)).toBe(false)
  })

  test('Test that resolveFaComponentTestingProjectContentEntity returns undefined for missing id', () => {
    expect(resolveFaComponentTestingProjectContentEntity({
      'doc-1': { id: 'doc-1' }
    }, 'doc-missing')).toBeUndefined()
  })

  test('Test that hasFaComponentTestingProjectContentOverrides is false for empty override object', () => {
    expect(hasFaComponentTestingProjectContentOverrides({})).toBe(false)
  })

  test('Test that hasFaComponentTestingProjectContentOverrides is true when templates map set', () => {
    expect(hasFaComponentTestingProjectContentOverrides({
      templatesById: {}
    })).toBe(true)
  })

  test('Test that hasFaComponentTestingProjectContentOverrides is true when worlds map set', () => {
    expect(hasFaComponentTestingProjectContentOverrides({
      worldsById: {}
    })).toBe(true)
  })
})
