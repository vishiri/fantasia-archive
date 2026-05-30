<template>
  <Transition name="global-language-selector-spellcheck-refresh-pop">
    <span
      v-if="show"
      class="globalLanguageSelectorSpellcheckRefreshControl__transitionRoot"
    >
      <q-btn
        round
        flat
        dense
        :ripple="false"
        class="globalLanguageSelectorSpellcheckRefreshControl__button bg-dark"
        :aria-label="$t('globalLanguageSelector.spellcheckRefreshAriaLabel')"
        :data-test-tooltip-text="$t('globalLanguageSelector.spellcheckRefreshTooltip')"
        data-test-locator="globalLanguageSelector-spellcheckRefresh"
        @click="emit('refreshWebContents')"
      >
        <q-icon
          class="globalLanguageSelectorSpellcheckRefreshControl__iconSpin fa-icon-spellcheck-refresh"
          name="mdi-refresh"
          size="22px"
        />
        <q-tooltip
          v-model="tooltipOpen"
          anchor="bottom middle"
          self="top middle"
          :delay="300"
          transition-hide="fade"
          :transition-duration="300"
        >
          <span class="globalLanguageSelectorSpellcheckRefreshControl__tooltipMultiline">
            {{ $t('globalLanguageSelector.spellcheckRefreshTooltip') }}
          </span>
        </q-tooltip>
      </q-btn>
    </span>
  </Transition>
</template>

<script setup lang="ts">
import { useGlobalLanguageSelectorSpellcheckRefreshControl } from './scripts/globalLanguageSelectorSpellcheckRefreshControl_manager'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  refreshWebContents: []
}>()

const { tooltipOpen } = useGlobalLanguageSelectorSpellcheckRefreshControl(props)
</script>

<style lang="scss" scoped>
.globalLanguageSelectorSpellcheckRefreshControl__transitionRoot {
  display: inline-flex;
  transform-origin: center center;
  vertical-align: middle;
}

.global-language-selector-spellcheck-refresh-pop-enter-active,
.global-language-selector-spellcheck-refresh-pop-leave-active {
  transition:
    opacity $globalLanguageSelector-spellcheckRefresh-popTransition-duration
    cubic-bezier(0.22, 1, 0.36, 1),
    transform $globalLanguageSelector-spellcheckRefresh-popTransition-duration
    cubic-bezier(0.34, 1.2, 0.64, 1);
}

.global-language-selector-spellcheck-refresh-pop-enter-from,
.global-language-selector-spellcheck-refresh-pop-leave-to {
  opacity: 0;
  transform: scale(0.72);
}

.global-language-selector-spellcheck-refresh-pop-enter-to,
.global-language-selector-spellcheck-refresh-pop-leave-from {
  opacity: 1;
  transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .global-language-selector-spellcheck-refresh-pop-enter-active,
  .global-language-selector-spellcheck-refresh-pop-leave-active {
    transition-duration: 300ms;
  }
}

@keyframes global-language-selector-spellcheck-refresh-icon-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.globalLanguageSelectorSpellcheckRefreshControl__button {
  border-radius: 50%;
  height: $globalLanguageSelector-diameter;
  margin-top: $globalLanguageSelector-spellcheckRefresh-button-marginTop;
  min-height: $globalLanguageSelector-diameter;
  min-width: $globalLanguageSelector-diameter;
  width: $globalLanguageSelector-diameter;
}

.globalLanguageSelectorSpellcheckRefreshControl__iconSpin {
  @media (prefers-reduced-motion: no-preference) {
    animation:
      global-language-selector-spellcheck-refresh-icon-spin
      $globalLanguageSelector-spellcheckRefresh-iconSpin-duration ease-in-out infinite;
  }
}

.globalLanguageSelectorSpellcheckRefreshControl__tooltipMultiline {
  white-space: pre-line;
}
</style>
