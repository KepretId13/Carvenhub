/* ═══════════════════════════════
   INTRO SEQUENCE
═══════════════════════════════ */
const sequences = [
  {
    label: 'Project_U8',
    title: 'The Archive',
    hold: 1400,
  },
  {
    label: 'Quest Planner Ecosystem',
    title: 'Welcome',
    hold: 1600,
    last: true,
  }
];

let currentText = '';
let labelEl, textEl, scanline;

const TYPING_SPEED = 60;
const ERASE_SPEED  = 35;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function typeText(str) {
  for (let i = 0; i < str.length; i++) {
    currentText = str.slice(0, i + 1);
    textEl.textContent = currentText;
    await sleep(TYPING_SPEED + Math.random() * 20);
  }
}

async function eraseText() {
  while (currentText.length > 0) {
    currentText = currentText.slice(0, -1);
    textEl.textContent = currentText;
    await sleep(ERASE_SPEED + Math.random() * 10);
  }
}

async function eraseLabel() {
  let lbl = labelEl.textContent;
  while (lbl.length > 0) {
    lbl = lbl.slice(0, -1);
    labelEl.textContent = lbl;
    await sleep(25);
  }
}

async function runIntro() {
  labelEl  = document.getElementById('introLabel');
  textEl   = document.getElementById('introText');
  scanline = document.getElementById('introScanline');

  await sleep(400);

  for (let i = 0; i < sequences.length; i++) {
    const seq = sequences[i];

    labelEl.classList.add('active');
    for (let c = 0; c < seq.label.length; c++) {
      labelEl.textContent = seq.label.slice(0, c + 1);
      await sleep(40);
    }

    await sleep(200);
    await typeText(seq.title);

    scanline.classList.add('grow');
    await sleep(seq.hold);

    if (seq.last) {
      scanline.classList.remove('grow');
      await sleep(200);
      triggerTransition();
      return;
    }

    scanline.classList.remove('grow');
    await sleep(200);
    await Promise.all([eraseText(), eraseLabel()]);
    await sleep(300);
  }
}

function triggerTransition() {
  const intro = document.getElementById('intro');
  intro.classList.add('shrink-out');

  setTimeout(() => {
    intro.style.display = 'none';
    document.getElementById('main-bg').classList.add('visible');
    document.getElementById('main-content').classList.add('visible');
    document.getElementById('corner-logo').classList.add('visible');
    initScrollReveal();
  }, 1100);
}

/* ═══════════════════════════════
   RANKINGS DATA
═══════════════════════════════ */
const designThemes = [
  { name: 'Blue Mist',        sub: 'Ambient / Soft',       score: '9.8', dq: 'S+', vibe: 'Calm',      symbol: '◈', date: '2024-01' },
  { name: 'Blue Quiet',       sub: 'Minimal / Clean',      score: '9.6', dq: 'S',  vibe: 'Focus',     symbol: '◇', date: '2024-01' },
  { name: 'Candy Sweet',      sub: 'Pop / Playful',        score: '9.4', dq: 'A+', vibe: 'Joyful',    symbol: '✦', date: '2024-02' },
  { name: 'Cappuccino Cream', sub: 'Warm / Cozy',          score: '9.2', dq: 'A+', vibe: 'Comfort',   symbol: '◉', date: '2024-02' },
  { name: 'Cozy Pastel',      sub: 'Soft / Dreamy',        score: '9.0', dq: 'A',  vibe: 'Gentle',    symbol: '◌', date: '2024-03' },
  { name: 'Desert Ember',     sub: 'Warm / Bold',          score: '8.9', dq: 'A',  vibe: 'Intense',   symbol: '▲', date: '2024-03' },
  { name: 'Da Green Ever',    sub: 'Nature / Fresh',       score: '8.7', dq: 'B+', vibe: 'Alive',     symbol: '◆', date: '2024-04' },
  { name: 'Fearless Dare',    sub: 'Bold / Edgy',          score: '8.5', dq: 'B+', vibe: 'Brave',     symbol: '▶', date: '2024-04' },
  { name: 'Green Valor',      sub: 'Deep / Strong',        score: '8.3', dq: 'B',  vibe: 'Power',     symbol: '◼', date: '2024-05' },
  { name: 'Greenery Fields',  sub: 'Open / Natural',       score: '8.1', dq: 'B',  vibe: 'Free',      symbol: '○', date: '2024-05' },
  { name: 'Lime White',       sub: 'Sharp / Contrast',     score: '8.0', dq: 'B',  vibe: 'Alert',     symbol: '◑', date: '2024-06' },
  { name: 'Midnight Ruins',   sub: 'Dark / Mysterious',    score: '7.9', dq: 'B-', vibe: 'Shadow',    symbol: '▓', date: '2024-06' },
  { name: 'Mint Frost',       sub: 'Cool / Crisp',         score: '7.7', dq: 'C+', vibe: 'Fresh',     symbol: '❄', date: '2024-07' },
  { name: 'Mint Horizon',     sub: 'Wide / Open',          score: '7.5', dq: 'C+', vibe: 'Horizon',   symbol: '—', date: '2024-07' },
  { name: 'Ocean Drift',      sub: 'Fluid / Deep',         score: '7.4', dq: 'C',  vibe: 'Flow',      symbol: '≋', date: '2024-08' },
  { name: 'Orange Dark Red',  sub: 'Fire / Passion',       score: '7.2', dq: 'C',  vibe: 'Heat',      symbol: '●', date: '2024-08' },
  { name: 'Pink Yellow',      sub: 'Bright / Fun',         score: '7.1', dq: 'C',  vibe: 'Playful',   symbol: '★', date: '2024-09' },
  { name: 'River Shine',      sub: 'Reflective / Clear',   score: '7.0', dq: 'C-', vibe: 'Mirror',    symbol: '◎', date: '2024-09' },
  { name: 'Sakura Breeze',    sub: 'Floral / Soft',        score: '6.9', dq: 'C-', vibe: 'Bloom',     symbol: '✿', date: '2024-10' },
  { name: 'Sand Natural',     sub: 'Earthy / Raw',         score: '6.7', dq: 'D+', vibe: 'Ground',    symbol: '□', date: '2024-10' },
  { name: 'Soft Lilac',       sub: 'Gentle / Mystic',      score: '6.5', dq: 'D',  vibe: 'Dream',     symbol: '◐', date: '2024-11' },
];

