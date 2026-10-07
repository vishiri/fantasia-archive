#!/usr/bin/env node
/**
 * Maps Cursor hook events to cavemem hook run CLI.
 * Fail-open: errors never block the agent loop.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { Result } from 'neverthrow';

const CAVEMEM_HOOK = process.argv[2];
const VALID_HOOKS = [
  'session-start',
  'user-prompt-submit',
  'post-tool-use',
  'stop',
  'session-end',
];

if (!VALID_HOOKS.includes(CAVEMEM_HOOK)) {
  process.stderr.write(`cavemem-bridge: unknown hook ${CAVEMEM_HOOK}\n`);
  process.exit(0);
}

const raw = readFileSync(0, 'utf8');
let cursorInput = {};

if (raw.trim()) {
  const parsed = Result.fromThrowable(
    () => JSON.parse(raw),
    () => undefined
  )().unwrapOr(undefined);
  if (parsed === undefined) {
    process.stderr.write('cavemem-bridge: invalid JSON on stdin\n');
    process.exit(0);
  }
  cursorInput = parsed;
}

const sessionId = cursorInput.session_id ?? cursorInput.conversation_id ?? 'unknown';
const cwd = cursorInput.cwd ?? cursorInput.workspace_roots?.[0] ?? null;

function mapCursorToCavemem(hookName, input) {
  switch (hookName) {
    case 'session-start':
      return {
        session_id: sessionId,
        cwd,
        ide: 'cursor',
      };
    case 'user-prompt-submit': {
      const prompt = input.prompt ?? '';
      return {
        session_id: sessionId,
        prompt,
      };
    }
    case 'post-tool-use': {
      const tool_name = input.tool_name;
      const tool_input = input.tool_input;
      const tool_response = input.tool_output;
      return {
        session_id: sessionId,
        tool_name,
        tool_input,
        tool_response,
      };
    }
    case 'stop': {
      const turn_summary = input.text ?? input.turn_summary ?? '';
      return {
        session_id: sessionId,
        turn_summary,
      };
    }
    case 'session-end':
      return {
        session_id: sessionId,
      };
    default:
      return {
        session_id: sessionId,
      };
  }
}

const payload = mapCursorToCavemem(CAVEMEM_HOOK, cursorInput);

const result = spawnSync(
  'cavemem',
  [
    'hook',
    'run',
    CAVEMEM_HOOK,
    '--ide',
    'cursor',
  ],
  {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    stdio: [
      'pipe',
      'pipe',
      'pipe',
    ],
    shell: process.platform === 'win32',
  },
);

if (result.error) {
  process.stderr.write(`cavemem-bridge: ${result.error.message}\n`);
  process.exit(0);
}

if (result.stderr) {
  process.stderr.write(result.stderr);
}

if (result.status !== 0) {
  process.exit(0);
}

if (CAVEMEM_HOOK === 'session-start' && result.stdout?.trim()) {
  const parsed = Result.fromThrowable(
    () => JSON.parse(result.stdout),
    () => undefined
  )().unwrapOr(undefined);
  const context = parsed?.hookSpecificOutput?.additionalContext;

  if (typeof context === 'string' && context.trim()) {
    process.stdout.write(JSON.stringify({
      additional_context: context,
    }));
  }
}

process.exit(0);
