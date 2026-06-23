import { expect, type Page } from '@playwright/test'

import {
  assertSaveEnabledWithoutErrorsIcon,
  clearVerticalTabFilter,
  openFaLocaleTranslationsMenu,
  setLocaleTranslation,
  setSingularPluralTranslation
} from 'app/helpers/playwrightHelpers_component/dialogProjectSettingsPlaywrightHelpers'
import {
  clickWorldTabByLabel,
  dragLayoutTreeNode,
  dragPaletteSwatch,
  dragVerticalTab,
  openWorldColorPickerMenu,
  setOpenColorPickerHex,
  setPaletteSwatchHex
} from 'app/helpers/playwrightHelpers_component/dialogProjectSettingsPlaywrightColorAndDragHelpers'
import {
  E2E_PROJECT_SETTINGS_PHASE1_MANIFEST,
  E2E_PROJECT_SETTINGS_PHASE2_MANIFEST
} from 'app/helpers/playwrightHelpers_e2e/e2eDialogProjectSettingsManifestData'
import L_projectSettings from 'app/i18n/en-US/dialogs/L_projectSettings'
import type {
  T_e2eLayoutGroupNode,
  T_e2eLayoutNodeManifest,
  T_e2eLayoutTemplateNode,
  T_e2eProjectSettingsManifest,
  T_e2eTemplateManifestEntry,
  T_e2eWorldManifestEntry
} from 'app/types/T_e2eProjectSettingsManifest'
import { E2E_PROJECT_SETTINGS_SELECTOR_LIST } from 'app/types/T_e2eProjectSettingsManifest'

export {
  E2E_PROJECT_SETTINGS_PHASE1_MANIFEST,
  E2E_PROJECT_SETTINGS_PHASE2_MANIFEST,
  E2E_PROJECT_SETTINGS_SELECTOR_LIST
}

const selectorList = E2E_PROJECT_SETTINGS_SELECTOR_LIST

function treeNodeLocator (kind: 'group' | 'template', nodeId: string): string {
  return `[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-${kind}-${nodeId}"]`
}

function treeNodeShellLocator (kind: 'group' | 'template', nodeId: string): string {
  return `.dialogProjectSettingsWorldTemplateLayoutTree .tree-node:has(${treeNodeLocator(kind, nodeId)})`
}

function treeRowLocator (): string {
  return '.dialogProjectSettingsWorldTemplateLayoutTreeNode.column[data-test-locator^="dialogProjectSettings-worldTemplateLayoutTreeNode-"]'
}

async function waitForProjectSettingsDialogHydrated (page: Page): Promise<void> {
  await expect(
    page.locator(`[data-test-locator="${selectorList.projectNameInput}"]`)
  ).toBeVisible({ timeout: 30_000 })
}

async function openDocumentTemplatesCategory (
  page: Page,
  expectedTabCount: number
): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.tabDocumentTemplatesSettings}"]`).click()
  await expect(async () => {
    const addFirstButton = page.locator(
      `[data-test-locator="${selectorList.documentTemplatesAddFirstButton}"]`
    )
    const templateList = page.locator(
      '[data-test-locator="dialogProjectSettings-documentTemplates-list"]'
    )
    const addFirstVisible = await addFirstButton.isVisible()
    const listVisible = await templateList.isVisible()
    expect(addFirstVisible || listVisible).toBe(true)
  }).toPass({ timeout: 30_000 })

  if (expectedTabCount === 0) {
    return
  }

  const addFirstButton = page.locator(
    `[data-test-locator="${selectorList.documentTemplatesAddFirstButton}"]`
  )
  if (await addFirstButton.isVisible()) {
    return
  }

  const filterClear = page.locator('[data-test-locator="dialogProjectSettings-documentTemplatesFilterClear"]')
  if (await filterClear.isVisible()) {
    await clearVerticalTabFilter(page, 'dialogProjectSettings-documentTemplatesFilterClear')
  }
  await expect(
    page.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`)
  ).toHaveCount(expectedTabCount, { timeout: 30_000 })
}

async function openWorldsCategory (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
  await expect(
    page.locator(`[data-test-locator="${selectorList.worldsTab}"]`).first()
  ).toBeVisible({ timeout: 30_000 })
}

async function readTemplateTabIds (page: Page): Promise<string[]> {
  const tabs = page.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`)
  const count = await tabs.count()
  const ids: string[] = []
  for (let index = 0; index < count; index += 1) {
    const id = await tabs.nth(index).getAttribute('data-test-template-id')
    if (id !== null) {
      ids.push(id)
    }
  }
  return ids
}

