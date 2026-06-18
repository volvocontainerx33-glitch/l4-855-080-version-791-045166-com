(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initHeader() {
    var header = document.querySelector("[data-site-header]");
    if (!header) {
      return;
    }

    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function textMatches(card, query) {
    if (!query) {
      return true;
    }

    var haystack = [
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags")
    ].join(" ").toLowerCase();

    return haystack.indexOf(query.toLowerCase()) !== -1;
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length) {
      return;
    }

    var input = document.querySelector("[data-filter-input]");
    var category = document.querySelector("[data-category-filter]");
    var year = document.querySelector("[data-year-filter]");
    var count = document.querySelector("[data-filter-count]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function applyFilters() {
      var query = input ? input.value.trim() : "";
      var categoryValue = category ? category.value : "";
      var yearValue = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var ok = textMatches(card, query);
        if (ok && categoryValue) {
          ok = card.getAttribute("data-category") === categoryValue;
        }
        if (ok && yearValue) {
          ok = card.getAttribute("data-year") === yearValue;
        }

        card.classList.toggle("is-filter-hidden", !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "显示 " + visible + " / " + cards.length + " 部";
      }
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }

  function initPlayer() {
    var video = document.querySelector("[data-video-src]");
    var button = document.querySelector("[data-player-button]");
    var status = document.querySelector("[data-player-status]");
    if (!video || !button) {
      return;
    }

    var source = video.getAttribute("data-video-src");
    var hlsInstance = null;
    var isLoaded = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message || "";
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
          button.classList.remove("is-hidden");
        });
      }
    }

    function loadSource() {
      if (isLoaded) {
        playVideo();
        return;
      }

      setStatus("正在加载播放源...");

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          isLoaded = true;
          setStatus("播放源加载完成。");
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus("播放源暂时无法加载，请刷新页面或更换浏览器重试。");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          isLoaded = true;
          setStatus("播放源加载完成。");
          playVideo();
        }, { once: true });
        video.load();
      } else {
        setStatus("当前浏览器需要联网加载 HLS.js 后播放 m3u8。请检查网络或使用支持 HLS 的浏览器。");
      }
    }

    button.addEventListener("click", function () {
      button.classList.add("is-hidden");
      loadSource();
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initHeader();
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initPlayer();
  });
})();
