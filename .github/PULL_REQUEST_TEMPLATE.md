## Required CI label (exactly one)

Pull requests against `main` / `master` must have **exactly one** of these GitHub labels so the correct full CI suite runs:

| Label | When to use |
| --- | --- |
| `novisualchange` | You are **not** intentionally changing Storybook visual baselines. CI runs `yarn testbatch:ensure:nochange` (includes VRT **compare** against committed snapshots). |
| `visualchange` | You **are** updating Storybook VRT baselines. CI runs `yarn testbatch:ensure:change` (includes `yarn test:storybook:visual:update`). **Commit the updated snapshot files** this job produces. |

**Do not** add both labels. **Do not** leave both off. If the combination is wrong, the **PR full suite (ensure nochange)** guard fails until you fix it (one bot comment); the **ensure change** guard stays green for that case so you do not get two failures for the same label mistake. The PR stays open so you can add a label after open.

Add the label in the PR sidebar (Labels) as soon as possible; the **labeled** event re-runs workflows, and pushing new commits also re-runs checks.

Fork PRs, local VRT snapshot updates, and maintainer **GitHub Actions** settings: [CONTRIBUTING.md](../CONTRIBUTING.md).

## Other labels

Add any others that logically apply for your pull request.

## Summary of your changes

<!-- Describe what this PR changes for reviewers. -->

## Checklist

- [ ] Exactly one of `novisualchange` or `visualchange` is applied to this PR
- [ ] If `visualchange`: I will commit any updated Storybook visual snapshots from CI or from local `yarn testbatch:ensure:change`
- [ ] Summary of changes has been filled in
