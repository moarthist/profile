// Mahmoud Mohammadi — minimal portfolio & CV
(function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var reveals = document.querySelectorAll('.reveal');

    // Stagger the three intro elements, then fade sections in as they enter
    document.querySelectorAll('.intro .reveal').forEach(function (el, i) {
        el.style.setProperty('--d', (i * 0.12) + 's');
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
        reveals.forEach(function (el) { el.classList.add('in'); });
    } else {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.classList.add('in');
                observer.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        reveals.forEach(function (el) { observer.observe(el); });
    }

    document.querySelector('.cur-year').textContent = new Date().getFullYear();
})();
