// Mahmoud Mohammadi — editorial portfolio
// Smooth scroll (Lenis), line/word reveals, parallax plates, modal menu, FAQ accordion.

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (min-width: 769px)').matches;
const rem = () => parseFloat(getComputedStyle(root).fontSize);

/* ---------- Smooth scroll (falls back to native if the CDN is unreachable) ---------- */
let lenis = null;
if (!reduceMotion) {
    import('https://cdn.jsdelivr.net/npm/lenis@1.3.19/+esm').then(({ default: Lenis }) => {
        lenis = new Lenis({ smoothWheel: true });
        const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
    }).catch(() => { lenis = null; });
}

/* ---------- Text splitting ---------- */
// Words: each word becomes an inline-block span with its own index.
document.querySelectorAll('[data-reveal="words"]').forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(/\s+/).map((w, i) => `<span class="w" aria-hidden="true" style="--wi:${i}">${w}</span>`).join(' ');
    if (el.dataset.stagger) el.style.setProperty('--ws', el.dataset.stagger + 'ms');
});

// Lines: split into word tokens, group by rendered line, wrap each line in a clip.
const lineEls = [...document.querySelectorAll('[data-reveal="lines"]')];
lineEls.forEach((el) => {
    el.dataset.source = el.innerHTML;
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    if (el.dataset.stagger) el.style.setProperty('--ls', el.dataset.stagger + 'ms');
});

function splitLines(el) {
    el.innerHTML = el.dataset.source;
    const tokens = [];
    [...el.childNodes].forEach((node) => {
        if (node.nodeType === 3) {
            node.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
                const s = document.createElement('span');
                s.textContent = word;
                tokens.push(s);
            });
        } else {
            const s = document.createElement('span');
            s.appendChild(node.cloneNode(true));
            tokens.push(s);
        }
    });
    el.innerHTML = '';
    tokens.forEach((t, i) => {
        t.style.display = 'inline-block';
        el.appendChild(t);
        if (i < tokens.length - 1) el.appendChild(document.createTextNode(' '));
    });
    const lines = [];
    let lastTop = null;
    tokens.forEach((t) => {
        const top = t.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 4) { lines.push([]); lastTop = top; }
        lines[lines.length - 1].push(t);
    });
    el.innerHTML = lines.map((line, i) =>
        `<span class="line" aria-hidden="true"><span class="line-inner" style="--li:${i}">${line.map((t) => t.innerHTML).join(' ')}</span></span>`
    ).join('');
}

const doSplit = () => lineEls.forEach(splitLines);
doSplit();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(doSplit);
let resizeTimer;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(doSplit, 200); });

/* ---------- Reveal once on enter ---------- */
const reveals = document.querySelectorAll('[data-reveal]');
reveals.forEach((el) => el.style.setProperty('--d', (el.dataset.delay || 0) + 'ms'));
if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
} else {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add('in');
            io.unobserve(e.target);
        });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    // Start once the intro curtain begins to lift
    setTimeout(() => reveals.forEach((el) => io.observe(el)), 650);
}

/* ---------- Parallax on field plates ---------- */
const plates = [...document.querySelectorAll('.parallax')];
function parallax() {
    if (reduceMotion) return;
    const vh = window.innerHeight;
    const on = window.innerWidth > 768;
    const r = rem();
    plates.forEach((p) => {
        if (!on) { p.style.removeProperty('--py'); return; }
        const box = p.getBoundingClientRect();
        if (box.bottom < -50 || box.top > vh + 50) return;
        const progress = Math.min(Math.max((vh - box.top) / (vh + box.height), 0), 1);
        p.style.setProperty('--py', ((1 - 2 * progress) * 2.5 * r).toFixed(1) + 'px');
    });
}
window.addEventListener('scroll', parallax, { passive: true });
window.addEventListener('resize', parallax);
parallax();

/* ---------- Anchor links glide with Lenis ---------- */
function scrollToHash(hash) {
    const target = hash === '#top' ? document.body : document.querySelector(hash);
    if (!target) return;
    if (lenis) {
        const offset = hash === '#top' ? 0 : -parseFloat(getComputedStyle(target).scrollMarginTop || 0);
        lenis.scrollTo(hash === '#top' ? 0 : target, { offset });
    } else {
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }
}
document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.closest('.menu')) return;
    const hash = a.getAttribute('href');
    if (hash.length < 2) return;
    e.preventDefault();
    scrollToHash(hash);
});

/* ---------- Modal menu ---------- */
const menu = document.getElementById('menu');
const menuBtn = document.querySelector('.menu-btn');
const menuClose = menu.querySelector('.menu-close');
menu.querySelectorAll('.menu-nav a').forEach((a, i) => a.style.setProperty('--i', i));
let closeTimer;

