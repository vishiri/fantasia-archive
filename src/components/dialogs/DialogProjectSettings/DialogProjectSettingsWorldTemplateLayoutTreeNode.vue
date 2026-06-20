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
          :data-test-locator="`${nodeTestLocator}-edit`"
          :data-test-tooltip-text="editTooltipText"
          @click.stop="onEditClick"
          @mouseleave="armEditTooltip"
        >
          <q-tooltip
            ref="editTooltipRef"
            :delay="300"
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
          :data-test-locator="`${nodeTestLocator}-remove`"
          :data-test-tooltip-text="removeTooltipText"
          @click.stop="onRemoveClick"
          @mouseleave="armRemoveTooltip"
        >
          <q-tooltip
            ref="removeTooltipRef"
            :delay="300"
            :disable="!removeTooltipHoverEnabled"
          >
            {{ removeTooltipText }}
          </q-tooltip>
        </q-btn>
      </div>
      <q-tooltip
        v-if="showPlacementNicknameHoverTooltip"
        ref="placementNicknameHoverTooltipRef"
        anchor="center right"
        self="center left"
        :delay="300"
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
    <q-menu
      v-if="renameMenuWiring.supportsRenameMenu"
      v-model="renameMenuOpen"
      anchor="bottom left"
      class="dialogProjectSettingsWorldTemplateLayoutTreeNode__contextMenu"
      dark
      :data-test-locator="renameMenuWiring.contextMenuTestLocator"
      :offset="renameMenuWiring.menuOffset"
      :content-style="renameMenuStyle"
      :style="renameMenuStyle"
      no-parent-event
      no-refocus
      self="top left"
      square
      :target="nodeAnchorRef ?? undefined"
      transition-hide="fade"
      transition-show="fade"
      @before-show="renameMenuWiring.onRenameMenuBeforeShow"
      @show="renameMenuWiring.onRenameMenuShow"
      @hide="renameMenuWiring.onRenameMenuHide"
      @keydown.esc.stop="renameMenuWiring.closeRenameMenu"
    >
      <div
        class="dialogProjectSettingsWorldTemplateLayoutTreeNode__renameMenuBody"
        :style="renameMenuStyle"
        @keydown.enter.stop.prevent="renameMenuWiring.closeRenameMenu"
        @keydown.esc.stop="renameMenuWiring.closeRenameMenu"
      >
        <q-input
          ref="renameInputRef"
          v-model="renameDraft"
          autofocus
          class="full-width"
          color="primary-bright"
          dark
          dense
          filled
          :error="renameHasError"
          :error-message="renameMenuErrorMessage"
          :data-test-locator="renameMenuWiring.renameInputTestLocator"
          hide-bottom-space
          :label="renameInputLabel"
          @keydown.enter.stop.prevent="renameMenuWiring.closeRenameMenu"
          @keydown.esc.stop="renameMenuWiring.closeRenameMenu"
          @update:model-value="renameMenuWiring.onRenameDraftUpdate"
        >
          <template
            v-if="showTemplateCanonicalName"
            #append
          >
            <q-icon
              class="dialogProjectSettingsWorldTemplateLayoutTreeNode__inputHelpIcon"
              data-test-locator="dialogProjectSettings-worldTemplateLayoutTemplateNicknameTooltipIcon"
              :data-test-tooltip-text="templateNicknameTooltipText"
              name="mdi-help-circle"
              size="16px"
              @click.stop
            >
              <q-tooltip
                :delay="500"
                content-class="dialogProjectSettings__fieldHelpTooltip"
              >
                {{ templateNicknameTooltipText }}
              </q-tooltip>
            </q-icon>
          </template>
        </q-input>
        <DialogProjectSettingsWorldTemplateLayoutTreeNodeCanonicalNameField
          v-if="showTemplateCanonicalName"
          :canonical-name-test-locator="canonicalNameTestLocator"
          canonical-name-tooltip-icon-test-locator="dialogProjectSettings-worldTemplateLayoutTemplateCanonicalNameTooltipIcon"
          :template-canonical-name="templateCanonicalName"
          :template-canonical-name-label="templateCanonicalNameLabel"
          :template-canonical-name-tooltip-text="templateCanonicalNameTooltipText"
        />
      </div>
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import DialogProjectSettingsWorldTemplateLayoutTreeNodeCanonicalNameField from './DialogProjectSettingsWorldTemplateLayoutTreeNodeCanonicalNameField.vue'
import DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea from './DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea.vue'
import { useDialogProjectSettingsWorldTemplateLayoutTreeNode } from './scripts/dialogProjectSettingsWorldTemplateLayoutTreeNode_manager'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutTreeNode'
})

const props = defineProps<{
  blankGroupIds?: ReadonlySet<string>
  duplicateDocumentTemplateIds?: ReadonlySet<string>
  invalidDocumentTemplateIds?: ReadonlySet<string>
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
}>()

const emit = defineEmits<{
  deleteGroup: [groupId: string]
  removePlacement: [placementId: string]
  renamePlacementNickname: [placementId: string, nickname: string]
  renameGroup: [groupId: string, displayName: string]
}>()

const {
  armEditTooltip,
  armRemoveTooltip,
  displayIconName,
  editTooltipHoverEnabled,
  editTooltipRef,
  editTooltipText,
  hidePlacementNicknameHoverTooltip,
  nodeAnchorRef,
  nodeRootClassList,
  nodeTestLocator,
  onEditClick,
  onRemoveClick,
  onRenameContextMenu,
  placementNicknameHoverTooltipEnabled,
  placementNicknameHoverTooltipNicknameLine,
  placementNicknameHoverTooltipOffset,
  placementNicknameHoverTooltipOriginalNameLine,
  placementNicknameHoverTooltipRef,
  placementNicknameHoverTooltipTestText,
  removeTooltipHoverEnabled,
  removeTooltipRef,
  removeTooltipText,
  renameDraft,
  renameHasError,
  renameInputLabel,
  renameInputRef,
  renameMenuErrorMessage,
  renameMenuOpen,
  renameMenuStyle,
  renameMenuWiring,
  rowHasValidationError,
  revealPlacementNicknameHoverTooltip,
  showPlacementNicknameHoverTooltip,
  suppressPlacementNicknameHoverTooltip,
  showTemplateCanonicalName,
  templateCanonicalName,
  templateCanonicalNameLabel,
  templateCanonicalNameTooltipText,
  templateNicknameTooltipText,
  canonicalNameTestLocator
} = useDialogProjectSettingsWorldTemplateLayoutTreeNode(props, emit)
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldTemplateLayoutTreeNode.unscoped.scss"></style>
<style lang="scss" src="./styles/DialogProjectSettings.worldTemplateLayoutTreeNodeContextMenu.unscoped.scss"></style>
