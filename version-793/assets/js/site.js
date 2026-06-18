(function () {
  const button = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-mobile-menu]");

  if (button && menu) {
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    let index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const target = Number(dot.getAttribute("data-hero-target") || 0);
        show(target);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }
  }

  const filter = document.querySelector("[data-filter]");
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  const empty = document.querySelector("[data-empty]");

  if (filter && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";

    if (filter.hasAttribute("data-query-sync") && query) {
      filter.value = query;
    }

    function applyFilter() {
      const value = filter.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(function (card) {
        const text = (card.getAttribute("data-search") || "").toLowerCase();
        const matched = !value || text.indexOf(value) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    filter.addEventListener("input", applyFilter);
    applyFilter();
  }
})();
