(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('.js-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        if (value) {
          event.preventDefault();
          window.location.href = './search.html?q=' + encodeURIComponent(value);
        }
      });
    });

    initHero();
    initFilters();
    initPlayer();
  });

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    if (!slides.length) {
      return;
    }
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var prev = document.querySelector('.hero-control-left');
    var next = document.querySelector('.hero-control-right');
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    start();
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card'));
    if (!cards.length) {
      return;
    }

    var keyword = document.querySelector('.js-filter-input');
    var type = document.querySelector('.js-filter-type');
    var year = document.querySelector('.js-filter-year');
    var category = document.querySelector('.js-filter-category');
    var count = document.querySelector('.js-visible-count');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');

    if (initial && keyword) {
      keyword.value = initial;
    }

    function filter() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var selectedType = type ? type.value : '';
      var selectedYear = year ? year.value : '';
      var selectedCategory = category ? category.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-index') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var match = true;

        if (q && text.indexOf(q) === -1) {
          match = false;
        }
        if (selectedType && cardType !== selectedType) {
          match = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          match = false;
        }
        if (selectedCategory && cardCategory !== selectedCategory) {
          match = false;
        }

        card.classList.toggle('is-hidden', !match);
        if (match) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [keyword, type, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filter);
        control.addEventListener('change', filter);
      }
    });

    filter();
  }

  function initPlayer() {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('.player-overlay');
    if (!video || !overlay || typeof PLAY_SRC === 'undefined') {
      return;
    }

    var hlsInstance = null;

    function attach() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.getAttribute('src') !== PLAY_SRC) {
          video.setAttribute('src', PLAY_SRC);
        }
        video.play();
        return;
      }

      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(PLAY_SRC);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else {
          video.play();
        }
        return;
      }

      if (video.getAttribute('src') !== PLAY_SRC) {
        video.setAttribute('src', PLAY_SRC);
      }
      video.play();
    }

    function start() {
      overlay.classList.add('is-hidden');
      attach();
    }

    overlay.addEventListener('click', start);
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
  }
})();
