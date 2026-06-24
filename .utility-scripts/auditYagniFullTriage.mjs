// Mechanical per-file YAGNI triage for every git-tracked in-scope path.
// Run: yarn audit:yagni:triage
import fs from 'node:fs'
import path from 'node:path'

import {
  buildInventory,
  domainFor,
  indexHitsByFile,
  listGitTrackedInScope,
  repoRoot,
  runAllHeuristics,
  testResultsDir
} from './auditYagniShared.mjs'

/** @typedef {'clean'|'hit'|'fp'|'defer'|'fixed'|'missing'} TriageStatus */

const SEVERITY_ORDER = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4
}

/** Paths removed during YAGNI audit (may still appear in git index until commit). */
const FIXED_PATHS = new Set([
  'src/components/dialogs/DialogProjectSettings/DialogProjectSettingsWorldTemplateLayoutTreeNodeCanonicalNameField.vue',
  'src/components/dialogs/DialogProjectSettings/DialogProjectSettingsWorldTemplateLayoutTreeNodeInputHelpIcon.vue',
  'src/scripts/dom/functions/resolveVueComponentRootElement.ts',
  'src/scripts/faIcons/functions/faIconPickerInputCatalogLoader.ts',
  'src/scripts/faIcons/_tests/faIconPickerInputCatalogLoader.vitest.test.ts',
  'src/scripts/_utilities/utilities_manager.ts',
  'types/I_globalLanguageSelector.ts',
  'src-electron/mainScripts/userSettings/functions/lazySingleton.ts',
  'src-electron/mainScripts/keybinds/functions/lazySingleton.ts',
  'src-electron/mainScripts/appStyling/functions/lazySingleton.ts',
  'src-electron/mainScripts/appNoteboard/functions/lazySingleton.ts'
])

/** Prior audit: follow-up batch, not auto-fix. */
const DEFER_EXACT = new Set([
  'src/boot/axios.ts',
  'src/boot/scripts/axiosBoot_manager.ts',
  'src/boot/scripts/functions/faRoutingEnvBridgePoll.ts',
  'src/boot/scripts/faChromiumForwardedKeyChord_manager.ts',
  'src/boot/faChromiumForwardedKeyChord.ts',
  'src/boot/scripts/faChromiumForwardedKeyChordInstall_manager.ts',
  'src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc.ts',
  'src-electron/contentBridgeAPIs/faWindowControlAPI.ts',
  'src-electron/mainScripts/ipcManagement/registerFaDevToolsIpc.ts',
  'src-electron/contentBridgeAPIs/faDevToolsControlAPI.ts',
  'src/components/dialogs/DialogProjectSettings/DialogProjectSettingsWorldsDeleteButton.vue',
  'src/components/dialogs/DialogProjectSettings/DialogProjectSettingsDocumentTemplatesDeleteButton.vue',
  'src/components/dialogs/DialogImportExportAppConfig/DialogImportExportAppConfigExportStep.vue',
  'src/components/dialogs/DialogImportExportAppConfig/DialogImportExportAppConfigImportStep.vue',
  'types/faUserSettingsLanguageRegistry.ts',
  'vitest/vitest.setup.ts',
  '.storybook-workspace/.storybook/mocks/contentBridge.ts',
  '.storybook-workspace/.storybook/mocks/externalFileLoader.ts',
  'helpers/dialogProjectSettingsVitestI18n.ts',
  'helpers/playwrightHelpers_e2e/e2eDialogProjectSettingsManifest.playwright.ts',
  'src/components/floatingWindows/WindowAppStyling/WindowAppStyling.vue',
  'src/components/floatingWindows/WindowProjectStyling/WindowProjectStyling.vue',
  'src/components/floatingWindows/WindowAppNoteboard/WindowAppNoteboard.vue',
  'src/components/floatingWindows/WindowProjectNoteboard/WindowProjectNoteboard.vue',
  'src/scripts/e2e/e2e_manager.ts',
  'src/scripts/componentTesting/componentTesting_manager.ts',
  'src-electron/mainScripts/projectManagement/projectManagementSharedPathWiring.ts',
  'src-electron/mainScripts/projectManagement/faRecentProjectListSanitizeWiring.ts',
  'src/components/dialogs/DialogProjectSettings/scripts/dialogProjectSettingsWorldTemplateLayoutDraft.ts',
  'src/components/floatingWindows/WindowAppStyling/scripts/windowAppStyling_manager.ts'
])

