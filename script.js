// Mahmoud Mohammadi — portfolio & CV
(function () {
    var body = document.body;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Split the headline into letters so they can fade in one by one
    var headline = document.querySelector('.split-chars');
    headline.setAttribute('aria-label', headline.textContent.replace(/\s+/g, ' ').trim());
    var index = 0;
    (function wrap(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
            if (child.nodeType === 3) {
                var frag = document.createDocumentFragment();
                child.textContent.split(/(\s+)/).forEach(function (part) {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
                    var word = document.createElement('span');
                    word.style.whiteSpace = 'nowrap';
                    word.setAttribute('aria-hidden', 'true');
                    part.split('').forEach(function (c) {
                        var ch = document.createElement('span');
                        ch.className = 'ch';
                        ch.style.setProperty('--i', index++);
                        ch.textContent = c;
                        word.appendChild(ch);
                    });
                    frag.appendChild(word);
                });
                node.replaceChild(frag, child);
            } else if (child.nodeType === 1) {
                wrap(child);
            }
        });
    })(headline);

    requestAnimationFrame(function () {
        body.classList.add('loaded');
        headline.classList.add('in');
    });
    // Fallback in case frames are throttled (background tabs)
    setTimeout(function () { body.classList.add('loaded'); headline.classList.add('in'); }, 600);

    // Live date and time in Paris, like a gallery wall clock
    var clock = document.querySelector('.clock');
    function tick() {
        try {
            var now = new Date();
            var date = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', day: 'numeric', month: 'short' }).format(now);
            var time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' }).format(now);
            clock.textContent = date + ' — ' + time + ' Paris, FR';
        } catch (e) {}
    }
    tick();
    setInterval(tick, 30000);

    // Reveal blocks as they enter, staggering siblings
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        var observer = new IntersectionObserver(function (entries) {
            entries.filter(function (e) { return e.isIntersecting; }).forEach(function (e, i) {
                e.target.style.setProperty('--delay', (i * 0.06) + 's');
                e.target.classList.add('in');
                observer.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        reveals.forEach(function (el) { observer.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('in'); });
    }

    // Highlight the nav item of the section in view
    var links = {};
    document.querySelectorAll('.nav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    function setActive(id) {
        Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === id); });
    }
    if ('IntersectionObserver' in window) {
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting && links[e.target.id]) setActive(e.target.id); });
        }, { rootMargin: '-45% 0px -50% 0px' });
        Object.keys(links).forEach(function (id) {
            var el = document.getElementById(id);
            if (el && id !== 'top') navObserver.observe(el);
        });
    }
    var info = document.getElementById('info');
    window.addEventListener('scroll', function () {
        if (window.scrollY < info.offsetTop - window.innerHeight / 2) setActive('top');
    }, { passive: true });

    document.querySelector('.year').textContent = new Date().getFullYear();
})();
