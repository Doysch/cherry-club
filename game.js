/* Cherry Club – 3, 4, 6, 7 and 12 times tables (ages 8-10) */
'use strict';

/* ---------------- Content ---------------- */
const TABLES = [3, 4, 6, 7, 12];
const MULTIPLIERS = [1,2,3,4,5,6,7,8,9,10,11,12];
const INTRO_ORDER = [2,5,10,3,4,6,8,9,7,11,12,1];   // anchor facts first, x1 last (trivial)
const TABLE_ORDER = [3, 4, 6, 12, 7];                // suggested learning order, shown on home
const INTERVALS = [0,1,2,4,7];                        // sessions until due, by box
const FAST_MS = 6000;                                 // MTC standard
const SESSION_LEN = 12;
const MAX_NEW_PER_SESSION = 4;
const PARENT_PIN = '1964';                            // Grown-ups' corner code (child-proofing, not security)

const REALMS = {
  3:  { id:3,  name:'The 3s',  plush:'bunny',    colour:'#e8f3e4', trick:'Double it, then add one more lot' },
  4:  { id:4,  name:'The 4s',  plush:'bear',     colour:'#fff1cf', trick:'Double, then double again' },
  6:  { id:6,  name:'The 6s',  plush:'octopus',  colour:'#e4eefb', trick:'Five lots, then one more lot' },
  7:  { id:7,  name:'The 7s',  plush:'avocado',  colour:'#e9f5e0', trick:'Five lots plus two lots' },
  12: { id:12, name:'The 12s', plush:'cherries', colour:'#ffe1e6', trick:'Ten lots plus two lots' },
};
const STAGES = ['◌', '🌱', '🍒', '🎀', '⭐'];
const MIXED = { id:'mix', name:'Cherry Bowl', emoji:'🥣', blurb:'All five tables mixed together', colour:'#f7e6f0' };

const PRAISE = [
  'Nice work.', 'That trick worked!', 'Solid – that fact is getting stronger.', 'Yes! Quick and correct.',
  'Good thinking.', 'You’ve got that one.', 'Spot on.', 'Smooth.', 'That’s fluent territory.', 'Nailed it.',
];
const RETRY = [
  'Not quite. Here’s a trick – have another go.', 'Close. Try the working below.', 'Hmm – check it with the strategy.',
];
const REVEAL = [
  'Here’s the working. Say the whole fact out loud once.', 'A tricky one. It’ll come back later so you can beat it.',
  'Mistakes are data – now you know which one to watch.',
];

/* ---------------- State ---------------- */
const KEY = 'cherry-club-v1';
let S = load();

function freshState() {
  const facts = {};
  for (const t of TABLES) for (const n of MULTIPLIERS) facts[`${t}x${n}`] = { t, n, box:0, seen:0, right:0, wrong:0, fast:0, due:0, last:0 };
  return {
    version:1, name:'', gems:0, totalGems:0, sessions:0, facts,
    plushOwned: [], bows: {}, bowsOwned: ['none', 'red'], goldUnlocked: false, dashBest: 0,
    settings: { sound:true, speak:false },
    history: [],
  };
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) { const s = JSON.parse(raw); return Object.assign(freshState(), s); } } catch (e) {}
  return freshState();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* ---------------- Helpers ---------------- */
const $ = id => document.getElementById(id);
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const an = n => (n === 8 || n === 11 ? 'An' : 'A');
const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo(0, 0);
}
function realmFacts(realm) { return Object.values(S.facts).filter(f => realm === 'mix' || f.t === realm); }
function realmUnlocked(realm) {
  if (realm !== 'mix') return true;
  return TABLES.filter(t => realmFacts(t).filter(f => f.box >= 2).length >= 5).length >= 2;   // at least two tables underway
}
function tableComplete(t) { return realmFacts(t).every(f => f.box === 4); }
function plushById(id) { return PLUSH.find(p => p.id === id); }
function ensureMascots() {
  // a table's mascot plush is adopted for free the first time that table is played
  let changed = false;
  for (const t of TABLES) if (realmFacts(t).some(f => f.seen > 0) && !S.plushOwned.includes(REALMS[t].plush)) { S.plushOwned.push(REALMS[t].plush); changed = true; }
  if (!S.goldUnlocked && TABLES.some(tableComplete)) { S.goldUnlocked = true; S.bowsOwned.push('gold'); changed = true; }
  if (changed) save();
}

/* ---------------- Audio ---------------- */
let audioCtx = null;
function beep(freqs, dur = 0.12, type = 'sine', gain = 0.12) {
  if (!S.settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    freqs.forEach((f, i) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = type; o.frequency.value = f;
      const t0 = audioCtx.currentTime + i * dur * 0.8;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g).connect(audioCtx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    });
  } catch (e) {}
}
const SFX = {
  click: () => beep([880], 0.06, 'triangle', 0.05),
  good: () => beep([523, 659, 784], 0.14),
  great: () => beep([523, 659, 784, 1047], 0.14),
  oops: () => beep([330, 262], 0.2, 'sine', 0.08),
  bloom: () => beep([523, 587, 659, 784, 880, 1047], 0.1, 'triangle'),
  gem: () => beep([1200, 1600], 0.07, 'triangle', 0.06),
};
function speak(text, force = false) {
  if ((!S.settings.speak && !force) || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ' ').replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/cm²/g, 'square centimetres'));
    u.lang = 'en-GB'; u.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => /en-GB/i.test(v.lang) && /female|Kate|Serena|Stephanie|Martha|Google UK English Female/i.test(v.name)) || voices.find(v => /en-GB/i.test(v.lang));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

