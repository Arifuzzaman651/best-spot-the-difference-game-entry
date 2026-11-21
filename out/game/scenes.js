// scenes.js — every scene is drawn twice from one recipe: once as the original
// (left panel) and once with its differences applied (right panel). A difference
// is { x, y, r, label }: the spot in panel-local coordinates a click must land on.

export const PANEL_W = 560;
export const PANEL_H = 440;

function circle(c, x, y, r, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}

function ellipse(c, x, y, rx, ry, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}

function rect(c, x, y, w, h, fill) {
  c.fillStyle = fill;
  c.fillRect(x, y, w, h);
}

function poly(c, points, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) c.lineTo(points[i][0], points[i][1]);
  c.closePath();
  c.fill();
}

function line(c, x1, y1, x2, y2, color, w) {
  c.strokeStyle = color;
  c.lineWidth = w;
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
}

function cloud(c, x, y, s) {
  circle(c, x, y, 18 * s, '#ffffff');
  circle(c, x + 18 * s, y - 6 * s, 15 * s, '#ffffff');
  circle(c, x + 36 * s, y, 17 * s, '#ffffff');
  ellipse(c, x + 18 * s, y + 8 * s, 34 * s, 12 * s, '#ffffff');
}

function flower(c, x, y, petal) {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    circle(c, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6, petal);
  }
  circle(c, x, y, 5, '#ffcf3d');
  line(c, x, y + 5, x, y + 22, '#2e7d32', 3);
}

// ---- Level 1: Garden Morning (7 differences) ----
function drawGarden(c, right) {
  const sky = c.createLinearGradient(0, 0, 0, PANEL_H);
  sky.addColorStop(0, '#7ec3ee');
  sky.addColorStop(1, '#dff2ff');
  c.fillStyle = sky;
  c.fillRect(0, 0, PANEL_W, PANEL_H);
  // Sun with a smile (difference 1: the smile is gone on the right).
  circle(c, 70, 64, 34, '#ffd93d');
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    line(c, 70 + Math.cos(a) * 40, 64 + Math.sin(a) * 40, 70 + Math.cos(a) * 50, 64 + Math.sin(a) * 50, '#ffd93d', 4);
  }
  circle(c, 60, 58, 4, '#333');
  circle(c, 80, 58, 4, '#333');
  if (!right) {
    c.strokeStyle = '#333';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(70, 66, 12, 0.2, Math.PI - 0.2);
    c.stroke();
  }
  // Clouds (difference 2: the middle cloud is missing on the right).
  cloud(c, 140, 52, 1);
  if (!right) cloud(c, 290, 44, 1.1);
  cloud(c, 440, 66, 0.9);
  // Bird (difference 6: gone on the right).
  if (!right) {
    c.strokeStyle = '#37474f';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(458, 95);
    c.quadraticCurveTo(466, 86, 474, 95);
    c.quadraticCurveTo(482, 86, 490, 95);
    c.stroke();
  }
  // Hills and grass.
  ellipse(c, 130, 470, 260, 90, '#7bc96f');
  ellipse(c, 460, 480, 280, 100, '#66bb6a');
  // Cottage.
  rect(c, 205, 210, 150, 120, '#ffe0b2');
  poly(c, [[190, 212], [280, 150], [370, 212]], '#e2574c');
  rect(c, 262, 265, 36, 65, '#8d5a2b');
  circle(c, 292, 298, 4, '#ffd93d');
  rect(c, 222, 232, 34, 34, '#b3e5fc');
  rect(c, 304, 232, 34, 34, '#b3e5fc');
  // Window curtain (difference 5: blue curtains on the left, green on the right).
  rect(c, 226, 236, 10, 26, right ? '#66bb6a' : '#42a5f5');
  rect(c, 242, 236, 10, 26, right ? '#66bb6a' : '#42a5f5');
  // Tree with apples (difference 4: one apple is missing on the right).
  rect(c, 448, 230, 16, 90, '#6d4c41');
  circle(c, 456, 195, 48, '#43a047');
  circle(c, 424, 220, 32, '#388e3c');
  circle(c, 488, 220, 32, '#2e7d32');
  circle(c, 430, 185, 6, '#e53935');
  if (!right) circle(c, 455, 200, 6, '#e53935');
  circle(c, 478, 178, 6, '#e53935');
  // Flowers (difference 3: the red flower turns yellow on the right).
  flower(c, 150, 375, right ? '#ffeb3b' : '#e53935');
  flower(c, 110, 390, '#ff80ab');
  flower(c, 195, 392, '#ab47bc');
  flower(c, 520, 385, '#ff80ab');
  flower(c, 90, 360, '#ffffff');
  // Butterfly.
  circle(c, 120, 200, 4, '#ff8f00');
  ellipse(c, 112, 194, 8, 5, '#ab47bc');
  ellipse(c, 128, 194, 8, 5, '#ab47bc');
  // Cat by the cottage (difference 7: tail up on the left, tail down on the right).
  ellipse(c, 345, 395, 26, 18, '#ff9800');
  circle(c, 366, 372, 13, '#ff9800');
  poly(c, [[358, 362], [362, 350], [368, 361]], '#ff9800');
  poly(c, [[370, 361], [376, 350], [378, 362]], '#ff9800');
  c.strokeStyle = '#ff9800';
  c.lineWidth = 6;
  c.beginPath();
  if (right) {
    c.moveTo(322, 392);
    c.quadraticCurveTo(306, 402, 312, 416);
  } else {
    c.moveTo(322, 392);
    c.quadraticCurveTo(304, 380, 310, 362);
  }
  c.stroke();
}

