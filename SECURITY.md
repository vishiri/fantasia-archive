# Security policy

## Supported versions

We only provide security fixes for the **current major release line** published from this repository, and we recommend running the **latest patch release** in that line.

| Version   | Supported          |
| --------- | ------------------ |
| 2.x.x       | :white_check_mark: |
| &lt; 2.0.0  | :x:                |

Adjust this table if you maintain multiple supported release branches.

## Reporting a vulnerability

**Please do not** open a public GitHub issue for security-sensitive reports (that can disclose details before a fix is ready).

Preferred options (use whichever you enable and monitor):

1. **GitHub private vulnerability reporting** — If enabled for this repository, use the **Security** tab and **Report a vulnerability** so the maintainers can coordinate privately.
2. **Email** — Contact the maintainer at **vishiri.rilgatan@gmail.com** (from `package.json`). Include:
   - A short description of the issue and its impact
   - Affected component or area if known (for example renderer under `src/`, Electron main under `src-electron/`, preload / `contentBridgeAPIs`, IPC channels in `electron-ipc-bridge.ts`, packaged app update flow, etc.)
   - Steps to reproduce or a proof of concept, if you can share one safely

## What to expect

- We will acknowledge reasonable reports when we can, but this is a volunteer-driven open source project — **we cannot guarantee fixed response times**.
- We may ask follow-up questions or coordinate an embargo period before public disclosure, especially for issues that affect end users of the packaged desktop app.

## Scope notes (non-exhaustive)

Reports we are especially interested in include issues that could compromise **users’ machines or data** through the **Electron** shell (for example unsafe IPC or preload exposure, unexpected file or shell access, or remote code execution in the app context). General hardening suggestions are welcome but may be prioritized lower than exploitable issues.

## Preferred versions

For development and releases, follow **Node.js** and **Yarn** guidance in the repository **README** so reproduction matches what maintainers use in CI.
