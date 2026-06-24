import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  assertSaveDisabledWithTooltip,
  assertSaveEnabledWithoutErrorsIcon,
  assertWarningTooltip,
  buildFaLocaleTranslationsFallbackWarningTooltip,
  buildSingularPluralMissingTooltip,
  clearVerticalTabFilter,
  countVisibleTabs,
  fillVerticalTabFilter,
  openFaLocaleTranslationsMenu,
  setLocaleTranslation,
  setSingularPluralTranslation
} from 'app/helpers/playwrightHelpers_component/dialogProjectSettingsPlaywrightHelpers'
import {
  clickDocumentTemplateTabByLabel,
  clickPaletteFooterColorByHex,
  clickWorldTabByLabel,
  dragLayoutTreeNode,
  dragPaletteSwatch,
  dragVerticalTab,
  openWorldColorPickerMenu,
  setPaletteSwatchHex
} from 'app/helpers/playwrightHelpers_component/dialogProjectSettingsPlaywrightColorAndDragHelpers'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import L_projectSettings from 'app/i18n/en-US/dialogs/L_projectSettings'
import { FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON } from 'app/types/I_faIconPickerInput'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  COMPONENT_NAME: 'DialogProjectSettings',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components'
}

const faFrontendRenderTimer = FA_FRONTEND_RENDER_TIMER
const functionalFlowProjectName = 'Component functional flow project'
const projectSettingsDirectInput: T_dialogName = 'ProjectSettings'

const selectorList = {
  closeButton: 'dialogProjectSettings-button-close',
  colorPaletteAddButton: 'dialogProjectSettings-worlds-colorPaletteAddButton',
  colorPaletteContextMenuDelete: 'dialogProjectSettings-worlds-colorPaletteContextMenu-delete',
  colorPaletteContextMenuDuplicate: 'dialogProjectSettings-worlds-colorPaletteContextMenu-duplicate',
  colorPaletteDuplicateIcon: 'dialogProjectSettings-worlds-colorPaletteDuplicateIcon',
  colorPaletteEditor: 'dialogProjectSettings-worlds-colorPaletteEditor',
  colorPaletteSwatch: 'dialogProjectSettings-worlds-colorPaletteSwatch',
  documentTemplatesAddButton: 'dialogProjectSettings-documentTemplates-addButton',
  documentTemplatesAddFirstButton: 'dialogProjectSettings-documentTemplates-addFirstButton',
  documentTemplatesDeleteConfirmCountdown: 'dialogProjectSettings-documentTemplates-deleteConfirmCountdown',
  documentTemplatesFilterClear: 'dialogProjectSettings-documentTemplatesFilterClear',
  documentTemplatesFilterEmpty: 'dialogProjectSettings-documentTemplatesFilterEmpty',
  documentTemplatesFilterInput: 'dialogProjectSettings-documentTemplatesFilterInput',
  documentTemplatesIconInput: 'dialogProjectSettings-documentTemplates-iconInput',
  documentTemplatesIconTrigger: 'dialogProjectSettings-documentTemplates-iconInput-trigger',
  documentTemplatesNameInput: 'dialogProjectSettings-documentTemplates-nameInput',
  documentTemplatesRemoveButton: 'dialogProjectSettings-documentTemplates-removeButton',
  documentTemplatesTab: 'dialogProjectSettings-documentTemplates-tab',
  documentTemplatesTabIcon: 'dialogProjectSettings-documentTemplates-tabIcon',
  documentTemplatesTabMissingTranslationsWarning: 'dialogProjectSettings-documentTemplates-tabMissingTranslationsWarning',
  documentTemplatesTabWorldAppendix: 'dialogProjectSettings-documentTemplates-tabWorldAppendix',
  documentTemplatesWorldAppendixInput: 'dialogProjectSettings-documentTemplates-worldAppendixInput',
  groupRenameInput: 'dialogProjectSettings-worldTemplateLayoutGroupRenameInput',
  projectNameInput: 'dialogProjectSettings-input-projectName',
  saveButton: 'dialogProjectSettings-button-save',
  saveErrorsIcon: 'dialogProjectSettings-saveErrorsIcon',
  saveWithoutClosingButton: 'dialogProjectSettings-button-saveWithoutClosing',
  tabDocumentTemplatesSettings: 'dialogProjectSettings-tab-documentTemplatesSettings',
  tabGeneralSettings: 'dialogProjectSettings-tab-generalSettings',
  tabWorldsSettings: 'dialogProjectSettings-tab-worldsSettings',
  templateRenameInput: 'dialogProjectSettings-worldTemplateLayoutTemplateRenameInput',
  title: 'dialogProjectSettings-title',
  worldAvailableTemplatesFilterClear: 'dialogProjectSettings-worldAvailableTemplatesFilterClear',
  worldAvailableTemplatesFilterEmpty: 'dialogProjectSettings-worldAvailableTemplatesFilterEmpty',
  worldAvailableTemplatesFilterInput: 'dialogProjectSettings-worldAvailableTemplatesFilterInput',
  worldAvailableTemplatesList: 'dialogProjectSettings-worldAvailableTemplatesList',
  worldsAddButton: 'dialogProjectSettings-worlds-addButton',
  worldsFilterClear: 'dialogProjectSettings-worldsFilterClear',
  worldsFilterEmpty: 'dialogProjectSettings-worldsFilterEmpty',
  worldsFilterInput: 'dialogProjectSettings-worldsFilterInput',
  worldsNameInput: 'dialogProjectSettings-worlds-nameInput',
  worldsNameInputFallbackWarning: 'dialogProjectSettings-worlds-nameInput-fallbackWarning',
  worldsRemoveButton: 'dialogProjectSettings-worlds-removeButton',
  worldsTab: 'dialogProjectSettings-worlds-tab',
  worldsTabColorSwatch: 'dialogProjectSettings-worlds-tabColorSwatch',
  worldsTabMissingTranslationsWarning: 'dialogProjectSettings-worlds-tabMissingTranslationsWarning',
  worldTemplateLayoutAddGroup: 'dialogProjectSettings-worldTemplateLayoutAddGroup',
  worldTemplateLayoutTree: 'dialogProjectSettings-worldTemplateLayoutTree',
  worldsDeleteConfirmCountdown: 'dialogProjectSettings-worlds-deleteConfirmCountdown'
} as const

