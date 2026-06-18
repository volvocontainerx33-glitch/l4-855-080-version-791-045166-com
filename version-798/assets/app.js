(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) return;
    button.addEventListener("click", function () {
      menu.classList.toggle("hidden");
      button.setAttribute("aria-expanded", menu.classList.contains("hidden") ? "false" : "true");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero]");
    if (!carousel) return;
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    if (slides.length < 2) return;
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    function restart() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initFilters() {
    var list = document.querySelector("[data-filter-list]");
    if (!list) return;
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var controls = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var status = document.querySelector("[data-filter-status]");

    function apply() {
      var values = {};
      controls.forEach(function (control) {
        values[control.getAttribute("data-filter")] = control.value;
      });
      var visible = 0;
      cards.forEach(function (card) {
        var ok = true;
        Object.keys(values).forEach(function (key) {
          if (values[key] && card.getAttribute("data-" + key) !== values[key]) ok = false;
        });
        card.classList.toggle("hidden-by-filter", !ok);
        if (ok) visible += 1;
      });
      if (status) status.textContent = "当前显示 " + visible + " 部作品";
    }

    controls.forEach(function (control) {
      control.addEventListener("change", apply);
    });
    apply();
  }

  function cardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">' + escapeHtml(tag) + '</span>';
    }).join("");
    return '<a href="./' + movie.url + '" class="movie-card group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">' +
      '<div class="relative overflow-hidden" style="padding-top:56.25%">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" class="absolute top-0 left-0 w-full h-full object-cover">' +
      '<span class="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">' + escapeHtml(movie.year) + '</span>' +
      '</div>' +
      '<div class="p-4">' +
      '<h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors">' + escapeHtml(movie.title) + '</h3>' +
      '<p class="text-sm text-gray-600 line-clamp-2 mb-3">' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="flex flex-wrap gap-2 mb-3">' + tags + '</div>' +
      '<div class="flex items-center justify-between text-xs text-gray-500"><span>' + escapeHtml(movie.region) + '</span><span class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded">' + escapeHtml(movie.category) + '</span></div>' +
      '</div>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[ch];
    });
  }

  function initSearch() {
    var list = document.querySelector("[data-search-list]");
    if (!list || typeof MOVIES_INDEX === "undefined") return;
    var input = document.querySelector("[data-search-input]");
    var type = document.querySelector("[data-search-type]");
    var region = document.querySelector("[data-search-region]");
    var year = document.querySelector("[data-search-year]");
    var status = document.querySelector("[data-search-status]");
    var params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) input.value = params.get("q");

    function render() {
      var q = (input && input.value ? input.value : "").trim().toLowerCase();
      var t = type ? type.value : "";
      var r = region ? region.value : "";
      var y = year ? year.value : "";
      var results = MOVIES_INDEX.filter(function (movie) {
        var text = [movie.title, movie.oneLine, movie.genre, movie.region, movie.type, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        return (!q || text.indexOf(q) !== -1) && (!t || movie.type === t) && (!r || movie.region === r) && (!y || movie.year === y);
      }).slice(0, 120);
      list.innerHTML = results.length ? results.map(cardHtml).join("") : '<div class="search-empty bg-white rounded-xl shadow-sm">没有找到匹配的影片，换个关键词继续搜索。</div>';
      if (status) status.textContent = "当前显示 " + results.length + " 部作品";
    }

    [input, type, region, year].forEach(function (control) {
      if (!control) return;
      var eventName = control.tagName === "INPUT" ? "input" : "change";
      control.addEventListener(eventName, render);
    });
    render();
  }

  function initPlayer() {
    var video = document.querySelector("[data-player]");
    if (!video) return;
    var startButton = document.querySelector("[data-player-start]");
    var sourceElement = video.querySelector("source");
    var streamUrl = sourceElement ? sourceElement.getAttribute("src") : "";
    var hlsInstance = null;

    function prepare() {
      if (video.getAttribute("data-ready") === "1") return;
      if (streamUrl && video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (streamUrl && window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else if (streamUrl) {
        video.src = streamUrl;
      }
      video.setAttribute("data-ready", "1");
    }

    function play() {
      prepare();
      if (startButton) startButton.classList.add("is-hidden");
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (startButton) {
      startButton.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.getAttribute("data-ready") !== "1") play();
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearch();
    initPlayer();
  });
})();