async function readWorldTabIds (page: Page): Promise<string[]> {
  const tabs = page.locator(`[data-test-locator="${selectorList.worldsTab}"]`)
  const count = await tabs.count()
  const ids: string[] = []
  for (let index = 0; index < count; index += 1) {
    const id = await tabs.nth(index).getAttribute('data-test-world-id')
    if (id !== null) {
      ids.push(id)
    }
  }
  return ids
}

async function extractTreeNodeIdFromRow (
  row: ReturnType<Page['locator']>,
  kind: 'group' | 'template'
): Promise<string> {
  const locatorValue = await row.getAttribute('data-test-locator')
  const match = locatorValue?.match(new RegExp(`${kind}-(.+)$`))
  expect(match?.[1]).toBeTruthy()
  return match?.[1] ?? ''
}

async function readTreeNodePaddingLeftPx (page: Page, shellLocator: string): Promise<number> {
  return page.locator(shellLocator).first().evaluate((element) => {
    const treeNode = element.closest('.tree-node')
    if (treeNode === null) {
      return 0
    }
    return Number.parseFloat(window.getComputedStyle(treeNode).paddingLeft) || 0
  })
}

async function findTemplatePlacementByTabLabel (
  page: Page,
  tabLabel: string
): Promise<string> {
  const rows = page.locator(treeRowLocator())
  const count = await rows.count()
  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index)
    const locatorValue = await row.getAttribute('data-test-locator')
    if (locatorValue?.includes('-template-') !== true) {
      continue
    }
    const text = await row.innerText()
    if (text.includes(tabLabel)) {
      return extractTreeNodeIdFromRow(row, 'template')
    }
  }
  throw new Error(`Template placement not found for tab label: ${tabLabel}`)
}

async function findGroupPlacementByName (
  page: Page,
  groupName: string
): Promise<string> {
  const rows = page.locator(treeRowLocator())
  const count = await rows.count()
  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index)
    const locatorValue = await row.getAttribute('data-test-locator')
    if (locatorValue?.includes('-group-') !== true) {
      continue
    }
    const text = await row.innerText()
    if (text.includes(groupName)) {
      return extractTreeNodeIdFromRow(row, 'group')
    }
  }
  throw new Error(`Group placement not found for name: ${groupName}`)
}

async function setDocumentTemplateIcon (
  page: Page,
  searchTerm: string,
  iconName: string
): Promise<void> {
  const iconTrigger = page.locator(`[data-test-locator="${selectorList.documentTemplatesIconTrigger}"]`)
  const iconMenuPanel = page.locator('.faIconPickerInput__menuPanel')
  const iconMenuSearch = page.locator(
    `[data-test-locator="${selectorList.documentTemplatesIconInput}-menu-search"]`
  )
  await expect(async () => {
    await iconTrigger.click()
    await expect(iconMenuSearch).toBeVisible()
    await iconMenuSearch.fill(searchTerm)
    const cell = iconMenuPanel.locator(`[data-test-icon-name="${iconName}"]`)
    await expect(cell).toBeVisible()
    await cell.click()
    await expect(iconTrigger).toHaveAttribute('data-test-icon-name', iconName)
  }).toPass({ timeout: 45_000 })
}

