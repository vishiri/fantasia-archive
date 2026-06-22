import { computed, ref, watch } from 'vue'
import { expect, test, vi } from 'vitest'

import type { createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring'
import { wireDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameTooltipRenameMenu } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameTooltipRenameMenuWiring'

type T_actionTooltipsWiring = ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring>

/**
 * wireDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameTooltipRenameMenu
 * Arms the nickname hover tooltip when the rename menu closes.
 */
test('Test that placement nickname tooltip wiring arms hover tooltip when rename menu closes', () => {
  const suppressPlacementNicknameHoverTooltip = vi.fn()
  const armPlacementNicknameHoverTooltip = vi.fn()
  const renameMenuOpen = ref(false)

  wireDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameTooltipRenameMenu({
    actionTooltipsWiring: {
      armPlacementNicknameHoverTooltip,
      suppressPlacementNicknameHoverTooltip
    } as unknown as T_actionTooltipsWiring,
    renameMenuOpen: computed(() => renameMenuOpen.value),
    watch
  })

  renameMenuOpen.value = true
  renameMenuOpen.value = false

  expect(suppressPlacementNicknameHoverTooltip).toHaveBeenCalledTimes(1)
  expect(armPlacementNicknameHoverTooltip).toHaveBeenCalledTimes(1)
})