function treeNodeLocator (kind: 'group' | 'template', nodeId: string): string {
  return `[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-${kind}-${nodeId}"]`
}

function treeNodeShellLocator (kind: 'group' | 'template', nodeId: string): string {
  return `.dialogProjectSettingsWorldTemplateLayoutTree .tree-node:has(${treeNodeLocator(kind, nodeId)})`
}

function treeTemplateRowLocator (): string {
  return '.dialogProjectSettingsWorldTemplateLayoutTreeNode.column[data-test-locator^="dialogProjectSettings-worldTemplateLayoutTreeNode-template-"]'
}

function treeGroupRowLocator (): string {
  return '.dialogProjectSettingsWorldTemplateLayoutTreeNode.column[data-test-locator^="dialogProjectSettings-worldTemplateLayoutTreeNode-group-"]'
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

async function openDocumentTemplatesCategory (
  page: Page,
  expectedTabCount: number
): Promise<void> {
  const categoryTab = page.locator(`[data-test-locator="${selectorList.tabDocumentTemplatesSettings}"]`)
  const list = page.locator('[data-test-locator="dialogProjectSettings-documentTemplates-list"]')
  await expect(async () => {
    await categoryTab.click()
    await expect(list).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 30_000 })
  const filterClear = page.locator(`[data-test-locator="${selectorList.documentTemplatesFilterClear}"]`)
  if (await filterClear.isVisible()) {
    await clearVerticalTabFilter(page, selectorList.documentTemplatesFilterClear)
  }
  await expect(
    page.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`)
  ).toHaveCount(expectedTabCount, { timeout: 30_000 })
}

async function renameWorldAtIndex (
  page: Page,
  index: number,
  name: string
): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.worldsTab}"]`).nth(index).click()
  const nameInput = page.locator(`[data-test-locator="${selectorList.worldsNameInput}"]`)
  await expect(nameInput).toBeVisible()
  await openFaLocaleTranslationsMenu(page, selectorList.worldsNameInput)
  await setLocaleTranslation(page, selectorList.worldsNameInput, 'en-US', name)
  await page.keyboard.press('Escape')
  await expect(
    page.locator(`[data-test-locator="${selectorList.worldsTab}"]`).nth(index)
  ).toContainText(name)
}

async function renameDocumentTemplateAtIndex (
  page: Page,
  index: number,
  singular: string,
  plural: string
): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`).nth(index).click()
  await expect(
    page.locator(`[data-test-locator="${selectorList.documentTemplatesNameInput}"]`)
  ).toBeVisible()
  await openFaLocaleTranslationsMenu(page, selectorList.documentTemplatesNameInput)
  await setSingularPluralTranslation(page, selectorList.documentTemplatesNameInput, 'en-US', {
    plural,
    singular
  })
  await page.keyboard.press('Escape')
}

test.describe.serial('DialogProjectSettings functional flow', () => {
  test.describe.configure({ timeout: 600_000 })

  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directDocumentTemplatesSnapshot: [],
      directInput: projectSettingsDirectInput,
      directSettingsSnapshot: {
        projectName: functionalFlowProjectName,
        schemaVersion: 1
      },
      directWorldsSnapshot: []
    })
    const launched = await launchFaPlaywrightComponentHarnessWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          COMPONENT_NAME: extraEnvSettings.COMPONENT_NAME,
          COMPONENT_PROPS: extraEnvSettings.COMPONENT_PROPS,
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      renderDelayMs: faFrontendRenderTimer,
      testInfo
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * General settings tab is active on open with footer actions and editable project name.
   */
  test('General tab shell shows active tab, footer buttons, and editable project name', async () => {
    await expect(appWindow.locator('.q-dialog.dialogComponent.ProjectSettings')).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    ).toHaveText(L_projectSettings.title)

    const generalTab = appWindow.locator(`[data-test-locator="${selectorList.tabGeneralSettings}"]`)
    await expect(generalTab).toHaveText(L_projectSettings.categories.generalSettings.title)
    await expect(generalTab).toHaveClass(/q-tab--active/)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    ).toContainText(L_projectSettings.closeButton)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.saveWithoutClosingButton}"]`)
    ).toContainText(L_projectSettings.saveWithoutClosingButton)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    ).toContainText(L_projectSettings.saveButton)

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.projectNameInput}"]`)
    await expect(nameInput).toHaveValue(functionalFlowProjectName)
    await nameInput.fill('Edited project name')
    await expect(nameInput).toHaveValue('Edited project name')
    await nameInput.fill(functionalFlowProjectName)
  })

  /**
   * Empty project name disables save actions and surfaces the required-name tooltip.
   */
  test('Empty project name disables save and shows validation tooltip', async () => {
    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.projectNameInput}"]`)
    await nameInput.fill('')
    const expectedTooltip = `${L_projectSettings.saveErrors.tooltipIntro}\n- ${L_projectSettings.fields.projectName.errorRequired}`
    await assertSaveDisabledWithTooltip(appWindow, expectedTooltip)
    await nameInput.fill(functionalFlowProjectName)
    await assertSaveEnabledWithoutErrorsIcon(appWindow)
  })

  /**
   * Category tab bar exposes three tabs with shipped en-US labels.
   */
  test('Category tab bar shows three tabs with en-US labels', async () => {
    const tabs = appWindow.locator('.dialogProjectSettings__tabs .q-tab')
    await expect(tabs).toHaveCount(3)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tabGeneralSettings}"]`)
    ).toHaveText(L_projectSettings.categories.generalSettings.title)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`)
    ).toHaveText(L_projectSettings.categories.worldsSettings.title)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tabDocumentTemplatesSettings}"]`)
    ).toHaveText(L_projectSettings.categories.documentTemplatesSettings.title)
  })

  /**
   * Worlds tab supports add-world, rename, and filter queries.
   */
  test('Worlds tab add rename and filter behave as expected', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const addButton = appWindow.locator(`[data-test-locator="${selectorList.worldsAddButton}"]`)
    await addButton.click()
    await addButton.click()
    await addButton.click()
    await expect(await countVisibleTabs(appWindow, selectorList.worldsTab)).toBe(3)

    const worldTabs = appWindow.locator(`[data-test-locator="${selectorList.worldsTab}"]`)
    await expect(worldTabs.nth(0)).toContainText(L_projectSettings.panels.worlds.defaultNewWorldName)
    await expect(worldTabs.nth(1)).toContainText(L_projectSettings.panels.worlds.defaultNewWorldName)
    await expect(worldTabs.nth(2)).toContainText(L_projectSettings.panels.worlds.defaultNewWorldName)

    await renameWorldAtIndex(appWindow, 0, 'Test 1')
    await renameWorldAtIndex(appWindow, 1, 'Test 2')

    await fillVerticalTabFilter(appWindow, selectorList.worldsFilterInput, 'Test')
    await expect(await countVisibleTabs(appWindow, selectorList.worldsTab)).toBe(2)
    await clearVerticalTabFilter(appWindow, selectorList.worldsFilterClear)
    await expect(await countVisibleTabs(appWindow, selectorList.worldsTab)).toBe(3)
    await fillVerticalTabFilter(appWindow, selectorList.worldsFilterInput, 'World')
    await expect(await countVisibleTabs(appWindow, selectorList.worldsTab)).toBe(1)

    await fillVerticalTabFilter(appWindow, selectorList.worldsFilterInput, 'zzzz-no-match-zzzz')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldsFilterEmpty}"]`)
    ).toContainText(L_projectSettings.panels.worlds.emptyFilteredWorlds)
    await clearVerticalTabFilter(appWindow, selectorList.worldsFilterClear)
  })

  /**
   * Test 1 detail exposes locale warnings, palette validation, and world color picker palette footer.
   */
  test('World detail locale palette and world color picker work for Test 1', async () => {
    await clickWorldTabByLabel(appWindow, 'Test 1')

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldsNameInput}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.colorPaletteEditor}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldsRemoveButton}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldTemplateLayoutTree}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldAvailableTemplatesList}"]`)
    ).toContainText(L_projectSettings.fields.worldTemplateLayout.emptyAvailableTemplates)

    await openFaLocaleTranslationsMenu(appWindow, selectorList.worldsNameInput)
    await setLocaleTranslation(appWindow, selectorList.worldsNameInput, 'en-US', '')
    await setLocaleTranslation(appWindow, selectorList.worldsNameInput, 'de', 'Deutsch Testwelt')
    await appWindow.keyboard.press('Escape')

    const activeWorldTab = appWindow.locator(`[data-test-locator="${selectorList.worldsTab}"]`)
      .filter({ hasText: 'Deutsch Testwelt' })
      .first()
    await assertWarningTooltip(
      activeWorldTab.locator(`[data-test-locator="${selectorList.worldsTabMissingTranslationsWarning}"]`),
      L_projectSettings.panels.worlds.missingTranslationsTabTooltip
    )
    await assertWarningTooltip(
      appWindow.locator(`[data-test-locator="${selectorList.worldsNameInputFallbackWarning}"]`),
      buildFaLocaleTranslationsFallbackWarningTooltip('de')
    )

    const paletteAdd = appWindow.locator(`[data-test-locator="${selectorList.colorPaletteAddButton}"]`)
    await paletteAdd.click()
    await paletteAdd.click()
    const swatches = appWindow.locator(`[data-test-locator="${selectorList.colorPaletteSwatch}"]`)
    await expect(swatches).toHaveCount(2)
    const paletteEditor = appWindow.locator(`[data-test-locator="${selectorList.colorPaletteEditor}"]`)
    await expect(
      paletteEditor.locator(`[data-test-locator="${selectorList.colorPaletteDuplicateIcon}"]`)
    ).toHaveCount(2)

    const duplicateBullet = L_projectSettings.saveErrors.bulletDuplicatePalette
      .replace('{worldLabel}', 'Deutsch Testwelt')
    const duplicateTooltip = `${L_projectSettings.saveErrors.tooltipIntro}\n- ${duplicateBullet}`
    await assertSaveDisabledWithTooltip(appWindow, duplicateTooltip)
    await expect(activeWorldTab).toHaveAttribute('data-test-validation-error', 'true')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`)
    ).toHaveAttribute('data-test-validation-error', 'true')

    await setPaletteSwatchHex(appWindow, 1, '#000000')
    await assertSaveEnabledWithoutErrorsIcon(appWindow)

    await openWorldColorPickerMenu(appWindow)
    const worldColorPicker = appWindow.locator(
      '[data-test-locator="dialogProjectSettings-worlds-colorInput-picker"]'
    )
    await expect(worldColorPicker.locator('.q-color-picker__footer')).toBeVisible()
    await clickPaletteFooterColorByHex(
      appWindow,
      'dialogProjectSettings-worlds-colorInput-picker',
      '#000000'
    )
    await appWindow.keyboard.press('Escape')
    await expect(
      activeWorldTab.locator(`[data-test-locator="${selectorList.worldsTabColorSwatch}"]`)
    ).toBeVisible()

    await clickWorldTabByLabel(appWindow, 'Test 2')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.colorPaletteSwatch}"]`)
    ).toHaveCount(0)
    await openWorldColorPickerMenu(appWindow)
    await expect(
      appWindow.locator('[data-test-locator="dialogProjectSettings-worlds-colorInput-picker"] .q-color-picker__cube')
    ).toHaveCount(0)
    await appWindow.keyboard.press('Escape')

    await clickWorldTabByLabel(appWindow, 'Deutsch Testwelt')
    const firstSwatch = appWindow.locator(`[data-test-locator="${selectorList.colorPaletteSwatch}"]`).first()
    await firstSwatch.click({ button: 'right' })
    await appWindow.locator(`[data-test-locator="${selectorList.colorPaletteContextMenuDelete}"]`).last().click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.colorPaletteSwatch}"]`)
    ).toHaveCount(1)

    const remainingSwatch = appWindow.locator(`[data-test-locator="${selectorList.colorPaletteSwatch}"]`).first()
    await remainingSwatch.click({ button: 'right' })
    await appWindow.locator(`[data-test-locator="${selectorList.colorPaletteContextMenuDuplicate}"]`).last().click()
    await expect(
      paletteEditor.locator(`[data-test-locator="${selectorList.colorPaletteDuplicateIcon}"]`)
    ).toHaveCount(2)
    const duplicateSwatch = appWindow.locator(`[data-test-locator="${selectorList.colorPaletteSwatch}"]`).nth(1)
    await duplicateSwatch.click({ button: 'right' })
    await appWindow.locator(`[data-test-locator="${selectorList.colorPaletteContextMenuDelete}"]`).last().click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.colorPaletteSwatch}"]`)
    ).toHaveCount(1)
  })

  /**
   * World color palette supports drag-reorder of swatch rows within the active world.
   */
  test('World color palette swatch drag-reorder updates displayed order', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const worldTabs = appWindow.locator(`[data-test-locator="${selectorList.worldsTab}"]`)
    const addWorldButton = appWindow.locator(`[data-test-locator="${selectorList.worldsAddButton}"]`)
    const worldCountBeforeAdd = await worldTabs.count()
    await addWorldButton.click()
    await worldTabs.nth(worldCountBeforeAdd).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.colorPaletteEditor}"]`)
    ).toBeVisible()

    const paletteAdd = appWindow.locator(`[data-test-locator="${selectorList.colorPaletteAddButton}"]`)
    for (let index = 0; index < 3; index += 1) {
      await paletteAdd.click()
    }

    const expectedInitialHexes = ['#111111', '#222222', '#333333']
    for (let index = 0; index < expectedInitialHexes.length; index += 1) {
      await setPaletteSwatchHex(appWindow, index, expectedInitialHexes[index] ?? '')
    }

    const swatches = appWindow.locator(`[data-test-locator="${selectorList.colorPaletteSwatch}"]`)
    await expect(swatches).toHaveCount(3)
    await expect(async () => {
      for (let index = 0; index < expectedInitialHexes.length; index += 1) {
        await expect(swatches.nth(index)).toHaveAttribute(
          'data-test-tooltip-text',
          expectedInitialHexes[index] ?? ''
        )
      }
    }).toPass({ timeout: 10_000 })

    await appWindow.keyboard.press('Escape')
    await expect(
      appWindow.locator('[data-test-locator="dialogProjectSettings-worlds-colorPalettePicker"]')
    ).toHaveCount(0)

    await expect(async () => {
      await dragPaletteSwatch(appWindow, 2, 0)
      await expect(swatches.nth(0)).toHaveAttribute('data-test-tooltip-text', '#333333')
      await expect(swatches.nth(1)).toHaveAttribute('data-test-tooltip-text', '#111111')
      await expect(swatches.nth(2)).toHaveAttribute('data-test-tooltip-text', '#222222')
    }).toPass({ timeout: 30_000 })
  })

  /**
   * Document templates tab supports add, rename, filter, singular-plural warnings, appendix, and icon picker.
   */
  test('Document templates add rename filter singular plural appendix and icon picker', async () => {
    test.setTimeout(120_000)

    await appWindow.locator(`[data-test-locator="${selectorList.tabDocumentTemplatesSettings}"]`).click()
    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesAddFirstButton}"]`).click()
    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesAddButton}"]`).click()
    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesAddButton}"]`).click()
    await expect(await countVisibleTabs(appWindow, selectorList.documentTemplatesTab)).toBe(3)

    await renameDocumentTemplateAtIndex(appWindow, 0, 'Template 1', 'Template 1')
    await renameDocumentTemplateAtIndex(appWindow, 1, 'Template 2', 'Template 2')

    await fillVerticalTabFilter(appWindow, selectorList.documentTemplatesFilterInput, 'Template 1')
    await expect(await countVisibleTabs(appWindow, selectorList.documentTemplatesTab)).toBe(1)
    await fillVerticalTabFilter(appWindow, selectorList.documentTemplatesFilterInput, 'Template 2')
    await expect(await countVisibleTabs(appWindow, selectorList.documentTemplatesTab)).toBe(1)
    await clearVerticalTabFilter(appWindow, selectorList.documentTemplatesFilterClear)
    await expect(await countVisibleTabs(appWindow, selectorList.documentTemplatesTab)).toBe(3)
    await fillVerticalTabFilter(
      appWindow,
      selectorList.documentTemplatesFilterInput,
      'new document'
    )
    await expect(await countVisibleTabs(appWindow, selectorList.documentTemplatesTab)).toBe(1)
    await clearVerticalTabFilter(appWindow, selectorList.documentTemplatesFilterClear)

    await fillVerticalTabFilter(appWindow, selectorList.documentTemplatesFilterInput, 'zzzz-no-match-zzzz')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesFilterEmpty}"]`)
    ).toContainText(L_projectSettings.panels.documentTemplates.emptyFilteredTemplates)
    await clearVerticalTabFilter(appWindow, selectorList.documentTemplatesFilterClear)

    await clickDocumentTemplateTabByLabel(appWindow, 'Template 1')
    await openFaLocaleTranslationsMenu(appWindow, selectorList.documentTemplatesNameInput)
    await setSingularPluralTranslation(appWindow, selectorList.documentTemplatesNameInput, 'en-US', {
      plural: '',
      singular: ''
    })
    await appWindow.keyboard.press('Escape')
    await assertWarningTooltip(
      appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesTabMissingTranslationsWarning}"]`).first(),
      buildSingularPluralMissingTooltip({
        fallbackLanguageCode: null,
        missingForm: 'both'
      })
    )

    await openFaLocaleTranslationsMenu(appWindow, selectorList.documentTemplatesNameInput)
    await setSingularPluralTranslation(appWindow, selectorList.documentTemplatesNameInput, 'en-US', {
      plural: '',
      singular: 'Singular-test'
    })
    await appWindow.keyboard.press('Escape')
    await clickDocumentTemplateTabByLabel(appWindow, 'Singular-test')
    await assertWarningTooltip(
      appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesTabMissingTranslationsWarning}"]`).first(),
      buildSingularPluralMissingTooltip({
        fallbackLanguageCode: null,
        missingForm: 'plural'
      })
    )

    await openFaLocaleTranslationsMenu(appWindow, selectorList.documentTemplatesNameInput)
    await setSingularPluralTranslation(appWindow, selectorList.documentTemplatesNameInput, 'en-US', {
      plural: 'Plural-test',
      singular: ''
    })
    await appWindow.keyboard.press('Escape')
    await assertWarningTooltip(
      appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesTabMissingTranslationsWarning}"]`).first(),
      buildSingularPluralMissingTooltip({
        fallbackLanguageCode: null,
        missingForm: 'singular'
      })
    )

    await openFaLocaleTranslationsMenu(appWindow, selectorList.documentTemplatesNameInput)
    await setSingularPluralTranslation(appWindow, selectorList.documentTemplatesNameInput, 'en-US', {
      plural: '',
      singular: ''
    })
    await setSingularPluralTranslation(appWindow, selectorList.documentTemplatesNameInput, 'de', {
      plural: '',
      singular: ''
    })
    await setSingularPluralTranslation(appWindow, selectorList.documentTemplatesNameInput, 'de', {
      plural: 'Deutsch Plural',
      singular: 'Deutsch Singular'
    })
    await appWindow.keyboard.press('Escape')

    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesAddButton}"]`).click()
    const templateIds = await readTemplateTabIds(appWindow)
    expect(templateIds.length).toBe(4)

    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`).nth(1).click()
    await openFaLocaleTranslationsMenu(appWindow, selectorList.documentTemplatesNameInput)
    await setSingularPluralTranslation(appWindow, selectorList.documentTemplatesNameInput, 'en-US', {
      plural: '',
      singular: 'English singular only'
    })
    await appWindow.keyboard.press('Escape')

    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`).nth(2).click()
    await openFaLocaleTranslationsMenu(appWindow, selectorList.documentTemplatesNameInput)
    await setSingularPluralTranslation(appWindow, selectorList.documentTemplatesNameInput, 'en-US', {
      plural: 'English plural only',
      singular: ''
    })
    await appWindow.keyboard.press('Escape')

    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`).nth(3).click()
    await openFaLocaleTranslationsMenu(appWindow, selectorList.documentTemplatesNameInput)
    await setSingularPluralTranslation(appWindow, selectorList.documentTemplatesNameInput, 'en-US', {
      plural: 'English both plural',
      singular: 'English both singular'
    })
    await appWindow.keyboard.press('Escape')

    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`).first().click()
    await openFaLocaleTranslationsMenu(appWindow, selectorList.documentTemplatesWorldAppendixInput)
    await setLocaleTranslation(
      appWindow,
      selectorList.documentTemplatesWorldAppendixInput,
      'en-US',
      ' of Eldoria'
    )
    await appWindow.keyboard.press('Escape')
    const firstTemplateTab = appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`).first()
    await expect(
      firstTemplateTab.locator(`[data-test-locator="${selectorList.documentTemplatesTabWorldAppendix}"]`)
    ).toContainText('of Eldoria')

    await expect(
      firstTemplateTab.locator(`[data-test-locator="${selectorList.documentTemplatesTabIcon}"]`)
    ).toHaveAttribute('data-test-icon-name', FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON)

    const iconTrigger = appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesIconTrigger}"]`)
    const iconMenuPanel = appWindow.locator('.faIconPickerInput__menuPanel')
    const iconMenuSearch = appWindow.locator(
      `[data-test-locator="${selectorList.documentTemplatesIconInput}-menu-search"]`
    )
    await expect(async () => {
      await iconTrigger.click()
      await expect(iconMenuSearch).toBeVisible()
      await iconMenuSearch.fill('dragon')
      const dragonCell = iconMenuPanel.locator('[data-test-icon-name="fa-solid fa-dragon"]')
      await expect(dragonCell).toBeVisible()
      await dragonCell.click()
      await expect(iconTrigger).toHaveAttribute('data-test-icon-name', 'fa-solid fa-dragon')
    }).toPass({ timeout: 45_000 })
    await expect(
      firstTemplateTab.locator(`[data-test-locator="${selectorList.documentTemplatesTabIcon}"]`)
    ).toHaveAttribute('data-test-icon-name', 'fa-solid fa-dragon')
  })

  /**
   * Worlds layout supports available-template filter, tree DnD, groups, nicknames, and removal.
   */
  test('World layout filter DnD groups nicknames and removal', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    await clickWorldTabByLabel(appWindow, 'Deutsch Testwelt')

    await fillVerticalTabFilter(appWindow, selectorList.worldAvailableTemplatesFilterInput, 'Deutsch')
    await expect(
      appWindow.locator('[data-test-locator^="dialogProjectSettings-worldAvailableTemplate-"]')
    ).toHaveCount(1)
    await clearVerticalTabFilter(appWindow, selectorList.worldAvailableTemplatesFilterClear)
    await fillVerticalTabFilter(appWindow, selectorList.worldAvailableTemplatesFilterInput, 'zzzz-no-match-zzzz')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldAvailableTemplatesFilterEmpty}"]`)
    ).toBeVisible()
    await clearVerticalTabFilter(appWindow, selectorList.worldAvailableTemplatesFilterClear)

    const availableTemplates = appWindow.locator(
      '[data-test-locator^="dialogProjectSettings-worldAvailableTemplate-"]'
    )
    const availableCount = await availableTemplates.count()
    for (let index = 0; index < availableCount; index += 1) {
      await availableTemplates.first().click()
    }
    await expect(availableTemplates).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldAvailableTemplatesList}"]`)
    ).toContainText(L_projectSettings.fields.worldTemplateLayout.emptyAvailableTemplates)

    const templateRows = appWindow.locator(treeTemplateRowLocator())
    await expect(templateRows).toHaveCount(4)
    const firstRow = templateRows.first()
    const lastRow = templateRows.last()
    const firstPlacementId = await extractTreeNodeIdFromRow(firstRow, 'template')
    const lastPlacementId = await extractTreeNodeIdFromRow(lastRow, 'template')
    await dragLayoutTreeNode(
      appWindow,
      treeNodeShellLocator('template', firstPlacementId),
      treeNodeShellLocator('template', lastPlacementId),
      'insert-before-target'
    )
    await expect(async () => {
      const order = await templateRows.allTextContents()
      expect(order[order.length - 1]).toContain('of Eldoria')
    }).toPass({ timeout: 5000 })
    await dragLayoutTreeNode(
      appWindow,
      treeNodeShellLocator('template', firstPlacementId),
      treeNodeShellLocator('template', lastPlacementId),
      'insert-before-target'
    )

    await appWindow.locator(`[data-test-locator="${selectorList.worldTemplateLayoutAddGroup}"]`).click()
    const groupRow = appWindow.locator(treeGroupRowLocator()).first()
    await expect(groupRow).toContainText(L_projectSettings.fields.worldTemplateLayout.defaultNewGroupName)
    const groupId = await extractTreeNodeIdFromRow(groupRow, 'group')
    const groupNode = appWindow.locator(treeNodeLocator('group', groupId))
    const groupEditButton = appWindow.locator(
      `[data-test-locator="dialogProjectSettings-worldTemplateLayoutTreeNode-group-${groupId}-edit"]`
    )
    const groupRenameMenu = appWindow.locator(
      '[data-test-locator="dialogProjectSettings-worldTemplateLayoutGroupContextMenu"]'
    )

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldTemplateLayoutTree}"]`)
    ).toBeVisible()
    await groupNode.scrollIntoViewIfNeeded()
    await groupNode.evaluate((element) => {
      element.dispatchEvent(new MouseEvent('contextmenu', {
        bubbles: true,
        button: 2,
        cancelable: true
      }))
    })
    await expect(groupRenameMenu).toBeVisible()
    await setLocaleTranslation(appWindow, selectorList.groupRenameInput, 'en-US', 'Creatures')
    await appWindow.getByRole('textbox', {
      exact: true,
      name: 'English, US'
    }).first().press('Enter')
    await expect(groupNode).toContainText('Creatures')

    await groupEditButton.click({ force: true })
    await expect(groupRenameMenu).toBeVisible()
    await setLocaleTranslation(appWindow, selectorList.groupRenameInput, 'en-US', 'Creatures edited')
    await appWindow.getByRole('textbox', {
      exact: true,
      name: 'English, US'
    }).first().press('Enter')
    await expect(groupNode).toContainText('Creatures edited')

    await groupNode.evaluate((element) => {
      element.dispatchEvent(new MouseEvent('contextmenu', {
        bubbles: true,
        button: 2,
        cancelable: true
      }))
    })
    await expect(groupRenameMenu).toBeVisible()
    await setLocaleTranslation(appWindow, selectorList.groupRenameInput, 'en-US', '')
    await setLocaleTranslation(appWindow, selectorList.groupRenameInput, 'de', 'Kreaturen')
    await appWindow.getByRole('textbox', {
      exact: true,
      name: 'Deutsch (AI-generiert)'
    }).first().press('Enter')
    await expect(groupNode).toContainText('Kreaturen')

    await expect(async () => {
      await dragLayoutTreeNode(
        appWindow,
        treeNodeShellLocator('template', firstPlacementId),
        treeNodeLocator('group', groupId),
        'nest-into-target'
      )
      await expectTemplateNestedUnderGroup(appWindow, groupId, firstPlacementId)
    }).toPass({ timeout: 15_000 })

    const addGroup = appWindow.locator(`[data-test-locator="${selectorList.worldTemplateLayoutAddGroup}"]`)
    await addGroup.click()
    await addGroup.click()
    await addGroup.click()
    await expect(appWindow.locator(treeGroupRowLocator())).toHaveCount(4)
    await expectTemplateNestedUnderGroup(appWindow, groupId, firstPlacementId)

    const groupShell = treeNodeShellLocator('group', groupId)
    const firstTemplateShell = treeNodeShellLocator('template', firstPlacementId)
    const topRow = appWindow.locator(treeTemplateRowLocator()).first()
    const topPlacementId = await extractTreeNodeIdFromRow(topRow, 'template')
    await dragLayoutTreeNode(appWindow, groupShell, treeNodeShellLocator('template', topPlacementId))
    await dragLayoutTreeNode(
      appWindow,
      firstTemplateShell,
      treeNodeShellLocator('template', topPlacementId),
      'insert-before-target'
    )
    await dragLayoutTreeNode(
      appWindow,
      treeNodeShellLocator('template', firstPlacementId),
      treeNodeLocator('group', groupId),
      'nest-into-target'
    )

    const placementNode = appWindow.locator(treeNodeLocator('template', firstPlacementId))
    await placementNode.locator('[data-test-locator$="-edit"]').click()
    await setSingularPluralTranslation(appWindow, selectorList.templateRenameInput, 'en-US', {
      plural: 'Hero plural',
      singular: 'Hero singular'
    })
    await appWindow.getByRole('textbox', {
      exact: true,
      name: 'English, US'
    }).first().press('Enter')
    await expect(placementNode.locator('.dialogProjectSettingsWorldTemplateLayoutTreeNode__label--nickname'))
      .toHaveCount(1)

    await placementNode.locator('[data-test-locator$="-edit"]').click()
    await setSingularPluralTranslation(appWindow, selectorList.templateRenameInput, 'en-US', {
      plural: '',
      singular: ''
    })
    await setSingularPluralTranslation(appWindow, selectorList.templateRenameInput, 'de', {
      plural: 'Held Plural',
      singular: 'Held Singular'
    })
    await appWindow.getByRole('textbox', {
      exact: true,
      name: 'Deutsch (AI-generiert)'
    }).first().press('Enter')
    await appWindow.keyboard.press('Escape')

    await groupNode.locator('[data-test-locator$="-remove"]').click({ force: true })
    await expect(appWindow.locator(treeNodeLocator('group', groupId))).toHaveCount(0)

    await placementNode.locator('[data-test-locator$="-remove"]').click()
    await expect(availableTemplates).toHaveCount(1)

    await clickWorldTabByLabel(appWindow, 'Test 2')
    await expect(availableTemplates).toHaveCount(4)
    await expect(appWindow.locator(treeTemplateRowLocator())).toHaveCount(0)
  })

  /**
   * Vertical tab drag-reorder and delete confirm countdowns appear without confirming deletion.
   */
  test('Vertical tab drag reorder and delete confirm countdowns', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const test1Tab = appWindow.locator(`[data-test-locator="${selectorList.worldsTab}"]`)
      .filter({ hasText: 'Deutsch Testwelt' })
      .first()
    const test2Tab = appWindow.locator(`[data-test-locator="${selectorList.worldsTab}"]`)
      .filter({ hasText: 'Test 2' })
      .first()
    await expect(test1Tab).toBeVisible({ timeout: 30_000 })
    await expect(test2Tab).toBeVisible({ timeout: 30_000 })
    const test1Id = await test1Tab.getAttribute('data-test-world-id')
    const test2Id = await test2Tab.getAttribute('data-test-world-id')
    expect(test1Id).toBeTruthy()
    expect(test2Id).toBeTruthy()
    await dragVerticalTab(
      appWindow,
      'data-test-world-id',
      test2Id ?? '',
      test1Id ?? '',
      selectorList.worldsTab
    )

    await openDocumentTemplatesCategory(appWindow, 4)
    const templateIds = await readTemplateTabIds(appWindow)
    expect(templateIds.length).toBeGreaterThanOrEqual(2)
    await dragVerticalTab(
      appWindow,
      'data-test-template-id',
      templateIds[1] ?? templateIds[0],
      templateIds[0] ?? templateIds[1],
      selectorList.documentTemplatesTab
    )

    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    await clickWorldTabByLabel(appWindow, 'Test 2')
    await appWindow.locator(`[data-test-locator="${selectorList.worldsRemoveButton}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldsDeleteConfirmCountdown}"]`)
    ).toHaveText('5')
    await appWindow.keyboard.press('Escape')

    await openDocumentTemplatesCategory(appWindow, 4)
    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`).first().click()
    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesRemoveButton}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesDeleteConfirmCountdown}"]`)
    ).toHaveText('5')
    await appWindow.keyboard.press('Escape')
  })
})