/* ---------------- Confetti ---------------- */
const cv = $('confetti'), cx = cv.getContext('2d');
let particles = [];
function resizeCanvas() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();
function confetti(n = 60, emoji = false) {
  const cols = ['#e63950', '#ff9fbf', '#ffd98a', '#9fc9a3', '#8fd0ff', '#fff'];
  const chars = ['🍒', '🎀', '⭐', '💖'];
  for (let i = 0; i < n; i++) particles.push({
    x: cv.width / 2 + (Math.random() - 0.5) * 200, y: cv.height * 0.4,
    vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4, g: 0.35 + Math.random() * 0.2,
    r: 4 + Math.random() * 6, c: rnd(cols), ch: emoji ? rnd(chars) : null, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, life: 90 + Math.random() * 40,
  });
  if (particles.length === n) requestAnimationFrame(tick);
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= 0.98; p.rot += p.vr; p.life--;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.globalAlpha = Math.min(1, p.life / 30);
    if (p.ch) { cx.font = '22px serif'; cx.fillText(p.ch, -11, 8); } else { cx.fillStyle = p.c; cx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); }
    cx.restore();
  }
  if (particles.length) requestAnimationFrame(tick); else cx.clearRect(0, 0, cv.width, cv.height);
}

/* ---------------- Visual models ---------------- */
// Area model: n rows of t squares, with running multiples on the right
function areaHTML(t, n, opts = {}) {
  const compact = t * n > 60;
  let cells = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < t; c++) cells += `<span class="${r % 2 ? 'alt' : ''}"></span>`;
  let rows = '';
  for (let r = 1; r <= n; r++) rows += `<span class="${r === n ? 'total' : ''}">${r === n && opts.hideTotal ? '?' : t * r}</span>`;
  const caption = opts.caption || `${an(n)} ${n} by ${t} rectangle: ${n} rows of ${t} squares. Its area is the answer.`;
  return `<div class="model-caption">${caption}</div><div class="area-wrap"><div class="area ${compact ? 'compact' : ''}" style="grid-template-columns:repeat(${t},auto)">${cells}</div><div class="area-rows ${compact ? 'compact' : ''}">${rows}</div></div>`;
}

// Derived-fact strategy with the working shown
function strategyHTML(t, n, opts = {}) {
  const p = t * n, steps = [];
  let title = '';
  if (t === 3) { title = `×3 trick: double, then add one more lot`; steps.push([`2 × ${n} = ${2 * n}`, 'double']); steps.push([`${2 * n} + ${n} = ${p}`, 'add one more lot']); }
  else if (t === 4) { title = `×4 trick: double, then double again`; steps.push([`2 × ${n} = ${2 * n}`, 'double']); steps.push([`2 × ${2 * n} = ${p}`, 'double again']); }
  else if (t === 6) { title = `×6 trick: five lots, then one more lot`; steps.push([`5 × ${n} = ${5 * n}`, 'five lots']); steps.push([`${5 * n} + ${n} = ${p}`, 'add one more lot']); }
  else if (t === 7) { title = `×7 trick: five lots plus two lots`; steps.push([`5 × ${n} = ${5 * n}`, 'five lots']); steps.push([`2 × ${n} = ${2 * n}`, 'two lots']); steps.push([`${5 * n} + ${2 * n} = ${p}`, 'add them']); }
  else if (t === 12) { title = `×12 trick: ten lots plus two lots`; steps.push([`10 × ${n} = ${10 * n}`, 'ten lots']); steps.push([`2 × ${n} = ${2 * n}`, 'two lots']); steps.push([`${10 * n} + ${2 * n} = ${p}`, 'add them']); }
  const last = steps.length - 1;
  const rows = steps.map(([eq, note], i) => {
    const shown = (i === last && opts.hideFinal) ? eq.replace(/= \d+$/, '= ?') : eq;
    return `<div class="s-step ${i === last ? 'final' : ''}"><span>${shown}</span><span class="s-note">${note}</span></div>`;
  }).join('');
  return `<div class="strategy"><div class="s-title">${opts.title || title}</div>${rows}</div>`;
}

function fullModel(t, n, opts = {}) { return strategyHTML(t, n, opts) + areaHTML(t, n, opts); }

