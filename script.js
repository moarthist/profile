// Mahmoud Mohammadi — portfolio & CV
(function () {
    var root = document.documentElement;
    var body = document.body;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Loader: count to 100%, then lift the curtain and start the reveals
    var count = document.querySelector('.loader .count');
    var started = false;

    function start() {
        if (started) return;
        started = true;
        count.textContent = '100%';
        body.classList.add('loaded');
        setTimeout(observeReveals, reduceMotion ? 0 : 450);
    }

    if (reduceMotion) {
        start();
    } else {
        var t0 = null;
        var duration = 900;
        (function tick(now) {
            if (started) return;
            if (t0 === null) t0 = now;
            var p = Math.min((now - t0) / duration, 1);
            count.textContent = Math.round(p * p * (3 - 2 * p) * 100) + '%';
            if (p < 1) requestAnimationFrame(tick);
            else setTimeout(start, 120);
        })(performance.now());
        // Never leave the page covered if frames are throttled
        setTimeout(start, 2500);
    }

    // Reveal masked lines and blocks as they enter, staggering siblings
    function observeReveals() {
        var targets = document.querySelectorAll('.mask, .reveal');
        if (!('IntersectionObserver' in window) || reduceMotion) {
            targets.forEach(function (el) { el.classList.add('in'); });
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.filter(function (e) { return e.isIntersecting; }).forEach(function (e, i) {
                e.target.style.setProperty('--delay', (i * 0.07) + 's');
                e.target.classList.add('in');
                observer.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px -6% 0px' });
        targets.forEach(function (el) { observer.observe(el); });
    }

    // Full-screen menu
    var menuBtn = document.querySelector('.menu-btn');
    var menu = document.getElementById('menu');
    menu.querySelectorAll('li').forEach(function (li, i) { li.firstElementChild.style.setProperty('--i', i); });

    function setMenu(open) {
        body.classList.toggle('menu-open', open);
        menuBtn.setAttribute('aria-expanded', open);
        menuBtn.textContent = open ? 'Close' : 'Menu';
    }
    menuBtn.addEventListener('click', function () { setMenu(!body.classList.contains('menu-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

    // Theme toggle: follows the system until the visitor picks one
    document.querySelector('.theme-toggle').addEventListener('click', function () {
        var current = root.getAttribute('data-theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        var next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
    });

    // Section titles split apart as they rise to the middle of the screen
    var splits = document.querySelectorAll('.split');
    var ticking = false;

    function onScroll() {
        var vh = window.innerHeight;
        splits.forEach(function (el) {
            var r = el.getBoundingClientRect();
            var centre = r.top + r.height / 2;
            var s = Math.min(Math.max((vh - centre) / (vh * 0.5), 0), 1);
            el.style.setProperty('--s', s.toFixed(3));
        });
        ticking = false;
    }

    if (!reduceMotion) {
        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(onScroll);
                ticking = true;
            }
        }, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();
    }

    document.querySelector('.year').textContent = new Date().getFullYear();
})();
