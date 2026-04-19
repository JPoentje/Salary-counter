console.log("SCRIPT LOADED");

// =====================
// SALARY METER SYSTEM
// =====================

let mode = 's';
let running = false;
let rafId = null;

let startTime = null;
let pausedTotal = 0;
let pausedElapsedMs = 0;

const wageInput = document.getElementById('wage');

function parseWage() {
  if (!wageInput) return 0;
  return parseFloat(wageInput.value.replace(',', '.')) || 0;
}

// MODE SWITCH
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    refreshRate();
  });
});

// BUTTONS (salary page only)
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

if (startBtn) {
  startBtn.addEventListener('click', () => {
    running ? doPause() : doStart();
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', doReset);
}

if (wageInput) {
  wageInput.addEventListener('input', refreshRate);
}

function doStart() {
  const w = parseWage();
  if (w <= 0) return;

  running = true;
  startTime = performance.now();
  setUI(true);
  loop();
}

function doPause() {
  running = false;
  cancelAnimationFrame(rafId);

  pausedTotal = currentTotal();
  pausedElapsedMs += performance.now() - startTime;

  setUI(false);
}

function doReset() {
  running = false;
  cancelAnimationFrame(rafId);

  pausedTotal = 0;
  pausedElapsedMs = 0;
  startTime = null;

  const totalEl = document.getElementById('totalValue');
  const elapsedEl = document.getElementById('elapsed');
  const progressEl = document.getElementById('progressFill');
  const statusEl = document.getElementById('statusTxt');

  if (totalEl) totalEl.textContent = '€0.0000';
  if (elapsedEl) elapsedEl.textContent = '0:00';
  if (progressEl) progressEl.style.width = '0%';
  if (statusEl) statusEl.textContent = 'Stopped';

  setUI(false);
  refreshRate();
}

function currentTotal() {
  const w = parseWage();
  const perSec = w / 3600;
  return pausedTotal + perSec * ((performance.now() - startTime) / 1000);
}

function setUI(live) {
  const btn = document.getElementById('startBtn');
  const dot = document.getElementById('dot');
  const status = document.getElementById('statusTxt');

  if (!btn) return;

  btn.textContent = live ? '⏸ Pause' : '▶ Start';

  if (live) {
    btn.classList.add('paused');
    if (dot) dot.classList.add('live');
    if (status) status.textContent = 'Running...';
  } else {
    btn.classList.remove('paused');
    if (dot) dot.classList.remove('live');
    if (status) status.textContent = 'Stopped';
  }
}

function refreshRate() {
  const w = parseWage();
  const ps = w / 3600;

  const cfg = {
    ms: ['per millisecond', ps / 1000, 9],
    s: ['per second', ps, 6],
    m: ['per minute', ps * 60, 4]
  }[mode];

  const rateLabel = document.getElementById('rateLabel');
  const rateValue = document.getElementById('rateValue');
  const perMin = document.getElementById('perMin');
  const perHour = document.getElementById('perHour');

  if (rateLabel) rateLabel.textContent = cfg[0];
  if (rateValue) rateValue.textContent = '€' + cfg[1].toFixed(cfg[2]);

  if (perMin) perMin.textContent = '€' + (ps * 60).toFixed(4);
  if (perHour) perHour.textContent = '€' + w.toFixed(2);
}

function loop() {
  if (!running) return;

  const now = performance.now();
  const total = currentTotal();

  const totalEl = document.getElementById('totalValue');
  const progressEl = document.getElementById('progressFill');
  const elapsedEl = document.getElementById('elapsed');

  if (totalEl) totalEl.textContent = '€' + total.toFixed(4);

  if (progressEl) {
    progressEl.style.width = ((now / 1000 % 1) * 100) + '%';
  }

  if (elapsedEl) {
    const ms = pausedElapsedMs + (now - startTime);
    const s = Math.floor(ms / 1000);

    elapsedEl.textContent =
      Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  rafId = requestAnimationFrame(loop);
}

// init
refreshRate();


// =====================
// PROJECT SYSTEM
// =====================

let projects = JSON.parse(localStorage.getItem("projects")) || [];

function saveProjects() {
  localStorage.setItem("projects", JSON.stringify(projects));
}

function renderProjects() {
  const list = document.getElementById("projectList");
  if (!list) return;

  list.innerHTML = "";

  projects.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "stat";

    div.innerHTML = `
      <div class="s-lbl">${p}</div>
      <button class="btn btn-reset" onclick="deleteProject(${i})">Remove</button>
    `;

    list.appendChild(div);
  });
}

function addProject() {
  const input = document.getElementById("projectName");
  if (!input) return;

  const name = input.value.trim();
  if (!name) return;

  projects.push(name);
  input.value = "";

  saveProjects();
  renderProjects();
}

function deleteProject(index) {
  projects.splice(index, 1);
  saveProjects();
  renderProjects();
}

// connect projects button safely
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");

  if (addBtn) {
    addBtn.addEventListener("click", addProject);
  }

  renderProjects();
});
