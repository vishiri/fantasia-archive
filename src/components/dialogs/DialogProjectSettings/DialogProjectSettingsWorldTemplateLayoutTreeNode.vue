<template>
  <div
    ref="nodeAnchorRef"
    class="dialogProjectSettingsWorldTemplateLayoutTreeNode column q-hoverable relative-position"
    :class="nodeRootClassList"
    :data-test-locator="nodeTestLocator"
    :data-test-validation-error="rowHasValidationError ? 'true' : 'false'"
    @contextmenu.prevent="onRenameContextMenu"
    @mouseenter="revealPlacementNicknameHoverTooltip"
    @mouseleave="hidePlacementNicknameHoverTooltip"
  >
    <div
      class="q-focus-helper"
      tabindex="-1"
    />
    <div
      class="dialogProjectSettingsWorldTemplateLayoutTreeNode__titleRow row items-center no-wrap"
      :data-test-locator="`${nodeTestLocator}-titleRow`"
      :data-test-tooltip-text="placementNicknameHoverTooltipTestText"
    >
      <DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea
        :display-icon-name="displayIconName"
        :node="props.node"
        :node-test-locator="nodeTestLocator"
      />
      <DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning
        v-if="(props.node.nodeKind === 'template' || props.node.nodeKind === 'group') && showMissingTranslationsWarning"
        :test-locator="missingTranslationsWarningTestLocator"
        :tooltip-text="missingTranslationsWarningTooltipText"
        @mouseenter="suppressPlacementNicknameHoverTooltip"
        @mouseleave="revealPlacementNicknameHoverTooltip"
      />
      <div
        v-if="props.node.nodeKind === 'template' || props.node.nodeKind === 'group'"
        class="dialogProjectSettingsWorldTemplateLayoutTreeNode__actions row items-center no-wrap"
        @mouseenter="suppressPlacementNicknameHoverTooltip"
        @mouseleave="revealPlacementNicknameHoverTooltip"
      >
        <q-btn
          v-if="renameMenuWiring.supportsRenameMenu"
          class="dialogProjectSettingsWorldTemplateLayoutTreeNode__edit"
          color="primary-bright"
          dense
          flat
          icon="edit"
          round
          size="sm"
          :aria-label="editTooltipText"
          :data-test-locator="`${nodeTestLocator}-edit`"
          :data-test-tooltip-text="editTooltipText"
          @click.stop="onEditClick"
          @mouseleave="armEditTooltip"
        >
          <q-tooltip
            ref="editTooltipRef"
            :disable="!editTooltipHoverEnabled"
          >
            {{ editTooltipText }}
          </q-tooltip>
        </q-btn>
        <q-btn
          class="dialogProjectSettingsWorldTemplateLayoutTreeNode__remove"
          color="negative"
          dense
          flat
          icon="mdi-close"
          round
          size="sm"
          :aria-label="removeTooltipText"
          :data-test-locator="`${nodeTestLocator}-remove`"
          :data-test-remove-disabled="removeDisabled ? 'true' : 'false'"
          :data-test-tooltip-text="removeTooltipText"
          :disable="removeDisabled"
          @click.stop="onRemoveClick"
          @mouseleave="armRemoveTooltip"
        >
          <q-tooltip
            ref="removeTooltipRef"
            :class="{ dialogProjectSettingsWorldTemplateLayoutTreeNode__removeDisabledTooltip: removeDisabled }"
            :disable="!removeTooltipHoverEnabled"
          >
            {{ removeTooltipText }}
          </q-tooltip>
        </q-btn>
      </div>
      <q-tooltip
        v-if="showPlacementNicknameHoverTooltip && !renameMenuOpen"
        ref="placementNicknameHoverTooltipRef"
        anchor="center right"
        no-parent-event
        self="center left"
        :disable="!placementNicknameHoverTooltipEnabled"
        :offset="placementNicknameHoverTooltipOffset"
      >
        <div class="dialogProjectSettingsWorldTemplateLayoutTreeNode__placementNicknameTooltipLine">
          {{ placementNicknameHoverTooltipNicknameLine }}
        </div>
        <div class="dialogProjectSettingsWorldTemplateLayoutTreeNode__placementNicknameTooltipLine">
          {{ placementNicknameHoverTooltipOriginalNameLine }}
        </div>
      </q-tooltip>
    </div>
    <div
      v-if="props.node.worldAppendix.trim().length > 0"
      class="dialogProjectSettingsWorldTemplateLayoutTreeNode__affixRow row no-wrap"
    >
      <span
        aria-hidden="true"
        class="dialogProjectSettingsWorldTemplateLayoutTreeNode__affixIndent"
      />
      <span
        class="dialogProjectSettingsWorldTemplateLayoutTreeNode__appendix fa-text-muted text-caption col ellipsis"
      >
        ({{ props.node.worldAppendix.trim() }})
      </span>
    </div>
    <DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu
      v-if="renameMenuWiring.supportsRenameMenu"
      v-model:rename-menu-open="renameMenuOpen"
      v-model:translations-draft="renameTranslationsDraft"
      :context-menu-test-locator="renameMenuContextMenuTestLocator"
      :current-language-code="props.currentLanguageCode"
      :error-message="renameMenuErrorMessageText"
      :has-error="renameHasError"
      :input-test-locator="renameInputTestLocatorValue"
      :max-length="renameTranslationMaxLength"
      :menu-offset="renameMenuWiring.menuOffset"
      :menu-pinned-aside-label="menuPinnedAsideLabelValue"
      :menu-pinned-aside-test-locator="showTemplatePinnedAside ? 'dialogProjectSettings-worldTemplateLayoutTemplateCanonicalName' : undefined"
      :menu-pinned-aside-tooltip="menuPinnedAsideTooltipValue"
      :menu-pinned-aside-value="menuPinnedAsideValue"
      :menu-style="renameMenuStyleValue"
      :menu-target="nodeAnchorRef"
      :on-before-show="renameMenuWiring.onRenameMenuBeforeShow"
      :on-close="renameMenuWiring.closeRenameMenu"
      :on-hide="renameMenuWiring.onRenameMenuHide"
      :on-show="renameMenuWiring.onRenameMenuShow"
      :on-translations-draft-update="onRenameTranslationsDraftUpdate"
      :translation-forms="props.node.nodeKind === 'template' ? 'singularPlural' : 'single'"
    />
  </div>
