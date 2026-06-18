(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    function onScroll() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 10);
    }

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function setSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('mouseenter', function () {
                setSlide(Number(thumb.getAttribute('data-hero-thumb')) || 0);
                stopHero();
            });
            thumb.addEventListener('mouseleave', startHero);
        });

        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                startHero();
            });
        }

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var grid = root.parentElement.querySelector('[data-filter-grid]');
        var input = root.querySelector('[data-filter-input]');
        var category = root.querySelector('[data-category-filter]');
        var year = root.querySelector('[data-year-filter]');
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-search-card], .rank-item'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (input && query) {
            input.value = query;
        }

        function getText(card) {
            return [
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selectedCategory = category ? category.value : '';
            var selectedYear = year ? year.value : '';
            cards.forEach(function (card) {
                var text = getText(card);
                var cardCategory = card.getAttribute('data-category') || '';
                var cardYear = card.getAttribute('data-year') || card.textContent;
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedCategory = !selectedCategory || cardCategory === selectedCategory;
                var matchedYear = !selectedYear || cardYear.indexOf(selectedYear) !== -1;
                card.classList.toggle('is-hidden', !(matchedKeyword && matchedCategory && matchedYear));
            });
        }

        [input, category, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    });
})();