/* ---------------- Question generation ---------------- */
// kinds: learn (worked example, final step blank), mult, missing, div, word, frac
function makeQuestion(f, kindOverride) {
  const { t, n } = f, R = REALMS[t], p = t * n;
  let kind = kindOverride;
  if (!kind) {
    if (f.box === 0) kind = f.seen === 0 ? 'learn' : rnd(['learn', 'mult']);
    else if (f.box === 1) kind = rnd(['mult', 'mult', 'mult', 'missing']);
    else if (f.box === 2) kind = rnd(['mult', 'mult', 'missing', 'div']);
    else if (f.box === 3) kind = rnd(['mult', 'div', 'missing', 'word', 'word', 'frac']);
    else kind = rnd(['mult', 'mult', 'div', 'word']);
  }
  if (n === 1 && (kind === 'frac' || kind === 'word')) kind = 'mult';
  const q = { f, kind, answer: p, hintHTML: fullModel(t, n, { hideTotal: true, hideFinal: true }), revealHTML: fullModel(t, n), choices: null, speakText: '' };

  if (kind === 'learn') {
    q.html = `${n} × ${t} = <span class="blank">?</span>`;
    q.speakText = `${n} times ${t}. Use the trick to finish the working.`;
    q.showModel = true;
    q.hintHTML = strategyHTML(t, n, { hideFinal: true, title: `New fact! ${R.trick.toLowerCase()} – finish the working:` }) + areaHTML(t, n, { hideTotal: true });
  } else if (kind === 'mult') {
    const flip = f.box >= 2 && Math.random() < 0.45;
    q.html = flip ? `${t} × ${n} = <span class="blank">?</span>` : `${n} × ${t} = <span class="blank">?</span>`;
    q.speakText = flip ? `${t} times ${n}` : `${n} times ${t}`;
  } else if (kind === 'missing') {
    q.answer = n;
    q.html = Math.random() < 0.5 ? `<span class="blank">?</span> × ${t} = ${p}` : `${t} × <span class="blank">?</span> = ${p}`;
    q.speakText = `Something times ${t} equals ${p}. What is the missing number?`;
    q.hintHTML = fullModel(t, n, { hideTotal: false, hideFinal: false, caption: `How many rows of ${t} make ${p}? Count the rows.` });
  } else if (kind === 'div') {
    q.answer = n;
    q.html = `${p} ÷ ${t} = <span class="blank">?</span>`;
    q.speakText = `${p} divided by ${t}`;
    q.hintHTML = fullModel(t, n, { caption: `${p} squares in rows of ${t}. How many rows? Think: ${t} × ? = ${p}` });
  } else if (kind === 'frac') {
    // equivalent fractions built on this fact
    if (Math.random() < 0.5) { q.answer = n; q.html = `${frac(1, t)} = ${frac('<span class="blank">?</span>', p)}`; q.speakText = `One ${t}th equals how many ${p}ths?`; }
    else { const k = rnd([2, 3].filter(k => k !== t && k * t <= 36)) || 2; q.answer = k * n; q.html = `${frac(k, t)} = ${frac('<span class="blank">?</span>', p)}`; q.speakText = `${k} over ${t} equals what over ${p}?`; q.f2 = { k }; }
    q.isWord = true;
    q.hintHTML = `<div class="strategy"><div class="s-title">Equivalent fractions: whatever you multiply the bottom by, multiply the top by too.</div><div class="s-step"><span>${t} × ${n} = ${p}</span><span class="s-note">bottom × ${n}</span></div><div class="s-step final"><span>${q.f2 ? q.f2.k : 1} × ${n} = ?</span><span class="s-note">so top × ${n}</span></div></div>`;
    q.revealHTML = q.hintHTML.replace('= ?', `= ${q.answer}`);
  } else if (kind === 'word') {
    const w = wordProblem(f);
    q.html = w.text; q.answer = w.answer; q.speakText = w.text; q.isWord = true;
    q.hintHTML = fullModel(t, n, { hideTotal: true, hideFinal: true, caption: w.caption });
    q.revealHTML = fullModel(t, n, { caption: w.caption });
  }
  return q;
}

function wordProblem(f) {
  const { t, n } = f, p = t * n, name = S.name || 'Cherry';
  const T = [
    { text: `A rectangle is ${n} cm long and ${t} cm wide. What is its area, in cm²?`, answer: p, caption: `Area = length × width = ${n} × ${t}` },
    { text: `Each ${rnd(['song', 'swimming length', 'chapter', 'dance routine'])} takes ${t} minutes. How many minutes do ${n} of them take?`, answer: p, caption: `${n} lots of ${t} minutes` },
    { text: `A jug holds ${t} litres. How many litres do ${n} jugs hold?`, answer: p, caption: `${n} jugs × ${t} litres` },
    { text: `Hair bows cost £${t} each. ${name} buys ${n}. How many pounds does she spend?`, answer: p, caption: `${n} bows × £${t}` },
    { text: `${p} cherries are shared equally into ${t} bowls. How many cherries in each bowl?`, answer: n, caption: `${p} ÷ ${t}: how many rows of ${t}?` },
    { text: `A ribbon ${p} cm long is cut into pieces ${t} cm long. How many pieces?`, answer: n, caption: `${p} ÷ ${t}: how many ${t}s in ${p}?` },
    { text: `A plushie costs £${t}. ${name} has saved £${p}. How many plushies can she buy?`, answer: n, caption: `£${p} ÷ £${t}` },
  ];
  if (t === 3) T.push({ text: `A tricycle has 3 wheels. How many wheels on ${n} tricycles?`, answer: p, caption: `${n} × 3 wheels` });
  if (t === 4) T.push({ text: `Every plushie has 4 paws. How many paws on ${n} plushies?`, answer: p, caption: `${n} × 4 paws` });
  if (t === 6) T.push({ text: `A pack holds 6 bows. How many bows in ${n} packs?`, answer: p, caption: `${n} packs × 6` });
  if (t === 7) { T.push({ text: `How many days are there in ${n} weeks?`, answer: p, caption: `${n} weeks × 7 days` }); T.push({ text: `${p} days is how many weeks?`, answer: n, caption: `${p} days ÷ 7` }); }
  if (t === 12) { T.push({ text: `How many months are there in ${n} years?`, answer: p, caption: `${n} years × 12 months` }); T.push({ text: `A box holds a dozen eggs. How many eggs in ${n} boxes?`, answer: p, caption: `${n} dozen = ${n} × 12` }); T.push({ text: `${p} months is how many years?`, answer: n, caption: `${p} ÷ 12` }); }
  return rnd(T);
}