async function configureDocumentTemplate (
  page: Page,
  index: number,
  entry: T_e2eTemplateManifestEntry
): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`).nth(index).click()
  await openFaLocaleTranslationsMenu(page, selectorList.documentTemplatesNameInput)
  await setSingularPluralTranslation(page, selectorList.documentTemplatesNameInput, 'en-US', {
    plural: entry.titles.enUS.plural,
    singular: entry.titles.enUS.singular
  })
  if (entry.titles.de?.singular !== undefined || entry.titles.de?.plural !== undefined) {
    await setSingularPluralTranslation(page, selectorList.documentTemplatesNameInput, 'de', {
      plural: entry.titles.de.plural,
      singular: entry.titles.de.singular
    })
  }
  await page.keyboard.press('Escape')

  await openFaLocaleTranslationsMenu(page, selectorList.documentTemplatesWorldAppendixInput)
  await setLocaleTranslation(page, selectorList.documentTemplatesWorldAppendixInput, 'en-US', entry.appendix.enUS)
  if (entry.appendix.de !== undefined) {
    await setLocaleTranslation(page, selectorList.documentTemplatesWorldAppendixInput, 'de', entry.appendix.de)
  }
  await page.keyboard.press('Escape')

  await setDocumentTemplateIcon(page, entry.iconSearchTerm, entry.icon)
}

async function setWorldColorAndPalette (
  page: Page,
  worldColor: string,
  paletteHexes: string[]
): Promise<void> {
  await openWorldColorPickerMenu(page)
  await setOpenColorPickerHex(page, 'dialogProjectSettings-worlds-colorInput-picker', worldColor)
  await page.keyboard.press('Escape')

  const paletteAdd = page.locator(`[data-test-locator="${selectorList.colorPaletteAddButton}"]`)
  for (let index = 0; index < paletteHexes.length; index += 1) {
    await paletteAdd.click()
  }
  for (let index = 0; index < paletteHexes.length; index += 1) {
    await setPaletteSwatchHex(page, index, paletteHexes[index] ?? '')
  }
}

async function renameGroupViaContextMenu (
  page: Page,
  groupId: string,
  name: T_e2eLayoutGroupNode['name']
): Promise<void> {
  const groupNode = page.locator(treeNodeLocator('group', groupId))
  const groupRenameMenu = page.locator(
    '[data-test-locator="dialogProjectSettings-worldTemplateLayoutGroupContextMenu"]'
  )
  await groupNode.scrollIntoViewIfNeeded()
  await groupNode.evaluate((element) => {
    element.dispatchEvent(new MouseEvent('contextmenu', {
      bubbles: true,
      button: 2,
      cancelable: true
    }))
  })
  await expect(groupRenameMenu).toBeVisible()
  await setLocaleTranslation(page, selectorList.groupRenameInput, 'en-US', name.enUS)
  if (name.de !== undefined) {
    await setLocaleTranslation(page, selectorList.groupRenameInput, 'de', name.de)
  }
  await page.getByRole('textbox', {
    exact: true,
    name: 'English, US'
  }).first().press('Enter')
}

async function setPlacementNickname (
  page: Page,
  placementId: string,
  nickname: NonNullable<T_e2eLayoutTemplateNode['nickname']>
): Promise<void> {
  const placementNode = page.locator(treeNodeLocator('template', placementId))
  await placementNode.locator('[data-test-locator$="-edit"]').click()
  await setSingularPluralTranslation(page, selectorList.templateRenameInput, 'en-US', {
    plural: nickname.enUS.plural,
    singular: nickname.enUS.singular
  })
  if (nickname.de?.singular !== undefined || nickname.de?.plural !== undefined) {
    await setSingularPluralTranslation(page, selectorList.templateRenameInput, 'de', {
      plural: nickname.de.plural,
      singular: nickname.de.singular
    })
  }
  await page.getByRole('textbox', {
    exact: true,
    name: 'English, US'
  }).first().press('Enter')
}

async function readTreeNodeContentBoxLeft (page: Page, shellLocator: string): Promise<number> {
  const box = await page.locator(shellLocator).first().boundingBox()
  return box?.x ?? 0
}

async function isTemplateVisuallyNestedUnderGroup (
  page: Page,
  groupId: string,
  placementId: string
): Promise<boolean> {
  const groupShell = treeNodeShellLocator('group', groupId)
  const templateShell = treeNodeShellLocator('template', placementId)
  await expect(page.locator(groupShell)).toHaveCount(1)
  await expect(page.locator(templateShell)).toHaveCount(1)
  const groupLeft = await readTreeNodeContentBoxLeft(page, groupShell)
  const templateLeft = await readTreeNodeContentBoxLeft(page, templateShell)
  return templateLeft > groupLeft + 20
}

async function reorderLayoutToMatchManifest (
  page: Page,
  layout: T_e2eLayoutNodeManifest[]
): Promise<void> {
  const expectedRootLabels = layout.map((node) => {
    if (node.type === 'group') {
      return node.name.enUS
    }
    if (node.nickname !== undefined) {
      return node.nickname.enUS.singular
    }
    return node.tabLabel
  })

  await expect(async () => {
    const rootShells = await readRootLevelTreeShells(page)
    const currentLabels = await readShellLabels(page, rootShells)
    if (arraysEqual(currentLabels, expectedRootLabels)) {
      return
    }
    if (rootShells.length < 2) {
      return
    }
    const lastShell = rootShells[rootShells.length - 1]
    const firstShell = rootShells[0]
    if (lastShell !== undefined && firstShell !== undefined) {
      await dragLayoutTreeNode(page, lastShell, firstShell, 'insert-before-target')
    }
  }).toPass({ timeout: 60_000 })
}

function arraysEqual (left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false
  }
  return left.every((value, index) => value.includes(right[index] ?? '') || (right[index] ?? '').includes(value))
}

async function readShellLabels (page: Page, shells: string[]): Promise<string[]> {
  const labels: string[] = []
  for (const shell of shells) {
    const text = await page.locator(shell).first().innerText()
    labels.push(text.trim())
  }
  return labels
}

async function readRootLevelTreeShells (page: Page): Promise<string[]> {
  const rows = page.locator(treeRowLocator())
  const count = await rows.count()
  const shells: Array<{ pad: number, shell: string }> = []
  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index)
    const locatorValue = await row.getAttribute('data-test-locator')
    const kind = locatorValue?.includes('-group-') === true ? 'group' : 'template'
    const nodeId = await extractTreeNodeIdFromRow(row, kind)
    const shell = treeNodeShellLocator(kind, nodeId)
    const pad = await readTreeNodePaddingLeftPx(page, shell)
    shells.push({
      pad,
      shell
    })
  }
  if (shells.length === 0) {
    return []
  }
  const minPad = Math.min(...shells.map((entry) => entry.pad))
  return shells.filter((entry) => entry.pad === minPad).map((entry) => entry.shell)
}

async function seedWorld (
  page: Page,
  world: T_e2eWorldManifestEntry
): Promise<void> {
  await clickWorldTabByLabel(page, world.tabLabel)
  if (world.paletteHexes.length > 0) {
    await setWorldColorAndPalette(page, world.worldColor, world.paletteHexes)
  }
}

/**
 * Fills Project Settings UI to match a phase manifest (idempotent where possible).
 */
export async function seedProjectSettingsPhase1 (
  page: Page,
  manifest: T_e2eProjectSettingsManifest = E2E_PROJECT_SETTINGS_PHASE1_MANIFEST
): Promise<void> {
  await waitForProjectSettingsDialogHydrated(page)
  await page.locator(`[data-test-locator="${selectorList.tabGeneralSettings}"]`).click()
  const nameInput = page.locator(`[data-test-locator="${selectorList.projectNameInput}"]`)
  await nameInput.fill(manifest.projectName)

  await openDocumentTemplatesCategory(page, 0)
  const addFirst = page.locator(`[data-test-locator="${selectorList.documentTemplatesAddFirstButton}"]`)
  if (await addFirst.isVisible()) {
    await addFirst.click()
    const addButton = page.locator(`[data-test-locator="${selectorList.documentTemplatesAddButton}"]`)
    for (let index = 1; index < manifest.templates.length; index += 1) {
      await addButton.click()
    }
  }
  await openDocumentTemplatesCategory(page, manifest.templates.length)

  for (let index = 0; index < manifest.templates.length; index += 1) {
    const entry = manifest.templates[index]
    if (entry === undefined) {
      continue
    }
    await configureDocumentTemplate(page, index, entry)
  }

  await openWorldsCategory(page)
  const worldTabs = page.locator(`[data-test-locator="${selectorList.worldsTab}"]`)
  const initialWorldCount = await worldTabs.count()
  const worldsToAdd = manifest.worlds.length - initialWorldCount
  const addWorldButton = page.locator(`[data-test-locator="${selectorList.worldsAddButton}"]`)
  for (let index = 0; index < worldsToAdd; index += 1) {
    await addWorldButton.click()
  }
  await expect(worldTabs).toHaveCount(manifest.worlds.length, { timeout: 30_000 })

  const bootstrapWorldTab = worldTabs.first()
  await bootstrapWorldTab.click()
  await openFaLocaleTranslationsMenu(page, selectorList.worldsNameInput)
  await setLocaleTranslation(page, selectorList.worldsNameInput, 'en-US', manifest.worlds[0]?.names.enUS ?? '')
  if (manifest.worlds[0]?.names.de !== undefined) {
    await setLocaleTranslation(page, selectorList.worldsNameInput, 'de', manifest.worlds[0].names.de)
  }
  await page.keyboard.press('Escape')

  for (let index = 1; index < manifest.worlds.length; index += 1) {
    const world = manifest.worlds[index]
    if (world === undefined) {
      continue
    }
    const newWorldTab = worldTabs.nth(index)
    await newWorldTab.click()
    await openFaLocaleTranslationsMenu(page, selectorList.worldsNameInput)
    await setLocaleTranslation(page, selectorList.worldsNameInput, 'en-US', world.names.enUS)
    if (world.names.de !== undefined) {
      await setLocaleTranslation(page, selectorList.worldsNameInput, 'de', world.names.de)
    }
    await page.keyboard.press('Escape')
  }

  for (const world of manifest.worlds) {
    await seedWorld(page, world)
  }

  await assertSaveEnabledWithoutErrorsIcon(page)
}

async function reverseVerticalTabOrder (
  page: Page,
  tabLocator: string,
  idAttribute: 'data-test-template-id' | 'data-test-world-id'
): Promise<void> {
  const initialIds = idAttribute === 'data-test-template-id'
    ? await readTemplateTabIds(page)
    : await readWorldTabIds(page)
  const reverseSteps = initialIds.length - 1
  for (let step = 0; step < reverseSteps; step += 1) {
    const ids = idAttribute === 'data-test-template-id'
      ? await readTemplateTabIds(page)
      : await readWorldTabIds(page)
    if (ids.length < 2) {
      break
    }
    const lastId = ids[ids.length - 1]
    const firstId = ids[0]
    if (lastId === undefined || firstId === undefined) {
      break
    }
    await dragVerticalTab(page, idAttribute, lastId, firstId, tabLocator)
  }
}

async function reversePaletteSwatchOrder (page: Page): Promise<void> {
  const swatches = page.locator(`[data-test-locator="${selectorList.colorPaletteSwatch}"]`)
  const initialCount = await swatches.count()
  for (let step = 0; step < initialCount - 1; step += 1) {
    const currentCount = await swatches.count()
    if (currentCount < 2) {
      break
    }
    await dragPaletteSwatch(page, currentCount - 1, 0)
  }
}

async function reverseLayoutRootSiblingOrder (page: Page): Promise<void> {
  await expect(async () => {
    const rootShells = await readRootLevelTreeShells(page)
    if (rootShells.length < 2) {
      return
    }
    const lastShell = rootShells[rootShells.length - 1]
    const firstShell = rootShells[0]
    if (lastShell !== undefined && firstShell !== undefined) {
      await dragLayoutTreeNode(page, lastShell, firstShell, 'insert-before-target')
    }
  }).toPass({ timeout: 60_000 })
}

async function updateTemplateAtIndex (
  page: Page,
  index: number,
  entry: T_e2eTemplateManifestEntry
): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`).nth(index).click()
  await openFaLocaleTranslationsMenu(page, selectorList.documentTemplatesNameInput)
  await setSingularPluralTranslation(page, selectorList.documentTemplatesNameInput, 'en-US', {
    plural: entry.titles.enUS.plural,
    singular: entry.titles.enUS.singular
  })
  if (entry.titles.de?.singular !== undefined || entry.titles.de?.plural !== undefined) {
    await setSingularPluralTranslation(page, selectorList.documentTemplatesNameInput, 'de', {
      plural: entry.titles.de.plural,
      singular: entry.titles.de.singular
    })
  }
  await page.keyboard.press('Escape')

  await openFaLocaleTranslationsMenu(page, selectorList.documentTemplatesWorldAppendixInput)
  await setLocaleTranslation(page, selectorList.documentTemplatesWorldAppendixInput, 'en-US', entry.appendix.enUS)
  if (entry.appendix.de !== undefined) {
    await setLocaleTranslation(page, selectorList.documentTemplatesWorldAppendixInput, 'de', entry.appendix.de)
  }
  await page.keyboard.press('Escape')

  await setDocumentTemplateIcon(page, entry.iconSearchTerm, entry.icon)
}

