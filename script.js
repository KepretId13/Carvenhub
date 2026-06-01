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
  { name: 'Brutalist Monochrome', sub: 'Print / Editorial', score: '9.8' },
  { name: 'Glassmorphism Dark', sub: 'UI / Interface', score: '9.6' },
  { name: 'Organic Texture', sub: 'Brand Identity', score: '9.4' },
  { name: 'Neon Retro Cyber', sub: 'Poster / Event', score: '9.2' },
  { name: 'Minimal Serif', sub: 'Catalog / Print', score: '9.0' },
  { name: 'Earth Tone Muted', sub: 'Lifestyle Brand', score: '8.9' },
  { name: 'Data Visualization', sub: 'Dashboard / Report', score: '8.7' },
  { name: 'Kinetic Typography', sub: 'Motion / Social', score: '8.5' },
  { name: 'Flat Geometric', sub: 'App / Product', score: '8.3' },
  { name: 'Vintage Halftone', sub: 'Merch / Zine', score: '8.1' },
];

const ostThemes = [
  { name: 'Ambient Lo-fi Piano', sub: 'Focus / Study Mode', score: '9.9' },
  { name: 'Epic Orchestral Swell', sub: 'Boss Fight / Peak', score: '9.7' },
  { name: 'Synthwave Drive', sub: 'Daily Sprint', score: '9.5' },
  { name: 'Melancholic Strings', sub: 'Recovery / Reflection', score: '9.3' },
  { name: 'Jazz Café Afternoon', sub: 'Review Session', score: '9.1' },
  { name: 'Field Recording', sub: 'Weekly Reset', score: '8.8' },
  { name: 'Drum & Bass Pulse', sub: 'Deadline Mode', score: '8.6' },
  { name: 'Choral Hymn', sub: 'Monthly Ceremony', score: '8.4' },
  { name: 'Minimalist Clicks', sub: 'Deep Work', score: '8.2' },
  { name: 'Cinematic Tension', sub: 'Hard Decision', score: '8.0' },
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
function buildModalList(data, containerId, isOst) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = data.map((item, i) => {
    const pos = i + 1;
    const posClass = pos <= 3 ? (isOst ? 't3o' : 't3d') : '';
    return `
    <div class="modal-item">
      <div class="modal-pos ${posClass}">${String(pos).padStart(2,'0')}</div>
      <div class="modal-name">${item.name}</div>
      <div class="modal-score">${item.score}</div>
    </div>`;
  }).join('');
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
