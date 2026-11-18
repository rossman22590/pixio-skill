#!/usr/bin/env node
// Fails when a Montage craft skill names a model or vendor, uses a route that
// is not under /api/v1, or points at another skill that does not exist.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'references',
  'montage',
);

const BANNED =
  /\b(h3|minimax|seedance|bytedance|gemini|seedvr2?|qwen|kling|veo|runway|revana|kinovi|atlas ?cloud|fal|higgsfield|lyria|suno|elevenlabs|cartesia|ltx|flux|mymachine|gpu|admin|loras?|reelshort|dramabox|shortmax)\b/i;
const STUDIO_ROUTE = /(^|[^/a-z])\/v1\/|github\.com/i;

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
const names = new Set(files.map((f) => f.replace(/\.md$/, '')));
const problems = [];

for (const file of files) {
  const lines = fs.readFileSync(path.join(dir, file), 'utf8').split('\n');

  lines.forEach((line, i) => {
    const where = `${file}:${i + 1}`;
    const banned = line.match(BANNED);

    if (banned) problems.push(`${where} names "${banned[0]}"`);
    if (STUDIO_ROUTE.test(line)) problems.push(`${where} studio route or link`);

    for (const [, ref] of line.matchAll(/references\/montage\/([\w-]+)\.md/g)) {
      if (!names.has(ref)) problems.push(`${where} points at missing ${ref}.md`);
    }
  });

  const head = lines.slice(0, 5).join('\n');
  const name = head.match(/^name:\s*(\S+)/m)?.[1];

  if (name !== file.replace(/\.md$/, '')) {
    problems.push(`${file} frontmatter name is "${name}"`);
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} problem(s) in references/montage`);
  process.exit(1);
}

console.log(`references/montage: ${files.length} skills clean`);