</template>

<script setup lang="ts">
import DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea from './DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea.vue'
import DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning from './DialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarning.vue'
import DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu from './DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu.vue'
import { useDialogProjectSettingsWorldTemplateLayoutTreeNode } from './scripts/dialogProjectSettingsWorldTemplateLayoutTreeNode_manager'
import { FA_PROJECT_WORLD_TEMPLATE_GROUP_DISPLAY_NAME_TRANSLATION_MAX_LENGTH } from 'app/types/I_faProjectWorldTemplateGroupDisplayNameTranslations'
import { FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_TRANSLATION_MAX_LENGTH } from 'app/types/I_faProjectWorldTemplatePlacementNicknameTranslations'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'
import { computed, type CSSProperties } from 'vue'

defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutTreeNode'
})

const props = defineProps<{
  blankGroupIds?: ReadonlySet<string> | undefined
  currentLanguageCode: T_faUserSettingsLanguageCode
  documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[]
  duplicateDocumentTemplateIds?: ReadonlySet<string> | undefined
  invalidDocumentTemplateIds?: ReadonlySet<string> | undefined
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
}>()

const emit = defineEmits<{
  deleteGroup: [groupId: string]
  removePlacement: [placementId: string]
  renamePlacementNickname: [placementId: string, nicknameTranslations: I_faLocaleSingularPluralTranslations]
  renameGroup: [groupId: string, displayNameTranslations: I_faLocaleStringTranslations]
}>()

const {
  armEditTooltip,
  armRemoveTooltip,
  displayIconName,
  editTooltipHoverEnabled,
  editTooltipRef,
  editTooltipText,
  hidePlacementNicknameHoverTooltip,
  missingTranslationsWarningTestLocator,
  missingTranslationsWarningTooltipText,
  nodeAnchorRef,
  nodeRootClassList,
  nodeTestLocator,
  onEditClick,
  onRemoveClick,
  onRenameContextMenu,
  onRenameTranslationsDraftUpdate,
  placementNicknameHoverTooltipEnabled,
  placementNicknameHoverTooltipNicknameLine,
  placementNicknameHoverTooltipOffset,
  placementNicknameHoverTooltipOriginalNameLine,
  placementNicknameHoverTooltipRef,
  placementNicknameHoverTooltipTestText,
  removeDisabled,
  removeTooltipHoverEnabled,
  removeTooltipRef,
  removeTooltipText,
  renameHasError,
  renameMenuErrorMessage,
  renameMenuOpen,
  renameMenuStyle,
  renameMenuWiring,
  renameTranslationsDraft,
  renameInputTestLocatorValue,
  menuPinnedAsideLabelValue,
  menuPinnedAsideTooltipValue,
  menuPinnedAsideValue,
  rowHasValidationError,
  showMissingTranslationsWarning,
  revealPlacementNicknameHoverTooltip,
  showPlacementNicknameHoverTooltip,
  showTemplatePinnedAside,
  suppressPlacementNicknameHoverTooltip
} = useDialogProjectSettingsWorldTemplateLayoutTreeNode(props, emit)

const renameMenuErrorMessageText = computed((): string | undefined => renameMenuErrorMessage.value)
const renameMenuStyleValue = computed((): CSSProperties | undefined => renameMenuStyle.value)
const renameMenuContextMenuTestLocator = computed((): string => renameMenuWiring.contextMenuTestLocator.value ?? '')

const renameTranslationMaxLength = computed(() => {
  if (props.node.nodeKind === 'group') {
    return FA_PROJECT_WORLD_TEMPLATE_GROUP_DISPLAY_NAME_TRANSLATION_MAX_LENGTH
  }
  return FA_PROJECT_WORLD_TEMPLATE_PLACEMENT_NICKNAME_TRANSLATION_MAX_LENGTH
})
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldTemplateLayoutTreeNode.unscoped.scss"></style>
<style lang="scss" src="./styles/DialogProjectSettings.worldTemplateLayoutTreeNodeContextMenu.unscoped.scss"></style>
