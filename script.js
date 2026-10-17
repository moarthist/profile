// Mahmoud Mohammadi — portfolio & CV
(function () {
    var body = document.body;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Loader: count to 100%, then wipe away
    var count = document.querySelector('.loader-count');
    var started = false;
    function start() {
        if (started) return;
        started = true;
        count.textContent = '100%';
        body.classList.add('loaded');
    }
    if (reduceMotion) {
        start();
    } else {
        var t0 = null;
        (function tick(now) {
            if (started) return;
            if (t0 === null) t0 = now;
            var p = Math.min((now - t0) / 1000, 1);
            count.textContent = Math.round(p * p * (3 - 2 * p) * 100) + '%';
            if (p < 1) requestAnimationFrame(tick); else setTimeout(start, 150);
        })(performance.now());
        setTimeout(start, 2500);
    }

    // Letter roll: duplicate each letter so it can slide up on hover
    document.querySelectorAll('.roll').forEach(function (el) {
        var text = el.textContent;
        el.setAttribute('aria-label', text);
        el.innerHTML = text.split('').map(function (c, i) {
            var ch = c === ' ' ? '&nbsp;' : c.replace(/[<>&]/g, '');
            return '<span class="ch" style="--i:' + i + '" aria-hidden="true"><span>' + ch + '</span><span>' + ch + '</span></span>';
        }).join('');
    });

    // Statements: split into words (and letters for the scattered one)
    var statements = document.querySelectorAll('.statement');
    statements.forEach(function (el) {
        var words = el.textContent.trim().split(/\s+/);
        el.setAttribute('aria-label', el.textContent.trim());
        var k = 0;
        el.innerHTML = words.map(function (w) {
            if (!el.classList.contains('scatter')) return '<span class="w" aria-hidden="true">' + w + '</span>';
            var letters = w.split('').map(function (c) {
                var x = (Math.random() * 2 - 1) * 60, y = (Math.random() * 2 - 1) * 90 + 40, r = (Math.random() * 2 - 1) * 70;
                return '<span class="c" style="--x:' + x.toFixed(0) + 'vw;--y:' + y.toFixed(0) + 'vh;--r:' + r.toFixed(0) + 'deg;--k:' + (k++) + '">' + c + '</span>';
            }).join('');
            return '<span class="w" aria-hidden="true">' + letters + '</span>';
        }).join(' ');
    });

    // Scroll effects: hero title slides sideways, statement words light up
    var heroTitle = document.querySelector('.hero-title span');
    function onScroll() {
        var vh = window.innerHeight;
        var overflow = heroTitle.scrollWidth - document.documentElement.clientWidth * 0.9;
        if (overflow > 0) heroTitle.style.setProperty('--tx', (-Math.min(window.scrollY * 0.5, overflow)).toFixed(1) + 'px');

        statements.forEach(function (el) {
            var r = el.getBoundingClientRect();
            var p = Math.min(Math.max((vh * 0.8 - r.top) / (r.height + vh * 0.3), 0), 1);
            var ws = el.querySelectorAll('.w');
            var lit = Math.max(1, Math.round(p * ws.length));
            ws.forEach(function (w, i) { w.classList.toggle('on', i < lit); });
        });
    }
    if (!reduceMotion) {
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) { requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; }
        }, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();
    } else {
        document.querySelectorAll('.statement .w').forEach(function (w) { w.classList.add('on'); });
    }

    // Reveal blocks and assemble the scattered statement when they enter
    var targets = document.querySelectorAll('.reveal, .scatter, .col, .sec-head');
    document.querySelectorAll('.col, .sec-head').forEach(function (el) { el.classList.add('reveal'); });
    if ('IntersectionObserver' in window && !reduceMotion) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (e, i) {
                if (!e.isIntersecting) return;
                e.target.style.transitionDelay = (i * 0.08) + 's';
                e.target.classList.add('in');
                observer.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px -12% 0px' });
        targets.forEach(function (el) { observer.observe(el); });
    } else {
        targets.forEach(function (el) { el.classList.add('in'); });
    }

    // Live Paris time with its GMT offset
    var clock = document.querySelector('.clock');
    function tickClock() {
        try {
            var now = new Date();
            var time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' }).format(now);
            var zone = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', timeZoneName: 'shortOffset' })
                .formatToParts(now).filter(function (p) { return p.type === 'timeZoneName'; })[0];
            clock.textContent = '(' + (zone ? zone.value : 'CET') + ') ' + time;
        } catch (e) {}
    }
    tickClock();
    setInterval(tickClock, 15000);

    document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
