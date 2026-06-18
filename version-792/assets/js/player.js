document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var start = player.querySelector("[data-start-play]");
    var status = player.querySelector("[data-player-status]");
    var hlsInstance = null;

    if (!video || !start) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function playVideo() {
      var stream = video.getAttribute("data-stream");

      if (!stream) {
        setStatus("暂无可播放内容");
        return;
      }

      start.classList.add("is-hidden");
      setStatus("正在加载影片");

      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.play().then(function () {
          setStatus("播放中");
        }).catch(function () {
          start.classList.remove("is-hidden");
          setStatus("点击继续播放");
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().then(function () {
            setStatus("播放中");
          }).catch(function () {
            start.classList.remove("is-hidden");
            setStatus("点击继续播放");
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            start.classList.remove("is-hidden");
            setStatus("播放失败，请稍后重试");
          }
        });
        return;
      }

      video.src = stream;
      video.play().then(function () {
        setStatus("播放中");
      }).catch(function () {
        start.classList.remove("is-hidden");
        setStatus("点击继续播放");
      });
    }

    start.addEventListener("click", playVideo);

    video.addEventListener("play", function () {
      start.classList.add("is-hidden");
      setStatus("播放中");
    });

    video.addEventListener("pause", function () {
      setStatus("已暂停");
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
  });
});
