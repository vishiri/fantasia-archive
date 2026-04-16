# Contributing to Fantasia Archive

Use **Node.js 22.22.0 or newer** and **Yarn 1.x** (CI **Verify** uses **`yarn@1.22.19`** — see [README.md](README.md) and **`.github/workflows/verify.yml`**). Install dependencies with `yarn` from the repository root and, for Storybook or ESLint scopes that touch `.storybook-workspace`, run `yarn --cwd .storybook-workspace install` when that tree changes.

Commit messages are enforced by **Husky** and **commitlint** (see [commitlint.config.mjs](commitlint.config.mjs) and the **Git commits** section in [AGENTS.md](AGENTS.md)).

## Quality checks before you push

For substantive code or test changes, run the full quality gate in **one** terminal from the repo root:

```bash
yarn testbatch:verify
```

See [.cursor/rules/testing-terminal-isolation.mdc](.cursor/rules/testing-terminal-isolation.mdc) for when to use faster commands while iterating. Playwright component and E2E tests need a production Electron build first; see [README.md](README.md) and [.cursor/skills/fantasia-testing/SKILL.md](.cursor/skills/fantasia-testing/SKILL.md).

## Pull request labels (required)

Pull requests against **main** or **master** must have **exactly one** of these labels so the correct **PR full suite** workflow runs:

| Label | When to use |
| --- | --- |
| `novisualchange` | You are **not** intentionally changing Storybook visual baselines. CI runs `yarn testbatch:ensure:nochange` (VRT **compare** against committed snapshots). |
| `visualchange` | You **are** updating Storybook VRT baselines. CI runs `yarn testbatch:ensure:change`. |

Do **not** use both labels. Do **not** leave both off.

Add the label in the PR sidebar as soon as you can; **labeled** events and new commits re-run checks. If you do not have permission to set labels on the repository, ask a **maintainer** to apply the correct single label.

Details match [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md).

## Fork pull requests (external contributors)

### Labels and permissions

You still need exactly one of `novisualchange` or `visualchange`. If you cannot add labels yourself, comment on the PR and a maintainer will set the right one.

### Storybook visual baselines (snapshots)

CI **does not** auto-commit updated VRT snapshots for PRs whose head branch lives on a **fork**. The **visualchange** workflow only pushes snapshot commits when the PR head branch is on **this** repository (same-repo PRs).

If your change requires new or updated PNGs under `.storybook-workspace/visual-tests/storybook.visual.playwright.test.ts-snapshots/`, run locally on **Windows** when possible (CI uses **windows-latest** and **chromium-win32** baselines), then commit and push the snapshot files from your fork:

```bash
yarn testbatch:ensure:change
```

If you only need to refresh Storybook captures without the rest of the chain, use the scripts described in [README.md](README.md) under Storybook visual tests. Read [README.md](README.md) (Storybook visual baseline policy) and [AGENTS.md](AGENTS.md) for how **`maxDiffPixels`** works so you do not confuse it with viewport width.

### Full suite and `GITHUB_TOKEN`

Workflows triggered by **`pull_request`** from a **public fork** use a **`GITHUB_TOKEN`** that is **read-only** for the **base** repository. Steps that need **write** access to the base repo (for example posting an automated comment when labels are wrong) can fail even when your PR is fine.

If checks fail with permission or API errors on the **guard** job, paste the log in the PR and a maintainer will confirm labels and continue review. The intended label state is still: **exactly one** of `novisualchange` or `visualchange`.

## If CI looks wrong

1. Confirm **exactly one** of `novisualchange` or `visualchange` is set (or ask a maintainer to set it).
2. For **fork** PRs, confirm a maintainer has **approved** the workflow run if GitHub is waiting for approval.
3. Copy the failing job name, error snippet, and any **uploaded artifacts** (for example Playwright HTML report) into a PR comment.

---

## For maintainers: GitHub settings (fork PR workflows)

These settings help maintainers and contributors: fork PRs can run Actions reliably and contributors get predictable behavior. They do **not** grant write access from forked **`pull_request`** workflows beyond what GitHub allows (read-only token to the base repo on public forks).

1. **Enable Actions for fork PRs**
   Repository **Settings** → **Actions** → **General**: under **Fork pull request workflows from outside collaborators**, choose a policy that matches your trust model (for example require approval only for **first-time** contributors).
   Official overview: [Approving workflow runs from public forks](https://docs.github.com/en/actions/managing-workflow-runs/approving-workflow-runs-from-public-forks).

2. **Workflow permissions (default for `GITHUB_TOKEN`)**
   Same page: **Workflow permissions** controls the default scope for jobs that do not set finer-grained `permissions`. Keep defaults as restrictive as your other workflows allow; the **PR full suite** workflows set their own `permissions` blocks where needed.

3. **Label guard and fork PRs**
   On **public** repositories, **`pull_request`** from forks still uses a **read-only** token for the base repo, so automated **PR comments** from the label guard may fail. Rely on the PR template, this document, and manual comments when that happens.

4. **Optional**
   **Settings** → **Actions** → **General**: allow the **actions** and reusable workflows your workflows reference (for example **google/osv-scanner-action**), if you use restricted allowlists.