async function expectTemplateNestedUnderGroup (
  page: Page,
  groupId: string,
  placementId: string
): Promise<void> {
  const groupShell = treeNodeShellLocator('group', groupId)
  const templateShell = treeNodeShellLocator('template', placementId)
  await expect(page.locator(templateShell)).toHaveCount(1)
  const groupPad = await readTreeNodePaddingLeftPx(page, groupShell)
  const templatePad = await readTreeNodePaddingLeftPx(page, templateShell)
  expect(templatePad).toBeGreaterThan(groupPad)
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

async function launchProjectSettingsGuardHarness (
  testInfo: TestInfo,
  componentProps: Record<string, unknown>
): Promise<{ electronApp: ElectronApplication; appWindow: Page }> {
  return launchFaPlaywrightComponentHarnessWindow({
    buildLaunchEnv (): Record<string, string> {
      return {
        COMPONENT_NAME: extraEnvSettings.COMPONENT_NAME,
        COMPONENT_PROPS: JSON.stringify(componentProps),
        TEST_ENV: extraEnvSettings.TEST_ENV
      }
    },
    renderDelayMs: faFrontendRenderTimer,
    testInfo
  })
}

const guardHarnessProjectSettings = {
  projectName: 'Delete guard harness project',
  schemaVersion: 1
}

test.describe.serial('DialogProjectSettings delete guards — last world', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  const guardWorldId = '550e8400-e29b-41d4-a716-446655440099'

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchProjectSettingsGuardHarness(testInfo, {
      directDocumentTemplatesSnapshot: [],
      directInput: projectSettingsDirectInput,
      directSettingsSnapshot: guardHarnessProjectSettings,
      directWorldsSnapshot: [
        {
          color: '',
          colorPallete: '',
          displayNameTranslations: { 'en-US': 'Only world' },
          documentCount: 0,
          id: guardWorldId,
          templateLayout: {
            groups: [],
            placements: []
          }
        }
      ]
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Delete world stays disabled when only one world exists', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    const removeButton = appWindow.locator(`[data-test-locator="${selectorList.worldsRemoveButton}"]`)
    await expect(removeButton).toBeDisabled()
    await removeButton.hover()
    await expect(
      appWindow.getByText(L_projectSettings.panels.worlds.removeDisabledLastWorld)
    ).toBeVisible()
  })
})

