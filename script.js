<script>
  let mode = 's', running = false, rafId = null;
  let startTime = null, pausedTotal = 0, pausedElapsedMs = 0, lastTick = null;

  const wageInput = document.getElementById('wage');

  function parseWage() {
    // Convert comma to dot, allow 7,50 as 7.50
    return parseFloat(wageInput.value.replace(',', '.')) || 0;
  }

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
      refreshRate();
    });
  });

  document.getElementById('startBtn').addEventListener('click', () => running ? doPause() : doStart());
  document.getElementById('resetBtn').addEventListener('click', doReset);
  wageInput.addEventListener('input', refreshRate);

  function doStart() {
    const w = parseWage();
    if (w <= 0) return;
    running = true;
    startTime = performance.now();
    lastTick = startTime;
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
    pausedTotal = 0; pausedElapsedMs = 0; startTime = null; lastTick = null;
    setUI(false);
    document.getElementById('totalValue').textContent = '€0.0000';
    document.getElementById('elapsed').textContent = '0:00';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('statusTxt').textContent = 'Stopped';
    refreshRate();
  }

  function currentTotal() {
    const w = parseWage();
    const perSec = w / 3600;
    return pausedTotal + perSec * ((performance.now() - startTime) / 1000);
  }

  function setUI(live) {
    const btn = document.getElementById('startBtn');
    btn.textContent = live ? '⏸ Pause' : '▶ Start';
    live ? btn.classList.add('paused') : btn.classList.remove('paused');
    live ? document.getElementById('dot').classList.add('live') : document.getElementById('dot').classList.remove('live');
    if (!live && (pausedTotal > 0 || pausedElapsedMs > 0)) document.getElementById('statusTxt').textContent = 'Paused';
    else if (live) document.getElementById('statusTxt').textContent = 'Running…';
  }

  function refreshRate() {
    const w = parseWage();
    const ps = w / 3600;
    const cfg = { ms: ['per millisecond', ps/1000, 9], s: ['per second', ps, 6], m: ['per minute', ps*60, 4] }[mode];
    document.getElementById('rateLabel').textContent = cfg[0];
    document.getElementById('rateValue').textContent = '€' + cfg[1].toFixed(cfg[2]);
    document.getElementById('perMin').textContent = '€' + (ps*60).toFixed(4);
    document.getElementById('perHour').textContent = '€' + w.toFixed(2);
  }

  refreshRate();

  function loop() {
    if (!running) return;
    const now = performance.now();
    const total = currentTotal();
    document.getElementById('totalValue').textContent = '€' + total.toFixed(4);
    refreshRate();
    document.getElementById('progressFill').style.width = ((now / 1000 % 1) * 100) + '%';
    const ms = pausedElapsedMs + (now - startTime);
    const s = Math.floor(ms / 1000);
    document.getElementById('elapsed').textContent = Math.floor(s/60) + ':' + String(s%60).padStart(2,'0');
    rafId = requestAnimationFrame(loop);
  }
</script>