// ---- Level 2: Riverside Market (8 differences) ----
function drawMarket(c, right) {
  const sky = c.createLinearGradient(0, 0, 0, PANEL_H);
  sky.addColorStop(0, '#a5d8f0');
  sky.addColorStop(1, '#e8f7ff');
  c.fillStyle = sky;
  c.fillRect(0, 0, PANEL_W, PANEL_H);
  circle(c, 500, 55, 26, '#fff176');
  // Clock tower.
  rect(c, 262, 60, 40, 150, '#cfd8dc');
  poly(c, [[256, 62], [282, 30], [308, 62]], '#78909c');
  circle(c, 282, 108, 24, '#ffffff');
  c.strokeStyle = '#37474f';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(282, 108, 24, 0, Math.PI * 2);
  c.stroke();
  // Clock hands (difference 7: 3:00 on the left, 4:30 on the right).
  line(c, 282, 108, 282, 92, '#37474f', 3);
  if (right) line(c, 282, 108, 294, 120, '#37474f', 3);
  else line(c, 282, 108, 298, 108, '#37474f', 3);
  // Tower window (difference 8: an extra window on the right).
  rect(c, 272, 150, 20, 24, '#37474f');
  if (right) rect(c, 272, 182, 20, 24, '#37474f');
  // Stalls with striped awnings.
  rect(c, 60, 230, 140, 90, '#8d6e63');
  for (let i = 0; i < 5; i++) rect(c, 60 + i * 28, 205, 28, 25, i % 2 ? '#ffffff' : '#e53935');
  rect(c, 360, 230, 140, 90, '#8d6e63');
  for (let i = 0; i < 5; i++) {
    // Awning stripe (difference 6: one blue stripe is missing on the right).
    if (right && i === 2) continue;
    rect(c, 360 + i * 28, 205, 28, 25, i % 2 ? '#ffffff' : '#1e88e5');
  }
  // Stall sign (difference 1: TEA on the left, TOA on the right).
  rect(c, 100, 240, 60, 26, '#fff8e1');
  c.fillStyle = '#4e342e';
  c.font = 'bold 20px Trebuchet MS, sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(right ? 'TOA' : 'TEA', 130, 254);
  rect(c, 400, 240, 60, 26, '#fff8e1');
  c.fillText('FISH', 430, 254);
  // Crates (difference 3: an extra crate on the right).
  rect(c, 230, 300, 34, 34, '#a1887f');
  rect(c, 268, 300, 34, 34, '#8d6e63');
  rect(c, 249, 266, 34, 34, '#bcaaa4');
  if (right) rect(c, 230, 232, 34, 34, '#a1887f');
  // Balloons (difference 2: the red balloon turns blue on the right).
  circle(c, 470, 85, 16, right ? '#1e88e5' : '#e53935');
  circle(c, 496, 100, 14, '#ffeb3b');
  circle(c, 446, 102, 14, '#43a047');
  line(c, 470, 101, 470, 150, '#666', 1);
  // River.
  rect(c, 0, 340, PANEL_W, 100, '#4db6e8');
  c.strokeStyle = 'rgba(255,255,255,.6)';
  c.lineWidth = 2;
  for (const y of [360, 385, 410]) {
    c.beginPath();
    for (let x = 10; x < PANEL_W; x += 30) {
      c.moveTo(x, y);
      c.quadraticCurveTo(x + 15, y - 6, x + 30, y);
    }
    c.stroke();
  }
  // Boat with a flag (difference 5: the flag points left on the left, right on the right).
  poly(c, [[400, 372], [460, 372], [448, 396], [412, 396]], '#6d4c41');
  line(c, 430, 372, 430, 330, '#5d4037', 3);
  poly(c, right ? [[430, 330], [452, 338], [430, 346]] : [[430, 330], [408, 338], [430, 346]], '#e53935');
  // Ducks (difference 4: the second duck is gone on the right).
  ellipse(c, 120, 385, 16, 10, '#ffffff');
  circle(c, 132, 376, 7, '#ffffff');
  poly(c, [[138, 376], [146, 378], [138, 380]], '#ff9800');
  if (!right) {
    ellipse(c, 300, 398, 16, 10, '#fff176');
    circle(c, 312, 389, 7, '#fff176');
    poly(c, [[318, 389], [326, 391], [318, 393]], '#ff9800');
  }
}

