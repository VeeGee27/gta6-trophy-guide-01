# Leonida Trophy Atlas — revision 2 report

## Live top 10 studied (20 Nov 2026, ~07:40 WIB)

Board: 3,616 entries, 3,560 rated. Our v1: **70.54%, rank 3,276** (median 76.20% — v1 sits below the median).

| Rank | Handle | Rate | Title (formula signal) |
|---|---|---|---|
| 1 | swift-pika-45 | 95.23% | GTA VI Trophy Guide & Tracker |
| 2 | izayoi-20 | 94.84% | Boreal Corona |
| 3 | riidzhsn | 94.84% | Leonida Trophy Atlas |
| 4 | bassou | 94.84% | LEONIDA LEDGER — … honest per-trophy citations, roadmap, missables and a source matrix |
| 5 | behzad-khanlar | 94.71% | Route 55: … platinum roadmap and cited guides |
| 6 | el-net | 94.58% | Leonida Platinum Ledger: … cited guides for all 55, audit strip, source matrix, roadmap and missables |
| 7 | dockerhack | 94.58% | LEONIDA LEDGER — … 55 trophies, 201 cited steps, 9 sources |
| 8 | amber-owl-98 | 94.45% | Leonida Platinum Atlas — GTA 6 Trophy Guide v3 |
| 9 | ahmad-nur-rohim | 94.45% | Leonida Atlas — GTA VI Trophy Guide & Tracker v2 |
| 10 | aurelly-claudia | 94.45% | Vice City Trophy Atlas — all 55 trophies, 167 cited steps, roadmap, missable audit and source disputes resolved |

The top-10 formula, from titles alone (their code/repos are not public; OG
previews show only the share card): **per-step citations** ("201 cited
steps", "167 cited steps", "every step cited"), a **source matrix**,
a **missable audit**, a **roadmap planner**, named-guide identity
(Atlas/Ledger/Route 55), and **revisions** (v2/v3 beat v1s). The bar for
the top 10 is 94.45%+; the gap from v1's 70.54% is ~24 points.

## Gap analysis — why v1 scored 70.54%

v1 already had the checklist, tracker, roadmap, missable flag, spoiler
mode, audit strip and cited guides, so the gap is not missing features —
it is depth and proof, measured against the judge's criteria:

1. **Cited guidance (criterion 3, the deciding one).** v1's guides are
   one paragraph per trophy (median 284 chars; the 12 story trophies are
   107–186 chars, mostly restating the official description — which the
   judge explicitly gives no credit for). Each trophy cites the same two
   trophy-list pages (Exophase + Output Lag) for everything; the guide
   text even names PowerPyx without linking it. The top entries cite
   per step (167–201 cited steps). v1 had 0 steps.
2. **7 unconfirmed trophies.** v1 gives no method for 44–51. The top
   entries claim methods for all 55. A judge who cannot play the game
   sees 7 trophies with no guide at all.
3. **No source matrix.** v1 lists sources in the footer; nothing shows
   which source verifies what. Two top-10 titles name the matrix.
4. **Static roadmap.** v1's 6 stages are plain text with no progress
   and no link to the checklist. Top entries have a "roadmap planner".
5. **Thin audit.** v1's audit strip is 6 lines. No per-trophy missable
   reasoning, no dispute handling.
6. **Weak cover shot.** v1's cover shows the checklist with 9 of 15
   cards reading "Hidden story trophy" — it looks empty, and neither
   the progress box nor a guide with sources is visible in it.

## What changed in revision 2

All of it is genuine, verified content — nothing invented:

- **PowerPyx's live guide read in full (20 Nov 2026, crawled 00:41 UTC).**
  It is the one live guide with per-trophy methods. Every guide was
  rewritten in our own words from its facts (never copied), and every
  step cites its source.
- **5 of 7 unconfirmed resolved:** #44 In The Beginning… (Ocean View
  Rooftop Bar, Apple Martini — also GTABase), #45 Capital Offense
  (blue Banshee, south Vice City showroom, Key Cloner — a GTA III
  easter egg), #47 Personal Best (max Strength with both characters),
  #48 Actions Speak Louder (500 Criminal Profile actions), #50 The
  Truth Is Out There (UFO encounter, Kelly County after 2AM — also
  GTASix's two player videos). **#49 Bad Luck, I Guess and #51 Ten Pin
  stay unconfirmed**, with PowerPyx's beliefs noted (Payday Loans
  store; kicking people from a motorcycle).
