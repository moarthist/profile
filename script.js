// Mahmoud Mohammadi — portfolio & CV
(function () {
    var body = document.body;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Hero load-in, line by line
    document.querySelectorAll('.hero .line > span').forEach(function (el, i) {
        el.style.setProperty('--d', (0.1 + i * 0.08) + 's');
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add('loaded'); }); });
    setTimeout(function () { body.classList.add('loaded'); }, 800);

    // Approach: words light up as you scroll through
    var approach = document.querySelector('.approach-text');
    approach.setAttribute('aria-label', approach.textContent.trim());
    approach.innerHTML = approach.textContent.trim().split(/\s+/).map(function (w) {
        return '<span class="w" aria-hidden="true">' + w + '</span>';
    }).join(' ');
    var words = approach.querySelectorAll('.w');

    function onScroll() {
        var vh = window.innerHeight;
        var r = approach.getBoundingClientRect();
        var p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
        var lit = Math.round(p * words.length);
        words.forEach(function (w, i) { w.classList.toggle('on', i < lit); });
    }
    if (reduceMotion) {
        words.forEach(function (w) { w.classList.add('on'); });
    } else {
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) { requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; }
        }, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();
    }

    // Reveal blocks as they enter, staggering siblings
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        var observer = new IntersectionObserver(function (entries) {
            entries.filter(function (e) { return e.isIntersecting; }).forEach(function (e, i) {
                e.target.style.setProperty('--delay', (i * 0.08) + 's');
                e.target.classList.add('in');
                observer.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        reveals.forEach(function (el) { observer.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('in'); });
    }

    // Underline the nav item of the section in view
    var links = {};
    document.querySelectorAll('.nav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    function setActive(id) { Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === id); }); }
    if ('IntersectionObserver' in window) {
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
        }, { rootMargin: '-45% 0px -50% 0px' });
        ['fields', 'about', 'cv', 'contact'].forEach(function (id) { navObserver.observe(document.getElementById(id)); });
    }
    var fields = document.getElementById('fields');
    window.addEventListener('scroll', function () {
        if (window.scrollY < fields.offsetTop - window.innerHeight / 2) setActive('top');
    }, { passive: true });

    // Live Paris time and UTC offset in the footer
    var clock = document.querySelector('.clock');
    var zone = document.querySelector('.zone');
    function tick() {
        try {
            var now = new Date();
            clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' }).format(now);
            var part = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', timeZoneName: 'shortOffset' })
                .formatToParts(now).filter(function (p) { return p.type === 'timeZoneName'; })[0];
            if (part) zone.textContent = part.value.replace('GMT', 'UTC');
        } catch (e) {}
    }
    tick();
    setInterval(tick, 15000);
})();
