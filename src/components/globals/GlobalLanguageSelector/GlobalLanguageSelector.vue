<template>
  <div
    v-if="showSelector"
    class="globalLanguageSelector"
    dir="ltr"
    data-test-locator="globalLanguageSelector-root"
    :data-test-active-language-code="currentCode"
    :data-test-i18n-locale="activeI18nLocale"
  >
    <div class="globalLanguageSelector__cluster">
      <GlobalLanguageSelectorSpellcheckRefreshControl
        :show="showSpellcheckRefresh"
        @refresh-web-contents="refreshWebContentsAndHide"
      />

      <q-btn
        round
        flat
        dense
        :ripple="false"
        class="globalLanguageSelector__trigger bg-dark"
        :aria-label="$t('globalLanguageSelector.openMenu')"
        :data-test-tooltip-text="$t('globalLanguageSelector.switchLanguageTooltip')"
        data-test-locator="globalLanguageSelector-trigger"
        @click.capture="onLanguageTriggerClickCapture"
      >
        <q-avatar
          rounded
          :size="`${globalLanguageSelectorInnerSize}px`"
          class="globalLanguageSelector__avatar"
        >
          <img
            :src="resolveVitePublicAssetPath(currentFlagSrc)"
            alt=""
            class="globalLanguageSelector__flagImg"
            data-test-locator="globalLanguageSelector-trigger-flag"
            :data-test-expected-flag-path="currentFlagSrc"
          >
        </q-avatar>

        <q-tooltip
          v-if="!isLanguageMenuOpen"
          anchor="bottom middle"
          self="top middle"
          transition-hide="fade"
          :transition-duration="280"
        >
          {{ $t('globalLanguageSelector.switchLanguageTooltip') }}
        </q-tooltip>

        <q-menu
          :dark="false"
          anchor="bottom middle"
          class="globalLanguageSelector__menu"
          self="top middle"
          auto-close
          :offset="[0, 12]"
          @hide="onLanguageMenuHide"
          @show="onLanguageMenuShow"
        >
          <q-list
            :dark="false"
          >
            <template
              v-for="row in GLOBAL_LANGUAGE_SELECTOR_LOCALES"
              :key="row.code"
            >
              <q-item
                clickable
                class="globalLanguageSelector__menuItem"
                :data-test-locator="`globalLanguageSelector-option-${row.code}`"
                @click="pickLanguage(row.code)"
              >
                <q-item-section
                  avatar
                  class="globalLanguageSelector__menuAvatarSection"
                >
                  <q-avatar
                    class="globalLanguageSelector__menuAvatar"
                    square
                    :size="`${globalLanguageSelectorInnerSize}px`"
                  >
                    <img
                      :src="resolveVitePublicAssetPath(row.flagSrc)"
                      :alt="$t(`globalFunctionality.faUserSettings.languageNames.${row.languageNamesKey}`)"
                      class="globalLanguageSelector__flagImg"
                      :data-test-locator="`globalLanguageSelector-menu-flag-${row.code}`"
                      :data-test-expected-flag-path="row.flagSrc"
                    >
                  </q-avatar>
                </q-item-section>
                <q-item-section
                  class="globalLanguageSelector__menuItemLabel text-weight-medium"
                  dir="auto"
                >
                  {{
                    $t(`globalFunctionality.faUserSettings.languageNames.${row.languageNamesKey}`)
                  }}
                </q-item-section>
              </q-item>
              <q-separator
                :dark="false"
                role="separator"
              />
            </template>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import GlobalLanguageSelectorSpellcheckRefreshControl from './GlobalLanguageSelectorSpellcheckRefreshControl.vue'

import { GLOBAL_LANGUAGE_SELECTOR_LOCALES } from './scripts/globalLanguageSelectorLocales_manager'
import { useGlobalLanguageSelector } from './scripts/globalLanguageSelector_manager'

const {
  activeI18nLocale,
  currentCode,
  currentFlagSrc,
  globalLanguageSelectorInnerSize,
  isLanguageMenuOpen,
  onLanguageMenuHide,
  onLanguageMenuShow,
  onLanguageTriggerClickCapture,
  pickLanguage,
  refreshWebContentsAndHide,
  resolveVitePublicAssetPath,
  showSelector,
  showSpellcheckRefresh
} = useGlobalLanguageSelector()
</script>

<style lang="scss" scoped>
/* Teleported q-menu panel is outside this scope; use :global for the shell. */
:global(.globalLanguageSelector__menu) {
  background-color: $globalLanguageSelector-menu-backgroundColor;
  direction: ltr;
  max-height: $globalLanguageSelector-menu-maxHeight;
  min-width: $globalLanguageSelector-menu-minWidth;
  overflow-y: auto;
  user-select: none;
}

.globalLanguageSelector {
  -webkit-app-region: no-drag;
  direction: ltr;
  position: fixed;
  right: calc(#{$globalWindowButtons-totalWidth} + #{$globalLanguageSelector-gap});
  top: $globalLanguageSelector-topPosition;
  z-index: $globalLanguageSelector-zIndex;

  &__cluster {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: $globalLanguageSelector-spellcheckRefresh-gap;
  }

  &__trigger {
    border: $globalLanguageSelector-trigger-border;
    border-radius: 50%;
    height: $globalLanguageSelector-diameter;
    min-height: $globalLanguageSelector-diameter;
    min-width: $globalLanguageSelector-diameter;
    padding: 0;
    width: $globalLanguageSelector-diameter;
  }

  &__menuAvatarSection {
    min-width: v-bind(globalLanguageSelectorInnerSize);
    width: v-bind(globalLanguageSelectorInnerSize);
  }

  &__avatar {
    border-radius: 50%;
  }

  &__flagImg {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  &__menuItem {
    padding: $globalLanguageSelector-menu-item-padding;

    &:hover {
      background-color: $globalLanguageSelector-menu-itemHover-backgroundColor;
    }
  }

  &__menuAvatar {
    box-shadow: $globalLanguageSelector-menu-flag-boxShadow;
  }

  &__menuItemLabel {
    color: $globalLanguageSelector-menu-itemTextColor;
  }
}
</style>
