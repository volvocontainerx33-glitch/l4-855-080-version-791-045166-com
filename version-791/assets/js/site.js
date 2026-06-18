document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
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
    start();
  });

  document.querySelectorAll("[data-scroll-button]").forEach(function (button) {
    button.addEventListener("click", function () {
      var target = document.querySelector(button.getAttribute("data-scroll-target"));
      var direction = button.getAttribute("data-scroll-direction") === "left" ? -1 : 1;

      if (target) {
        target.scrollBy({
          left: direction * 420,
          behavior: "smooth"
        });
      }
    });
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-search-input]");
    var region = scope.querySelector("[data-filter-region]");
    var type = scope.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var selectedRegion = region ? region.value : "";
      var selectedType = type ? type.value : "";

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        var regionOk = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
        var typeOk = !selectedType || card.getAttribute("data-type") === selectedType;
        var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;

        card.classList.toggle("is-hidden", !(regionOk && typeOk && keywordOk));
      });
    }

    [input, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var video = player.querySelector("video");
    var start = player.querySelector("[data-play]");
    var stream = player.getAttribute("data-hls");
    var hls = null;
    var loaded = false;

    function loadAndPlay() {
      if (!video || !stream) {
        return;
      }

      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }

        loaded = true;
      }

      video.controls = true;
      player.classList.add("is-playing");
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (start) {
      start.addEventListener("click", loadAndPlay);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          loadAndPlay();
        }
      });
    }
  });
});
