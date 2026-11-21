// game.js — state, marking, timer, hints and screens for Spot the Difference.

import { LEVELS, PANEL_W, PANEL_H } from './scenes.js';

const GAP = 40;
const PAD = 10;
const PANELS = [
  { x: PAD, y: PAD },
  { x: PAD + PANEL_W + GAP, y: PAD },
];

export function createGame(canvas) {
  const ctx = canvas.getContext('2d');
  const state = {
    screen: 'start', // start | play | levelDone | done
    level: 0,
    found: new Set(),
    pops: [], // {x, y, r, t} expanding ring animations, panel-local
    flashes: [], // {x, y, t} wrong-click flashes, panel-local
    hint: null, // {index, until} pulsing highlight
    hintsLeft: 3,
    mistakes: 0,
    foundCount: 0,
    totalMistakes: 0,
    startAt: 0,
    elapsed: 0,
    levelTimes: [],
    shakeUntil: 0,
    overlayBtn: null, // {x, y, w, h, action} drawn on the canvas overlay
    toast: '',
    toastUntil: 0,
  };

  const hud = {
    levelName: document.getElementById('level-name'),
    leftCount: document.getElementById('left-count'),
    timer: document.getElementById('timer'),
    hintBtn: document.getElementById('hint-btn'),
    hintCount: document.getElementById('hint-count'),
    restartBtn: document.getElementById('restart-btn'),
  };

  function level() {
    return LEVELS[state.level];
  }

  function fmt(ms) {
    const s = Math.floor(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function updateHud() {
    const lv = level();
    hud.levelName.textContent = (state.level + 1) + ' · ' + lv.name;
    const left = lv.diffs.length - state.found.size;
    hud.leftCount.textContent = left + (left === 1 ? ' difference left' : ' differences left');
    hud.hintCount.textContent = state.hintsLeft;
    hud.hintBtn.disabled = state.screen !== 'play' || state.hintsLeft <= 0;
    hud.restartBtn.disabled = state.screen !== 'play';
    document.querySelectorAll('.lvl').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.level) === state.level);
    });
  }

  function setLevel(i) {
    state.level = i;
    state.found = new Set();
    state.pops = [];
    state.flashes = [];
    state.hint = null;
    state.hintsLeft = 3;
    state.mistakes = 0;
    state.screen = 'play';
    state.startAt = performance.now();
    state.elapsed = 0;
    state.overlayBtn = null;
    updateHud();
  }

  function useHint() {
    if (state.screen !== 'play' || state.hintsLeft <= 0) return;
    const lv = level();
    const remaining = lv.diffs.map((d, i) => i).filter((i) => !state.found.has(i));
    if (!remaining.length) return;
    state.hintsLeft--;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    state.hint = { index: pick, until: performance.now() + 2500 };
    state.toast = 'Hint: look near the ' + lv.diffs[pick].label;
    state.toastUntil = performance.now() + 2500;
    updateHud();
  }

  function markFound(i, panelLocal) {
    const lv = level();
    state.found.add(i);
    state.foundCount++;
    for (const p of PANELS) state.pops.push({ x: panelLocal.x, y: panelLocal.y, t: performance.now() });
    state.toast = 'Found it — ' + lv.diffs[i].label + '!';
    state.toastUntil = performance.now() + 1800;
    updateHud();
    if (state.found.size === lv.diffs.length) {
      state.levelTimes.push(state.elapsed);
      state.totalMistakes += state.mistakes;
      const last = state.level === LEVELS.length - 1;
      state.screen = last ? 'done' : 'levelDone';
      state.overlayBtn = {
        x: canvas.width / 2 - 130, y: canvas.height / 2 + 52, w: 260, h: 52,
        action: last ? 'again' : 'next',
      };
    }
  }

  function clickAt(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * canvas.width;
    const y = ((clientY - r.top) / r.height) * canvas.height;
    if (state.screen === 'start') {
      setLevel(0);
      return;
    }
    if (state.screen === 'levelDone' || state.screen === 'done') {
      const b = state.overlayBtn;
      if (b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        if (b.action === 'next') setLevel(state.level + 1);
        else setLevel(0);
      }
      return;
    }
    // Which panel was clicked?
    let panel = -1;
    let lx = 0;
    let ly = 0;
    for (let i = 0; i < 2; i++) {
      const p = PANELS[i];
      if (x >= p.x && x <= p.x + PANEL_W && y >= p.y && y <= p.y + PANEL_H) {
        panel = i;
        lx = x - p.x;
        ly = y - p.y;
        break;
      }
    }
    if (panel < 0) return;
    const lv = level();
    for (let i = 0; i < lv.diffs.length; i++) {
      if (state.found.has(i)) continue;
      const d = lv.diffs[i];
      const dx = lx - d.x;
      const dy = ly - d.y;
      if (dx * dx + dy * dy <= (d.r + 10) * (d.r + 10)) {
        markFound(i, { x: d.x, y: d.y });
        return;
      }
    }
    // Wrong click: a gentle shake and a red flash where they tapped.
    state.mistakes++;
    state.shakeUntil = performance.now() + 180;
    state.flashes.push({ x: lx, y: ly, panel, t: performance.now() });
  }

  function drawMarkers(now) {
    const lv = level();
    for (const i of state.found) {
      const d = lv.diffs[i];
      for (const p of PANELS) {
        ctx.strokeStyle = '#2fbf82';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(p.x + d.x, p.y + d.y, d.r + 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x + d.x, p.y + d.y, d.r + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Expanding pop rings.
    state.pops = state.pops.filter((pop) => now - pop.t < 350);
    for (const pop of state.pops) {
      const k = (now - pop.t) / 350;
      for (const p of PANELS) {
        ctx.strokeStyle = 'rgba(47,191,130,' + (1 - k) + ')';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(p.x + pop.x, p.y + pop.y, 14 + k * 30, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // Wrong-click flashes.
    state.flashes = state.flashes.filter((f) => now - f.t < 400);
    for (const f of state.flashes) {
      const k = 1 - (now - f.t) / 400;
      const p = PANELS[f.panel];
      ctx.strokeStyle = 'rgba(229,57,53,' + k + ')';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(p.x + f.x, p.y + f.y, 12 + (1 - k) * 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(229,57,53,' + k * 0.8 + ')';
      ctx.font = 'bold 22px Trebuchet MS, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✕', p.x + f.x, p.y + f.y + 8);
    }
    // Hint pulse.
    if (state.hint && now < state.hint.until) {
      const d = lv.diffs[state.hint.index];
      const pulse = 1 + 0.15 * Math.sin(now / 120);
      for (const p of PANELS) {
        ctx.strokeStyle = '#ffcf3d';
        ctx.lineWidth = 5;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.arc(p.x + d.x, p.y + d.y, (d.r + 10) * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else if (state.hint) {
      state.hint = null;
    }
  }

  function drawOverlay(title, lines, btnLabel) {
    ctx.fillStyle = 'rgba(10,16,32,.78)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '800 44px Trebuchet MS, sans-serif';
    ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 78);
    ctx.font = '20px Trebuchet MS, sans-serif';
    ctx.fillStyle = '#c8d6f2';
    lines.forEach((ln, i) => ctx.fillText(ln, canvas.width / 2, canvas.height / 2 - 30 + i * 30));
    const b = state.overlayBtn;
    if (b && btnLabel) {
      ctx.fillStyle = '#0f7a4d';
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 22px Trebuchet MS, sans-serif';
      ctx.fillText(btnLabel, canvas.width / 2, b.y + 34);
    }
  }

  function drawStart() {
    ctx.fillStyle = '#10182b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = '800 52px Trebuchet MS, sans-serif';
    ctx.fillText('🔍 Spot the Difference', canvas.width / 2, 120);
    ctx.font = '24px Trebuchet MS, sans-serif';
    ctx.fillStyle = '#9fb4dd';
    ctx.fillText('Three hand-drawn worlds. Two pictures in each. Find every difference.', canvas.width / 2, 168);
    const cards = [
      ['1 · Garden Morning', '7 differences', '#43a047'],
      ['2 · Riverside Market', '8 differences', '#1e88e5'],
      ['3 · Space Station', '10 differences', '#7e57c2'],
    ];
    cards.forEach((card, i) => {
      const x = 130 + i * 320;
      ctx.fillStyle = '#182642';
      ctx.beginPath();
      ctx.roundRect(x, 210, 280, 120, 14);
      ctx.fill();
      ctx.strokeStyle = card[2];
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 22px Trebuchet MS, sans-serif';
      ctx.fillText(card[0], x + 140, 258);
      ctx.fillStyle = '#c8d6f2';
      ctx.font = '18px Trebuchet MS, sans-serif';
      ctx.fillText(card[1], x + 140, 292);
    });
    ctx.fillStyle = '#ffcf3d';
    ctx.font = '800 26px Trebuchet MS, sans-serif';
    ctx.fillText('Click anywhere to start  ·  H hint  ·  R restart  ·  1 / 2 / 3 switch level', canvas.width / 2, 396);
  }

  function frame(now) {
    if (state.screen === 'play') state.elapsed = now - state.startAt;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const shake = now < state.shakeUntil ? 3 : 0;
    const sx = shake ? (Math.random() - 0.5) * shake * 2 : 0;
    const sy = shake ? (Math.random() - 0.5) * shake * 2 : 0;
    ctx.save();
    ctx.translate(sx, sy);
    if (state.screen === 'start') {
      drawStart();
    } else {
      const lv = level();
      for (let i = 0; i < 2; i++) {
        ctx.save();
        ctx.translate(PANELS[i].x, PANELS[i].y);
        lv.draw(ctx, i === 1);
        ctx.restore();
        ctx.strokeStyle = '#2b3f66';
        ctx.lineWidth = 3;
        ctx.strokeRect(PANELS[i].x, PANELS[i].y, PANEL_W, PANEL_H);
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 20px Trebuchet MS, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('ORIGINAL', PANELS[0].x + 12, PANELS[0].y + 26);
      ctx.fillText('SPOT THE CHANGES', PANELS[1].x + 12, PANELS[1].y + 26);
      drawMarkers(now);
      if (state.screen === 'levelDone') {
        drawOverlay('Level Complete! 🎉', [
          lv.name + ' — all ' + lv.diffs.length + ' differences found in ' + fmt(state.elapsed),
          'Mistakes this level: ' + state.mistakes,
        ], 'Next level →');
      } else if (state.screen === 'done') {
        const total = state.levelTimes.reduce((a, b) => a + b, 0);
        const acc = Math.round((25 / (25 + state.totalMistakes)) * 100);
        drawOverlay('You found them all! 🏆', [
          '25 differences across 3 worlds in ' + fmt(total),
          'Accuracy: ' + acc + '%  ·  Mistakes: ' + state.totalMistakes,
        ], 'Play again ↻');
      }
      if (state.toast && now < state.toastUntil && state.screen === 'play') {
        ctx.fillStyle = 'rgba(10,16,32,.85)';
        const w = ctx.measureText(state.toast).width + 36;
        ctx.beginPath();
        ctx.roundRect(canvas.width / 2 - w / 2, canvas.height - 44, w, 32, 16);
        ctx.fill();
        ctx.fillStyle = '#ffcf3d';
        ctx.font = '17px Trebuchet MS, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(state.toast, canvas.width / 2, canvas.height - 22);
      }
    }
    ctx.restore();
    hud.timer.textContent = fmt(state.elapsed);
    requestAnimationFrame(frame);
  }

  function applyDemo() {
    const q = new URLSearchParams(location.search);
    const demo = Number(q.get('demo') || 0);
    const lvl = Math.min(2, Math.max(0, Number(q.get('level') || 1) - 1));
    if (!demo) return;
    setLevel(lvl);
    const lv = level();
    for (let i = 0; i < Math.min(demo, lv.diffs.length); i++) state.found.add(i);
    state.foundCount += state.found.size;
    if (state.found.size === lv.diffs.length) {
      state.levelTimes.push(state.elapsed);
      const last = state.level === LEVELS.length - 1;
      state.screen = last ? 'done' : 'levelDone';
      state.overlayBtn = {
        x: canvas.width / 2 - 130, y: canvas.height / 2 + 52, w: 260, h: 52,
        action: last ? 'again' : 'next',
      };
    }
    updateHud();
  }

  canvas.addEventListener('click', (e) => clickAt(e.clientX, e.clientY));
  hud.hintBtn.addEventListener('click', useHint);
  hud.restartBtn.addEventListener('click', () => setLevel(state.level));
  document.querySelectorAll('.lvl').forEach((b) => {
    b.addEventListener('click', () => setLevel(Number(b.dataset.level)));
  });
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'h') useHint();
    else if (k === 'r') setLevel(state.level);
    else if (k === '1' || k === '2' || k === '3') setLevel(Number(k) - 1);
    else if (k === 'enter' && state.screen === 'start') setLevel(0);
  });

  updateHud();
  applyDemo();
  requestAnimationFrame(frame);
  return { setLevel, useHint };
}
