(function () {
    function initPlayer(card) {
        var video = card.querySelector('video');
        var overlay = card.querySelector('.player-overlay');
        if (!video || !overlay) {
            return;
        }

        var source = video.getAttribute('data-src');
        var hlsInstance = null;
        var loadingPromise = null;

        function loadVideo() {
            if (!source) {
                return Promise.resolve();
            }
            if (video.getAttribute('data-ready') === 'true') {
                return Promise.resolve();
            }
            if (loadingPromise) {
                return loadingPromise;
            }

            loadingPromise = new Promise(function (resolve) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.setAttribute('data-ready', 'true');
                    resolve();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.setAttribute('data-ready', 'true');
                        resolve();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                            video.src = source;
                            video.setAttribute('data-ready', 'true');
                            resolve();
                        }
                    });
                    return;
                }

                video.src = source;
                video.setAttribute('data-ready', 'true');
                resolve();
            });

            return loadingPromise;
        }

        function startPlayback(event) {
            if (event) {
                event.preventDefault();
            }
            overlay.classList.add('is-hidden');
            video.controls = true;
            loadVideo().then(function () {
                var playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {
                        overlay.classList.remove('is-hidden');
                    });
                }
            });
        }

        overlay.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.js-player').forEach(initPlayer);
    });
})();
