(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var index = 0;

        var showSlide = function (nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = parseInt(dot.getAttribute('data-slide'), 10);
                showSlide(next);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }
    }

    var normalize = function (value) {
        return (value || '').toString().trim().toLowerCase();
    };

    var filterItems = function (input) {
        var scope = input.closest('main') || document;
        var keyword = normalize(input.value);
        var items = Array.prototype.slice.call(scope.querySelectorAll('.searchable-item'));
        items.forEach(function (item) {
            var title = normalize(item.getAttribute('data-title'));
            var meta = normalize(item.getAttribute('data-meta'));
            var matched = !keyword || title.indexOf(keyword) > -1 || meta.indexOf(keyword) > -1;
            item.classList.toggle('is-hidden', !matched);
        });
    };

    var inlineSearches = Array.prototype.slice.call(document.querySelectorAll('.inline-search'));
    inlineSearches.forEach(function (input) {
        input.addEventListener('input', function () {
            filterItems(input);
        });
    });

    var searchInput = document.querySelector('.search-page-input');
    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            searchInput.value = q;
            filterItems(searchInput);
        }
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.play-cover');
        var started = false;

        var start = function () {
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-stream');
            if (!source) {
                return;
            }
            if (!started) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                video.controls = true;
                started = true;
            }
            if (cover) {
                cover.classList.add('hidden');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };

        if (cover) {
            cover.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!started || video.paused) {
                    start();
                }
            });
        }
    });
})();
