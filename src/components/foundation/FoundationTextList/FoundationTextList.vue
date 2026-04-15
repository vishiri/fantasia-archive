<template>
  <div
    class="foundationTextList q-pa-lg"
    data-test-locator="foundationTextList"
  >
    <h1 class="foundationTextList__title text-h4 q-mb-sm">
      Typography foundation
    </h1>
    <p class="text-body2 q-mb-lg text-grey-5">
      Storybook-only reference: Quasar typography classes as they render with Fantasia theme and Roboto.
    </p>

    <section class="q-mb-xl">
      <h2 class="foundationTextList__sectionTitle text-h5 q-mb-sm">
        Type scale
      </h2>
      <p class="text-body2 q-mb-md text-grey-5">
        Heading, subtitle, body, caption, and overline classes from the
        <a
          class="text-primary"
          href="https://quasar.dev/style/typography"
          rel="noopener noreferrer"
          target="_blank"
        >
          Quasar typography guide
        </a>
        .
      </p>

      <div
        v-for="row in headingRows"
        :key="row.className"
        class="foundationTextList__sampleRow q-mb-lg"
      >
        <div class="foundationTextList__classLabel foundationTextList__mono text-caption text-grey-5 q-mb-xs">
          {{ row.className }}
          <span class="text-weight-regular"> — {{ row.label }}</span>
        </div>
        <component
          :is="row.tag"
          :class="row.className"
        >
          {{ row.sample }}
        </component>
      </div>
    </section>

    <section class="q-mb-xl">
      <h2 class="foundationTextList__sectionTitle text-h5 q-mb-sm">
        Font weights
      </h2>
      <p class="text-body2 q-mb-md text-grey-5">
        Quasar weight utilities (Roboto ships 100, 300, 400, 500, 700, 900).
      </p>

      <div
        v-for="row in weightRows"
        :key="row.className"
        class="foundationTextList__sampleRow q-mb-md"
      >
        <div class="foundationTextList__classLabel foundationTextList__mono text-caption text-grey-5 q-mb-xs">
          {{ row.className }}
          <span class="text-weight-regular"> — {{ row.label }}</span>
        </div>
        <div :class="row.className">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </div>
      </div>
    </section>

    <section>
      <h2 class="foundationTextList__sectionTitle text-h5 q-mb-sm">
        Text helper classes
      </h2>
      <p class="text-body2 q-mb-md text-grey-5">
        Alignment, emphasis, decoration, and transform helpers from the same Quasar page.
      </p>

      <div class="row q-col-gutter-md">
        <div
          v-for="row in helperRows"
          :key="row.className"
          class="col-12 col-md-6"
        >
          <article class="foundationTextList__helperCard q-pa-md q-mb-md">
            <div class="foundationTextList__mono text-caption text-grey-5 q-mb-sm">
              {{ row.className }}
            </div>
            <div class="text-caption text-grey-5 q-mb-sm">
              {{ row.description }}
            </div>
            <div :class="row.className">
              {{ row.demoPhrase }}
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import {
  FOUNDATION_TYPOGRAPHY_HEADINGS,
  FOUNDATION_TYPOGRAPHY_HELPERS,
  FOUNDATION_TYPOGRAPHY_WEIGHTS
} from './scripts/foundationTypographySamples'

const headingRows = FOUNDATION_TYPOGRAPHY_HEADINGS
const weightRows = FOUNDATION_TYPOGRAPHY_WEIGHTS
const helperRows = FOUNDATION_TYPOGRAPHY_HELPERS
</script>

<style lang="scss" scoped>
.foundationTextList {
  background-color: transparent;
  box-sizing: border-box;
  color: $grey;
  min-height: $foundationCatalogues-root-minHeight;
  width: 100%;

  &__title,
  &__sectionTitle {
    color: $primary-bright;
  }

  &__sampleRow {
    border-bottom: $foundationTextList-sampleRow-borderBottomWidth solid $gold-muted-border;
    padding-bottom: $foundationTextList-sampleRow-paddingBottom;
  }

  &__classLabel {
    color: $primary-bright;
  }

  &__helperCard {
    background-color: $dark;
    border: $foundationTextList-helperCard-borderWidth solid $gold-muted-border;
    border-radius: $qCard-border-radius;
  }

  &__mono {
    font-family:
      ui-monospace,
      'Cascadia Code',
      'Source Code Pro',
      Menlo,
      Consolas,
      'DejaVu Sans Mono',
      monospace;
  }
}
</style>
