<template>
  <section
    class="projectOverview column items-center full-width"
    data-test-locator="projectOverview"
  >
    <h5
      class="projectOverview__subtitle fa-text-white text-center q-my-none"
      data-test-locator="projectOverview-subtitle"
    >
      {{ $t('projectUI.projectOverview.projectOverviewFor') }}
    </h5>

    <h2
      class="projectOverview__title text-primary-bright text-center q-my-none"
      data-test-locator="projectOverview-projectName"
    >
      {{ projectDisplayName }}
    </h2>

    <!-- Tips & tricks callout -->
    <div
      v-if="showTipCard"
      class="projectOverview__hint row items-center no-wrap full-width"
      data-test-locator="projectOverview-tipCard"
    >
      <q-icon
        v-if="!showMascotInTipCard"
        class="projectOverview__hintIcon q-mr-md"
        name="mdi-help"
        size="30px"
      />

      <FantasiaMascotImage
        v-if="showMascotInTipCard"
        class="projectOverview__hintMascot"
        fantasia-image=""
        height="135px"
        width="135px"
      />

      <div class="projectOverview__hintBody col">
        <div
          class="projectOverview__hintHeading text-subtitle1 text-bold text-left fa-text-dark"
          data-test-locator="projectOverview-tipHeading"
        >
          {{ $t('globalFunctionality.unsortedAppTexts.didYouKnow') }}
        </div>
        <div
          class="projectOverview__hintMessage text-weight-medium text-left fa-text-dark"
          data-test-locator="projectOverview-tipMessage"
        >
          {{ randomTipCaption }}
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import FantasiaMascotImage from 'app/src/components/elements/FantasiaMascotImage/FantasiaMascotImage.vue'

import { useProjectOverview } from './scripts/projectOverview_manager'

defineOptions({
  name: 'ProjectOverview'
})

const {
  projectDisplayName,
  randomTipCaption,
  showMascotInTipCard,
  showTipCard
} = useProjectOverview()
</script>

<style scoped lang="scss">
.projectOverview {
  margin: 0 auto;
  max-width: $projectOverview-maxWidth;

  &__subtitle {
    margin-top: $projectOverview-subtitle-marginTop;
    opacity: $projectOverview-subtitle-opacity;
  }

  &__title {
    font-weight: $projectOverview-title-fontWeight;
    margin-bottom: $projectOverview-title-marginBottom;
    margin-top: $projectOverview-title-marginTop;
  }

  &__hint {
    background-color: $projectOverview-hint-background;
    border: $projectOverview-hint-border-width solid $projectOverview-hint-border-color;
    border-radius: $projectOverview-hint-border-radius;
    color: $projectOverview-hint-border-color;
    margin-bottom: $projectOverview-hint-marginBottom;
    padding: $projectOverview-hint-paddingBlock $projectOverview-hint-paddingInline;
  }

  &__hintMascot {
    flex-shrink: 0;
    height: $projectOverview-hint-mascot-height;
    margin-right: $projectOverview-hint-mascot-marginRight;
    width: $projectOverview-hint-mascot-width;
  }

  &__hintIcon {
    flex-shrink: 0;
  }
}
</style>
