const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];

// Year
$('#year').textContent = new Date().getFullYear();

// Expand cards
$$('[data-expand]').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('expanded'));
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    card.style.setProperty('--mx', mx + '%');
    card.style.setProperty('--my', my + '%');
  });
});

// Count up
const animateCount = (el, target, ms = 900) => {
  const start = performance.now();
  const from = 0;
  const step = (t) => {
    const p = Math.min(1, (t - start) / ms);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const kpiEls = $$('.kpiNum');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = Number(el.dataset.count || '0');
    if (el.dataset.did === '1') return;
    el.dataset.did = '1';
    animateCount(el, target);
  });
}, { threshold: 0.3 });

kpiEls.forEach(el => io.observe(el));

// Orb parallax
const orb = $('.orb');
let pointer = { x: 0.5, y: 0.5 };

const setPointer = (clientX, clientY) => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  pointer.x = Math.min(1, Math.max(0, clientX / w));
  pointer.y = Math.min(1, Math.max(0, clientY / h));
};

window.addEventListener('mousemove', (e) => setPointer(e.clientX, e.clientY), { passive: true });
window.addEventListener('touchmove', (e) => {
  const t = e.touches?.[0];
  if (t) setPointer(t.clientX, t.clientY);
}, { passive: true });

const tickOrb = () => {
  if (orb) {
    const rx = (pointer.y - 0.5) * -16;
    const ry = (pointer.x - 0.5) * 20;
    orb.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }
  requestAnimationFrame(tickOrb);
};
requestAnimationFrame(tickOrb);

// Toast + ideas
const toast = $('#toast');
let toastTimer;
const showToast = (text) => {
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
};

$$('[data-idea]').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.getAttribute('data-idea');
    showToast(`建議任務：${text}`);
  });
});

// Tour button
$('#btnTour').addEventListener('click', async () => {
  const seq = [
    ['#cards', '互動卡片：點一下展開，滑鼠移動會出光圈。'],
    ['#done', 'Timeline：把我們做過的事，變成可交付的里程碑。'],
    ['#ideas', '點 pills 生成可執行的小任務建議。'],
  ];

  for (const [hash, msg] of seq) {
    const el = $(hash);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast(msg);
    await new Promise(r => setTimeout(r, 1400));
  }
});

// Vibe toggle
$('#btnTheme').addEventListener('click', () => {
  document.body.classList.toggle('vibe2');
  showToast(document.body.classList.contains('vibe2') ? 'Vibe: mint-pop' : 'Vibe: neon-night');
});

// Command palette
const cmdk = $('#cmdk');
const cmdInput = $('#cmdInput');
const cmdList = $('#cmdList');

const COMMANDS = [
  { id: 'top', label: '回到頂部', key: 'top', run: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
  { id: 'capabilities', label: '跳到：我可以做什麼', key: 'capabilities', run: () => $('#cards')?.scrollIntoView({ behavior: 'smooth' }) },
  { id: 'done', label: '跳到：我們做過什麼', key: 'done', run: () => $('#done')?.scrollIntoView({ behavior: 'smooth' }) },
  { id: 'ideas', label: '跳到：有趣應用', key: 'ideas', run: () => $('#ideas')?.scrollIntoView({ behavior: 'smooth' }) },
  { id: 'deploy', label: '顯示：部署指令提示', key: 'deploy', run: () => showToast('部署：npm i -g vercel → vercel → vercel --prod（或連 GitHub 自動部署）') },
  { id: 'vibe', label: '切換：Vibe', key: 'vibe', run: () => $('#btnTheme').click() },
];

let activeIndex = 0;

const renderCmds = (filter = '') => {
  const f = filter.trim().toLowerCase();
  const items = COMMANDS.filter(c => !f || c.id.includes(f) || c.label.toLowerCase().includes(f) || c.key.includes(f));
  activeIndex = 0;
  cmdList.innerHTML = '';
  items.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'cmdItem' + (i === 0 ? ' active' : '');
    div.setAttribute('role', 'option');
    div.dataset.id = c.id;
    div.innerHTML = `<div>${c.label}</div><div class="cmdKey">${c.key}</div>`;
    div.addEventListener('click', () => { c.run(); cmdk.close(); });
    cmdList.appendChild(div);
  });
  return items;
};

let currentItems = renderCmds('');

const openCmdk = () => {
  cmdk.showModal();
  cmdInput.value = '';
  currentItems = renderCmds('');
  setTimeout(() => cmdInput.focus(), 0);
};

$('#btnCmd').addEventListener('click', openCmdk);

window.addEventListener('keydown', (e) => {
  const isK = e.key.toLowerCase() === 'k';
  if ((e.ctrlKey || e.metaKey) && isK) {
    e.preventDefault();
    openCmdk();
  }

  if (cmdk.open) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, currentItems.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = currentItems[activeIndex];
      cmd?.run();
      cmdk.close();
      return;
    } else {
      return;
    }

    const els = $$('.cmdItem', cmdList);
    els.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
    els[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }
});

cmdInput.addEventListener('input', () => {
  currentItems = renderCmds(cmdInput.value);
});

// Particle-ish background canvas
const canvas = $('#fx');
const ctx = canvas.getContext('2d');
let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

const resize = () => {
  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
};

window.addEventListener('resize', resize);
resize();

const rnd = (a, b) => a + Math.random() * (b - a);

const dots = Array.from({ length: 64 }, () => ({
  x: rnd(0, 1),
  y: rnd(0, 1),
  vx: rnd(-0.00025, 0.00025),
  vy: rnd(-0.00018, 0.00018),
  r: rnd(1.2, 2.6),
  hue: rnd(180, 300),
}));

const draw = () => {
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // soft vignette
  const g = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.7);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,.35)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const mx = pointer.x * w;
  const my = pointer.y * h;

  // links
  for (let i = 0; i < dots.length; i++) {
    const a = dots[i];
    const ax = a.x * w;
    const ay = a.y * h;

    for (let j = i + 1; j < dots.length; j++) {
      const b = dots[j];
      const bx = b.x * w;
      const by = b.y * h;
      const dx = ax - bx;
      const dy = ay - by;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 160 * dpr) {
        const alpha = (1 - dist / (160 * dpr)) * 0.22;
        ctx.strokeStyle = `rgba(160, 190, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }
    }

    // magnet
    const mdx = ax - mx;
    const mdy = ay - my;
    const md = Math.sqrt(mdx * mdx + mdy * mdy);
    if (md < 220 * dpr) {
      a.vx += (mdx / (md + 0.001)) * -0.0000007;
      a.vy += (mdy / (md + 0.001)) * -0.0000007;
    }
  }

  // dots
  for (const p of dots) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < -0.05) p.x = 1.05;
    if (p.x > 1.05) p.x = -0.05;
    if (p.y < -0.05) p.y = 1.05;
    if (p.y > 1.05) p.y = -0.05;

    const x = p.x * w;
    const y = p.y * h;

    ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, .18)`;
    ctx.beginPath();
    ctx.arc(x, y, p.r * dpr, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(draw);
};
requestAnimationFrame(draw);
