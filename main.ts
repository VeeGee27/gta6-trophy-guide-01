// Leonida Trophy Atlas — the entry program for gta6-trophy-guide-01
// (Node 22, standard library only). The guide itself is this directory's
// app/ folder: plain static files a browser opens at app/index.html, with no
// build step and nothing fetched over the network. Its trophy data and guides
// live in app/data/trophies.json — 55 trophies, each with an official name,
// description and grade, a guide in our own words, and numbered steps that
// each cite their source — plus a roadmap, a source matrix and a missable
// audit computed from the same data. app/app.js renders the checklist,
// filters, spoiler shield and progress tracker; app/style.css is its look.
//
// This program hands the guide in: it copies app/ and screenshots/ from
// beside this file to /output and writes /output/dossier.json — the summary
// the judge reads (the screenshots, the first load's files and bytes, and
// the source) — with the vendored make.fun library. vendor/makefun-frontend.ts
// stays exactly as the kit shipped it: the scorer requires dossier.json to be
// byte for byte what its own copy of that library writes.
//
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function handIn() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
  const shotsDir = join(outputDir, 'screenshots');
  mkdirSync(shotsDir, { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
  }
  // The scorer's own caps: only text_max_bytes shapes the bytes; the others
  // refuse an entry the scorer would refuse — more than 4 screenshots or one
  // over 256 KiB; more than 993 files and directories in app/, or 48 MiB of
  // app files (app/ counts beside /output's own 1000-entry cap, with its
  // screenshots/ and dossier.json).
  writeFileSync(
    join(outputDir, 'dossier.json'),
    buildDossier(outputDir, {
      text_max_bytes: 163840,
      screenshots: { max: 4, max_bytes: 262144 },
      app_max_files: 993,
      app_max_bytes: 50331648,
    }),
  );
}

handIn();
