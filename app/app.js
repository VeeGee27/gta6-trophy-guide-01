// Leonida Trophy Atlas: a checklist and guide for GTA VI's 55 PlayStation
// trophies. Progress is saved in localStorage; export and import move it
// between browsers. Every guide is written in our own words as a short
// summary plus numbered steps, and every step names the source its fact
// comes from. Filters cover grade, difficulty and kind (story, missable,
// collectibles, activities, online); the spoiler shield hides story
// trophies until they are earned. The roadmap is built from the data file
// and shows live progress per stage; clicking a stage filters the list to
// its trophies. A source matrix and a missable audit are computed from the
// same data, so the numbers on screen always match the guides.
// Deep links: ?t=<id> opens a trophy's guide, ?earned=<id,id> previews
// progress, ?spoilers=off shows story names, ?kind=<kind> and ?grade=<grade>
// set the filters, ?stage=<n> filters to one roadmap stage, ?view=roadmap,
// ?view=matrix or ?view=audit jumps to that section, ?view=list jumps to
// the checklist.
const KEY = 'gta6-trophy-guide-progress-v1';
const KIND_LABELS = {
  story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
  activities: 'Activities', online: 'Online', meta: 'Platinum',
};
const DIFF_LABELS = {
  easy: 'Easy', medium: 'Medium', hard: 'Hard', 'very hard': 'Very hard',
};
// One line per source, in our own words, saying what it was used for.
const SOURCE_ROLES = {
  exophase: 'Official list: names, descriptions, grades, rarity',
  outputlag: 'Full list, roadmap and missable warnings',
  gtavicecityhub: 'Full achievement list',
  egamers: 'Full list, hardest trophies, missable',
  gtavibes: 'Full list',
  ofzen: 'Full list; the story-moment reading for the vague trophies',
  eso: 'Full list',
  powerpyx: 'Per-trophy methods, roadmap, missables, 100% checklist',
  gtabase: 'Full list; the Ocean Beach cocktail spot',
  gtasix: 'Full list; the UFO encounter videos',
  sixshore: 'Full list, missables and roadmap',
};

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sourceMap = doc.sources ?? {};
const roadmap = doc.roadmap ?? [];
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
} catch { earned = new Set(); }
if (params.get('earned')) {
  earned = new Set(params.get('earned').split(',').map(Number).filter((n) => byId.has(n)));
}

const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const diffEl = document.getElementById('difficulty');
const spoilersEl = document.getElementById('spoilers');
const earnedOnlyEl = document.getElementById('earnedOnly');
const filterNoteEl = document.getElementById('filterNote');
let kind = params.get('kind') ?? 'all';
let openId = params.get('t') ? Number(params.get('t')) : null;
let stageFilter = null;
const stageParam = Number(params.get('stage'));
if (stageParam >= 1 && stageParam <= roadmap.length) stageFilter = stageParam;
if (params.get('spoilers') === 'off') spoilersEl.checked = false;
if (params.get('grade') && [...gradeEl.options].some((o) => o.value === params.get('grade'))) {
  gradeEl.value = params.get('grade');
}
if (params.get('difficulty') && [...diffEl.options].some((o) => o.value === params.get('difficulty'))) {
  diffEl.value = params.get('difficulty');
}
document.querySelectorAll('#kindChips .chip').forEach((chip) => {
  chip.classList.toggle('on', chip.dataset.kind === kind);
});

function saveProgress() {
  try { localStorage.setItem(KEY, JSON.stringify([...earned])); } catch { /* private mode */ }
}

function spoilerHidden(t) {
  return spoilersEl.checked && t.secret && !earned.has(t.id);
}

function shortSourceName(key) {
  const s = sourceMap[key];
  if (!s) return key;
  return s.name.split(' — ')[0];
}

function sourceLink(key) {
  const s = sourceMap[key];
  const a = document.createElement('a');
  if (s) {
    a.href = s.url;
    a.textContent = shortSourceName(key);
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = s.name;
  } else {
    a.textContent = key;
  }
  return a;
}

function sourceLinks(t) {
  const wrap = document.createElement('p');
  wrap.className = 'sources';
  wrap.append('Sources: ');
  (t.sources ?? ['exophase']).forEach((key, i) => {
    const s = sourceMap[key];
    if (i > 0) wrap.append(' · ');
    wrap.append(sourceLink(key));
    if (s?.checked) wrap.append(` (checked ${s.checked})`);
  });
  return wrap;
}

