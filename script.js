// Mahmoud Mohammadi — portfolio & CV
// Veil, text reveals, sticky stack, chequered seams, route map, career rail.

const root = document.documentElement;
const body = document.body;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const token = (name) => getComputedStyle(root).getPropertyValue(name).trim();
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

window.scrollTo(0, 0);

/* ---------- Text reveals: split into words or letters ---------- */
$$('[data-split]').forEach((el) => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    const units = el.dataset.split === 'words' ? text.split(' ') : [...text];
    el.style.setProperty('--st', (el.dataset.stagger || 110) + 'ms');
    el.innerHTML = `<span class="sr">${text}</span>` + units.map((u, i) =>
        `<span class="u" aria-hidden="true" style="--i:${i}">${u === ' ' ? '&nbsp;' : u}</span>`).join('');
});

/* ---------- Smooth scroll (optional; native scroll if the CDN is unreachable) ---------- */
let lenis = null;
if (!reduce) {
    import('https://cdn.jsdelivr.net/npm/lenis@1.3.19/+esm').then(({ default: Lenis }) => {
        lenis = new Lenis({ smoothWheel: true });
        const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
    }).catch(() => {});
}
const goTo = (hash) => {
    const target = hash === '#top' ? null : $(hash);
    if (lenis) lenis.scrollTo(target || 0);
    else if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
};
document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault();
    closeSheet();
    goTo(a.getAttribute('href'));
});

/* ---------- Loading veil: creeps to 70%, completes when the hero is ready ---------- */
const veil = $('.veil');
let load = 0;
let isReady = reduce;
let went = false;
const go = () => {
    if (went) return;
    went = true;
    body.classList.add('go');
    setTimeout(() => veil.remove(), 1200);
};
if (reduce) { body.classList.add('ready'); go(); } else {
    const heroImg = $('.hero-figure img');
    const ready = () => { isReady = true; };
    Promise.all([
        heroImg.complete ? Promise.resolve() : new Promise((r) => { heroImg.onload = r; heroImg.onerror = r; }),
        document.fonts ? document.fonts.ready : Promise.resolve(),
    ]).then(ready);
    setTimeout(ready, 3000);
    (function creep() {
        const target = isReady ? 1 : 0.7;
        load += (target - load) * (isReady ? 0.16 : 0.012);
        veil.style.setProperty('--load', load.toFixed(4));
        if (isReady && load > 0.995) {
            body.classList.add('ready');
            setTimeout(go, 670);
            return;
        }
        requestAnimationFrame(creep);
    })();
    setTimeout(() => { body.classList.add('ready'); go(); }, 6000);
}

/* ---------- Reveal on enter ---------- */
const io = (els, margin, cb) => {
    if (reduce || !('IntersectionObserver' in window)) { els.forEach((el) => cb(el)); return; }
    const o = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { cb(e.target); o.unobserve(e.target); }
    }), { rootMargin: margin });
    els.forEach((el) => o.observe(el));
};
const mark = (el) => el.classList.add('in');
io($$('[data-io], .rise-io, .fade-io, .draw-io'), '0% 0% -8% 0%', mark);
io($$('.row'), '0% 0% -25% 0%', mark);
io($$('.cal'), '0% 0% -20% 0%', mark);
$$('.cal li').forEach((li, i) => li.style.setProperty('--i', i));
$$('.sheet nav a').forEach((a, i) => a.style.setProperty('--i', i));

/* ---------- Chequered seams ---------- */
const CELL = 24, SOLID_UNTIL = 0.16, LIFT = 2, ACCENT_SHARE = 0.06;
const noise = (x, y) => {
    let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const seams = $$('canvas.dissolve').map((canvas) => ({
    canvas, ctx: canvas.getContext('2d'), last: -1,
    surface: canvas.dataset.carry === 'light' ? token('--background') : token('--surface-black'),
}));
const accent = token('--accent');
const drawSeam = (s, progress) => {
    const { canvas, ctx } = s;
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * ratio)) { canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); }
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const columns = Math.ceil(width / CELL), rows = Math.ceil(height / CELL), lift = progress * LIFT;
    for (let y = 0; y < rows; y += 1) {
        const depth = y / Math.max(1, rows - 1) + lift;
        if (depth > 1) break;
        const solid = depth <= SOLID_UNTIL;
        const fade = clamp(1 - (depth - SOLID_UNTIL) / (1 - SOLID_UNTIL));
        if (!solid && fade <= 0) break;
        for (let x = 0; x < columns; x += 1) {
            if (!solid) {
                if ((x + y) % 2 !== 0) continue;
                if (noise(x, y) > fade) continue;
            }
            ctx.fillStyle = !solid && noise(x + 101, y + 57) < ACCENT_SHARE ? accent : s.surface;
            ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
    }
};