/* ---------------- Session engine ---------------- */
let G = null;

function buildQueue(realm) {
  const pool = realmFacts(realm);
  const unseen = pool.filter(f => f.seen === 0).sort((a, b) => (realm === 'mix' ? TABLE_ORDER.indexOf(a.t) - TABLE_ORDER.indexOf(b.t) : 0) || INTRO_ORDER.indexOf(a.n) - INTRO_ORDER.indexOf(b.n));
  const seen = pool.filter(f => f.seen > 0);
  const due = seen.filter(f => f.due <= S.sessions).sort((a, b) => a.box - b.box || a.last - b.last);
  const notDue = seen.filter(f => f.due > S.sessions).sort((a, b) => a.box - b.box || a.last - b.last);

  let picked = [];
  picked.push(...due.filter(f => f.box <= 1).slice(0, 5));
  const newCount = Math.min(MAX_NEW_PER_SESSION, Math.max(1, SESSION_LEN - picked.length - 5));
  picked.push(...unseen.slice(0, unseen.length ? newCount : 0));
  for (const f of due) if (picked.length < SESSION_LEN && !picked.includes(f)) picked.push(f);
  for (const f of notDue) if (picked.length < SESSION_LEN && !picked.includes(f)) picked.push(f);
  if (picked.length === 0) picked = pool.slice(0, SESSION_LEN);

  let queue = shuffle(picked);
  const weakest = picked.slice().sort((a, b) => a.box - b.box);
  let i = 0;
  while (queue.length < SESSION_LEN) queue.push(weakest[i++ % weakest.length]);
  for (let k = 1; k < queue.length; k++) if (queue[k] === queue[k - 1]) { const j = queue.findIndex((f, idx) => idx > k && f !== queue[k]); if (j > 0) [queue[k], queue[j]] = [queue[j], queue[k]]; }
  return queue.map(f => ({ f }));
}

function startGame(realm, sprint = false) {
  G = {
    realm, sprint, queue: sprint ? [] : buildQueue(realm), idx: 0, total: SESSION_LEN,
    gemsStart: S.gems, correct: 0, answered: 0, bloomed: [], struggled: new Set(), promoted: [],
    current: null, attempt: 0, usedHint: false, tStart: 0, input: '', sprintEnd: 0, sprintTimer: null,
  };
  $('sprint-bar-wrap').hidden = !sprint;
  $('q-realm').textContent = realm === 'mix' ? `${MIXED.emoji} ${MIXED.name}` : `${plushById(REALMS[realm].plush).emoji} ${REALMS[realm].name} · ${REALMS[realm].trick}`;
  if (sprint) {
    $('q-realm').textContent = `⚡ Cherry Dash – 60 seconds. Personal best: ${S.dashBest}`;
    G.sprintEnd = Date.now() + 60000;
    G.sprintTimer = setInterval(() => {
      const left = Math.max(0, G.sprintEnd - Date.now());
      $('sprint-bar').style.width = (left / 600) + '%';
      if (left <= 0) { clearInterval(G.sprintTimer); if (!$('feedback').hidden) return; endGame(); }
    }, 250);
  }
  showScreen('screen-play');
  nextQuestion();
}

function pickSprintFact() {
  const pool = Object.values(S.facts).filter(f => f.box >= 1);
  return rnd(pool.length >= 8 ? pool : Object.values(S.facts));
}

function nextQuestion() {
  if (G.sprint) {
    if (Date.now() >= G.sprintEnd) return endGame();
    G.current = { f: pickSprintFact() };
    G.current.q = makeQuestion(G.current.f, rnd(['mult', 'mult', 'div']));
  } else {
    if (G.idx >= G.queue.length) return endGame();
    G.current = G.queue[G.idx];
    G.current.q = G.current.q || makeQuestion(G.current.f, G.current.kind);
  }
  G.attempt = 0; G.usedHint = false; G.input = '';
  renderQuestion();
  G.tStart = Date.now();
}

