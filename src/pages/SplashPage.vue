<template>
  <q-page
    class="splashPage flex flex-center"
    data-test-locator="splashPage"
  >
    <div class="splashPage__inner column items-center justify-center">
      <SplashControls />

      <q-separator
        v-if="!hideWelcomeScreenSocials"
        class="splashPage__separator q-mt-xl q-mb-lg"
        color="primary-bright"
        data-test-locator="splashPage-socialSeparator"
      />

      <SocialContactButtons v-if="!hideWelcomeScreenSocials" />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import SplashControls from 'app/src/components/other/SplashControls/SplashControls.vue'
import SocialContactButtons from 'app/src/components/other/SocialContactButtons/SocialContactButtons.vue'
import { bindSplashPageSkipWelcomeScreenLifecycle } from 'app/src/pages/scripts/splashPageSkipWelcomeScreen'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

defineOptions({
  name: 'SplashPage'
})

const faUserSettingsStore = S_FaUserSettings()
const { settings } = storeToRefs(faUserSettingsStore)

const hideWelcomeScreenSocials = computed(() => {
  return settings.value?.hideWelcomeScreenSocials ??
    FA_USER_SETTINGS_DEFAULTS.hideWelcomeScreenSocials
})

const resolveSkipWelcomeScreenEnabled = (): boolean => {
  return settings.value?.skipWelcomeScreen ??
    FA_USER_SETTINGS_DEFAULTS.skipWelcomeScreen
}

bindSplashPageSkipWelcomeScreenLifecycle(
  resolveSkipWelcomeScreenEnabled,
  () => settings.value?.skipWelcomeScreen
)
</script>

<style scoped lang="scss">
.splashPage {
  background: $splashPage-background;
  min-height: $splashPage-minHeight;
  padding: $splashPage-padding;

  &__inner {
    margin: $splashPage-inner-margin;
    width: $splashPage-inner-width;
  }

  &__separator {
    max-width: $splashPage-separator-maxWidth;
    opacity: $splashPage-separator-opacity;
    width: $splashPage-separator-width;
  }
}
</style>