// ---- Level 3: Space Station (10 differences) ----
const STARS = [[60, 40], [150, 90], [240, 50], [330, 80], [420, 40], [510, 110], [90, 150], [200, 130], [360, 140], [500, 190], [40, 250], [530, 300]];

function drawSpace(c, right) {
  const sky = c.createLinearGradient(0, 0, 0, PANEL_H);
  sky.addColorStop(0, '#0b1026');
  sky.addColorStop(1, '#1b2a52');
  c.fillStyle = sky;
  c.fillRect(0, 0, PANEL_W, PANEL_H);
  // Stars (difference 1: the star at (90,60) is missing on the right).
  for (const [x, y] of STARS) {
    if (right && x === 90 && y === 60) continue;
    circle(c, x, y, 3, '#ffffff');
    circle(c, x, y, 1.2, '#fff9c4');
  }
  if (!right) {
    circle(c, 90, 60, 3, '#ffffff');
    circle(c, 90, 60, 1.2, '#fff9c4');
  }
  // Planet with a ring (difference 2: gold ring on the left, teal on the right).
  circle(c, 430, 120, 55, '#ff8a65');
  ellipse(c, 430, 120, 78, 18, right ? '#4db6ac' : '#ffd54f');
  ellipse(c, 430, 120, 78, 18, 'rgba(0,0,0,0)');
  circle(c, 430, 120, 55, 'rgba(255,138,101,.25)');
  circle(c, 415, 105, 10, '#e64a19');
  // Crater (difference 8: an extra crater on the right).
  circle(c, 448, 138, 7, '#d84315');
  if (right) circle(c, 408, 138, 6, '#d84315');
  // Solar panels (difference 4: one segment is missing on the right).
  for (let i = 0; i < 4; i++) {
    if (right && i === 1) continue;
    rect(c, 62 + i * 28, 214, 24, 52, '#1565c0');
    line(c, 62 + i * 28, 240, 86 + i * 28, 240, '#90caf9', 2);
  }
  rect(c, 174, 234, 20, 12, '#78909c');
  // Station module.
  rect(c, 194, 200, 190, 80, '#eceff1');
  rect(c, 194, 200, 190, 12, '#b0bec5');
  rect(c, 240, 280, 60, 40, '#cfd8dc');
  // Portholes (difference 3: the middle porthole is missing on the right).
  circle(c, 224, 240, 13, '#4fc3f7');
  if (!right) circle(c, 280, 240, 13, '#4fc3f7');
  circle(c, 336, 240, 13, '#4fc3f7');
  // Antenna dish (difference 6: it points up-left on the left, up-right on the right).
  line(c, 280, 200, 280, 168, '#78909c', 4);
  c.strokeStyle = '#90a4ae';
  c.lineWidth = 4;
  c.beginPath();
  if (right) {
    c.arc(292, 162, 14, -0.4, Math.PI - 1.2);
  } else {
    c.arc(268, 162, 14, 0.2, Math.PI + 0.4);
  }
  c.stroke();
  // Flag (difference 10: red on the left, green on the right).
  line(c, 356, 200, 356, 168, '#78909c', 3);
  poly(c, right ? [[356, 168], [378, 174], [356, 180]] : [[356, 168], [378, 174], [356, 180]], right ? '#43a047' : '#e53935');
  // Astronaut (difference 5: the tether is gone on the right).
  if (!right) line(c, 384, 280, 452, 296, '#ffffff', 2);
  circle(c, 470, 300, 16, '#ffffff');
  circle(c, 470, 296, 10, '#90caf9');
  rect(c, 452, 312, 36, 10, '#ffffff');
  // Rocket (difference 7: a big flame on the left, a small one on the right).
  poly(c, [[78, 330], [102, 330], [96, 290], [84, 290]], '#eceff1');
  poly(c, [[84, 290], [90, 272], [96, 290]], '#e53935');
  circle(c, 90, 330, 6, '#42a5f5');
  poly(c, right ? [[84, 332], [96, 332], [90, 344]] : [[82, 332], [98, 332], [90, 360]], '#ff9800');
  // Satellite (difference 9: gone on the right).
  if (!right) {
    rect(c, 508, 52, 24, 14, '#b0bec5');
    rect(c, 486, 56, 20, 6, '#1565c0');
    rect(c, 534, 56, 20, 6, '#1565c0');
  }
}

