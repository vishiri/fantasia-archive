import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import L_projectSettings from 'app/i18n/en-US/dialogs/L_projectSettings'
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

const componentFixtureProjectName = 'Component test project name'

const componentFixtureWorldId = '550e8400-e29b-41d4-a716-446655440000'

const selectorList = {
  closeButton: 'dialogProjectSettings-button-close',
  colorPaletteAddButton: 'dialogProjectSettings-worlds-colorPaletteAddButton',
  colorPaletteEditor: 'dialogProjectSettings-worlds-colorPaletteEditor',
  colorPaletteSwatch: 'dialogProjectSettings-worlds-colorPaletteSwatch',
  projectNameInput: 'dialogProjectSettings-input-projectName',
  saveButton: 'dialogProjectSettings-button-save',
  saveErrorsIcon: 'dialogProjectSettings-saveErrorsIcon',
  tabGeneralSettings: 'dialogProjectSettings-tab-generalSettings',
  tabDocumentTemplatesSettings: 'dialogProjectSettings-tab-documentTemplatesSettings',
  tabWorldsSettings: 'dialogProjectSettings-tab-worldsSettings',
  title: 'dialogProjectSettings-title',
  worldsAddButton: 'dialogProjectSettings-worlds-addButton',
  worldsList: 'dialogProjectSettings-worlds-list',
  worldTemplateLayoutPanel: 'dialogProjectSettings-worldTemplateLayoutPanel',
  worldTemplateLayoutAddGroup: 'dialogProjectSettings-worldTemplateLayoutAddGroup',
  worldAvailableTemplatesList: 'dialogProjectSettings-worldAvailableTemplatesList',
  documentTemplatesAddButton: 'dialogProjectSettings-documentTemplates-addButton',
  documentTemplatesAddFirstButton: 'dialogProjectSettings-documentTemplates-addFirstButton',
  documentTemplatesDeleteConfirmCountdown: 'dialogProjectSettings-documentTemplates-deleteConfirmCountdown',
  documentTemplatesEmptyState: 'dialogProjectSettings-documentTemplates-emptyState',
  documentTemplatesIconInput: 'dialogProjectSettings-documentTemplates-iconInput',
  documentTemplatesIconMenuSearch: 'dialogProjectSettings-documentTemplates-iconInput-menu-search',
  documentTemplatesIconTrigger: 'dialogProjectSettings-documentTemplates-iconInput-trigger',
  documentTemplatesList: 'dialogProjectSettings-documentTemplates-list',
  documentTemplatesNameInput: 'dialogProjectSettings-documentTemplates-nameInput',
  documentTemplatesRemoveButton: 'dialogProjectSettings-documentTemplates-removeButton',
  documentTemplatesTab: 'dialogProjectSettings-documentTemplates-tab',
  documentTemplatesWorldAppendixInput: 'dialogProjectSettings-documentTemplates-worldAppendixInput'
} as const

const projectSettingsDirectInput: T_dialogName = 'ProjectSettings'