function renderQuestion() {
  const q = G.current.q;
  $('feedback').hidden = true;
  $('question-card').style.display = '';
  $('play-progress').style.width = G.sprint ? '100%' : (G.idx / G.total * 100) + '%';
  $('play-gems').textContent = S.gems;
  const qt = $('q-text');
  qt.innerHTML = q.html; qt.classList.toggle('word', !!q.isWord && q.kind !== 'frac');
  $('model').innerHTML = q.showModel ? q.hintHTML : '';
  $('choices').innerHTML = '';
  $('answer-row').style.display = ''; $('keypad').style.display = '';
  $('btn-hint').style.display = (q.showModel || G.sprint) ? 'none' : '';
  $('answer-text').textContent = '';
  if (q.kind === 'word') speak(q.speakText);
}

function keyInput(k) {
  if (!G || !$('feedback').hidden) return;
  SFX.click();
  if (k === 'del') G.input = G.input.slice(0, -1);
  else if (k === 'go') { if (G.input !== '') submit(parseInt(G.input, 10)); return; }
  else if (G.input.length < 3) G.input += k;
  $('answer-text').textContent = G.input;
}

function showHint() {
  if (!G) return;
  G.usedHint = true;
  $('model').innerHTML = G.current.q.hintHTML;
  $('btn-hint').style.display = 'none';
}

function submit(val) {
  const q = G.current.q;
  const elapsed = Date.now() - G.tStart;
  if (val === q.answer) return onCorrect(elapsed);
  G.attempt++;
  SFX.oops();
  $('answer-box').classList.remove('shake'); void $('answer-box').offsetWidth; $('answer-box').classList.add('shake');
  if (G.attempt === 1 && !G.sprint) {
    G.usedHint = true;
    $('model').innerHTML = `<div class="model-caption" style="color:#b3243a;font-weight:900">${rnd(RETRY)}</div>` + q.hintHTML;
    $('btn-hint').style.display = 'none';
    G.input = ''; $('answer-text').textContent = '';
    return;
  }
  onWrong();
}

function equationText(q) {
  const { t, n } = q.f, p = t * n;
  if (q.kind === 'div') return `${p} ÷ ${t} = ${n}`;
  if (q.kind === 'frac') return `${n} × ${t} = ${p}`;
  return `${n} × ${t} = ${p}`;
}

function onCorrect(elapsed) {
  const f = G.current.f, q = G.current.q;
  const fast = elapsed < FAST_MS && !G.usedHint;
  const clean = !G.usedHint && G.attempt === 0;
  G.correct++; G.answered++;
  let gems = 1 + (clean ? 1 : 0) + (fast ? 1 : 0);
  let bloomed = false, msg = rnd(PRAISE);

  f.seen++; f.right++; f.last = Date.now(); if (fast) f.fast++;
  if (clean) {
    const before = f.box;
    if (f.box < 3) f.box++;
    else if (f.box === 3 && fast) f.box = 4;
    if (f.box === 4 && before < 4) { bloomed = true; gems += 5; G.bloomed.push(f); }
    else if (f.box > before) G.promoted.push(f);
  }
  f.due = S.sessions + 1 + INTERVALS[f.box];
  S.gems += gems; S.totalGems += gems; save();

  if (bloomed) { SFX.bloom(); confetti(90, true); msg = `⭐ ${f.n} × ${f.t} is now fluent! +5 bonus cherries.`; }
  else if (clean && fast) { SFX.great(); confetti(25); msg += ' ⚡ Fast!'; }
  else SFX.good();

  showFeedback('good', bloomed ? '⭐🍒' : rnd(['🍒', '🎀', '✨', '🐰', '🐻', '💖']), `${msg}<span class="eq">${equationText(q)}</span>`, `+${gems} 🍒`);
}

function onWrong() {
  const f = G.current.f, q = G.current.q;
  G.answered++; G.struggled.add(f);
  f.seen++; f.wrong++; f.last = Date.now();
  f.box = Math.max(0, f.box - 1); f.due = S.sessions;
  save();
  if (!G.sprint) {
    const insertAt = Math.min(G.queue.length, G.idx + 3 + Math.floor(Math.random() * 2));
    G.queue.splice(insertAt, 0, { f, kind: 'mult' });
    G.total = G.queue.length;
  }
  showFeedback('oops', '🍒', `${rnd(REVEAL)}<span class="eq">${equationText(q)}</span>`, '', q.revealHTML || q.hintHTML);
}

function showFeedback(cls, emoji, text, gemsText, modelHTML = '') {
  $('question-card').style.display = 'none';
  const fb = $('feedback');
  fb.className = 'feedback ' + cls; fb.hidden = false;
  $('fb-emoji').textContent = emoji;
  $('fb-text').innerHTML = text + (gemsText ? `<div style="margin-top:8px;color:#b3243a">${gemsText}</div>` : '');
  $('fb-model').innerHTML = modelHTML;
  $('play-gems').textContent = S.gems;
  if (!G.sprint) $('play-progress').style.width = ((G.idx + 1) / G.total * 100) + '%';
  if (G.sprint && cls === 'good') { setTimeout(() => { if (!fb.hidden) advance(); }, 600); }
}

