import { describe, expect, test, vi } from 'vitest'

import {
  hasAnyDialogProjectSettingsWorldTemplatePlacement,
  hasAnyFaProjectWorldTemplatePlacement,
  resolveHideHierarchyTreeAfterEmptyWorldTemplateGate,
  syncHideHierarchyTreeWhenNoWorldTemplatePlacements
} from '../faProjectWorldTemplatePlacementHideHierarchyTree'

describe('hasAnyFaProjectWorldTemplatePlacement', () => {
  test('Test that hasAnyFaProjectWorldTemplatePlacement is false for empty worlds', () => {
    expect(hasAnyFaProjectWorldTemplatePlacement([])).toBe(false)
    expect(hasAnyFaProjectWorldTemplatePlacement([{ placements: [] }])).toBe(false)
  })

  test('Test that hasAnyFaProjectWorldTemplatePlacement is true when any world has placements', () => {
    expect(
      hasAnyFaProjectWorldTemplatePlacement([
        { placements: [] },
        { placements: [{ id: 'p1' }] }
      ])
    ).toBe(true)
  })
})

describe('hasAnyDialogProjectSettingsWorldTemplatePlacement', () => {
  test('Test that hasAnyDialogProjectSettingsWorldTemplatePlacement reads templateLayout.placements', () => {
    expect(
      hasAnyDialogProjectSettingsWorldTemplatePlacement([
        { templateLayout: { placements: [] } }
      ])
    ).toBe(false)
    expect(
      hasAnyDialogProjectSettingsWorldTemplatePlacement([
        { templateLayout: { placements: [{ id: 'p1' }] } }
      ])
    ).toBe(true)
  })
})

describe('resolveHideHierarchyTreeAfterEmptyWorldTemplateGate', () => {
  test('Test that resolveHideHierarchyTreeAfterEmptyWorldTemplateGate returns null when dialog opened with placements', () => {
    expect(
      resolveHideHierarchyTreeAfterEmptyWorldTemplateGate({
        hadPlacementsBeforeDialogOpen: true,
        hasPlacementsAfterSave: false
      })
    ).toBeNull()
  })

  test('Test that resolveHideHierarchyTreeAfterEmptyWorldTemplateGate hides when still empty after save', () => {
    expect(
      resolveHideHierarchyTreeAfterEmptyWorldTemplateGate({
        hadPlacementsBeforeDialogOpen: false,
        hasPlacementsAfterSave: false
      })
    ).toBe(true)
  })

  test('Test that resolveHideHierarchyTreeAfterEmptyWorldTemplateGate shows when placements added', () => {
    expect(
      resolveHideHierarchyTreeAfterEmptyWorldTemplateGate({
        hadPlacementsBeforeDialogOpen: false,
        hasPlacementsAfterSave: true
      })
    ).toBe(false)
  })
})

describe('syncHideHierarchyTreeWhenNoWorldTemplatePlacements', () => {
  test('Test that syncHideHierarchyTreeWhenNoWorldTemplatePlacements patches hide when empty', async () => {
    const patchHideHierarchyTree = vi.fn(async () => undefined)
    const refreshLayout = vi.fn(async () => undefined)
    await syncHideHierarchyTreeWhenNoWorldTemplatePlacements({
      getHideHierarchyTree: () => false,
      getWorlds: () => [{ placements: [] }],
      patchHideHierarchyTree,
      refreshLayout
    })
    expect(refreshLayout).toHaveBeenCalledTimes(1)
    expect(patchHideHierarchyTree).toHaveBeenCalledWith(true)
  })

  test('Test that syncHideHierarchyTreeWhenNoWorldTemplatePlacements skips when placements exist', async () => {
    const patchHideHierarchyTree = vi.fn(async () => undefined)
    await syncHideHierarchyTreeWhenNoWorldTemplatePlacements({
      getHideHierarchyTree: () => false,
      getWorlds: () => [{ placements: [{ id: 'p1' }] }],
      patchHideHierarchyTree,
      refreshLayout: async () => undefined
    })
    expect(patchHideHierarchyTree).not.toHaveBeenCalled()
  })

  test('Test that syncHideHierarchyTreeWhenNoWorldTemplatePlacements skips when already hidden', async () => {
    const patchHideHierarchyTree = vi.fn(async () => undefined)
    await syncHideHierarchyTreeWhenNoWorldTemplatePlacements({
      getHideHierarchyTree: () => true,
      getWorlds: () => [{ placements: [] }],
      patchHideHierarchyTree,
      refreshLayout: async () => undefined
    })
    expect(patchHideHierarchyTree).not.toHaveBeenCalled()
  })

  test('Test that syncHideHierarchyTreeWhenNoWorldTemplatePlacements skips when the project changed during refresh', async () => {
    const patchHideHierarchyTree = vi.fn(async () => undefined)
    await syncHideHierarchyTreeWhenNoWorldTemplatePlacements({
      getHideHierarchyTree: () => false,
      getWorlds: () => [{ placements: [] }],
      patchHideHierarchyTree,
      projectStillCurrent: () => false,
      refreshLayout: async () => undefined
    })
    expect(patchHideHierarchyTree).not.toHaveBeenCalled()
  })
})