const ostThemes = [
  { name: 'Ambient Lo-fi Piano',   sub: 'Focus / Study Mode',    score: '9.9', dq: 'S+', vibe: 'Deep Focus',  symbol: '♩', date: '2024-01' },
  { name: 'Epic Orchestral Swell', sub: 'Boss Fight / Peak',     score: '9.7', dq: 'S',  vibe: 'Peak',        symbol: '♬', date: '2024-01' },
  { name: 'Synthwave Drive',       sub: 'Daily Sprint',          score: '9.5', dq: 'A+', vibe: 'Drive',       symbol: '♫', date: '2024-02' },
  { name: 'Melancholic Strings',   sub: 'Recovery / Reflection', score: '9.3', dq: 'A+', vibe: 'Reflect',     symbol: '♪', date: '2024-02' },
  { name: 'Jazz Café Afternoon',   sub: 'Review Session',        score: '9.1', dq: 'A',  vibe: 'Ease',        symbol: '𝄞', date: '2024-03' },
  { name: 'Field Recording',       sub: 'Weekly Reset',          score: '8.8', dq: 'A',  vibe: 'Reset',       symbol: '◎', date: '2024-03' },
  { name: 'Drum & Bass Pulse',     sub: 'Deadline Mode',         score: '8.6', dq: 'B+', vibe: 'Pulse',       symbol: '▶', date: '2024-04' },
  { name: 'Choral Hymn',           sub: 'Monthly Ceremony',      score: '8.4', dq: 'B+', vibe: 'Sacred',      symbol: '✦', date: '2024-04' },
  { name: 'Minimalist Clicks',     sub: 'Deep Work',             score: '8.2', dq: 'B',  vibe: 'Precision',   symbol: '·', date: '2024-05' },
  { name: 'Cinematic Tension',     sub: 'Hard Decision',         score: '8.0', dq: 'B',  vibe: 'Pressure',    symbol: '▓', date: '2024-05' },
];

function buildRankList(data, container, isOst) {
  container.innerHTML = data.map((item, i) => {
    const pos = i + 1;
    const topClass = pos <= 3 ? 'top3' + (isOst ? ' ost' : '') : '';
    const ostItemClass = isOst ? 'ost-item' : '';
    return `
    <div class="rank-item ${ostItemClass}">
      <div class="rank-pos ${topClass}">${String(pos).padStart(2,'0')}</div>
      <div class="rank-info">
        <div class="rank-name">${item.name}</div>
        <div class="rank-sub">${item.sub}</div>
      </div>
      <div class="rank-score">${item.score}</div>
      <div class="rank-bar"></div>
    </div>`;
  }).join('');
}

/* ═══════════════════════════════
   MODAL - SHOW ALL
═══════════════════════════════ */
function nameToFile(name) {
  return name.replace(/ /g, '_') + '.webp';
}

function buildModalList(data, containerId, isOst) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = data.map((item, i) => {
    const pos = i + 1;
    const posClass = pos <= 3 ? (isOst ? 't3o' : 't3d') : '';
    const file = nameToFile(item.name);
    return `
    <div class="modal-item"
      data-name="${item.name}"
      data-sub="${item.sub}"
      data-score="${item.score}"
      data-dq="${item.dq}"
      data-vibe="${item.vibe}"
      data-symbol="${item.symbol}"
      data-date="${item.date}"
      data-file="${file}"
      data-type="${isOst ? 'ost' : 'design'}"
      onmouseenter="showPreview(this)"
      onmouseleave="hidePreview()">
      <div class="modal-pos ${posClass}">${String(pos).padStart(2,'0')}</div>
      <div class="modal-name">${item.name}</div>
      <div class="modal-score">${item.score}</div>
    </div>`;
  }).join('');
}

