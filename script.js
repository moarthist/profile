// Mahmoud Mohammadi — portfolio & CV
(function () {
    var body = document.body;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Hero load-in
    document.querySelectorAll('.hero-nav a').forEach(function (a, i) { a.style.setProperty('--i', i); });
    requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add('loaded'); }); });
    setTimeout(function () { body.classList.add('loaded'); }, 800);

    // Manifesto: words fill in from pale to black as you scroll
    var manifesto = document.querySelector('.manifesto-text');
    var words = manifesto.textContent.trim().split(/\s+/);
    manifesto.setAttribute('aria-label', manifesto.textContent.trim());
    manifesto.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w + '</span>'; }).join(' ');
    var wordEls = manifesto.querySelectorAll('.w');

    // Fields: highlight the index entry of the panel in view
    var panels = document.querySelectorAll('.panel');
    var indexItems = document.querySelectorAll('.fields-index li');

    function onScroll() {
        var vh = window.innerHeight;

        var r = manifesto.getBoundingClientRect();
        var p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
        var lit = Math.round(p * wordEls.length);
        wordEls.forEach(function (w, i) { w.classList.toggle('on', i < lit); });

        var active = 0;
        panels.forEach(function (panel, i) {
            var pr = panel.getBoundingClientRect();
            if (pr.top < vh * 0.5) active = i;
        });
        indexItems.forEach(function (li, i) { li.classList.toggle('active', i === active); });
    }

    if (reduceMotion) {
        wordEls.forEach(function (w) { w.classList.add('on'); });
    } else {
        var ticking = false;
        window.addEventListener('scroll', function () {
            if (!ticking) { requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; }
        }, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();
    }

    // Reveal blocks as they enter
    var reveals = document.querySelectorAll('.fields-side .big, .panel, .statement span, .cv-title, .group, .contact .big, .contact-row');
    reveals.forEach(function (el) { el.classList.add('reveal'); });
    if ('IntersectionObserver' in window && !reduceMotion) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); }
            });
        }, { rootMargin: '0px 0px -10% 0px' });
        reveals.forEach(function (el) { observer.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('in'); });
    }

    // Typewriter line in the contact section
    var typer = document.querySelector('.typer-text');
    var phrases = ["Let's talk museums", "Let's talk Persian art", "Or just say salam"];
    if (!reduceMotion) {
        var pi = 0, ci = phrases[0].length, deleting = true;
        setTimeout(function step() {
            var phrase = phrases[pi];
            if (deleting) {
                ci--;
                if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
            } else {
                ci++;
            }
            typer.textContent = phrases[pi].slice(0, ci);
            var delay = deleting ? 45 : 85;
            if (!deleting && ci === phrases[pi].length) { deleting = true; delay = 2200; }
            setTimeout(step, delay);
        }, 2600);
    }

    // Live Paris time in the footer
    var clock = document.querySelector('.clock');
    function tick() {
        try {
            clock.textContent = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Europe/Paris', hour: 'numeric', minute: '2-digit', second: '2-digit'
            }).format(new Date());
        } catch (e) {}
    }
    tick();
    setInterval(tick, 1000);

    var year = String(new Date().getFullYear());
    document.querySelectorAll('.year').forEach(function (el) { el.textContent = year; });
})();