async function updateWorldAtIndex (
  page: Page,
  index: number,
  world: T_e2eWorldManifestEntry
): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.worldsTab}"]`).nth(index).click()
  await openFaLocaleTranslationsMenu(page, selectorList.worldsNameInput)
  await setLocaleTranslation(page, selectorList.worldsNameInput, 'en-US', world.names.enUS)
  if (world.names.de !== undefined) {
    await setLocaleTranslation(page, selectorList.worldsNameInput, 'de', world.names.de)
  }
  await page.keyboard.press('Escape')

  await openWorldColorPickerMenu(page)
  await setOpenColorPickerHex(page, 'dialogProjectSettings-worlds-colorInput-picker', world.worldColor)
  await page.keyboard.press('Escape')

  const swatchCount = await page.locator(`[data-test-locator="${selectorList.colorPaletteSwatch}"]`).count()
  for (let swatchIndex = 0; swatchIndex < world.paletteHexes.length; swatchIndex += 1) {
    if (swatchIndex < swatchCount) {
      await setPaletteSwatchHex(page, swatchIndex, world.paletteHexes[swatchIndex] ?? '')
    }
  }

  await applyWorldLayoutValues(page, world.layout)
}

async function applyWorldLayoutValues (
  page: Page,
  layout: T_e2eLayoutNodeManifest[]
): Promise<void> {
  for (const node of layout) {
    if (node.type === 'group') {
      const groupId = await findGroupPlacementByName(page, node.name.enUS)
      await renameGroupViaContextMenu(page, groupId, node.name)
      for (const child of node.children) {
        const placementId = await findTemplatePlacementByTabLabel(page, child.tabLabel)
        if (child.nickname !== undefined) {
          await setPlacementNickname(page, placementId, child.nickname)
        }
      }
      continue
    }
    const placementId = await findTemplatePlacementByTabLabel(page, node.tabLabel)
    if (node.nickname !== undefined) {
      await setPlacementNickname(page, placementId, node.nickname)
    }
  }
  await reorderLayoutToMatchManifest(page, layout)
}