/* ═══════════════════════════════
   PREVIEW CARD
═══════════════════════════════ */
let previewTimeout = null;
let currentPreviewName = null;

function getCardTop(el) {
  const card      = document.getElementById('previewCard');
  const cardH     = card.offsetHeight || 320; // estimasi tinggi card
  const rect      = el.getBoundingClientRect();
  const itemMidY  = rect.top + rect.height / 2;
  const margin    = 12;
  const vpH       = window.innerHeight;

  // Coba align tengah card ke tengah item
  let top = itemMidY - cardH / 2;

  // Clamp: jangan keluar viewport
  top = Math.max(margin, Math.min(top, vpH - cardH - margin));
  return top;
}

function showPreview(el) {
  const name   = el.dataset.name;
  const sub    = el.dataset.sub;
  const dq     = el.dataset.dq;
  const vibe   = el.dataset.vibe;
  const symbol = el.dataset.symbol;
  const date   = el.dataset.date;
  const file   = el.dataset.file;
  const type   = el.dataset.type;

  const card = document.getElementById('previewCard');
  if (!card) return;

  clearTimeout(previewTimeout);

  const doShow = () => {
    currentPreviewName = name;

    // Set posisi Y dinamis
    const topY = getCardTop(el);
    card.style.top = topY + 'px';

    document.getElementById('pvImg').src = `assets/${file}`;
    document.getElementById('pvImg').onerror = function() {
      this.style.display = 'none';
      document.getElementById('pvImgPlaceholder').style.display = 'flex';
    };
    document.getElementById('pvImg').onload = function() {
      this.style.display = 'block';
      document.getElementById('pvImgPlaceholder').style.display = 'none';
    };
    document.getElementById('pvImg').style.display = 'block';
    document.getElementById('pvImgPlaceholder').style.display = 'none';

    document.getElementById('pvName').textContent = name;
    document.getElementById('pvSub').textContent = sub;
    document.getElementById('pvDq').textContent = dq;
    document.getElementById('pvVibe').textContent = vibe;
    document.getElementById('pvSymbol').textContent = symbol;
    document.getElementById('pvSymbolPlaceholder').textContent = symbol;
    document.getElementById('pvDate').textContent = date;

    const accentClass = type === 'ost' ? 'ost' : 'design';
    card.dataset.type = accentClass;
    card.classList.add('visible');
  };

  if (card.classList.contains('visible')) {
    // crossfade: fade out → swap → fade in
    card.classList.add('switching');
    card.classList.remove('visible');
    previewTimeout = setTimeout(() => {
      doShow();
      card.classList.remove('switching');
    }, 180);
  } else {
    doShow();
  }
}

function hidePreview() {
  clearTimeout(previewTimeout);
  previewTimeout = setTimeout(() => {
    const card = document.getElementById('previewCard');
    if (card) {
      card.classList.remove('visible');
      currentPreviewName = null;
    }
  }, 120);
}

function toggleModal() {
  const panel   = document.getElementById('modalPanel');
  const overlay = document.getElementById('modalOverlay');
  const btn     = document.getElementById('showAllBtn');
  const isOpen  = panel.classList.contains('open');
  if (isOpen) {
    closeModal();
  } else {
    panel.classList.add('open');
    overlay.classList.add('open');
    btn.classList.add('open');
  }
}

function closeModal() {
  document.getElementById('modalPanel').classList.remove('open');
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('showAllBtn').classList.remove('open');
}

/* ═══════════════════════════════
   ACTIVE NAV — SCROLL TRACKER
═══════════════════════════════ */
function initNavTracker() {
  const sections = ['hero', 'rankings', 'story'];
  const links = document.querySelectorAll('.nav-link-item');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach(a => {
          if (a.dataset.section === id) {
            a.classList.add('nav-active');
          } else {
            a.classList.remove('nav-active');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });
}

/* ═══════════════════════════════
   SCROLL REVEAL
═══════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ═══════════════════════════════
   BOOT
═══════════════════════════════ */
const designList = document.querySelector('.rank-list:not(.ost-list)');
const ostList    = document.querySelector('.rank-list.ost-list');
buildRankList(designThemes, designList, false);
buildRankList(ostThemes, ostList, true);

buildModalList(designThemes, 'modalDesignList', false);
buildModalList(ostThemes, 'modalOstList', true);

runIntro();

// Nav tracker init setelah intro done
const navTrackerInterval = setInterval(() => {
  if (document.getElementById('main-content').classList.contains('visible')) {
    initNavTracker();
    clearInterval(navTrackerInterval);
  }
}, 200);
