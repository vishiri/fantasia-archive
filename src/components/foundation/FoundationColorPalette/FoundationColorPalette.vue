<template>
  <div
    class="foundationColorPalette q-pa-lg"
    data-test-locator="foundationColorPalette"
  >
    <!-- Intro -->
    <h1 class="foundationColorPalette__title text-h4 q-mb-sm">
      Color foundation
    </h1>
    <p class="text-body2 q-mb-lg text-grey-5">
      Storybook-only reference: Fantasia theme variables and the default Quasar material scale.
    </p>

    <!-- Custom QUASAR COLORS - GENERAL -->
    <section class="q-mb-xl">
      <h2 class="foundationColorPalette__sectionTitle text-h5 q-mb-sm">
        Custom theme colors
      </h2>
      <p class="text-body2 q-mb-md text-grey-5">
        From
        <span class="text-weight-medium text-primary">QUASAR COLORS - GENERAL</span>
        in
        <code class="text-primary">src/css/quasar.variables.scss</code>
        (Quasar brand variables for this app).
      </p>

      <div class="row q-col-gutter-md">
        <div
          v-for="swatch in customSwatches"
          :key="swatch.sassVar"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <article class="foundationColorPalette__customCard">
            <div
              class="foundationColorPalette__swatch"
              :style="{ backgroundColor: swatch.hex }"
            />
            <div class="foundationColorPalette__meta q-pa-sm">
              <div class="foundationColorPalette__var foundationColorPalette__mono text-caption">
                {{ swatch.sassVar }}
              </div>
              <div class="foundationColorPalette__mono text-caption text-grey-5 q-mt-xs">
                {{ swatch.hex }}
              </div>
              <div
                v-if="swatch.note"
                class="text-caption text-grey-5 q-mt-xs"
              >
                {{ swatch.note }}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Quasar default material scale (class stems) -->
    <section>
      <h2 class="foundationColorPalette__sectionTitle text-h5 q-mb-sm">
        Default Quasar material palette
      </h2>
      <p class="text-body2 q-mb-md text-grey-5">
        Class stems for
        <code class="text-primary">bg-&#42;</code>
        and
        <code class="text-primary">text-&#42;</code>
        per the
        <a
          class="text-primary"
          href="https://quasar.dev/style/color-palette#color-list"
          rel="noopener noreferrer"
          target="_blank"
        >
          Quasar color list
        </a>
        (nineteen roots, fifteen steps each).
      </p>

      <div
        v-for="group in materialGroups"
        :key="group.root"
        class="foundationColorPalette__materialRow q-mb-md"
      >
        <div class="foundationColorPalette__materialRootLabel text-subtitle2 q-pr-md">
          {{ group.root }}
        </div>
        <div class="foundationColorPalette__materialSwatches">
          <div
            v-for="stem in group.stems"
            :key="stem"
            class="foundationColorPalette__materialCell"
          >
            <div
              class="foundationColorPalette__materialPatch"
              :class="`bg-${stem}`"
            />
            <div class="foundationColorPalette__mono text-caption text-grey-5 q-mt-xs text-center">
              {{ stem }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { FOUNDATION_CUSTOM_SWATCHES } from './scripts/foundationPaletteCustom'
import { buildQuasarMaterialGroups } from './scripts/foundationPaletteQuasarMaterial'

const customSwatches = FOUNDATION_CUSTOM_SWATCHES
const materialGroups = buildQuasarMaterialGroups()
</script>

<style lang="scss" scoped>
.foundationColorPalette {
  /* Transparent root so Storybook backgrounds toolbar (paper / dark app) paints the canvas. */
  background-color: transparent;
  box-sizing: border-box;
  color: $grey;
  min-height: $foundationCatalogues-root-minHeight;
  width: 100%;

  &__title,
  &__sectionTitle {
    color: $primary-bright;
  }

  &__customCard {
    border: $foundationColorPalette-customCard-borderWidth solid $gold-muted-border;
    border-radius: $qCard-border-radius;
    overflow: hidden;
  }

  &__swatch {
    min-height: $foundationColorPalette-swatch-minHeight;
  }

  &__meta {
    background-color: $dark;
  }

  &__var {
    color: $primary-bright;
  }

  &__materialRow {
    align-items: flex-start;
    display: flex;
    flex-flow: row wrap;
  }

  &__materialRootLabel {
    color: $primary-bright;
    flex-shrink: 0;
    min-width: $foundationColorPalette-materialRootLabel-minWidth;
  }

  &__materialSwatches {
    display: flex;
    flex: 1 1 0;
    flex-flow: row wrap;
    gap: $foundationColorPalette-materialSwatches-gap;
    min-width: 0;
  }

  &__materialCell {
    flex-shrink: 0;
    width: $foundationColorPalette-materialCell-width;
  }

  &__materialPatch {
    border: $foundationColorPalette-materialPatch-borderWidth solid $gold-muted-border;
    border-radius: $qCard-border-radius;
    min-height: $foundationColorPalette-materialPatch-minHeight;
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
