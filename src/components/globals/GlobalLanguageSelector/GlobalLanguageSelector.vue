<template>
  <div
    v-if="showSelector"
    class="globalLanguageSelector"
    data-test-locator="globalLanguageSelector-root"
    :data-test-active-language-code="currentCode"
    :data-test-i18n-locale="activeI18nLocale"
  >
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
        :delay="300"
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
              <q-item-section class="globalLanguageSelector__menuItemLabel text-weight-medium">
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { i18n } from 'app/i18n/externalFileLoader'
import type { T_faUserSettingsLanguageCode } from 'app/types/T_faUserSettingsLanguageCode'

import { applyFaUserSettingsLanguageSelection } from 'src/scripts/applyFaUserSettingsLanguageSelection'
import { resolveVitePublicAssetPath } from 'src/scripts/resolveVitePublicAssetPath'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

import { GLOBAL_LANGUAGE_SELECTOR_LOCALES } from './scripts/globalLanguageSelectorLocales'

const globalLanguageSelectorInnerSize = 21

const isLanguageMenuOpen = ref(false)

const faUserSettingsStore = S_FaUserSettings()

const showSelector = computed((): boolean => {
  return (
    process.env.MODE === 'electron' &&
    window.faContentBridgeAPIs?.faUserSettings !== undefined
  )
})

const currentCode = computed((): T_faUserSettingsLanguageCode => {
  return faUserSettingsStore.settings?.languageCode ?? 'en-US'
})

const currentFlagSrc = computed((): string => {
  const row = GLOBAL_LANGUAGE_SELECTOR_LOCALES.find((r) => {
    return r.code === currentCode.value
  })

  return row?.flagSrc ?? '/countryFlags/us.svg'
})

const activeI18nLocale = computed((): string => {
  void currentCode.value
  return String(i18n.global.locale.value)
})

function onLanguageTriggerClickCapture (): void {
  isLanguageMenuOpen.value = true
}

function onLanguageMenuShow (): void {
  isLanguageMenuOpen.value = true
}

function onLanguageMenuHide (): void {
  isLanguageMenuOpen.value = false
}

async function pickLanguage (code: T_faUserSettingsLanguageCode): Promise<void> {
  await applyFaUserSettingsLanguageSelection(
    faUserSettingsStore.updateSettings,
    code,
    currentCode.value
  )
}
</script>

<style lang="scss" scoped>
/* Teleported q-menu panel is outside this scope; use :global for the shell. */
:global(.globalLanguageSelector__menu) {
  background-color: $globalLanguageSelector-menu-backgroundColor;
  min-width: $globalLanguageSelector-menu-minWidth;
}

.globalLanguageSelector {
  -webkit-app-region: no-drag;
  position: fixed;
  right: calc(#{$globalWindowButtons-totalWidth} + #{$globalLanguageSelector-gap});
  top: $globalLanguageSelector-topPosition;
  z-index: $globalLanguageSelector-zIndex;

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