function advance() { if (!G) return; G.idx++; nextQuestion(); }

function endGame() {
  if (G.sprintTimer) clearInterval(G.sprintTimer);
  const earned = S.gems - G.gemsStart;
  S.sessions++;
  let newBest = false;
  if (G.sprint && G.correct > S.dashBest) { S.dashBest = G.correct; newBest = true; }
  S.history.push({ date: new Date().toISOString().slice(0, 10), realm: G.realm, sprint: G.sprint, correct: G.correct, answered: G.answered, gems: earned });
  ensureMascots(); save();
  const completed = TABLES.filter(t => tableComplete(t) && G.bloomed.some(f => f.t === t));
  $('sum-emoji').textContent = completed.length ? '🏆🎀' : G.bloomed.length ? '⭐🍒' : rnd(['🍒', '🎀', '🐰', '🐻']);
  $('sum-title').textContent = G.sprint ? (newBest ? `New personal best: ${G.correct}!` : `Cherry Dash: ${G.correct} correct`) : rnd(['Session complete!', 'Good work.', 'Done – nicely played.', 'That’s another session banked.']);
  $('sum-gems').textContent = earned;
  $('sum-facts').textContent = `${G.correct} out of ${G.answered} correct.`;
  const items = [];
  for (const t of completed) items.push(`<span>🏆 All of the ${t}s are fluent! Golden bow unlocked.</span>`);
  for (const f of G.bloomed) items.push(`<span>⭐ ${f.n} × ${f.t} fluent</span>`);
  for (const f of G.promoted) items.push(`<span>${STAGES[f.box]} ${f.n} × ${f.t} up a level</span>`);
  $('sum-bloom').innerHTML = items.join('');
  const s = [...G.struggled];
  $('sum-practise').textContent = s.length ? `Watch list: ${s.map(f => `${f.n} × ${f.t} = ${f.n * f.t}`).join(', ')}. These come back next session.` : (G.answered ? 'Clean sheet – nothing on the watch list.' : '');
  if (G.bloomed.length || newBest) confetti(120, true);
  showScreen('screen-summary');
}

/* ---------------- Home ---------------- */
function renderHome() {
  ensureMascots();
  $('home-name').textContent = S.name;
  $('home-gems').textContent = S.gems;
  const fav = S.plushOwned.length ? plushById(S.plushOwned[S.plushOwned.length - 1]) : plushById('cherries');
  $('home-mascot').innerHTML = plushArt(fav) + bowSVG(BOWS.find(b => b.id === (S.bows[fav.id] || 'none')));
  const cards = [];
  for (const t of TABLE_ORDER) {
    const R = REALMS[t], facts = realmFacts(t), P = plushById(R.plush);
    const secure = facts.filter(f => f.box >= 3).length, fluent = facts.filter(f => f.box === 4).length;
    const garden = facts.map(f => `<span class="s${f.box}" title="${f.n} × ${t}">${STAGES[f.box]}</span>`).join('');
    cards.push(`<button class="realm" data-realm="${t}"><div class="realm-emoji" style="background:${R.colour}">${plushArt(P)}</div>
      <div class="realm-info"><div class="realm-name">${R.name} <span class="small">· ${P.name}</span></div>
      <div class="realm-sub">${fluent === 12 ? '<span class="tick">✔</span> All 12 fluent' : secure ? `${secure} of 12 secure · ${R.trick}` : R.trick}</div>
      <div class="garden">${garden}</div></div><div class="realm-arrow">➜</div></button>`);
  }
  const mixOk = realmUnlocked('mix');
  cards.push(`<button class="realm ${mixOk ? '' : 'locked'}" data-realm="mix"><div class="realm-emoji" style="background:${MIXED.colour}">${mixOk ? MIXED.emoji : '🔒'}</div>
    <div class="realm-info"><div class="realm-name">${MIXED.name}</div>
    <div class="realm-sub">${mixOk ? MIXED.blurb : 'Unlocks once two tables are underway'}</div></div><div class="realm-arrow">${mixOk ? '➜' : ''}</div></button>`);
  $('realm-list').innerHTML = cards.join('');
  $('btn-sprint').innerHTML = `⚡ Cherry Dash${S.dashBest ? ` <span class="pb">· best ${S.dashBest}</span>` : ''}`;
  const fluentAll = Object.values(S.facts).filter(f => f.box === 4).length;
  $('home-bubble').textContent = rnd(['Which table shall we work on?', 'Suggested order: 3s, 4s, 6s, 12s, then 7s.', fluentAll ? `${fluentAll} of 60 facts fluent so far.` : 'Every fact you make fluent earns bonus cherries.', 'Tip: the 7s trick is five lots plus two lots.']);
}

