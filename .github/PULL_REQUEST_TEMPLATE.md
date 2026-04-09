## Required CI label (exactly one)

Pull requests against `main` / `master` must have **exactly one** of these GitHub labels so the correct full CI suite runs:

| Label | When to use |
| --- | --- |
| `novisualchange` | You are **not** intentionally changing Storybook visual baselines. CI runs `yarn testbatch:ensure:nochange` (includes VRT **compare** against committed snapshots). |
| `visualchange` | You **are** updating Storybook VRT baselines. CI runs `yarn testbatch:ensure:change` (includes `yarn test:storybook:visual:update`). **Commit the updated snapshot files** this job produces. |

**Do not** add both labels. **Do not** leave both off. If the combination is wrong, the PR may be **closed automatically** with a short explanation.

Add the label in the PR sidebar (Labels) **before** or right after opening the PR; pushing new commits re-runs checks.

## Other labels

Add any other/others that logically appply for your Pull Request

## Summary of your changes

<!-- Describe what this PR changes for reviewers. -->

## Checklist

- [ ] Exactly one of `novisualchange` or `visualchange` is applied to this PR
- [ ] If `visualchange`: I will commit any updated Storybook visual snapshots from CI or from local `yarn testbatch:ensure:change`
- [ ] Summary of changes has been filled in