function openMenu() {
    clearTimeout(closeTimer);
    menu.hidden = false;
    void menu.offsetWidth;
    menu.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    root.classList.add('menu-locked');
    if (lenis) lenis.stop();
    menuClose.focus();
}
function closeMenu(then) {
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    root.classList.remove('menu-locked');
    if (lenis) lenis.start();
    closeTimer = setTimeout(() => { menu.hidden = true; if (then) then(); }, reduceMotion ? 0 : 450);
}
menuBtn.addEventListener('click', openMenu);
menuClose.addEventListener('click', () => closeMenu(() => menuBtn.focus()));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) closeMenu(() => menuBtn.focus()); });
menu.querySelectorAll('.menu-nav a').forEach((a) => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
        const hash = a.getAttribute('href');
        closeMenu(() => scrollToHash(hash));
    });
});

/* ---------- FAQ accordion (rows toggle independently) ---------- */
const rows = [...document.querySelectorAll('.faq-row')];
rows.forEach((row) => {
    const btn = row.querySelector('button');
    const panel = row.querySelector('.faq-panel');
    btn.addEventListener('click', () => {
        const open = !row.classList.contains('open');
        row.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
        panel.style.height = open ? panel.scrollHeight + 'px' : '0px';
    });
});
if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => rows.forEach((row) => {
        if (row.classList.contains('open')) {
            const panel = row.querySelector('.faq-panel');
            panel.style.height = panel.firstElementChild.offsetHeight + 'px';
        }
    }));
    rows.forEach((row) => ro.observe(row.querySelector('.faq-panel > div')));
}

/* ---------- Year ---------- */
document.querySelectorAll('.cur-year').forEach((el) => { el.textContent = new Date().getFullYear(); });

// Hover springs only on fine pointers; CSS handles the motion, this just tags the root.
if (finePointer()) root.classList.add('fine');


/* ---------- Intro curtain ---------- */
const lift = () => document.body.classList.add('ready');
if (reduceMotion) lift();
else { window.addEventListener('load', () => setTimeout(lift, 350)); setTimeout(lift, 1800); }

/* ---------- Scroll-driven extras: progress, turning stars, marquee lean, footer word ---------- */
const giant = document.querySelector('.giant');
let lastY = window.scrollY;
let skew = 0;
function scrollFx() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    root.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (reduceMotion) return;
    root.style.setProperty('--rot', (y * 0.06).toFixed(2));
    if (giant) {
        const box = giant.getBoundingClientRect();
        const prog = Math.min(Math.max((window.innerHeight - box.top) / (window.innerHeight + box.height), 0), 1);
        giant.style.setProperty('--gx', ((0.5 - prog) * 8).toFixed(2) + 'vw');
    }
}
window.addEventListener('scroll', scrollFx, { passive: true });
window.addEventListener('resize', scrollFx);
scrollFx();

/* ---------- Pointer extras (fine pointers only) ---------- */
if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    // Cursor dot that grows over links and plates
    const cursor = document.querySelector('.cursor');
    window.addEventListener('pointermove', (e) => {
        cursor.style.setProperty('--cx', e.clientX + 'px');
        cursor.style.setProperty('--cy', e.clientY + 'px');
        const t = e.target;
        cursor.classList.toggle('is-plate', !!t.closest('.plate'));
        cursor.classList.toggle('is-link', !t.closest('.plate') && !!t.closest('a, button'));
    }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.style.setProperty('--cx', '-100px'));

    // Magnetic buttons
    document.querySelectorAll('.cta, .menu-btn').forEach((btn) => {
        btn.addEventListener('pointermove', (e) => {
            const r = btn.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
            const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
            btn.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        });
        btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });

    // Portrait tilts toward the pointer
    const visual = document.querySelector('.hero-visual');
    const plate = document.querySelector('.hero-plate');
    if (visual && plate) {
        visual.addEventListener('pointermove', (e) => {
            const r = visual.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            plate.style.setProperty('--ty', (px * 8).toFixed(2) + 'deg');
            plate.style.setProperty('--tx', (py * -8).toFixed(2) + 'deg');
        });
        visual.addEventListener('pointerleave', () => { plate.style.setProperty('--tx', '0deg'); plate.style.setProperty('--ty', '0deg'); });
    }

    // Marquee leans with scroll speed, then settles
    const track = document.querySelector('.marquee-track');
    (function lean() {
        const y = window.scrollY;
        const target = Math.max(-12, Math.min(12, (y - lastY) * 0.35));
        lastY = y;
        skew += (target - skew) * 0.12;
        if (track) track.style.setProperty('--skew', skew.toFixed(2) + 'deg');
        requestAnimationFrame(lean);
    })();
}
