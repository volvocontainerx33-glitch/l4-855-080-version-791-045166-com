(function () {
    'use strict';

    var root = document.documentElement;

    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initHeader() {
        var header = qs('[data-sticky-header]');
        var toggle = qs('[data-menu-toggle]');
        var menu = qs('[data-mobile-menu]');

        function onScroll() {
            if (!header) {
                return;
            }
            header.classList.toggle('is-scrolled', window.scrollY > 10);
        }

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                menu.classList.toggle('is-open');
                document.body.classList.toggle('menu-open', menu.classList.contains('is-open'));
            });
        }
    }

    function initHero() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = qsa('.hero-slide', slider);
        var dots = qsa('[data-hero-dot]', slider);
        var prev = qs('[data-hero-prev]', slider);
        var next = qs('[data-hero-next]', slider);
        var current = 0;
        var timer = null;

        function show(index) {
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
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initLocalFilters() {
        qsa('.js-filter-scope').forEach(function (scope) {
            var input = qs('.js-local-search', scope);
            var category = qs('.js-category-filter', scope);
            var year = qs('.js-year-filter', scope);
            var sort = qs('.js-sort-select', scope);
            var reset = qs('.js-filter-reset', scope);
            var container = qs('.js-card-container', scope);
            var count = qs('[data-filter-count]', scope);

            if (!container) {
                return;
            }

            var cards = qsa('.js-movie-card', container);
            var initialCards = cards.slice();

            function selectedYearMatches(cardYear, selected) {
                if (!selected) {
                    return true;
                }
                if (selected === '2018') {
                    return Number(cardYear) <= 2018;
                }
                return String(cardYear) === selected;
            }

            function apply() {
                var query = normalize(input && input.value);
                var selectedCategory = category ? category.value : '';
                var selectedYear = year ? year.value : '';
                var visible = [];

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesCategory = !selectedCategory || card.getAttribute('data-category') === selectedCategory;
                    var matchesYear = selectedYearMatches(card.getAttribute('data-year'), selectedYear);
                    var ok = matchesQuery && matchesCategory && matchesYear;
                    card.classList.toggle('is-hidden-by-filter', !ok);
                    if (ok) {
                        visible.push(card);
                    }
                });

                if (sort) {
                    var sorted = visible.slice();
                    if (sort.value === 'views-desc') {
                        sorted.sort(function (a, b) {
                            return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
                        });
                    } else if (sort.value === 'year-desc') {
                        sorted.sort(function (a, b) {
                            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                        });
                    } else if (sort.value === 'title-asc') {
                        sorted.sort(function (a, b) {
                            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
                        });
                    } else {
                        sorted = initialCards.filter(function (card) {
                            return visible.indexOf(card) !== -1;
                        });
                    }
                    sorted.forEach(function (card) {
                        container.appendChild(card);
                    });
                }

                if (count) {
                    count.textContent = '当前显示 ' + visible.length + ' 部影片 / 共 ' + cards.length + ' 部';
                }
            }

            [input, category, year, sort].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (category) {
                        category.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (sort) {
                        sort.value = 'default';
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function createMovieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<article class="movie-card">' +
            '    <a class="poster-frame" href="' + escapeHtml(movie.url) + '">' +
            '        <img src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
            '        <span class="quality-badge">HD</span>' +
            '        <span class="duration-badge">' + escapeHtml(movie.duration) + '</span>' +
            '    </a>' +
            '    <div class="card-body">' +
            '        <div class="card-meta"><a href="category-' + escapeHtml(movie.category) + '.html">' + escapeHtml(movie.categoryName) + '</a><span>' + escapeHtml(movie.year) + '</span></div>' +
            '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
            '        <p>' + escapeHtml(movie.oneLine || movie.genre || movie.region) + '</p>' +
            '        <div class="tag-row">' + tags + '</div>' +
            '        <div class="card-foot"><span>' + escapeHtml(movie.region) + '</span><span>' + Number(movie.views).toLocaleString() + ' 热度</span></div>' +
            '    </div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var page = qs('[data-search-page]');
        if (!page || !window.MOVIES_DATA) {
            return;
        }

        var input = qs('[data-search-input]', page);
        var summary = qs('[data-search-summary]', page);
        var results = qs('[data-search-results]', page);
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input) {
            input.value = query;
        }

        function render() {
            var value = normalize(input && input.value);
            var matches = window.MOVIES_DATA.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.categoryName,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' '));
                return !value || text.indexOf(value) !== -1;
            });

            matches.sort(function (a, b) {
                return Number(b.views) - Number(a.views);
            });

            if (summary) {
                summary.textContent = value ? '关键词“' + value + '”共找到 ' + matches.length + ' 部影片。' : '请输入关键词，或直接浏览全部 ' + matches.length + ' 部影片。';
            }

            if (results) {
                results.innerHTML = matches.slice(0, 240).map(createMovieCard).join('');
            }
        }

        if (input) {
            input.addEventListener('input', render);
        }
        render();
    }

    function initPlayers() {
        qsa('[data-player]').forEach(function (panel) {
            var video = qs('video', panel);
            var button = qs('[data-play-button]', panel);
            var message = qs('[data-player-message]', panel);
            var source = panel.getAttribute('data-video-url');
            var hlsInstance = null;

            function setMessage(text) {
                if (message) {
                    message.textContent = text || '';
                }
            }

            function playVideo() {
                if (!video || !source) {
                    setMessage('未找到可用线路。');
                    return;
                }

                setMessage('正在加载线路...');

                if (window.Hls && window.Hls.isSupported()) {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setMessage('');
                        video.play().catch(function () {
                            setMessage('已加载，请点击播放器继续播放。');
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('线路加载异常，请稍后重试。');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        setMessage('');
                        video.play().catch(function () {
                            setMessage('已加载，请点击播放器继续播放。');
                        });
                    }, { once: true });
                } else {
                    setMessage('当前浏览器暂不支持此线路播放，请允许播放脚本加载或更换浏览器。');
                }

                if (button) {
                    button.classList.add('is-hidden');
                }
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHeader();
        initHero();
        initLocalFilters();
        initSearchPage();
        initPlayers();
    });
})();
