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
import { useSplashControlsResumeDropdown } from './scripts/splashControlsResumeDropdown_manager'

defineOptions({
  name: 'SplashControlsResumeDropdown'
})

const {
  hasRecentProjects,
  onLoadRecentProjectByPath,
  onResumePrimarySegmentClick,
  recentProjectEntries,
  resumeDropdownArrowTarget,
  resumeDropdownRef,
  resumePrimarySegmentLabel,
  showResumeDropdownArrowTooltip,
  splashRecentProjectRowTestLocator
} = useSplashControlsResumeDropdown()
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
