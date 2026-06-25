import { computed, onBeforeUnmount, ref, toRef, watch } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'

import { createUseDialogProjectSettingsWorldTemplateLayoutTreeNode } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeUseWiring'

export const useDialogProjectSettingsWorldTemplateLayoutTreeNode =
  createUseDialogProjectSettingsWorldTemplateLayoutTreeNode({
    computed,
    i18n,
    onBeforeUnmount,
    ref,
    toRef,
    watch
  })