/* ---------- Route map: Isfahan → Paris ---------- */
const CITIES = [
    { name: 'Isfahan', year: '2015', x: 1326, y: 634, lx: -14, ly: 4, anchor: 'end' },
    { name: 'Bologna', year: '2023', x: 600, y: 338, lx: 14, ly: 22, anchor: 'start' },
    { name: 'Berlin', year: '2024', x: 637, y: 137, lx: 0, ly: -14, anchor: 'middle' },
    { name: 'Liège', year: '2024', x: 496, y: 184, lx: -12, ly: -10, anchor: 'end' },
    { name: 'Poznań', year: '2025', x: 701, y: 140, lx: 14, ly: 4, anchor: 'start' },
    { name: 'Paris', year: 'now', x: 438, y: 228, lx: -14, ly: 4, anchor: 'end' },
];
const map = $('.map');
const NS = 'http://www.w3.org/2000/svg';
let pathD = `M${CITIES[0].x} ${CITIES[0].y}`;
const measure = document.createElementNS(NS, 'path');
const cityAt = [0];
CITIES.slice(1).forEach((c, i) => {
    const p = CITIES[i];
    const mx = (p.x + c.x) / 2, my = (p.y + c.y) / 2;
    const dx = c.x - p.x, dy = c.y - p.y;
    const bend = (i % 2 ? -1 : 1) * 0.22;
    pathD += ` Q${(mx - dy * bend).toFixed(1)} ${(my + dx * bend).toFixed(1)} ${c.x} ${c.y}`;
    measure.setAttribute('d', pathD);
    cityAt.push(measure.getTotalLength());
});
const routeLength = cityAt[cityAt.length - 1];
$$('.route-base, .route-glow, .route-line', map).forEach((p) => p.setAttribute('d', pathD));
const routeParts = $$('.route-glow, .route-line', map);
routeParts.forEach((p) => { p.style.strokeDasharray = routeLength; p.style.strokeDashoffset = routeLength; });
const cityNodes = CITIES.map((c) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'city');
    g.setAttribute('transform', `translate(${c.x} ${c.y})`);
    g.innerHTML = `<rect x="-4" y="-4" width="8" height="8"/><text x="${c.lx}" y="${c.ly}" text-anchor="${c.anchor}">${c.name} <tspan fill="#b6c1c8" font-weight="400">${c.year}</tspan></text>`;
    $('.cities', map).appendChild(g);
    return g;
});
const setRoute = (p) => {
    const d = routeLength * p;
    routeParts.forEach((el) => { el.style.strokeDashoffset = routeLength - d; });
    cityNodes.forEach((g, i) => g.classList.toggle('lit', d >= cityAt[i] - 0.5));
};
let routeDone = false;
const runRoute = () => {
    if (reduce) { setRoute(1); routeDone = true; return; }
    const start = performance.now(), LAP_MS = 5500;
    (function step(now) {
        const u = clamp((now - start) / LAP_MS);
        setRoute(0.5 - Math.cos(Math.PI * u) / 2);
        if (u < 1) requestAnimationFrame(step); else routeDone = true;
    })(start);
};
if ('IntersectionObserver' in window) {
    const o = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { runRoute(); o.disconnect(); }
    }, { threshold: 0.35 });
    o.observe($('.stage'));
} else runRoute();
const fitMap = () => {
    const stage = $('.stage');
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    if (w < 1024 && h > w) {
        // Portrait: frame the European cluster and let the line arrive from the right edge.
        const vw = 530, vh = (vw * h) / w;
        map.setAttribute('viewBox', `308 ${(240 - vh * 0.62).toFixed(0)} ${vw} ${vh.toFixed(0)}`);
    } else map.setAttribute('viewBox', '0 0 1440 800');
};