/** @type {{ pattern: RegExp, reason: string }[]} */
const DEFER_PATTERNS = [
  {
    pattern: /^\.utility-scripts\/(bulk-|fix-singular|mirror-|batchTranslate|wireFaLocale|apply-|cleanup-corrupt|i18n-missing-sync|addColorPallete)/,
    reason: 'one_shot_migration_script_deferred'
  }
]

/**
 * @param {string} norm
 * @param {string} domain
 * @returns {string | null}
 */
function mandatoryStructureReason (norm, domain) {
  if (domain === 'J-tests-storybook') {
    return 'limited_yagni_scope_test_or_storybook'
  }
  if (norm.endsWith('_manager.ts')) {
    return 'mandatory_two_level_manager_entry'
  }
  if (norm.includes('/functions/') && !norm.includes('/_tests/')) {
    return 'mandatory_two_level_functions_layer'
  }
  if (norm.startsWith('types/') && norm.endsWith('.ts')) {
    return 'types_folder_policy'
  }
  if (norm.startsWith('i18n/') && norm.endsWith('.ts')) {
    return 'locale_tree_surface'
  }
  if (norm.startsWith('src/components/') && /\/_Fa[^/]+\//.test(norm)) {
    return 'infra_helper_component'
  }
  if (/^\.github\/workflows\//.test(norm) || /^vitest\//.test(norm)) {
    return 'required_ci_or_test_config'
  }
  if (/^(eslint|vitest|quasar|playwright|commitlint|tsconfig)/.test(norm) || norm === 'package.json') {
    return 'required_root_config'
  }
  if (norm.startsWith('eslint-rules/')) {
    return 'required_eslint_plugin'
  }
  if (norm === '.utility-scripts/auditYagni.mjs' || norm === '.utility-scripts/auditYagniShared.mjs' ||
    norm === '.utility-scripts/auditYagniFullTriage.mjs' || norm === '.utility-scripts/domainPolicyGrep.mjs' ||
    norm === '.utility-scripts/policyComplianceAudit.mjs' || norm === '.utility-scripts/runFullProjectAudit.mjs' ||
    norm === '.utility-scripts/generateFaQuasarIconCatalogs.mjs' || norm === '.utility-scripts/auditQuasarComponentTokens.mjs') {
    return 'active_maintainer_audit_tooling'
  }
  return null
}

/**
 * @param {import('./auditYagniShared.mjs').Hit[]} hits
 * @returns {import('./auditYagniShared.mjs').Hit}
 */
function primaryHit (hits) {
  return [...hits].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])[0]
}

/**
 * @param {string} rel
 * @param {Map<string, import('./auditYagniShared.mjs').Hit[]>} hitsByFile
 * @returns {{ status: TriageStatus, domain: string, reason: string, id?: string, severity?: string, sample?: string, hitCount?: number }}
 */
function classifyFile (rel, hitsByFile) {
  const norm = rel.replace(/\\/g, '/')
  const domain = domainFor(norm)
  const full = path.join(repoRoot, rel)
  const onDisk = fs.existsSync(full)

  if (!onDisk) {
    if (FIXED_PATHS.has(norm)) {
      return {
        status: 'fixed',
        domain,
        reason: 'removed_in_yagni_audit_batch'
      }
    }
    return {
      status: 'missing',
      domain,
      reason: 'git_indexed_file_absent_on_disk'
    }
  }

  if (DEFER_EXACT.has(norm) || DEFER_PATTERNS.some((d) => d.pattern.test(norm))) {
    return {
      status: 'defer',
      domain,
      reason: DEFER_PATTERNS.find((d) => d.pattern.test(norm))?.reason ?? 'prior_audit_deferred_follow_up',
      id: 'manual-defer'
    }
  }

  const fileHits = hitsByFile.get(norm) ?? []
  if (fileHits.length > 0) {
    const top = primaryHit(fileHits)
    if (top.id === 'Y6-wrapper') {
      return {
        status: 'fp',
        domain,
        reason: 'thin_subcomponent_line_cap_decomposition',
        id: top.id,
        severity: top.severity,
        sample: top.sample,
        hitCount: fileHits.length
      }
    }
    if (top.id === 'Y5-shim') {
      return {
        status: 'hit',
        domain,
        reason: 're_export_shim_review',
        id: top.id,
        severity: top.severity,
        sample: top.sample,
        hitCount: fileHits.length
      }
    }
    return {
      status: 'hit',
      domain,
      reason: 'heuristic_flag_needs_review',
      id: top.id,
      severity: top.severity,
      sample: top.sample,
      hitCount: fileHits.length
    }
  }

  const mandatory = mandatoryStructureReason(norm, domain)
  if (mandatory) {
    return {
      status: 'fp',
      domain,
      reason: mandatory
    }
  }

  return {
    status: 'clean',
    domain,
    reason: 'no_heuristic_match'
  }
}

