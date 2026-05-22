<template>
  <div
    v-if="hasRecentProjects"
    class="splashControlsResumeDropdown column items-center no-wrap"
  >
    <q-btn-dropdown
      ref="resumeDropdownRef"
      class="splashControlsResumeDropdown__actionDropdownBtn splashControlsResumeDropdown__actionBtnDropdown"
      color="primary-bright"
      content-class="splashControls__resumeMenu"
      data-test-locator="splashPage-btn-resume-latest"
      dropdown-icon="arrow_drop_down"
      outline
      split
      type="button"
      :label="resumePrimarySegmentLabel"
      :menu-offset="[0, 0]"
      :toggle-aria-label="$t('splashPage.browseLatestProjects')"
      @click="onResumePrimarySegmentClick"
    >
      <q-list
        class="splashControlsResumeDropdown__resumeMenuList"
        data-test-locator="splashPage-resumeMenu"
        dense
      >
        <template
          v-for="(entry, index) in recentProjectEntries"
          :key="entry.filePath"
        >
          <q-separator
            v-if="index > 0"
            class="splashControls__resumeMenuSeparator"
            role="separator"
          />
          <q-item
            v-close-popup
            class="splashControlsResumeDropdown__resumeMenuItem"
            clickable
            :data-test-locator="splashRecentProjectRowTestLocator(index)"
            @click="onLoadRecentProjectByPath(entry.filePath)"
          >
            <q-item-section>
              <q-item-label>
                {{ entry.name }}
              </q-item-label>
              <q-item-label caption>
                {{ entry.filePath }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-btn-dropdown>
    <q-tooltip
      v-if="showResumeDropdownArrowTooltip"
      anchor="center right"
      self="center left"
      :delay="300"
      :offset="[10, 0]"
      :target="resumeDropdownArrowTarget"
      transition-hide="fade"
      :transition-duration="300"
    >
      {{ $t('splashPage.browseLatestProjects') }}
    </q-tooltip>
  </div>
</template>

<script lang="ts" setup>
import type { ComponentPublicInstance } from 'vue'

import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { i18n } from 'app/i18n/externalFileLoader'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'
import { openWelcomeScreenAutoLoadProject } from 'app/src/scripts/projectManagement/faWelcomeScreenAutoLoadProject'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaRecentProjects } from 'app/src/stores/S_FaRecentProjects'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { resolveSplashResumeDropdownArrowElement } from './scripts/resolveSplashResumeDropdownArrowElement'

defineOptions({
  name: 'SplashControlsResumeDropdown'
})

const resumeDropdownRef = ref<ComponentPublicInstance | null>(null)
const resumeDropdownArrowEl = ref<HTMLElement | null>(null)

const activeProjectStore = S_FaActiveProject()
const { activeProject } = storeToRefs(activeProjectStore)

const faUserSettingsStore = S_FaUserSettings()
const { settings: faUserSettings } = storeToRefs(faUserSettingsStore)

const recentProjectsStore = S_FaRecentProjects()
const { entries: recentProjectEntries } = storeToRefs(recentProjectsStore)

const hideRecentProjectTooltip = computed(() => {
  return faUserSettings.value?.hideRecentProjectTooltip ??
    FA_USER_SETTINGS_DEFAULTS.hideRecentProjectTooltip
})

const hasRecentProjects = computed(() => {
  return recentProjectEntries.value.length > 0
})

const showResumeDropdownArrowTooltip = computed(() => {
  if (hideRecentProjectTooltip.value === true) {
    return false
  }
  return resumeDropdownArrowEl.value !== null
})

const resumeDropdownArrowTarget = computed((): Element | undefined => {
  return resumeDropdownArrowEl.value ?? undefined
})

const resumePrimarySegmentLabel = computed(() => {
  if (activeProject.value !== null) {
    return i18n.global.t('splashPage.resumeCurrentProject')
  }
  return i18n.global.t('splashPage.resumeLatestProject')
})

function syncResumeDropdownArrowTarget (): void {
  if (hasRecentProjects.value !== true || hideRecentProjectTooltip.value === true) {
    resumeDropdownArrowEl.value = null
    return
  }

  void nextTick(() => {
    resumeDropdownArrowEl.value = resolveSplashResumeDropdownArrowElement(
      resumeDropdownRef.value
    )
  })
}

watch(
  hasRecentProjects,
  () => {
    syncResumeDropdownArrowTarget()
  },
  { flush: 'post' }
)

watch(
  hideRecentProjectTooltip,
  () => {
    syncResumeDropdownArrowTarget()
  },
  { flush: 'post' }
)

watch(
  () => i18n.global.locale.value,
  () => {
    syncResumeDropdownArrowTarget()
  },
  { flush: 'post' }
)

function splashRecentProjectRowTestLocator (index: number): string {
  return `splashPage-recentProject-${String(index)}`
}

function onLoadRecentProjectByPath (filePath: string): void {
  void runFaAction('loadExistingProject', { filePath })
}

function onResumePrimarySegmentClick (): void {
  const sessionFilePath = activeProject.value?.filePath
  if (sessionFilePath !== undefined && sessionFilePath.length > 0) {
    void runFaAction('loadExistingProject', {
      filePath: sessionFilePath,
      resumeActiveSession: true
    })
    return
  }

  void openWelcomeScreenAutoLoadProject()
}

onMounted(() => {
  void recentProjectsStore.refreshRecentProjects().then(() => {
    syncResumeDropdownArrowTarget()
  })
})
</script>

<style scoped lang="scss">
.splashControlsResumeDropdown {
  max-width: 100%;
  width: fit-content;

  &__actionDropdownBtn {
    /*
      Do not put Quasar text-uppercase on the whole q-btn-dropdown: it inherits into the arrow
      QIcon, and Material Icons ligatures (e.g. arrow_drop_down) stop matching when uppercase.
    */
    :deep(.q-btn-dropdown--current) {
      font-size: $splashControls-actionBtn-fontSize;
      padding: $splashControls-actionBtnDropdownButton-padding;
      text-transform: uppercase;
      width: fit-content;
    }

    :deep(.q-btn-dropdown__arrow-container) {
      font-size: $splashControls-actionBtn-fontSize;
      padding: $splashControls-actionBtnDropdownTrigger-padding;
      text-transform: none;
      width: fit-content;
    }
  }
}
</style>

<style lang="scss" src="./styles/SplashControls.resumeMenu.unscoped.scss"></style>