/**
 * Reverses DnD lists and applies phase-2 manifest values on top of phase-1 state.
 */
export async function mutateProjectSettingsPhase2 (
  page: Page,
  phase2: T_e2eProjectSettingsManifest = E2E_PROJECT_SETTINGS_PHASE2_MANIFEST
): Promise<void> {
  await waitForProjectSettingsDialogHydrated(page)
  await page.locator(`[data-test-locator="${selectorList.tabGeneralSettings}"]`).click()
  await page.locator(`[data-test-locator="${selectorList.projectNameInput}"]`).fill(phase2.projectName)

  await openDocumentTemplatesCategory(page, phase2.templates.length)
  await reverseVerticalTabOrder(
    page,
    selectorList.documentTemplatesTab,
    'data-test-template-id'
  )

  await openWorldsCategory(page)
  await reverseVerticalTabOrder(page, selectorList.worldsTab, 'data-test-world-id')

  const worldTabCount = phase2.worlds.length
  for (let worldIndex = 0; worldIndex < worldTabCount; worldIndex += 1) {
    await page.locator(`[data-test-locator="${selectorList.worldsTab}"]`).nth(worldIndex).click()
    await reverseLayoutRootSiblingOrder(page)
    await reversePaletteSwatchOrder(page)
  }

  await openDocumentTemplatesCategory(page, phase2.templates.length)
  for (let templateIndex = 0; templateIndex < phase2.templates.length; templateIndex += 1) {
    const entry = phase2.templates[templateIndex]
    if (entry !== undefined) {
      await updateTemplateAtIndex(page, templateIndex, entry)
    }
  }

  await openWorldsCategory(page)
  for (let worldIndex = 0; worldIndex < phase2.worlds.length; worldIndex += 1) {
    const world = phase2.worlds[worldIndex]
    if (world !== undefined) {
      await updateWorldAtIndex(page, worldIndex, world)
    }
  }
}