/* ---------- Halftone lattice with a cursor reticle (after the route has drawn) ---------- */
const dotCanvas = $('.dots');
const dotCtx = dotCanvas.getContext('2d');
const PITCH = 18;
let baked = null;
const bakeDots = () => {
    const w = dotCanvas.clientWidth, h = dotCanvas.clientHeight;
    if (!w || !h) return;
    const ratio = fine ? Math.min(devicePixelRatio || 1, 2) : 1;
    dotCanvas.width = Math.round(w * ratio); dotCanvas.height = Math.round(h * ratio);
    baked = document.createElement('canvas');
    baked.width = dotCanvas.width; baked.height = dotCanvas.height;
    const c = baked.getContext('2d');
    c.setTransform(ratio, 0, 0, ratio, 0, 0);
    c.fillStyle = 'rgb(122 122 122 / 0.5)';
    c.beginPath();
    for (let y = PITCH / 2; y < h; y += PITCH) for (let x = PITCH / 2; x < w; x += PITCH) {
        c.moveTo(x + 1.1, y); c.arc(x, y, 1.1, 0, Math.PI * 2);
    }
    c.fill();
    dotCtx.setTransform(1, 0, 0, 1, 0, 0);
    dotCtx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
    dotCtx.drawImage(baked, 0, 0);
};
const reticle = { x: 0, y: 0, tx: 0, ty: 0, heat: 0, on: false, spread: 0, running: false };
const drawReticle = () => {
    const r = reticle;
    const px = r.x, py = r.y;
    r.x += (r.tx - r.x) * 0.22; r.y += (r.ty - r.y) * 0.22;
    const speed = Math.hypot(r.x - px, r.y - py);
    const wanted = clamp(1 - speed / 14);
    r.spread += (wanted - r.spread) * (wanted > r.spread ? 0.05 : 0.25);
    r.heat += ((r.on ? 0.95 : 0) - r.heat) * (r.on ? 0.14 : 0.08);
    const ratio = dotCanvas.width / dotCanvas.clientWidth;
    dotCtx.setTransform(1, 0, 0, 1, 0, 0);
    dotCtx.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
    dotCtx.drawImage(baked, 0, 0);
    if (r.heat > 0.01) {
        dotCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
        const ci = Math.round((r.x - PITCH / 2) / PITCH), cj = Math.round((r.y - PITCH / 2) / PITCH);
        const reach = 320 * r.spread, span = Math.ceil(Math.max(reach, 54) / PITCH);
        const lit = (i, j, level) => {
            if (level < 0.3) return;
            const x = PITCH / 2 + i * PITCH, y = PITCH / 2 + j * PITCH;
            dotCtx.clearRect(x - 2, y - 2, 4, 4);
            if ((i + j) & 1) return;
            const t = clamp((level - 0.3) / 0.7);
            const side = PITCH * (0.7 + 0.3 * t);
            dotCtx.fillStyle = level > 0.8 ? '#ffffff' : level > 0.5 ? 'rgb(141 243 250)' : accent;
            dotCtx.fillRect(x - side / 2, y - side / 2, side, side);
        };
        for (let k = -span; k <= span; k += 1) {
            const d = Math.abs(k) * PITCH;
            if (reach > 1 && d <= reach) {
                const level = (1 - d / reach) * 0.82 * r.heat;
                lit(ci + k, cj, level);
                if (k !== 0) lit(ci, cj + k, level);
            }
        }
        for (let j = -3; j <= 3; j += 1) for (let i = -3; i <= 3; i += 1) {
            if (i === 0 || j === 0) continue;
            const u = 1 - Math.hypot(i, j) * PITCH / 54;
            if (u > 0) lit(ci + i, cj + j, u * u * r.heat);
        }
    }
    if (r.heat > 0.01 || r.on) requestAnimationFrame(drawReticle); else r.running = false;
};
if (fine && !reduce) {
    const season = $('.season');
    window.addEventListener('pointermove', (e) => {
        if (!routeDone || !baked) return;
        const box = season.getBoundingClientRect();
        const inside = e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom
            && e.target.closest && !!e.target.closest('.season');
        reticle.on = inside;
        if (inside) {
            reticle.tx = e.clientX - box.left; reticle.ty = e.clientY - box.top;
            if (reticle.heat < 0.01) { reticle.x = reticle.tx; reticle.y = reticle.ty; }
            if (!reticle.running) { reticle.running = true; requestAnimationFrame(drawReticle); }
        }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { reticle.on = false; });
}

/* ---------- Hero portrait follows the pointer a little ---------- */
if (fine && !reduce) {
    const img = $('.hero-figure img');
    const p = { x: 0, y: 0, tx: 0, ty: 0, running: false };
    const follow = () => {
        p.x += (p.tx - p.x) * 0.08; p.y += (p.ty - p.y) * 0.08;
        img.style.setProperty('--fx', (-p.x * 14).toFixed(2) + 'px');
        img.style.setProperty('--fy', (-p.y * 8).toFixed(2) + 'px');
        if (Math.abs(p.tx - p.x) + Math.abs(p.ty - p.y) > 0.001) requestAnimationFrame(follow); else p.running = false;
    };
    window.addEventListener('pointermove', (e) => {
        if (window.scrollY > innerHeight) return;
        p.tx = (e.clientX / innerWidth) * 2 - 1; p.ty = (e.clientY / innerHeight) * 2 - 1;
        if (!p.running) { p.running = true; requestAnimationFrame(follow); }
    }, { passive: true });
}

/* ---------- Scroll-driven: stack recede, seams, rail, row parallax, photo drift ---------- */
const pinned = $$('.layer.pin').map((layer) => ({
    inner: $('.layer-inner', layer), shade: $('.shade', layer), next: layer.nextElementSibling,
}));
const phone = matchMedia('(max-width: 639px)');
const rail = $('.rail');
const railRun = $('.rail-run'), railMark = $('.rail-mark');
const REST = 2387;
const rows = $$('.row');
const update = () => {
    const vh = innerHeight || 1;

    // Each pinned block recedes as the next one comes over it.
    const shrink = phone.matches || reduce ? 0 : 0.1;
    for (const { inner, shade, next } of pinned) {
        const p = clamp(1 - next.getBoundingClientRect().top / vh);
        inner.style.transform = p > 0 && shrink > 0 ? `scale(${1 - shrink * p})` : '';
        shade.style.opacity = `${0.55 * p}`;
        inner.style.visibility = p >= 1 ? 'hidden' : 'visible';
    }

    // Chequered seams burn off as their block rises from the fold to the ceiling.
    seams.forEach((s) => {
        const box = s.canvas.getBoundingClientRect();
        if (box.bottom < 0 || box.top > vh) return;
        const p = Math.round(clamp(1 - box.top / vh) * 200) / 200;
        if (p !== s.last) { s.last = p; drawSeam(s, p); }
    });

    if (!phone.matches && !reduce) {
        // The rail's thread and its turning marker.
        const rb = rail.getBoundingClientRect();
        const rp = clamp((vh / 2 - rb.top) / Math.max(1, rb.height - vh / 2));
        const run = rp * REST;
        railRun.setAttribute('height', run.toFixed(1));
        railMark.setAttribute('transform', `translate(8 ${run.toFixed(1)}) rotate(${((run / REST) * 1800).toFixed(1)})`);

        // Three layers per row, centred on their design position.
        rows.forEach((row) => {
            const b = row.getBoundingClientRect();
            if (b.bottom < -200 || b.top > vh + 200) return;
            const p = clamp((vh - b.top) / (vh + b.height));
            row.style.setProperty('--par', (1 - 2 * p).toFixed(4));
            row.style.setProperty('--slot', (1 - clamp((vh - b.top) / (vh / 2))).toFixed(4));
        });

    }
};
let ticking = false;
const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
};
window.addEventListener('scroll', requestUpdate, { passive: true });
let lastWidth = innerWidth;
window.addEventListener('resize', () => {
    seams.forEach((s) => { s.last = -1; });
    if (innerWidth !== lastWidth || fine) { lastWidth = innerWidth; fitMap(); bakeDots(); }
    requestUpdate();
});
fitMap();
bakeDots();
update();

/* ---------- Menu sheet (below 1280) ---------- */
const sheet = $('.sheet');
function closeSheet() {
    if (sheet.hidden) return;
    sheet.classList.remove('open');
    root.classList.remove('locked');
    if (lenis) lenis.start();
    setTimeout(() => { sheet.hidden = true; }, 300);
}
$('.burger').addEventListener('click', () => {
    sheet.hidden = false;
    void sheet.offsetWidth;
    sheet.classList.add('open');
    root.classList.add('locked');
    if (lenis) lenis.stop();
    $('.sheet-close').focus();
});
$('.sheet-close').addEventListener('click', closeSheet);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
matchMedia('(min-width: 1280px)').addEventListener('change', (e) => { if (e.matches) closeSheet(); });

$$('.cur-year').forEach((el) => { el.textContent = new Date().getFullYear(); });
