import type {
  I_faProjectDocumentDistributionResult
} from 'app/types/I_faProjectDocumentLastOpenedDomain'
import { expect, test } from 'vitest'

import { buildProjectOverviewStackedChartModel } from '../buildProjectOverviewStackedChartModel'

const distribution: I_faProjectDocumentDistributionResult = {
  templates: [
    {
      templateId: 't-b',
      titlePluralTranslationsJson: '{"en-US":"Beasts"}',
      icon: 'mdi-paw',
      sortOrder: 1
    },
    {
      templateId: 't-a',
      titlePluralTranslationsJson: '{"en-US":"Artifacts"}',
      icon: 'mdi-diamond',
      sortOrder: 0
    }
  ],
  worlds: [
    {
      worldId: 'w1',
      displayNameTranslationsJson: '{"en-US":"Alpha"}',
      color: '#112233',
      sortOrder: 0
    },
    {
      worldId: 'w2',
      displayNameTranslationsJson: '{"en-US":"Beta"}',
      color: '#445566',
      sortOrder: 1
    }
  ],
  counts: [
    {
      templateId: 't-a',
      worldId: 'w1',
      documentCount: 2
    },
    {
      templateId: 't-b',
      worldId: 'w2',
      documentCount: 3
    }
  ],
  documentTemplateTotalCount: 2,
  totalDocumentCount: 5
}

/**
 * buildProjectOverviewStackedChartModel
 * Orders template categories by Project Settings sortOrder (not A-Z label).
 */
test('Test that buildProjectOverviewStackedChartModel sorts categories by sortOrder', () => {
  const model = buildProjectOverviewStackedChartModel({
    distribution,
    preferredLanguageCode: 'en-US',
    parseTranslationsJson: (raw) => JSON.parse(raw) as Record<string, string>
  })
  expect(model.categories).toEqual(['Artifacts', 'Beasts'])
  expect(model.series).toHaveLength(2)
  expect(model.series[0]?.name).toBe('Alpha')
  expect(model.series[0]?.data).toEqual([2, 0])
  expect(model.series[1]?.name).toBe('Beta')
  expect(model.series[1]?.data).toEqual([0, 3])
  expect(model.totalDocumentCount).toBe(5)
})

/**
 * buildProjectOverviewStackedChartModel
 * Keeps Project Settings order even when plural labels would sort differently A-Z.
 */
test('Test that buildProjectOverviewStackedChartModel prefers sortOrder over label alphabet', () => {
  const model = buildProjectOverviewStackedChartModel({
    distribution: {
      ...distribution,
      templates: [
        {
          templateId: 't-z',
          titlePluralTranslationsJson: '{"en-US":"Zebras"}',
          icon: 'mdi-z',
          sortOrder: 0
        },
        {
          templateId: 't-a',
          titlePluralTranslationsJson: '{"en-US":"Apples"}',
          icon: 'mdi-a',
          sortOrder: 1
        }
      ],
      counts: []
    },
    preferredLanguageCode: 'en-US',
    parseTranslationsJson: (raw) => JSON.parse(raw) as Record<string, string>
  })

  expect(model.categories).toEqual(['Zebras', 'Apples'])
})

/**
 * buildProjectOverviewStackedChartModel
 * Equal sort_order keeps the query order (created time, then id), not template id.
 */
test('Test that buildProjectOverviewStackedChartModel keeps equal sortOrder query order', () => {
  const model = buildProjectOverviewStackedChartModel({
    distribution: {
      ...distribution,
      templates: [
        {
          templateId: 't-z',
          titlePluralTranslationsJson: '{"en-US":"Zebras"}',
          icon: 'mdi-z',
          sortOrder: 0
        },
        {
          templateId: 't-a',
          titlePluralTranslationsJson: '{"en-US":"Apples"}',
          icon: 'mdi-a',
          sortOrder: 0
        }
      ],
      worlds: [
        {
          color: '#222222',
          displayNameTranslationsJson: '{"en-US":"Zulu"}',
          sortOrder: 0,
          worldId: 'w-z'
        },
        {
          color: '#111111',
          displayNameTranslationsJson: '{"en-US":"Alpha"}',
          sortOrder: 0,
          worldId: 'w-a'
        }
      ],
      counts: []
    },
    preferredLanguageCode: 'en-US',
    parseTranslationsJson: (raw) => JSON.parse(raw) as Record<string, string>
  })

  expect(model.categories).toEqual(['Zebras', 'Apples'])
  expect(model.series.map((series) => series.name)).toEqual(['Zulu', 'Alpha'])
})

/**
 * resolveProjectOverviewTemplatePluralLabel / buildProjectOverviewStackedChartModel
 * Falls back through preferred, en-US, then language-code order, and empty color default.
 */
test('Test that buildProjectOverviewStackedChartModel resolves label and color fallbacks', () => {
  const model = buildProjectOverviewStackedChartModel({
    distribution: {
      counts: [],
      templates: [
        {
          icon: 'mdi-a',
          templateId: 't-preferred',
          titlePluralTranslationsJson: '{"nb":" Helter ","en-US":"Heroes"}',
          sortOrder: 2
        },
        {
          icon: 'mdi-b',
          templateId: 't-en',
          titlePluralTranslationsJson: '{"en-US":" Places ","fr":""}',
          sortOrder: 3
        },
        {
          icon: 'mdi-c',
          templateId: 't-first',
          titlePluralTranslationsJson: '{"de":"","fr":" Artefakte "}',
          sortOrder: 1
        },
        {
          icon: 'mdi-d',
          templateId: 't-empty',
          titlePluralTranslationsJson: '{"de":"","fr":""}',
          sortOrder: 0
        },
        {
          icon: 'mdi-e',
          templateId: 't-code-order',
          titlePluralTranslationsJson: '{"zh":" Dragons ","de":" Drachen "}',
          sortOrder: 4
        }
      ],
      documentTemplateTotalCount: 4,
      totalDocumentCount: 0,
      worlds: [{
        color: '  ',
        displayNameTranslationsJson: '{"en-US":"Orphan"}',
        sortOrder: 0,
        worldId: 'w1'
      }]
    },
    preferredLanguageCode: 'nb',
    parseTranslationsJson: (raw) => JSON.parse(raw) as Record<string, string>
  })

  expect(model.categories).toEqual(['', 'Artefakte', 'Helter', 'Places', 'Drachen'])
  expect(model.series[0]?.color).toBe('var(--fa-color-primary-bright)')
  expect(model.series[0]?.name).toBe('Orphan')
  expect(model.series[0]?.data).toEqual([0, 0, 0, 0, 0])
})