async function assertTemplateTabs (page: Page, templates: T_e2eTemplateManifestEntry[]): Promise<void> {
  const tabs = page.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`)
  await expect(tabs).toHaveCount(templates.length, { timeout: 30_000 })
  for (let index = 0; index < templates.length; index += 1) {
    const entry = templates[index]
    if (entry === undefined) {
      continue
    }
    const tab = tabs.nth(index)
    await expect(tab).toContainText(entry.tabLabel)
    await tab.click()
    await expect(
      tab.locator(`[data-test-locator="${selectorList.documentTemplatesTabIcon}"]`)
    ).toHaveAttribute('data-test-icon-name', entry.icon)
    if (entry.appendix.enUS.length > 0) {
      await expect(
        tab.locator(`[data-test-locator="${selectorList.documentTemplatesTabWorldAppendix}"]`)
      ).toContainText(entry.appendix.enUS.replace(/^\s+/, ''))
    }
  }
}

async function assertPaletteHexOrder (page: Page, expectedHexes: string[]): Promise<void> {
  const swatches = page.locator(`[data-test-locator="${selectorList.colorPaletteSwatch}"]`)
  await expect(swatches).toHaveCount(expectedHexes.length)
  for (let index = 0; index < expectedHexes.length; index += 1) {
    const expectedHex = (expectedHexes[index] ?? '').toLowerCase()
    await expect(swatches.nth(index)).toHaveAttribute('data-test-tooltip-text', expectedHex)
  }
}

async function assertWorldLayout (page: Page, layout: T_e2eLayoutNodeManifest[]): Promise<void> {
  const expectedRootLabels = layout.map((node) => {
    if (node.type === 'group') {
      return node.name.enUS
    }
    if (node.nickname !== undefined) {
      return node.nickname.enUS.singular
    }
    return node.tabLabel
  })
  await expect(async () => {
    const rootShells = await readRootLevelTreeShells(page)
    const labels = await readShellLabels(page, rootShells)
    expect(labels.length).toBe(expectedRootLabels.length)
    for (let index = 0; index < expectedRootLabels.length; index += 1) {
      expect(labels[index]).toContain(expectedRootLabels[index] ?? '')
    }
  }).toPass({ timeout: 15_000 })

  for (const node of layout) {
    if (node.type !== 'group') {
      continue
    }
    const groupId = await findGroupPlacementByName(page, node.name.enUS)
    for (const child of node.children) {
      const placementId = await findTemplatePlacementByTabLabel(page, child.tabLabel)
      expect(await isTemplateVisuallyNestedUnderGroup(page, groupId, placementId)).toBe(true)
    }
  }
}

async function assertWorldEntry (page: Page, world: T_e2eWorldManifestEntry): Promise<void> {
  await clickWorldTabByLabel(page, world.tabLabel)
  await expect(
    page.locator(`[data-test-locator="${selectorList.worldsNameInput}"]`)
  ).toBeVisible()
  if (world.paletteHexes.length > 0) {
    await assertPaletteHexOrder(page, world.paletteHexes)
  }
  if (world.layout.length > 0) {
    await assertWorldLayout(page, world.layout)
  }
}

/**
 * Reopen-safe read-back of manifest state via data-test-locator hooks.
 */
export async function assertProjectSettingsManifest (
  page: Page,
  manifest: T_e2eProjectSettingsManifest
): Promise<void> {
  await waitForProjectSettingsDialogHydrated(page)
  await page.locator(`[data-test-locator="${selectorList.tabGeneralSettings}"]`).click()
  await expect(
    page.locator(`[data-test-locator="${selectorList.projectNameInput}"]`)
  ).toHaveValue(manifest.projectName)

  await openDocumentTemplatesCategory(page, manifest.templates.length)
  await assertTemplateTabs(page, manifest.templates)

  await openWorldsCategory(page)
  const worldTabs = page.locator(`[data-test-locator="${selectorList.worldsTab}"]`)
  await expect(worldTabs).toHaveCount(manifest.worlds.length)
  for (let index = 0; index < manifest.worlds.length; index += 1) {
    const world = manifest.worlds[index]
    if (world === undefined) {
      continue
    }
    await expect(worldTabs.nth(index)).toContainText(world.tabLabel)
  }
  for (const world of manifest.worlds) {
    await assertWorldEntry(page, world)
  }
}

export const E2E_PROJECT_SETTINGS_DEFAULT_NEW_WORLD_NAME =
  L_projectSettings.panels.worlds.defaultNewWorldName

export const E2E_PROJECT_SETTINGS_DEFAULT_NEW_TEMPLATE_NAME =
  L_projectSettings.panels.documentTemplates.defaultNewTemplateName
