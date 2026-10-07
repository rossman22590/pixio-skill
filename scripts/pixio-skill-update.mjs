#!/usr/bin/env node

// Check GitHub for a newer pixio-skill and, with --apply, fast-forward a git
// clone of it. Never overwrites local edits and never touches anything else.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HELP = `Usage: node scripts/pixio-skill-update.mjs [--apply]

Compares this skill's skill-version.json with the copy on GitHub
(rossman22590/pixio-skill, branch main).

  --apply   If an update exists and this skill is a clean git clone, run
            "git pull --ff-only". Otherwise print how to update by hand.

Exit codes: 0 up to date or updated, 10 update available (not applied),
1 could not check (offline, blocked); continue with the local copy.`;

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const local = JSON.parse(readFileSync(join(root, "skill-version.json"), "utf8"));
const rawUrl = `https://raw.githubusercontent.com/rossman22590/pixio-skill/${local.branch ?? "main"}/skill-version.json`;

function report(result, code) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(code);
}

let remote;
try {
  const response = await fetch(rawUrl, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  remote = await response.json();
} catch (error) {
  report(
    {
      ok: false,
      checked: false,
      local: local.version,
      reason: `Could not reach GitHub (${error.message}). Continue with the local copy and read GET /api/v1/guide for anything newer.`,
    },
    1,
  );
}

const updateAvailable = String(remote.version) > String(local.version);

if (!updateAvailable) {
  report({ ok: true, upToDate: true, local: local.version, remote: remote.version }, 0);
}

const manual = `Download ${local.repo} (branch ${local.branch ?? "main"}) and replace this skill folder, or run "git pull --ff-only" inside it.`;

if (!process.argv.includes("--apply")) {
  report(
    {
      ok: true,
      upToDate: false,
      local: local.version,
      remote: remote.version,
      next: "Run again with --apply, or update by hand.",
      manual,
    },
    10,
  );
}

const git = (...args) =>
  execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();

try {
  if (!existsSync(join(root, ".git"))) throw new Error("not a git clone");
  if (git("status", "--porcelain")) throw new Error("the skill folder has local changes");
  git("pull", "--ff-only");
  const after = JSON.parse(readFileSync(join(root, "skill-version.json"), "utf8"));
  report({ ok: true, updated: true, from: local.version, to: after.version }, 0);
} catch (error) {
  report(
    {
      ok: false,
      updated: false,
      local: local.version,
      remote: remote.version,
      reason: `Not updated automatically: ${error.message}.`,
      manual,
    },
    10,
  );
}
