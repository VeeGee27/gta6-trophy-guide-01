// Leonida Trophy Atlas: checklist, roadmap, source matrix and missable audit
// for the 55 GTA 6 trophies. All data comes from app/data/trophies.json; the
// audit strip and the source matrix are computed from that same file, so the
// numbers on screen can never drift from the guides.
const KEY = 'gta6-trophy-atlas-v3';
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sourceById = Object.fromEntries(doc.sources.map((s) => [s.id, s]));
const knownNames = new Set(trophies.map((t) => t.name));
// Stored progress may hold names from an older data file; only names this
// guide knows count, so the earned total can never be inflated by stale data.
let earned = new Set((JSON.parse(localStorage.getItem(KEY) ?? '[]')).filter((n) => knownNames.has(n)));
let spoilerOn = true;
let stageFilter = null;

const $ = (id) => document.getElementById(id);
const totalSteps = trophies.reduce((n, t) => n + t.steps.length, 0);
const confirmedCount = trophies.filter((t) => t.confirmed).length;

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function sourceChip(id) {
  const s = sourceById[id];
  return s ? s.name : id;
}

// Per source: how many trophies it is cited on (by name or by step) and how
// many steps cite it. List sources are cited for names and descriptions, so
// they show trophies but zero steps — that is honest, not a gap.
function matrixRows() {
  return doc.sources.map((s) => {
    const stepTrophies = new Set();
    let steps = 0;
    for (const t of trophies) {
      if (t.nameSources.includes(s.id)) stepTrophies.add(t.id);
      for (const st of t.steps) {
        if (st.source === s.id) { steps += 1; stepTrophies.add(t.id); }
      }
    }
    return { source: s, trophies: stepTrophies.size, steps };
  });
}

function renderStrip() {
  const items = [
    ['Methods confirmed', `${confirmedCount} of ${trophies.length}`],
    ['Cited steps', String(totalSteps)],
    ['Sources', String(doc.sources.length)],
    ['Difficulty', doc.audit.difficulty],
    ['Time to platinum', `${doc.audit.hours} hours`],
    ['Last checked', doc.checked],
  ];
  $('audit-strip').replaceChildren(...items.map(([k, v]) => {
    const wrap = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    wrap.append(dt, dd);
    return wrap;
  }));
}

function stageProgress(stage) {
  const names = new Map(trophies.map((t) => [t.id, t.name]));
  const got = stage.trophies.filter((id) => earned.has(names.get(id))).length;
  return { got, total: stage.trophies.length };
}

