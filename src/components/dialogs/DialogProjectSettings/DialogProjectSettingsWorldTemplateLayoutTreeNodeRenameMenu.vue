<template>
  <q-menu
    v-model="renameMenuOpenModel"
    anchor="bottom left"
    class="dialogProjectSettingsWorldTemplateLayoutTreeNode__contextMenu"
    dark
    :data-test-locator="contextMenuTestLocator"
    :offset="menuOffset"
    :content-style="menuStyle"
    :style="menuStyle"
    no-parent-event
    no-refocus
    self="top left"
    square
    :target="menuTarget ?? undefined"
    transition-hide="fade"
    transition-show="fade"
    @before-show="onBeforeShow"
    @show="onMenuShow"
    @hide="onHide"
    @keydown.esc.stop="onClose"
  >
    <div
      class="dialogProjectSettingsWorldTemplateLayoutTreeNode__renameMenuBody"
      :style="menuStyle"
      @keydown.esc.stop="onClose"
    >
      <FaLocaleTranslationsInput
        ref="renameTranslationsInputRef"
        v-model="translationsDraftModel"
        class="full-width"
        :current-language-code="currentLanguageCode"
        dark
        dense
        :error="hasError"
        :error-message="errorMessage"
        :max-length="maxLength"
        :menu-pinned-aside-label="menuPinnedAsideLabel"
        :menu-pinned-aside-test-locator="menuPinnedAsideTestLocator"
        :menu-pinned-aside-tooltip="menuPinnedAsideTooltip"
        :menu-pinned-aside-value="menuPinnedAsideValue"
        presentation="menuPanel"
        :test-locator="inputTestLocator"
        :translation-forms="translationForms"
        @update:model-value="onTranslationsDraftUpdate"
      />
    </div>
  </q-menu>
</template>

<script setup lang="ts">
import { nextTick, ref, type CSSProperties } from 'vue'

import FaLocaleTranslationsInput from 'app/src/components/elements/FaLocaleTranslationsInput/FaLocaleTranslationsInput.vue'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { T_faLocaleTranslationsInputTranslationForms } from 'app/types/I_faLocaleTranslationsInput'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'

defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenu'
})

const props = defineProps<{
  contextMenuTestLocator: string
  currentLanguageCode: T_faUserSettingsLanguageCode
  errorMessage?: string | undefined
  hasError: boolean
  inputTestLocator: string
  maxLength: number
  menuOffset: [number, number]
  menuPinnedAsideLabel?: string | undefined
  menuPinnedAsideTestLocator?: string | undefined
  menuPinnedAsideTooltip?: string | undefined
  menuPinnedAsideValue?: string | undefined
  menuStyle?: CSSProperties | undefined
  menuTarget: HTMLElement | null
  onBeforeShow: () => void
  onClose: () => void
  onHide: () => void
  onShow: () => void
  onTranslationsDraftUpdate: (
    value: I_faLocaleStringTranslations | I_faLocaleSingularPluralTranslations
  ) => void
  translationForms: T_faLocaleTranslationsInputTranslationForms
  translationsDraft: I_faLocaleStringTranslations | I_faLocaleSingularPluralTranslations
}>()

const renameMenuOpenModel = defineModel<boolean>('renameMenuOpen', { required: true })
const translationsDraftModel = defineModel<
  I_faLocaleStringTranslations | I_faLocaleSingularPluralTranslations
>('translationsDraft', { required: true })

const renameTranslationsInputRef = ref<InstanceType<typeof FaLocaleTranslationsInput> | null>(null)

function onMenuShow (): void {
  props.onShow()
  void nextTick(() => {
    renameTranslationsInputRef.value?.focusPreferredLanguageInput()
  })
}
</script>