export const LEVELS = [
  {
    name: 'Garden Morning',
    tag: 'A sunny cottage garden',
    draw: drawGarden,
    diffs: [
      { x: 70, y: 64, r: 36, label: 'the sun lost its smile' },
      { x: 300, y: 48, r: 42, label: 'a cloud vanished' },
      { x: 150, y: 375, r: 18, label: 'a flower changed colour' },
      { x: 455, y: 200, r: 18, label: 'an apple is missing' },
      { x: 235, y: 249, r: 24, label: 'the curtains changed colour' },
      { x: 474, y: 95, r: 22, label: 'a bird flew away' },
      { x: 345, y: 380, r: 26, label: "the cat's tail flipped" },
    ],
  },
  {
    name: 'Riverside Market',
    tag: 'Stalls, boats and ducks by the river',
    draw: drawMarket,
    diffs: [
      { x: 130, y: 253, r: 20, label: 'a letter changed on the sign' },
      { x: 470, y: 85, r: 20, label: 'a balloon changed colour' },
      { x: 247, y: 249, r: 18, label: 'an extra crate appeared' },
      { x: 300, y: 398, r: 20, label: 'a duck swam away' },
      { x: 430, y: 338, r: 20, label: 'the boat flag flipped' },
      { x: 416, y: 217, r: 18, label: 'an awning stripe is missing' },
      { x: 282, y: 108, r: 26, label: 'the clock shows a different time' },
      { x: 282, y: 194, r: 16, label: 'an extra window appeared' },
    ],
  },
  {
    name: 'Space Station',
    tag: 'Orbiting above a ringed planet',
    draw: drawSpace,
    diffs: [
      { x: 90, y: 60, r: 14, label: 'a star blinked out' },
      { x: 430, y: 120, r: 60, label: "the planet's ring changed colour" },
      { x: 280, y: 240, r: 18, label: 'a porthole is missing' },
      { x: 104, y: 240, r: 20, label: 'a solar panel segment is missing' },
      { x: 455, y: 290, r: 22, label: "the astronaut's tether is gone" },
      { x: 280, y: 165, r: 20, label: 'the antenna dish turned' },
      { x: 90, y: 344, r: 20, label: "the rocket's flame shrank" },
      { x: 408, y: 138, r: 14, label: 'an extra crater appeared' },
      { x: 520, y: 60, r: 18, label: 'a satellite drifted away' },
      { x: 367, y: 174, r: 16, label: 'the station flag changed colour' },
    ],
  },
];