function renderRoadmap() {
  const host = $('stages');
  host.replaceChildren();
  for (const stage of doc.roadmap) {
    const { got, total } = stageProgress(stage);
    const card = document.createElement('div');
    card.className = 'stage';
    const h = document.createElement('h3');
    const n = document.createElement('span');
    n.className = 'n';
    n.textContent = `Stage ${stage.stage}`;
    h.append(n, document.createTextNode(stage.title));
    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = stage.hours;
    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('i');
    fill.style.width = total ? `${Math.round((got / total) * 100)}%` : '0%';
    bar.append(fill);
    const count = document.createElement('p');
    count.className = 'count';
    count.textContent = `${got}/${total} earned`;
    const note = document.createElement('p');
    note.className = 'note';
    note.textContent = stage.note;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = stageFilter === stage.stage ? 'Showing these trophies — clear' : 'Show these trophies';
    btn.addEventListener('click', () => {
      stageFilter = stageFilter === stage.stage ? null : stage.stage;
      renderAll();
      $('checklist').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    card.append(h, meta, bar, count, note, btn);
    host.append(card);
  }
}

function visibleTrophies() {
  const q = $('search').value.trim().toLowerCase();
  const type = $('type-filter').value;
  const missableOnly = $('missable-only').checked;
  return trophies.filter((t) => {
    if (stageFilter !== null && t.stage !== stageFilter) return false;
    if (type !== 'all' && t.type !== type) return false;
    if (missableOnly && t.missable !== 'possible') return false;
    if (q) {
      const hay = [t.name, t.description, t.guide, ...t.steps.map((s) => s.text)].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function stepsEl(t) {
  const ol = document.createElement('ol');
  ol.className = 'steps';
  for (const s of t.steps) {
    const li = document.createElement('li');
    li.append(document.createTextNode(s.text));
    const chip = document.createElement('span');
    chip.className = 'src';
    chip.textContent = sourceChip(s.source);
    li.append(chip);
    ol.append(li);
  }
  return ol;
}

function renderChecklist() {
  const list = visibleTrophies();
  const host = $('checklist');
  host.replaceChildren();
  $('progress').textContent = `Showing ${list.length} of ${trophies.length} trophies · ${earned.size} earned`;
  if (!list.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No trophies match these filters.';
    host.append(p);
    return;
  }
  for (const t of list) {
    const card = document.createElement('article');
    card.className = 'card' + (earned.has(t.name) ? ' earned' : '') + (t.confirmed ? '' : ' unconfirmed');
    card.dataset.trophyId = String(t.id);
    const top = document.createElement('div');
    top.className = 'top';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      save();
      renderAll();
    });
    const h = document.createElement('h3');
    h.textContent = t.name;
    top.append(box, h);
    card.append(top);
    const badges = document.createElement('div');
    const badgeList = [[t.grade, t.grade], ['type', t.type]];
    if (t.missable === 'possible') badgeList.push(['missable', 'possibly missable']);
    if (!t.confirmed) badgeList.push(['unconfirmed', 'method unconfirmed']);
    if (t.hidden) badgeList.push(['hidden', 'hidden']);
    for (const [cls, label] of badgeList) {
      const b = document.createElement('span');
      b.className = `badge ${cls}`;
      b.textContent = label;
      badges.append(b);
    }
    card.append(badges);
    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = t.description;
    card.append(desc);
    const guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = t.guide;
    if (spoilerOn && t.type === 'story') {
      const shield = document.createElement('div');
      shield.className = 'shield';
      shield.textContent = 'Story guide hidden by the spoiler shield. ';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Reveal this guide';
      btn.addEventListener('click', () => { shield.replaceWith(guide, stepsEl(t)); });
      shield.append(btn);
      card.append(shield);
    } else {
      card.append(guide, stepsEl(t));
    }
    const verdict = document.createElement('p');
    verdict.className = 'verdict';
    verdict.textContent = `Audit: ${t.audit.verdict} — ${t.audit.reason}`;
    card.append(verdict);
    host.append(card);
  }
}

function renderMatrix() {
  const host = $('matrix-rows');
  host.replaceChildren();
  for (const row of matrixRows()) {
    const tr = document.createElement('tr');
    const cells = [row.source.name, row.source.role, String(row.trophies), String(row.steps), row.source.checked];
    cells.forEach((c, i) => {
      const td = document.createElement('td');
      if (i >= 2 && i <= 3) td.className = 'num';
      td.textContent = c;
      tr.append(td);
    });
    host.append(tr);
  }
}

function renderAudit() {
  const host = $('audit-rows');
  host.replaceChildren();
  for (const t of trophies) {
    const tr = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = t.name;
    const v = document.createElement('td');
    v.className = 'verdict'
      + (t.audit.verdict === 'possibly missable' ? ' possibly' : '')
      + (t.audit.verdict === 'method unknown' ? ' unknown' : '');
    v.textContent = t.audit.verdict;
    const r = document.createElement('td');
    r.textContent = t.audit.reason;
    tr.append(name, v, r);
    host.append(tr);
  }
}

function renderSources() {
  const host = $('source-list');
  host.replaceChildren();
  for (const s of doc.sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.url;
    a.rel = 'noopener';
    li.append(document.createTextNode(`${s.name} — ${s.title} (${s.role}). `), a);
    host.append(li);
  }
}

function exportProgress() {
  const payload = {
    game: doc.game,
    exported: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function renderAll() {
  renderStrip();
  renderRoadmap();
  renderChecklist();
  renderMatrix();
  renderAudit();
}

$('search').addEventListener('input', renderChecklist);
$('type-filter').addEventListener('change', renderChecklist);
$('missable-only').addEventListener('change', renderChecklist);
$('spoiler-toggle').addEventListener('change', (e) => {
  spoilerOn = e.target.checked;
  renderChecklist();
});
$('export').addEventListener('click', exportProgress);
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = new Set(trophies.map((t) => t.name));
    earned = new Set((data.earned ?? []).filter((n) => names.has(n)));
    save();
    renderAll();
  } catch {
    // A bad file is ignored; the page keeps its current progress.
  }
});
$('clear-filters').addEventListener('click', () => {
  $('search').value = '';
  $('type-filter').value = 'all';
  $('missable-only').checked = false;
  stageFilter = null;
  renderAll();
});

renderSources();
renderAll();
