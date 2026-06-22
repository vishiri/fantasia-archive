import { computed } from 'vue'
import { expect, test } from 'vitest'

import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuPinnedAsideWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuPinnedAsideWiring'

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuPinnedAsideWiring
 * Exposes pinned-aside menu values only for template nickname rename menus.
 */
test('Test that rename menu pinned-aside wiring hides values when template aside is off', () => {
  const showTemplatePinnedAside = computed(() => false)
  const templateCanonicalName = computed(() => 'Character')
  const templateCanonicalNameLabel = computed(() => 'Document template name')
  const templateCanonicalNameTooltipText = computed(() => 'Canonical title')

  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuPinnedAsideWiring({
    computed,
    showTemplatePinnedAside,
    templateCanonicalName,
    templateCanonicalNameLabel,
    templateCanonicalNameTooltipText
  })

  expect(wiring.menuPinnedAsideLabelValue.value).toBeUndefined()
  expect(wiring.menuPinnedAsideTooltipValue.value).toBeUndefined()
  expect(wiring.menuPinnedAsideValue.value).toBeUndefined()
})

test('Test that rename menu pinned-aside wiring exposes template canonical values when enabled', () => {
  const showTemplatePinnedAside = computed(() => true)
  const templateCanonicalName = computed(() => 'Character')
  const templateCanonicalNameLabel = computed(() => 'Document template name')
  const templateCanonicalNameTooltipText = computed(() => 'Canonical title')

  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuPinnedAsideWiring({
    computed,
    showTemplatePinnedAside,
    templateCanonicalName,
    templateCanonicalNameLabel,
    templateCanonicalNameTooltipText
  })

  expect(wiring.menuPinnedAsideLabelValue.value).toBe('Document template name')
  expect(wiring.menuPinnedAsideTooltipValue.value).toBe('Canonical title')
  expect(wiring.menuPinnedAsideValue.value).toBe('Character')
})