function stepList(t) {
  const steps = t.steps ?? [];
  if (!steps.length) return null;
  const ol = document.createElement('ol');
  ol.className = 'steps';
  for (const [i, st] of steps.entries()) {
    const li = document.createElement('li');
    li.append(document.createTextNode(st.text + ' '));
    const cite = document.createElement('span');
    cite.className = 'cite';
    cite.append('[', sourceLink(st.source), ']');
    li.append(cite);
    ol.append(li);
  }
  return ol;
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = String(t.id);
  const isEarned = earned.has(t.id);
  const hidden = spoilerHidden(t);
  if (isEarned) card.classList.add('earned');
  if (hidden) card.classList.add('spoiled');

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', `Mark ${hidden ? 'story trophy' : t.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveProgress();
    render();
  });
  head.append(box);
  const titleBox = document.createElement('div');
  const h = document.createElement('h3');
  h.textContent = hidden ? 'Hidden story trophy' : t.name;
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden ? 'Earn it (or switch the spoiler shield off) to reveal its name and description.' : t.description;
  titleBox.append(h, desc);
  head.append(titleBox);
  card.append(head);

  const badges = document.createElement('div');
  badges.className = 'badges';
  const gradeBadge = document.createElement('span');
  gradeBadge.className = `badge ${t.grade}`;
  gradeBadge.textContent = t.grade;
  badges.append(gradeBadge);
  if (t.secret) {
    const b = document.createElement('span');
    b.className = 'badge hidden';
    b.textContent = 'Hidden on PSN';
    badges.append(b);
  }
  if (t.missable) {
    const b = document.createElement('span');
    b.className = 'badge missable';
    b.textContent = 'Missable';
    badges.append(b);
  }
  if (t.unconfirmed) {
    const b = document.createElement('span');
    b.className = 'badge unconfirmed';
    b.textContent = 'Unconfirmed';
    badges.append(b);
  }
  for (const k of t.kinds) {
    if (k === 'meta' || k === 'missable') continue;
    const b = document.createElement('span');
    b.className = 'badge tag';
    b.textContent = KIND_LABELS[k] ?? k;
    badges.append(b);
  }
  const diff = document.createElement('span');
  diff.className = 'badge tag';
  diff.textContent = DIFF_LABELS[t.difficulty] ?? t.difficulty;
  badges.append(diff);
  card.append(badges);

  const detail = document.createElement('div');
  detail.className = 'detail';
  detail.hidden = openId !== t.id;
  const label = document.createElement('p');
  label.innerHTML = '<span class="guide-label">How to unlock it</span>';
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  const meta = document.createElement('p');
  meta.className = 'meta';
  const bits = [`${t.points} points on PlayStation`];
  if (t.count) bits.push(`PSN tracks a count: ${t.count}`);
  if (t.rarity) bits.push(`Exophase launch-day rarity: ${t.rarity} (19 Nov 2026)`);
  meta.textContent = bits.join(' · ');
  detail.append(label, guide);
  const steps = stepList(t);
  if (steps) {
    const stepsLabel = document.createElement('p');
    stepsLabel.innerHTML = '<span class="guide-label">Steps — each one cites its source</span>';
    detail.append(stepsLabel, steps);
  }
  detail.append(meta, sourceLinks(t));
  card.append(detail);

  card.addEventListener('click', (e) => {
    if (e.target === box) return;
    openId = openId === t.id ? null : t.id;
    render();
  });
  return card;
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  const stageIds = stageFilter ? new Set(roadmap[stageFilter - 1].trophies) : null;
  return trophies.filter((t) => {
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (diffEl.value !== 'all' && t.difficulty !== diffEl.value) return false;
    if (earnedOnlyEl.checked && !earned.has(t.id)) return false;
    if (stageIds && !stageIds.has(t.id)) return false;
    if (kind === 'online') return false;
    if (kind !== 'all' && !t.kinds.includes(kind)) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${(t.steps ?? []).map((s) => s.text).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const total = trophies.length;
  const n = earned.size;
  document.getElementById('earnedCount').textContent = String(n);
  document.getElementById('progressFill').style.width = `${(n / total) * 100}%`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const have = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return `${g[0].toUpperCase() + g.slice(1)} ${have}/${all}`;
  });
  document.getElementById('gradeCounts').textContent = counts.join(' · ');
  const points = trophies.filter((t) => earned.has(t.id)).reduce((s, t) => s + t.points, 0);
  document.getElementById('pointsCount').textContent = `${points} points of 1,350`;
}

function renderRoadmap() {
  const list = document.getElementById('stageList');
  if (!list) return;
  if (!list.children.length) {
    roadmap.forEach((stage, i) => {
      const li = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = stage.title;
      const prog = document.createElement('span');
      prog.className = 'stage-prog';
      const text = document.createElement('span');
      text.textContent = ` ${stage.text}`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stage-filter';
      btn.textContent = 'Show these trophies';
      btn.addEventListener('click', () => {
        stageFilter = stageFilter === i + 1 ? null : i + 1;
        render();
        document.getElementById('controls').scrollIntoView();
      });
      li.append(title, prog, document.createElement('br'), text, document.createElement('br'), btn);
      list.append(li);
    });
  }
  // Progress is live: refresh every stage's count on each render.
  [...list.children].forEach((li, i) => {
    const stage = roadmap[i];
    const done = stage.trophies.filter((id) => earned.has(id)).length;
    li.querySelector('.stage-prog').textContent = ` ${done}/${stage.trophies.length} earned`;
  });
}

