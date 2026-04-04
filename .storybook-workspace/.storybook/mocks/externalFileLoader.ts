import T_documents from 'src/i18n/en-US/components/AppControlMenus/T_documents'
import T_FantasiaMascotImage from 'src/i18n/en-US/components/FantasiaMascotImage/T_FantasiaMascotImage'
import T_GlobalWindowButtons from 'src/i18n/en-US/components/GlobalWindowButtons/T_GlobalWindowButtons'
import T_helpInfo from 'src/i18n/en-US/components/AppControlMenus/T_helpInfo'
import T_project from 'src/i18n/en-US/components/AppControlMenus/T_project'
import T_tools from 'src/i18n/en-US/components/AppControlMenus/T_tools'
import T_socialContactButtons from 'src/i18n/en-US/components/SocialContactButtons/T_socialContactButtons'
import T_aboutFantasiaArchive from 'src/i18n/en-US/dialogs/T_aboutFantasiaArchive'
import T_faUserSettings from 'src/i18n/en-US/globalFunctionality/T_faUserSettings'
import T_unsortedAppTexts from 'src/i18n/en-US/globalFunctionality/T_unsortedAppTexts'
import T_ErrorNotFound from 'src/i18n/en-US/pages/T_ErrorNotFound'

type T_i18nScenario = 'default' | 'longStrings' | 'markdownHeavy'

const defaultMessages: Record<string, unknown> = {
  errorNotFound: T_ErrorNotFound,
  dialogs: {
    aboutFantasiaArchive: T_aboutFantasiaArchive
  },
  globalWindowButtons: T_GlobalWindowButtons,
  appControlMenus: {
    project: T_project,
    documents: T_documents,
    tools: T_tools,
    helpInfo: T_helpInfo
  },
  socialContactButtons: T_socialContactButtons,
  fantasiaMascotImage: T_FantasiaMascotImage,
  globalFunctionality: {
    faUserSettings: T_faUserSettings,
    unsortedAppTexts: T_unsortedAppTexts
  },
  documents: {
    advancedSearchCheatSheet: '# Advanced Search Cheat Sheet\n\nIn the moonlit stacks beneath **Aurelion Citadel**, archivists index stories by sigil, era, and oath. Queries can chain together concepts like *kingdom*, *bloodline*, and *artifact* to narrow thousands of records into a single credible trail. Use precise terms first, then broaden with synonyms when the trail goes cold.\n\n> Lore note: most "missing" entries are filed under their pre-coronation names.\n\n## Quick patterns\n\n- `type:character AND faction:"Sunforged Court"`\n- `region:"North Reach" AND status:active`\n- `artifact:"Glass Compass" OR artifact:"Mirror Needle"`\n\n```text\ntitle:"Ashen Treaty" AND NOT status:archived\n```\n\n| Field | Use |\n| --- | --- |\n| `type` | Entity category |\n| `region` | Geographic filter |\n| `status` | Active/archived state |',
    advancedSearchGuide: '# Advanced Search Guide\n\nThe Archive supports layered criteria, so you can trace a single rumor across continents, dynasties, and calamities. Start with one stable anchor (`type` or `region`), then add `AND` clauses until noise drops to a usable shortlist. If a query becomes too strict, replace one clause with `OR` to recover adjacent lore.\n\nWhen documenting discoveries, keep a reproducible query trail in your notes. This helps collaborators verify whether a contradiction is a data issue or a timeline split caused by retcons in newer chronicles.\n\n## Suggested workflow\n\n1. Begin broad: `type:location AND region:"Western Fjords"`\n2. Add intent: `AND tag:"trade-route"`\n3. Exclude stale lore: `AND NOT status:archived`\n\n- Prefer quoted phrases for multi-word names.\n- Keep aliases in parentheses when known.\n- Confirm date scopes before publishing summaries.',
    changeLog: '# Changelog\n\n## 2.3.0\n\n### New features\n\n- Added Storybook-first component coverage with reusable mocks and docs-focused story taxonomy.\n- Introduced stress stories for long localization strings and markdown-heavy document rendering.\n\n### Bugfixes & Optimizations\n\n- Stabilized dialog previews in docs with iframe rendering to avoid overlay bleed.\n- Improved interaction assertions for Quasar menu rendering in Storybook.\n\n### Notes for worldbuilders\n\nThis release focuses on safer UI iteration loops, so lore-heavy interfaces can be validated before full Electron boot. Expect faster visual checks when polishing document dialogs and control menus.',
    license: '# License\n\nThis Storybook entry is placeholder prose for layout validation only and does **not** represent legal terms. In the setting, the Scribes\' Accord grants free circulation of non-commercial chronicles while preserving attribution for original curators.\n\nRedistributions should retain provenance markers, revision lineage, and source seals. Derivative codices are welcome when they document divergences clearly and avoid claiming canonical status without council approval.\n\n---\n\n## Validation checklist\n\n- Heading hierarchy renders correctly.\n- Long paragraphs wrap without overflow.\n- Inline emphasis, lists, and separators remain legible.',
    tipsTricksTrivia: '# Tips, Tricks & Trivia\n\nThe fastest way to keep continuity intact is to cross-reference each new character entry against its parent house and region before publishing. Tiny naming differences often signal different eras, not mistakes. Keep aliases visible and annotate first sightings.\n\nFor crowded timelines, draft summaries in short bullets first, then expand into narrative paragraphs once the sequence is stable. This reduces accidental contradictions when multiple collaborators edit in parallel.\n\n## Field tips\n\n- Use **one canonical spelling** per release cycle.\n- Add `aka:` aliases immediately when discovered.\n- Mark disputed lore with `status:review` instead of deleting it.\n\n`Pro tip:` keep one query that always returns your current "must-review" set.',
    test: '# Storybook Markdown Test\n\nThis document intentionally mixes formatting so dialog rendering can be verified in isolation. It simulates production-like lore paragraphs with headings, lists, quotes, code spans, and tables.\n\n> If this block is readable and wrapped correctly, markdown styling is likely healthy.\n\n- First paragraph checks spacing.\n- Second paragraph checks line-height.\n- Third paragraph checks nested formatting like **bold**, *italic*, and `inline code`.\n\n| Check | Expected |\n| --- | --- |\n| Wrapping | No horizontal overflow |\n| Typography | Consistent rhythm |\n| Emphasis | Clear visual contrast |'
  }
}

