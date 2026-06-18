(function () {
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  if (slides.length > 0) {
    var active = 0;
    var showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('active', pos === active);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('active', pos === active);
      });
    };
    dots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        showSlide(pos);
      });
    });
    showSlide(0);
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var input = filterForm.querySelector('[name="keyword"]');
    var year = filterForm.querySelector('[name="year"]');
    var type = filterForm.querySelector('[name="type"]');
    var empty = document.querySelector('.empty-state');
    var runFilter = function () {
      var keywordValue = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      var shown = 0;
      cards.forEach(function (card) {
        var matchedKeyword = !keywordValue || card.getAttribute('data-search').indexOf(keywordValue) !== -1;
        var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchedType = !typeValue || card.getAttribute('data-type').indexOf(typeValue) !== -1;
        var visible = matchedKeyword && matchedYear && matchedType;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.style.display = shown === 0 ? 'block' : 'none';
      }
    };
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runFilter();
    });
    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runFilter);
        control.addEventListener('change', runFilter);
      }
    });
    var params = new URLSearchParams(window.location.search);
    if (params.get('q') && input) {
      input.value = params.get('q');
    }
    runFilter();
  }
})();

function bindMoviePlayer(videoId, layerId, src) {
  var video = document.getElementById(videoId);
  var layer = document.getElementById(layerId);
  if (!video || !layer || !src) {
    return;
  }
  var loaded = false;
  var begin = function () {
    layer.classList.add('hidden');
    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      loaded = true;
    }
    var playResult = video.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(function () {});
    }
  };
  layer.addEventListener('click', begin);
}