test.describe.serial('DialogProjectSettings delete guards — world with documents', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  const guardWorldId = '550e8400-e29b-41d4-a716-446655440099'
  const guardWorldBId = '550e8400-e29b-41d4-a716-446655440098'

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchProjectSettingsGuardHarness(testInfo, {
      directDocumentTemplatesSnapshot: [],
      directInput: projectSettingsDirectInput,
      directSettingsSnapshot: guardHarnessProjectSettings,
      directWorldsSnapshot: [
        {
          color: '',
          colorPallete: '',
          displayNameTranslations: { 'en-US': 'Blocked world' },
          documentCount: 1,
          id: guardWorldId,
          templateLayout: {
            groups: [],
            placements: []
          }
        },
        {
          color: '',
          colorPallete: '',
          displayNameTranslations: { 'en-US': 'Second world' },
          documentCount: 0,
          id: guardWorldBId,
          templateLayout: {
            groups: [],
            placements: []
          }
        }
      ]
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Delete world stays disabled when world has documents', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()
    await appWindow.locator(`[data-test-locator="${selectorList.worldsTab}"]`).first().click()
    const removeButton = appWindow.locator(`[data-test-locator="${selectorList.worldsRemoveButton}"]`)
    await expect(removeButton).toBeDisabled()
    await removeButton.hover()
    await expect(
      appWindow.getByText(L_projectSettings.panels.worlds.removeDisabledHasDocuments)
    ).toBeVisible()
  })
})