const longStringsMessages: Record<string, unknown> = {
  ...defaultMessages,
  documents: {
    advancedSearchCheatSheet: '# Advanced Search Cheat Sheet\n\nThis line intentionally stretches layout width by combining placeholder fragments repeatedly: alpha-beta-gamma-delta-epsilon-zeta-eta-theta-iota-kappa-lambda-mu-nu-xi-omicron-pi-rho-sigma-tau-upsilon-phi-chi-psi-omega.',
    advancedSearchGuide: '# Advanced Search Guide\n\nUse this story to validate wrapping with very long tokens:\n\n`PROJECT_REFERENCE__THE_CRYSTAL_ARCHIVES_OF_THE_SEVENTH_ASTRAL_REALM_WITH_EXTENDED_ANNOTATIONS_AND_CROSS_REFERENCES`',
    changeLog: '# Changelog\n\n- Build notes include multiple extended lines to pressure overflow handling and line wrapping in markdown containers.\n- 2026-03-31: Added Storybook coverage and behavior stress documentation for localized renderer surfaces.',
    license: '# License\n\nThe fictional lorem section here is intentionally verbose to represent legal text translations that can become significantly longer in some locales.',
    tipsTricksTrivia: '# Tips, Tricks & Trivia\n\n- Keep labels concise.\n- Expect translated strings to expand by 20-40% in some languages.\n- Validate tooltips and button groups with screen zoom and large text settings.',
    test: '# Long text test\n\nThis document exists to stress the dialog with oversized paragraph content for localization QA.'
  }
}