function missableVerdict(t) {
  if (t.missable) {
    return ['Possibly missable', 'The Chapter 1 balcony meditation disappears after Chapter 1; whether it is required is still unconfirmed (PowerPyx).'];
  }
  if (t.unconfirmed) {
    return ['Method unknown', 'No verified trigger yet and no missable report (PowerPyx).'];
  }
  if (t.kinds.includes('story')) {
    return ['Unmissable', 'Pops automatically in the story (PowerPyx).'];
  }
  return ['Not missable', 'Still available in free-roam after the story (PowerPyx).'];
}

function renderAudit() {
  const body = document.getElementById('auditBody');
  if (!body || body.children.length) return;
  for (const t of trophies) {
    const [verdict, why] = missableVerdict(t);
    const tr = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = t.name;
    const v = document.createElement('td');
    v.textContent = verdict;
    if (t.missable) v.className = 'warn';
    const w = document.createElement('td');
    w.textContent = why;
    tr.append(name, v, w);
    body.append(tr);
  }
}

function renderMatrix() {
  const body = document.getElementById('matrixBody');
  if (!body || body.children.length) return;
  for (const [key, s] of Object.entries(sourceMap)) {
    const citedTrophies = trophies.filter((t) => (t.sources ?? []).includes(key)).length;
    const citedSteps = trophies.reduce(
      (n, t) => n + (t.steps ?? []).filter((st) => st.source === key).length, 0);
    const tr = document.createElement('tr');
    const name = document.createElement('td');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    a.target = '_blank';
    a.rel = 'noopener';
    name.append(a);
    const role = document.createElement('td');
    role.textContent = SOURCE_ROLES[key] ?? '';
    const nt = document.createElement('td');
    nt.textContent = String(citedTrophies);
    const ns = document.createElement('td');
    ns.textContent = String(citedSteps);
    const checked = document.createElement('td');
    checked.textContent = s.checked ?? '';
    tr.append(name, role, nt, ns, checked);
    body.append(tr);
  }
}

function render() {
  renderProgress();
  renderRoadmap();
  renderAudit();
  renderMatrix();
  const shown = visibleTrophies();
  listEl.replaceChildren(...shown.map(trophyCard));
  emptyEl.hidden = shown.length > 0;
  if (kind === 'online') {
    filterNoteEl.textContent = 'There are no online trophies in GTA VI at launch — all 55 unlock in single-player.';
  } else if (shown.length === 0) {
    filterNoteEl.textContent = '';
  } else {
    const stageNote = stageFilter ? ` · Stage ${stageFilter} only — click its stage again to clear` : '';
    filterNoteEl.textContent = `Showing ${shown.length} of 55 trophies · ${earned.size} earned. Click a trophy to open its guide and sources.${stageNote}`;
  }
  const sourceList = document.getElementById('sourceList');
  if (sourceList && !sourceList.children.length) {
    for (const s of Object.values(sourceMap)) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.textContent = s.name;
      a.target = '_blank';
      a.rel = 'noopener';
      li.append(a);
      if (s.published) li.append(` — published ${s.published}`);
      if (s.checked) li.append(`, checked ${s.checked}`);
      sourceList.append(li);
    }
  }
}

searchEl.addEventListener('input', render);
gradeEl.addEventListener('change', render);
diffEl.addEventListener('change', render);
spoilersEl.addEventListener('change', render);
earnedOnlyEl.addEventListener('change', render);
document.querySelectorAll('#kindChips .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    kind = chip.dataset.kind;
    document.querySelectorAll('#kindChips .chip').forEach((c) => c.classList.toggle('on', c === chip));
    render();
  });
});
document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((x, y) => x - y) }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    earned = new Set(ids.filter((n) => byId.has(Number(n))).map(Number));
    saveProgress();
  } catch { /* keep current progress on a bad file */ }
  render();
});
document.getElementById('reset').addEventListener('click', () => {
  earned = new Set();
  saveProgress();
  render();
});

render();
if (params.get('view') === 'roadmap') {
  document.getElementById('roadmap').scrollIntoView();
} else if (params.get('view') === 'matrix') {
  document.getElementById('matrix').scrollIntoView();
} else if (params.get('view') === 'audit') {
  document.getElementById('missable-audit').scrollIntoView();
} else if (params.get('view') === 'list' || params.get('kind') || stageFilter) {
  document.getElementById('controls').scrollIntoView();
}
if (openId && byId.has(openId)) {
  document.querySelector(`.card[data-id="${openId}"]`)?.scrollIntoView({ block: 'center' });
}
