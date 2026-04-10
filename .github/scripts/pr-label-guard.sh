#!/usr/bin/env bash
# Validates that a pull request has exactly one of: novisualchange | visualchange.
# Used by pr-full-suite-*.yml workflows. Exits 1 when invalid (does not close the PR so labels can be added after open).
# Argument: nochange | change — selects which workflow is running (controls run_heavy output).
set -euo pipefail

MODE="${1:-}"
if [[ "$MODE" != "nochange" && "$MODE" != "change" ]]; then
  echo "Usage: pr-label-guard.sh <nochange|change>" >&2
  exit 2
fi

EVENT_PATH="${GITHUB_EVENT_PATH:?GITHUB_EVENT_PATH is required}"
REPO="${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
PR_NUMBER="$(jq -r '.pull_request.number' "${EVENT_PATH}")"

# Read labels from the GitHub API, not only GITHUB_EVENT_PATH. Re-run failed jobs replays the
# original pull_request payload (often from open/push before labels existed), so embedded labels
# stay stale and the guard would never pass until a new synchronize/labeled run. API state is current.
has_novisual=false
has_visual=false
while IFS= read -r name; do
  [[ -z "${name}" ]] && continue
  [[ "${name}" == "novisualchange" ]] && has_novisual=true
  [[ "${name}" == "visualchange" ]] && has_visual=true
done < <(gh api "repos/${REPO}/pulls/${PR_NUMBER}" --jq '.labels[].name')

invalid=false
if [[ "${has_novisual}" == "true" && "${has_visual}" == "true" ]]; then
  invalid=true
elif [[ "${has_novisual}" == "false" && "${has_visual}" == "false" ]]; then
  invalid=true
fi

if [[ "${invalid}" == "true" ]]; then
  # Both workflows run on every PR. Without this branch, missing or conflicting labels would fail
  # two guard jobs with the same error. Only the nochange workflow owns the failing check + comment;
  # the change workflow exits success with run_heavy=false so the PR shows a single red guard.
  if [[ "${MODE}" == "change" ]]; then
    {
      echo "run_heavy=false"
    } >> "${GITHUB_OUTPUT:?GITHUB_OUTPUT is required}"
    exit 0
  fi
  MARKER='<!-- fa-pr-label-guard -->'
  if ! gh api "repos/${REPO}/issues/${PR_NUMBER}/comments" --paginate --jq '.[].body' | grep -qF "${MARKER}"; then
    gh pr comment "${PR_NUMBER}" --repo "${REPO}" --body "${MARKER}

The **PR full suite (ensure nochange)** guard is failing because this PR does not have **exactly one** of the labels \`novisualchange\` or \`visualchange\` (not both, not neither). Workflows run on **open** and **push** before labels may be set — add the correct single label in the sidebar and checks will re-run.

- \`novisualchange\` — Storybook baselines must **not** change; CI runs \`yarn testbatch:ensure:nochange\`.
- \`visualchange\` — You intend to refresh VRT baselines; CI runs \`yarn testbatch:ensure:change\` (includes \`yarn test:storybook:visual:update\`).

The **PR full suite (ensure change)** guard stays green when labels are missing so you only see one failure for this rule. See the pull request template file under the .github folder on the default branch."
  fi
  exit 1
fi

run_heavy=false
if [[ "${MODE}" == "nochange" && "${has_novisual}" == "true" ]]; then
  run_heavy=true
fi
if [[ "${MODE}" == "change" && "${has_visual}" == "true" ]]; then
  run_heavy=true
fi

{
  echo "run_heavy=${run_heavy}"
} >> "${GITHUB_OUTPUT:?GITHUB_OUTPUT is required}"

exit 0
