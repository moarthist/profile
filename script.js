// Mahmoud Mohammadi — portfolio & CV
(function () {
    var root = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.add('js');

    // Theme toggle: follows the system until the visitor picks one
    var toggle = document.querySelector('.theme-toggle');
    toggle.addEventListener('click', function () {
        var current = root.getAttribute('data-theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        var next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
    });

    // Reveal on scroll, staggering siblings that enter together
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        var observer = new IntersectionObserver(function (entries) {
            var batch = entries.filter(function (e) { return e.isIntersecting; });
            batch.forEach(function (e, i) {
                e.target.style.setProperty('--delay', (i * 0.08) + 's');
                e.target.classList.add('in');
                observer.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
        reveals.forEach(function (el) { observer.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('in'); });
    }

    // Highlight the nav link of the section in view
    var links = {};
    document.querySelectorAll('.nav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    if ('IntersectionObserver' in window) {
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                var link = links[e.target.id];
                if (link && e.isIntersecting) {
                    Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
                    link.classList.add('active');
                }
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(links).forEach(function (id) {
            var section = document.getElementById(id);
            if (section) navObserver.observe(section);
        });
    }

    // Scroll progress bar, top-bar rule and a gentle portrait parallax
    var progress = document.querySelector('.progress');
    var topbar = document.querySelector('.topbar');
    var portrait = document.querySelector('.arch img');
    var ticking = false;

    function onScroll() {
        var y = window.scrollY;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
        topbar.style.setProperty('--scrolled', y > 8 ? 1 : 0);
        if (y < document.getElementById('about').offsetTop - window.innerHeight / 2) {
            Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
        }
        if (!reduceMotion && portrait && y < window.innerHeight) {
            portrait.style.setProperty('--shift', (y * 0.08).toFixed(1) + 'px');
        }
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });
    onScroll();

    document.querySelector('.year').textContent = new Date().getFullYear();
})();