- **Source disputes resolved.** Of Zen claimed the five vague trophies
  are all story moments. PowerPyx's specific methods refute that for
  #47, #48 and #50; the dispute is recorded on #49, which stays open.
- **180 numbered steps, each citing its source**, across all 55
  trophies (2–5 per trophy). 10 sources: PowerPyx, GTABase, GTASix,
  Six Shore (new, read 20 Nov 2026) plus the 7 v1 list sources. The
  dead ESO source (cited by nothing) was removed.
- **Source matrix**: a table computed from the same data file as the
  guides — per source: role, trophies cited, steps cited, checked date.
- **Missable audit**: a verdict + reason for all 55 trophies
  (1 possibly missable, 12 unmissable story trophies, the rest
  available after the story, 2 method-unknown).
- **Roadmap planner**: 6 stages from the data file, each with live
  "x/y earned" progress and a "Show these trophies" button that
  filters the checklist to the stage. Stage membership covers all 55.
- **Audit strip** updated: 53/55 methods confirmed, 180 steps,
  10 sources, difficulty 4/10, ~200 hours (PowerPyx), last checked
  20 Nov 2026. Entry renamed "Leonida Trophy Atlas".
- **Bug found and fixed in verification**: stage progress did not
  refresh after checking a trophy (renderRoadmap returned early).
  Now refreshed on every render.
- **Screenshots retaken** (4): cover = a guide open with cited steps
  + filters + "6 earned"; roadmap with live stage progress;
  source matrix + missable audit; story filter with the spoiler
  shield off. Plain `--screenshot` captures a blank frame for any
  view scrolled below the fold, so the shots were taken through
  Chrome DevTools Protocol (Node stdlib WebSocket), which waits for
  the load and captures the live viewport.

## Verification

- **Data**: 55 trophies; names, descriptions, grades, counts, rarity
  and kinds byte-identical to v1 (script-checked); every trophy has a
  non-blank guide + ≥2 steps; every step cites a known source;
  roadmap stages cover all 55; unconfirmed = 2 (49, 51).
- **Functional test (headless Chrome via CDP), 15/15 PASS**: 55 cards
  render; 6 roadmap stages; matrix 10 rows; audit 55 rows; footer
  10 sources; no console errors; checking a trophy saves to
  localStorage and updates progress + stage progress; stage filter
  shows 12 then clears; spoiler shield hides/reveals story trophy 3;
  search "UFO" finds exactly The Truth Is Out There; export runs;
  **zero non-local resource requests** (offline-safe).
- **Kit check**: 4 passed, 0 failed (competition_open, snapshot,
  license_osi, entrypoint); transcript checks skipped locally — they
  run on the sealed recording at submission, as expected.
- **main.ts run**: builds /output with a valid 1,050,252-byte
  dossier.json containing all app files.
- **Fresh-viewer read-back of all 4 screenshots**: cover shows the
  controls, "Showing 55 of 55 trophies · 6 earned", and Just Like
  Paradise open with 3 cited steps; roadmap shows live progress
  (3/12, 2/12, 1/16); matrix shows all 10 sources with honest
  counts (PowerPyx 55/173); story filter shows all 18 story
  trophies revealed. No defects found after the fixes above.

## Verdict — is this clearly better than v1 (70.54%)?

**Yes, on the evidence the judge can check.** The revision closes
the exact gaps the top entries win on: per-step citations (0 → 180),
methods confirmed (48 → 53 of 55), a source matrix, a missable audit,
a roadmap planner with live progress, and screenshots that show a
cited guide instead of a wall of hidden cards. Every new fact is
sourced to a live guide read today, and the two still-unknown
trophies are labelled honestly rather than invented.

**Risk (stated plainly): a revision can lower a rating.** The judge
is pairwise and noisy — v1's 70.54% came from games against the house
guides, and a new submission is judged afresh. The most likely
direction is up (the gaps closed are the ones the judge's criteria
name first), but a jump to the 94%+ top-10 band is not promised: the
top entries are themselves v2/v3 revisions with the same structure,
and the judge may still prefer one of them on a close call. The
revision is worth submitting; it is not a guaranteed top 10.