/* ---------------- Shelf / shop ---------------- */
let wardTab = 'plush', selectedPlush = null;
function renderWardrobe() {
  ensureMascots();
  $('ward-gems').textContent = S.gems;
  $('shelf').innerHTML = renderShelf(S.plushOwned, S.bows, selectedPlush);
  const tabs = [{ id: 'plush', name: 'Adopt a plushie 🧸' }, { id: 'bows', name: selectedPlush ? `Bows for ${plushById(selectedPlush).name} 🎀` : 'Bows 🎀' }];
  $('ward-tabs').innerHTML = tabs.map(s => `<button data-tab="${s.id}" class="${s.id === wardTab ? 'active' : ''}">${s.name}</button>`).join('');
  $('shelf-hint').textContent = wardTab === 'bows' && !selectedPlush ? 'Tap a plushie on the shelf first, then pick its bow.' : 'Tap a plushie on the shelf to give it a bow.';
  if (wardTab === 'plush') {
    $('ward-items').innerHTML = PLUSH.filter(p => !S.plushOwned.includes(p.id)).map(p => {
      const mascot = p.table ? `Free when you start the ${p.table}s` : `🍒 ${p.cost}`;
      const cls = p.table ? 'locked cant' : (S.gems >= p.cost ? 'locked' : 'locked cant');
      return `<div class="ward-item ${cls}" data-plush-buy="${p.id}">${plushArt(p)}<div>${p.name}</div><span class="cost">${mascot}</span></div>`;
    }).join('') || '<p class="small centre">You’ve adopted every plushie! 🏆</p>';
  } else {
    $('ward-items').innerHTML = BOWS.map(b => {
      const owned = S.bowsOwned.includes(b.id), eq = selectedPlush && (S.bows[selectedPlush] || 'none') === b.id;
      const sw = b.colour ? bowSVG(b, 40) : '<span class="bow-swatch" style="background:#eee"></span>';
      const cls = eq ? 'equipped' : owned ? '' : (b.locked ? 'locked cant' : S.gems >= b.cost ? 'locked' : 'locked cant');
      const cost = owned ? (eq ? '<span class="cost">Wearing ✓</span>' : '<span class="cost">Owned</span>') : b.locked ? `<span class="cost small">${b.locked}</span>` : `<span class="cost">🍒 ${b.cost}</span>`;
      return `<div class="ward-item ${cls}" data-bow="${b.id}">${sw}<div>${b.name}</div>${cost}</div>`;
    }).join('');
  }
}
function buyPlush(id) {
  const p = plushById(id); if (!p || S.plushOwned.includes(id)) return;
  if (p.table) { SFX.oops(); return; }
  if (S.gems < p.cost) { SFX.oops(); return; }
  S.gems -= p.cost; S.plushOwned.push(id); S.bows[id] = 'red'; selectedPlush = id; save();
  SFX.gem(); confetti(50, true); renderWardrobe();
}
function pickBow(id) {
  const b = BOWS.find(x => x.id === id); if (!b) return;
  if (!selectedPlush) { SFX.oops(); $('shelf-hint').textContent = 'Tap a plushie on the shelf first!'; return; }
  if (!S.bowsOwned.includes(id)) {
    if (b.locked || S.gems < b.cost) { SFX.oops(); return; }
    S.gems -= b.cost; S.bowsOwned.push(id); SFX.gem(); confetti(30);
  } else SFX.click();
  S.bows[selectedPlush] = id; save(); renderWardrobe();
}

/* ---------------- Grown-ups ---------------- */
function renderGrownups() {
  const rows = TABLES.map(t => {
    const cells = MULTIPLIERS.map(n => { const f = S.facts[`${t}x${n}`]; return `<div class="cell b${f.box}" title="${n} × ${t}: box ${f.box}, ${f.right} right, ${f.wrong} wrong">${n}×${t}</div>`; }).join('');
    return `<div class="fg-row"><div class="lbl">${t}s</div>${cells}</div>`;
  }).join('');
  $('fact-grid').innerHTML = rows;
  const all = Object.values(S.facts);
  const right = all.reduce((a, f) => a + f.right, 0), wrong = all.reduce((a, f) => a + f.wrong, 0);
  const days = new Set(S.history.map(h => h.date)).size;
  const last = S.history.slice(-6).reverse().map(h => `${h.date}: ${h.sprint ? 'Cherry Dash' : h.realm === 'mix' ? 'Cherry Bowl' : REALMS[h.realm]?.name || h.realm} – ${h.correct}/${h.answered}`).join('<br>');
  $('stats').innerHTML = `<p><b>Sessions:</b> ${S.sessions} on ${days} day${days === 1 ? '' : 's'} · <b>Answers:</b> ${right} right, ${wrong} wrong · <b>Fluent facts:</b> ${all.filter(f => f.box === 4).length} / 60 · <b>Dash best:</b> ${S.dashBest} · <b>Cherries earned ever:</b> ${S.totalGems}</p>${last ? `<p><b>Recent:</b><br>${last}</p>` : ''}`;
  $('set-sound').checked = S.settings.sound;
  $('set-speak').checked = S.settings.speak;
  $('set-name').value = S.name;
}

