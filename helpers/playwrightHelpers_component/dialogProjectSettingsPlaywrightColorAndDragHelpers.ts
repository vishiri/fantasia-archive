import { expect, type Page } from '@playwright/test'

import { dragWorldTemplateLayoutTreeNode } from 'app/helpers/playwrightHelpers_component/dialogProjectSettingsWorldTemplateLayoutTreeDrag'

/**
 * Sets a world palette swatch color through its embedded q-color picker.
 */
export async function setPaletteSwatchHex (
  page: Page,
  swatchIndex: number,
  hex: string
): Promise<void> {
  const swatch = page.locator('[data-test-locator="dialogProjectSettings-worlds-colorPaletteSwatch"]')
    .nth(swatchIndex)
  await swatch.click()
  const picker = page.locator('[data-test-locator="dialogProjectSettings-worlds-colorPalettePicker"]')
  await expect(picker).toBeVisible()
  const hexInput = picker.locator('input').first()
  await hexInput.fill(hex)
  await hexInput.press('Enter')
  await page.keyboard.press('Escape')
  await page.waitForTimeout(250)
}

/**
 * Opens the world color FaColorPickerInput menu.
 */
export async function openWorldColorPickerMenu (page: Page): Promise<void> {
  await page.locator('[data-test-locator="dialogProjectSettings-worlds-colorInput"]').click()
  await expect(
    page.locator('[data-test-locator="dialogProjectSettings-worlds-colorInput-picker"]')
  ).toBeVisible()
}

/**
 * Sets hex on an open q-color picker via its hex input.
 */
export async function setOpenColorPickerHex (
  page: Page,
  pickerLocator: string,
  hex: string
): Promise<void> {
  const picker = page.locator(`[data-test-locator="${pickerLocator}"]`)
  await expect(picker).toBeVisible()
  const hexInput = picker.locator('input').first()
  await hexInput.fill(hex)
  await hexInput.press('Enter')
  await page.waitForTimeout(200)
}

/**
 * Clicks a palette footer cube in an open q-color picker by hex value.
 */
export async function clickPaletteFooterColorByHex (
  page: Page,
  pickerLocator: string,
  hex: string
): Promise<void> {
  const targetHex = hex.toLowerCase()
  await expect(async () => {
    const picker = page.locator(`[data-test-locator="${pickerLocator}"]`)
    await expect(picker).toBeVisible()
    const footer = picker.locator('.q-color-picker__footer')
    const cubes = footer.locator('.q-color-picker__cube')
    const count = await cubes.count()
    if (count > 0) {
      for (let index = 0; index < count; index += 1) {
        const cube = cubes.nth(index)
        const backgroundColor = await cube.evaluate((element) => {
          return window.getComputedStyle(element).backgroundColor
        })
        if (backgroundColorMatchesHex(backgroundColor, targetHex)) {
          await cube.click()
          return
        }
      }
    }
    await setOpenColorPickerHex(page, pickerLocator, hex)
  }).toPass({ timeout: 15_000 })
}

function backgroundColorMatchesHex (backgroundColor: string, hex: string): boolean {
  const normalized = hex.replace('#', '').toLowerCase()
  if (normalized.length !== 6) {
    return false
  }
  if (backgroundColor.replace(/\s/g, '').toLowerCase().includes(normalized)) {
    return true
  }
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  const rgbMatch = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
  if (rgbMatch === null) {
    return false
  }
  return Number(rgbMatch[1]) === red &&
    Number(rgbMatch[2]) === green &&
    Number(rgbMatch[3]) === blue
}

/**
 * Drags a palette swatch row from one index to another.
 * Uses mouse steps so Sortable forceFallback (8px tolerance) registers the drag.
 */
export async function dragPaletteSwatch (
  page: Page,
  fromIndex: number,
  toIndex: number
): Promise<void> {
  const swatchLocator = '[data-test-locator="dialogProjectSettings-worlds-colorPaletteSwatch"]'
  const source = page.locator(swatchLocator).nth(fromIndex)
  const target = page.locator(swatchLocator).nth(toIndex)
  await page.keyboard.press('Escape')
  await source.scrollIntoViewIfNeeded()
  await target.scrollIntoViewIfNeeded()
  await source.hover()
  await page.waitForTimeout(50)
  await source.dragTo(target, {
    force: true,
    sourcePosition: {
      x: 8,
      y: 8
    },
    steps: 32,
    targetPosition: {
      x: 8,
      y: 8
    }
  })
  await page.waitForTimeout(400)
}

/**
 * Drags a vertical tab row identified by a data-test attribute value.
 */
export async function dragVerticalTab (
  page: Page,
  idAttribute: 'data-test-world-id' | 'data-test-template-id',
  fromId: string,
  toId: string,
  tabLocator: string
): Promise<void> {
  const source = page.locator(
    `[data-test-locator="${tabLocator}"][${idAttribute}="${fromId}"]`
  )
  const target = page.locator(
    `[data-test-locator="${tabLocator}"][${idAttribute}="${toId}"]`
  )
  await source.scrollIntoViewIfNeeded()
  await target.scrollIntoViewIfNeeded()
  await source.dragTo(target, {
    force: true,
    steps: 16
  })
  await page.waitForTimeout(400)
}

/**
 * Thin wrapper around he-tree layout drag helper.
 */
export async function dragLayoutTreeNode (
  page: Page,
  sourceShellLocator: string,
  targetShellLocator: string,
  mode: 'insert-before-target' | 'nest-into-target' = 'insert-before-target'
): Promise<void> {
  await dragWorldTemplateLayoutTreeNode(page, sourceShellLocator, targetShellLocator, mode)
}

/**
 * Clicks a world tab by visible label text.
 */
export async function clickWorldTabByLabel (page: Page, label: string): Promise<void> {
  await page.locator('[data-test-locator="dialogProjectSettings-worlds-tab"]')
    .filter({ hasText: label })
    .first()
    .click()
}

/**
 * Clicks a document template tab by visible label text.
 */
export async function clickDocumentTemplateTabByLabel (page: Page, label: string): Promise<void> {
  await page.locator('[data-test-locator="dialogProjectSettings-documentTemplates-tab"]')
    .filter({ hasText: label })
    .first()
    .click()
}