const markdownHeavyMessages: Record<string, unknown> = {
  ...defaultMessages,
  documents: {
    advancedSearchCheatSheet: '# Advanced Search Cheat Sheet\n\n## Operators\n\n- `AND`\n- `OR`\n- `NOT`\n\n> Combine operators for precise filters.\n\n```text\nfaction:"Sunforged" AND status:active\n```',
    advancedSearchGuide: '# Advanced Search Guide\n\n## Example Query\n\n- Open **Advanced Search**.\n- Use `type:character AND region:"North Reach"`.\n- Add `-status:archived`.\n\n### Keys\n\n- `type`: Object category\n- `region`: Scope filter\n- `status`: Lifecycle state\n\n```text\ntype:character AND region:"North Reach" AND -status:archived\n```',
    changeLog: '# Changelog\n\n## 2.3.0\n\n### New features\n\n- Storybook coverage plan published.\n\n### Bugfixes & Optimizations\n\n- Added reusable providers and mock scenarios.',
    license: '# License\n\n## Terms\n\nThis is placeholder markdown content used by Storybook only.\n\n---\n\n### Notes\n\n1. Not a legal document.\n2. Suitable for renderer layout checks.',
    tipsTricksTrivia: '# Tips, Tricks & Trivia\n\n## Practical checklist for dense markdown rendering\n\nUse this document to verify heading rhythm, list indentation, and long-token wrapping without relying on complex table syntax.\n\n### Core stress cases\n\n- Heading rhythm with multiple levels (`h2`, `h3`, `h4`).\n- Mixed emphasis in one line: **bold**, *italic*, and `inline-code`.\n- Long tokens that normally overflow: `ANCIENT_CHRONICLE_REFERENCE_WITH_EXTENDED_NAMESPACE_AND_VARIANT_SUFFIX_00042`.\n- Nested lists where indentation and bullets stay legible.\n\n#### Nested list sample\n\n- Archive operations\n  - Intake\n    - Validate contributor metadata\n    - Normalize naming and aliases\n  - Review\n    - Cross-check continuity markers\n    - Flag unresolved timeline forks\n\n### Quoted design note\n\n> Dialog markdown should remain readable at high zoom levels and with long localization strings.\n\n### Example snippet\n\n```text\ntype:character AND region:"Storm Coast" AND tag:"sky-harbormaster"\n```\n\nFinal reminder: combine long paragraph copy with list-heavy sections in one document to stress both vertical rhythm and line wrapping under realistic lore-writing conditions.',
    test: '# Markdown stress test\n\n## Heading levels\n\n### H3\n\n#### H4\n\n##### H5\n\n###### H6\n\n## Emphasis and inline formatting\n\nPlain text with **bold**, *italic*, ***bold italic***, ~~strikethrough~~, and `inline code` in one sentence.\n\nEscaped characters: \\*literal asterisks\\*, \\_literal underscore\\_, and \\`literal backticks\\`.\n\n## Links and references\n\n- Inline link: [Fantasia Archive](https://example.invalid/fantasia-archive)\n- Autolink: <https://example.invalid/docs>\n\n## Lists\n\n- Unordered item A\n  - Nested unordered A.1\n  - Nested unordered A.2\n    - Deep nested unordered A.2.a\n- Unordered item B\n\n1. Ordered item one\n2. Ordered item two\n   1. Nested ordered two.one\n   2. Nested ordered two.two\n\n- [x] Task list done\n- [ ] Task list pending\n\n## Blockquotes\n\n> Single-level quote.\n>\n> - Quote list item\n> - Another quote list item\n>\n> > Nested quote level two.\n\n## Code blocks\n\n```text\nSELECT title, region FROM chronicles WHERE status = "active";\n```\n\n```ts\ntype CharacterRecord =\n  id: string\n  aliases: string[]\n  region: string\n\nconst normalizeAlias = (value: string): string => value.trim().toLowerCase()\n```\n\n## Table-like coverage without pipes\n\n- Feature: Alignment; Sample: centered; Expected behavior: right-aligned text\n- Feature: Inline code; Sample: `token`; Expected behavior: monospace rendering\n- Feature: Emphasis; Sample: **bold** and *italic*; Expected behavior: readable contrast\n\n## Horizontal rule\n\n---\n\n## Image syntax\n\n![Placeholder asset alt text](./non-existent-image.png)\n\n## Mixed content paragraph\n\nWhen a paragraph includes **emphasis**, a [link](https://example.invalid/mixed), `inline code`, and a trailing list:\n\n- it should keep vertical rhythm,\n- wrapping should stay stable,\n- and no horizontal overflow should appear at 1920x1080.'
  }
}

const scenarioMessages: Record<T_i18nScenario, Record<string, unknown>> = {
  default: defaultMessages,
  longStrings: longStringsMessages,
  markdownHeavy: markdownHeavyMessages
}

let activeScenario: T_i18nScenario = 'default'

export const setI18nScenario = (scenario: T_i18nScenario = 'default') => {
  activeScenario = scenario
}

export const getStorybookI18nMessages = (): Record<string, unknown> => scenarioMessages[activeScenario]

const resolveTranslation = (key: string): string => {
  const fragments = key.split('.')
  let current: unknown = storybookI18nMessages

  for (const fragment of fragments) {
    if (typeof current !== 'object' || current === null || !(fragment in current)) {
      return key
    }

    current = (current as Record<string, unknown>)[fragment]
  }

  return typeof current === 'string' ? current : key
}

const storybookI18nMessages = new Proxy(defaultMessages, {
  get (_target, property: string) {
    return scenarioMessages[activeScenario][property]
  },
  has (_target, property: string) {
    return property in scenarioMessages[activeScenario]
  }
}) as Record<string, unknown>

export const i18n = {
  global: {
    t: (key: string): string => resolveTranslation(key)
  }
}