test.describe.serial('DialogProjectSettings delete guards — templates', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  const guardWorldId = '550e8400-e29b-41d4-a716-446655440099'
  const guardTemplateId = '660e8400-e29b-41d4-a716-446655440099'
  const guardTemplateBId = '660e8400-e29b-41d4-a716-446655440098'

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchProjectSettingsGuardHarness(testInfo, {
      directDocumentTemplatesSnapshot: [
        {
          documentCount: 1,
          icon: '',
          id: guardTemplateId,
          titlePluralTranslations: { 'en-US': 'Blocked template' },
          titleSingularTranslations: { 'en-US': 'Blocked template' },
          worldAppendixTranslations: {}
        },
        {
          documentCount: 0,
          icon: '',
          id: guardTemplateBId,
          titlePluralTranslations: { 'en-US': 'Deletable template' },
          titleSingularTranslations: { 'en-US': 'Deletable template' },
          worldAppendixTranslations: {}
        }
      ],
      directInput: projectSettingsDirectInput,
      directSettingsSnapshot: guardHarnessProjectSettings,
      directWorldsSnapshot: [
        {
          color: '',
          colorPallete: '',
          displayNameTranslations: { 'en-US': 'Only world' },
          documentCount: 0,
          id: guardWorldId,
          templateLayout: {
            groups: [],
            placements: []
          }
        }
      ]
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Delete template stays disabled when template has documents', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabDocumentTemplatesSettings}"]`).click()
    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`).first().click()
    const removeButton = appWindow.locator(
      `[data-test-locator="${selectorList.documentTemplatesRemoveButton}"]`
    )
    await expect(removeButton).toBeDisabled()
    await removeButton.hover()
    await expect(
      appWindow.getByText(L_projectSettings.panels.documentTemplates.removeDisabledHasDocuments)
    ).toBeVisible()
  })

  test('Confirm delete removes deletable document template row', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`).nth(1).click()
    const tabsBefore = await countVisibleTabs(appWindow, selectorList.documentTemplatesTab)
    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesRemoveButton}"]`).click()
    const confirmButton = appWindow.locator(
      '[data-test-locator="dialogProjectSettings-documentTemplates-deleteConfirmConfirmButton"]'
    )
    await expect(async () => {
      if (await confirmButton.isDisabled()) {
        await appWindow.waitForTimeout(1100)
      }
      await confirmButton.click()
    }).toPass({ timeout: 10_000 })
    await expect(await countVisibleTabs(appWindow, selectorList.documentTemplatesTab)).toBe(tabsBefore - 1)
  })
})