/* ---------------- PIN gate ---------------- */
let pinInput = '';
function renderPin() { $('pin-dots').querySelectorAll('span').forEach((d, i) => d.classList.toggle('on', i < pinInput.length)); }
function openPin() { pinInput = ''; $('pin-msg').innerHTML = '&nbsp;'; renderPin(); showScreen('screen-pin'); }
function pinKey(k) {
  if (k === 'back') { pinInput = ''; renderHome(); showScreen('screen-home'); return; }
  if (k === 'del') { pinInput = pinInput.slice(0, -1); renderPin(); return; }
  if (pinInput.length >= 4) return;
  pinInput += k; renderPin();
  if (pinInput.length === 4) {
    if (pinInput === PARENT_PIN) { pinInput = ''; renderGrownups(); showScreen('screen-grownups'); }
    else {
      SFX.oops();
      const dots = $('pin-dots'); dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake');
      $('pin-msg').textContent = 'That’s not the code – ask a grown-up!';
      setTimeout(() => { pinInput = ''; renderPin(); }, 500);
    }
  }
}

/* ---------------- Events ---------------- */
$('btn-start').addEventListener('click', () => { S.name = ($('name-input').value.trim() || 'Cherry').slice(0, 14); save(); SFX.click(); renderHome(); showScreen('screen-home'); });
$('name-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-start').click(); });

$('realm-list').addEventListener('click', e => {
  const b = e.target.closest('.realm'); if (!b) return;
  const realm = b.dataset.realm === 'mix' ? 'mix' : parseInt(b.dataset.realm, 10);
  if (!realmUnlocked(realm)) { SFX.oops(); $('home-bubble').textContent = 'Get two tables underway to open the Cherry Bowl.'; return; }
  SFX.click(); startGame(realm);
});
$('btn-sprint').addEventListener('click', () => { SFX.click(); startGame('mix', true); });
$('btn-wardrobe').addEventListener('click', () => { SFX.click(); renderWardrobe(); showScreen('screen-wardrobe'); });
$('btn-sum-wardrobe').addEventListener('click', () => { SFX.click(); renderWardrobe(); showScreen('screen-wardrobe'); });
$('btn-wardrobe-home').addEventListener('click', () => { SFX.click(); renderHome(); showScreen('screen-home'); });
$('btn-grownups').addEventListener('click', openPin);
$('pin-pad').addEventListener('click', e => { const b = e.target.closest('button'); if (b) pinKey(b.dataset.k); });
$('btn-grownups-home').addEventListener('click', () => { renderHome(); showScreen('screen-home'); });
$('btn-sum-home').addEventListener('click', () => { SFX.click(); renderHome(); showScreen('screen-home'); });
$('btn-again').addEventListener('click', () => { SFX.click(); startGame(G.realm, G.sprint); });
$('btn-quit').addEventListener('click', () => { if (G && G.sprintTimer) clearInterval(G.sprintTimer); G = null; renderHome(); showScreen('screen-home'); });

$('keypad').addEventListener('click', e => { const b = e.target.closest('button'); if (b) keyInput(b.dataset.k); });
$('btn-hint').addEventListener('click', () => { SFX.click(); showHint(); });
$('btn-next').addEventListener('click', () => { SFX.click(); advance(); });
$('btn-speak').addEventListener('click', () => { if (G) speak(G.current.q.speakText, true); });

document.addEventListener('keydown', e => {
  if ($('screen-pin').classList.contains('active')) {
    if (/^[0-9]$/.test(e.key)) pinKey(e.key); else if (e.key === 'Backspace') pinKey('del'); else if (e.key === 'Escape') pinKey('back');
    return;
  }
  if (!$('screen-play').classList.contains('active') || !G) return;
  if (!$('feedback').hidden) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(); } return; }
  if (/^[0-9]$/.test(e.key)) keyInput(e.key);
  else if (e.key === 'Backspace') keyInput('del');
  else if (e.key === 'Enter') keyInput('go');
});

$('ward-tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { wardTab = b.dataset.tab; SFX.click(); renderWardrobe(); } });
$('shelf').addEventListener('click', e => { const b = e.target.closest('.shelf-plush'); if (b) { selectedPlush = b.dataset.plush; wardTab = 'bows'; SFX.click(); renderWardrobe(); } });
$('ward-items').addEventListener('click', e => {
  const p = e.target.closest('[data-plush-buy]'); if (p) return buyPlush(p.dataset.plushBuy);
  const b = e.target.closest('[data-bow]'); if (b) return pickBow(b.dataset.bow);
});

$('set-sound').addEventListener('change', e => { S.settings.sound = e.target.checked; save(); });
$('set-speak').addEventListener('change', e => { S.settings.speak = e.target.checked; save(); });
$('set-name').addEventListener('change', e => { S.name = (e.target.value.trim() || 'Cherry').slice(0, 14); save(); });
$('btn-export').addEventListener('click', () => { navigator.clipboard?.writeText(JSON.stringify(S)).then(() => alert('Progress copied to clipboard.')); });
$('btn-reset').addEventListener('click', () => { if (confirm('Reset ALL progress, cherries and plushies? This cannot be undone.')) { localStorage.removeItem(KEY); S = freshState(); showScreen('screen-welcome'); } });

if ('speechSynthesis' in window) window.speechSynthesis.getVoices();

/* ---------------- Boot ---------------- */
if (S.name) { renderHome(); showScreen('screen-home'); } else showScreen('screen-welcome');
