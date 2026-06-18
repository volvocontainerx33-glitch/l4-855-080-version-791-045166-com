document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  setupHero();
  setupFilters();
  setupScrollRows();
});

function setupHero() {
  var hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  var prev = hero.querySelector("[data-hero-prev]");
  var next = hero.querySelector("[data-hero-next]");
  var index = 0;
  var timer = null;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(function () {
      showSlide(index + 1);
    }, 5000);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (prev) {
    prev.addEventListener("click", function () {
      showSlide(index - 1);
      startTimer();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(index + 1);
      startTimer();
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      showSlide(dotIndex);
      startTimer();
    });
  });

  hero.addEventListener("mouseenter", stopTimer);
  hero.addEventListener("mouseleave", startTimer);
  showSlide(0);
  startTimer();
}

function setupFilters() {
  var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

  scopes.forEach(function (scope) {
    var form = scope.querySelector("[data-search-form]");

    if (!form) {
      return;
    }

    var keyword = form.querySelector("[data-filter-keyword]");
    var type = form.querySelector("[data-filter-type]");
    var year = form.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
    var empty = scope.querySelector("[data-empty-state]");

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function yearMatches(cardYear, selected) {
      var numericYear = Number(cardYear || 0);

      if (!selected) {
        return true;
      }

      if (selected === "2024plus") {
        return numericYear >= 2024;
      }

      if (selected === "2020-2023") {
        return numericYear >= 2020 && numericYear <= 2023;
      }

      if (selected === "before2020") {
        return numericYear < 2020;
      }

      return true;
    }

    function applyFilters() {
      var words = normalize(keyword && keyword.value);
      var selectedType = normalize(type && type.value);
      var selectedYear = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(" "));
        var cardType = normalize(card.dataset.type);
        var matchesWords = !words || haystack.indexOf(words) !== -1;
        var matchesType = !selectedType || cardType.indexOf(selectedType) !== -1;
        var matchesYear = yearMatches(card.dataset.year, selectedYear);
        var isVisible = matchesWords && matchesType && matchesYear;

        card.hidden = !isVisible;

        if (isVisible) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    form.addEventListener("input", applyFilters);
    form.addEventListener("change", applyFilters);
    form.addEventListener("reset", function () {
      window.setTimeout(applyFilters, 0);
    });

    applyFilters();
  });
}

function setupScrollRows() {
  var leftButtons = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-left]"));
  var rightButtons = Array.prototype.slice.call(document.querySelectorAll("[data-scroll-right]"));

  leftButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var target = document.getElementById(button.getAttribute("data-scroll-left"));

      if (target) {
        target.scrollBy({ left: -420, behavior: "smooth" });
      }
    });
  });

  rightButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var target = document.getElementById(button.getAttribute("data-scroll-right"));

      if (target) {
        target.scrollBy({ left: 420, behavior: "smooth" });
      }
    });
  });
}