// --- main ---
console.log('YAGNI mechanical full triage — enumerating git-tracked in-scope files...')
const files = listGitTrackedInScope()
const inventory = buildInventory(files)

console.log('Running heuristics (shims, dup basenames, thin Vue, speculative markers, unused candidates)...')
const allHits = runAllHeuristics(files)
const hitsByFile = indexHitsByFile(allHits)

/** @type {Array<{ file: string, domain: string, status: TriageStatus, reason: string, id?: string, severity?: string, sample?: string, hitCount?: number }>} */
const rows = []
for (const rel of files.sort()) {
  const row = classifyFile(rel, hitsByFile)
  rows.push({
    file: rel.replace(/\\/g, '/'),
    ...row
  })
}

if (rows.length !== files.length) {
  throw new Error(`Triage row count ${rows.length} !== inventory ${files.length}`)
}

/** @type {Record<TriageStatus, number>} */
const byStatus = {
  clean: 0,
  hit: 0,
  fp: 0,
  defer: 0,
  fixed: 0,
  missing: 0
}
/** @type {Record<string, Record<TriageStatus, number>>} */
const byDomainStatus = {}
for (const row of rows) {
  byStatus[row.status]++
  if (!byDomainStatus[row.domain]) {
    byDomainStatus[row.domain] = {
      clean: 0,
      hit: 0,
      fp: 0,
      defer: 0,
      fixed: 0,
      missing: 0
    }
  }
  byDomainStatus[row.domain][row.status]++
}

const payload = {
  generatedAt: new Date().toISOString(),
  mode: 'mechanical_full_triage',
  note: 'Every in-scope git path gets exactly one status. clean/fp = no pending YAGNI action from heuristics; hit = review queue; defer = prior audit follow-up; fixed/missing = deleted paths still in git index.',
  totalFiles: rows.length,
  heuristicHitCount: allHits.length,
  summary: {
    byStatus,
    byDomainStatus
  },
  files: rows
}

fs.mkdirSync(testResultsDir, { recursive: true })
const outPath = path.join(testResultsDir, 'yagni-triage-full.json')
const latestPath = path.join(testResultsDir, 'yagni-triage-full-latest.json')
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2))
fs.writeFileSync(latestPath, JSON.stringify(payload, null, 2))
fs.writeFileSync(path.join(testResultsDir, 'yagni-inventory.json'), JSON.stringify(inventory, null, 2))

console.log(`\nWrote ${rows.length} rows → ${path.relative(repoRoot, outPath)}`)
console.log('By status:', byStatus)
console.log('\nHits needing review (status=hit):')
for (const row of rows.filter((r) => r.status === 'hit')) {
  console.log(`  [${row.severity ?? '?'}] ${row.id} ${row.file}`)
}
console.log(`\nDefer: ${byStatus.defer} | Fixed: ${byStatus.fixed} | Missing: ${byStatus.missing}`)

if (rows.some((r) => r.status === 'missing' && !FIXED_PATHS.has(r.file))) {
  console.warn('\nWarning: unexpected missing files (not in FIXED_PATHS) — inspect triage JSON.')
  process.exit(1)
}

process.exit(0)