test.describe.serial('Project settings dialog', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directInput: projectSettingsDirectInput,
      directSettingsSnapshot: {
        projectName: componentFixtureProjectName,
        schemaVersion: 1
      },
      directWorldsSnapshot: [{
        color: '',
        colorPallete: '',
        displayNameTranslations: { 'en-US': 'Component test world' },
        documentCount: 0,
        id: componentFixtureWorldId,
        templateLayout: {
          groups: [],
          placements: []
        }
      }],
      directDocumentTemplatesSnapshot: []
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
   * Opens DialogProjectSettings via component harness directInput and directSettingsSnapshot.
   */
  test('Renders Project Settings title, General settings tab, and prefilled project name', async () => {
    const dialogShell = appWindow.locator('.q-dialog.dialogComponent.ProjectSettings')
    await expect(dialogShell).toHaveCount(1)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    ).toHaveText(L_projectSettings.title)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tabGeneralSettings}"]`)
    ).toHaveText(L_projectSettings.categories.generalSettings.title)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`)
    ).toHaveText(L_projectSettings.categories.worldsSettings.title)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tabDocumentTemplatesSettings}"]`)
    ).toHaveText(L_projectSettings.categories.documentTemplatesSettings.title)

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.projectNameInput}"]`)
    await expect(nameInput).toHaveValue(componentFixtureProjectName)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    ).toContainText(L_projectSettings.closeButton)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    ).toContainText(L_projectSettings.saveButton)
  })

  /**
   * Worlds settings tab shows the worlds list and add-world control when selected.
   */
  test('Worlds settings tab shows worlds list when selected', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldsList}"]`)
    ).toBeVisible()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldsAddButton}"]`)
    ).toContainText(L_projectSettings.panels.worlds.addWorldButton)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectNameInput}"]`)
    ).toHaveCount(0)
  })

  /**
   * Worlds detail shows template layout chrome and available global templates.
   */
  test('Worlds detail shows template layout panel and available templates', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldTemplateLayoutPanel}"]`)
    ).toBeVisible()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldTemplateLayoutAddGroup}"]`)
    ).toContainText(L_projectSettings.fields.worldTemplateLayout.addGroupButton)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldAvailableTemplatesList}"]`)
    ).toBeVisible()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.worldAvailableTemplatesList}"]`)
    ).toContainText(L_projectSettings.fields.worldTemplateLayout.emptyAvailableTemplates)
  })

  /**
   * World color palette editor supports adding swatches and shows hex tooltips.
   */
  test('World color palette editor adds swatches and exposes hex tooltips', async () => {
    const editor = appWindow.locator(`[data-test-locator="${selectorList.colorPaletteEditor}"]`)
    await expect(editor).toHaveCount(1)

    const addButton = appWindow.locator(`[data-test-locator="${selectorList.colorPaletteAddButton}"]`)
    await expect(addButton).toHaveAttribute(
      'aria-label',
      L_projectSettings.fields.worldColorPalette.addButton
    )

    const swatches = appWindow.locator(`[data-test-locator="${selectorList.colorPaletteSwatch}"]`)
    await expect(swatches).toHaveCount(0)

    await addButton.click()
    await expect(swatches).toHaveCount(1)
    await expect(swatches.first()).toHaveAttribute('data-test-tooltip-text', '#FFFFFF')

    await addButton.click()
    await expect(swatches).toHaveCount(2)
    await expect(swatches.nth(1)).toHaveAttribute('data-test-tooltip-text', '#FFFFFF')
  })

  /**
   * Duplicate world palette colors disable Save settings while the dialog stays open.
   */
  test('Duplicate world palette colors disable Save settings', async () => {
    const saveButton = appWindow.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    await expect(saveButton).toBeDisabled()

    const saveErrorsIcon = appWindow.locator(`[data-test-locator="${selectorList.saveErrorsIcon}"]`)
    await expect(saveErrorsIcon).toHaveCount(1)
    const bulletLine = L_projectSettings.saveErrors.bulletDuplicatePalette.replace(
      '{worldLabel}',
      'Component test world'
    )
    const expectedTooltip = `${L_projectSettings.saveErrors.tooltipIntro}\n- ${bulletLine}`
    await expect(saveErrorsIcon).toHaveAttribute('data-test-tooltip-text', expectedTooltip)
  })

  /**
   * Document Template Settings tab shows centered empty state when no templates exist.
   */
  test('Document templates settings tab shows empty state with add-first button', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabDocumentTemplatesSettings}"]`).click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesEmptyState}"]`)
    ).toBeVisible()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesList}"]`)
    ).toHaveCount(0)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesAddFirstButton}"]`)
    ).toContainText(L_projectSettings.panels.documentTemplates.addFirstTemplateButton)
  })

  /**
   * Add document template exposes detail fields and delete countdown on confirm menu.
   */
  test('Document templates tab supports add, edit fields, and delete countdown', async () => {
    test.setTimeout(90_000)

    await appWindow.locator(`[data-test-locator="${selectorList.tabDocumentTemplatesSettings}"]`).click()
    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesAddFirstButton}"]`).click()

    const templateTab = appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesTab}"]`).first()
    await expect(templateTab).toContainText(L_projectSettings.panels.documentTemplates.defaultNewTemplateName)

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesNameInput}"]`)
    await nameInput.fill('Character sheet')
    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesWorldAppendixInput}"]`).fill(' of Eldoria')

    const iconMenuVirtualScrollLocator = `${selectorList.documentTemplatesIconInput}-menu-virtualScroll`
    const iconMenuPanel = appWindow.locator('.faIconPickerInput__menuPanel')
    const iconTrigger = appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesIconTrigger}"]`)

    await expect(async () => {
      await iconTrigger.click()
      await expect(
        appWindow.locator(`[data-test-locator="${iconMenuVirtualScrollLocator}"]`)
      ).toBeVisible()
      const firstIconCell = iconMenuPanel.locator('[data-test-locator$="-iconCell"]').first()
      await expect(firstIconCell).toBeVisible()
      const selectedIconName = await firstIconCell.getAttribute('data-test-icon-name')
      expect(selectedIconName).toBeTruthy()
      await firstIconCell.scrollIntoViewIfNeeded()
      await firstIconCell.click()
      await expect(iconTrigger).toHaveAttribute('data-test-icon-name', selectedIconName ?? '')
    }).toPass({ timeout: 45_000 })

    await expect(nameInput).toHaveValue('Character sheet')

    await appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesRemoveButton}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesDeleteConfirmCountdown}"]`)
    ).toHaveText('5')
  })

  /**
   * Worlds template layout adds a global template from the available list and supports Add group.
   */
  test('World template layout adds available template and group rows', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabDocumentTemplatesSettings}"]`).click()

    const addFirstButton = appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesAddFirstButton}"]`)
    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.documentTemplatesNameInput}"]`)

    if (await addFirstButton.count() > 0) {
      await addFirstButton.click()
      await nameInput.fill('Character sheet')
    } else {
      await expect(nameInput).toHaveValue('Character sheet')
    }

    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()

    const availableTemplate = appWindow.locator(
      '[data-test-locator^="dialogProjectSettings-worldAvailableTemplate-"]'
    ).first()
    await expect(availableTemplate).toContainText('Character sheet')
    await availableTemplate.click()

    const layoutTemplateNode = appWindow.locator(
      '[data-test-locator^="dialogProjectSettings-worldTemplateLayoutTreeNode-template-"]'
    ).first()
    await expect(layoutTemplateNode).toContainText('Character sheet')

    await appWindow.locator(`[data-test-locator="${selectorList.worldTemplateLayoutAddGroup}"]`).click()

    await expect(
      appWindow.locator('[data-test-locator^="dialogProjectSettings-worldTemplateLayoutTreeNode-group-"]').first()
    ).toBeVisible()

    await expect(availableTemplate).toHaveCount(0)
  })

  /**
   * Close without saving dismisses the dialog without requiring a persisted project database.
   */
  test('Close without saving dismisses the dialog', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabGeneralSettings}"]`).click()

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.projectNameInput}"]`)
    await nameInput.fill('Edited but not saved')

    await appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`).click()

    const dialogShell = appWindow.locator('.q-dialog.dialogComponent.ProjectSettings')
    await expect(dialogShell).toHaveCount(0)
  })
})
