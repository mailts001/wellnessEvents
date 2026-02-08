// ===== HOME PAGE PHOTO + VIDEO MONTAGE =====
const montageContainer = document.getElementById("montage-container");

if (montageContainer) {
  fetch('./media/media.json')
    .then(res => res.json())
    .then(mediaList => {

      if (!mediaList || mediaList.length === 0) return;

      let index = 0;
      let timeoutId = null;

      function nextIndex() {
        index = (index + 1) % mediaList.length;
      }

      function clearTimers() {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }

      function playNext() {
        clearTimers();
        montageContainer.innerHTML = '';

        const item = mediaList[index];
        let el;

        // ---------- VIDEO ----------
        if (item.type === "video") {

          el = document.createElement('video');
          el.src = item.src;
          el.autoplay = true;
          el.muted = true;
          el.playsInline = true;
          el.controls = false;
          el.preload = "auto";

          // RESPONSIVE FULL SCREEN
          el.style.width = "100%";
          el.style.height = "100vh";
          el.style.objectFit = "contain";   // prevents bottom cutoff
          el.style.background = "black";

          // When video finishes normally
          el.onended = () => {
            nextIndex();
            playNext();
          };

          // If autoplay blocked OR video error → skip after 4s
          el.onerror = el.onstalled = () => {
            timeoutId = setTimeout(() => {
              nextIndex();
              playNext();
            }, 4000);
          };

          // If mobile blocks autoplay, force play
          el.oncanplay = () => {
            const promise = el.play();
            if (promise !== undefined) {
              promise.catch(() => {
                timeoutId = setTimeout(() => {
                  nextIndex();
                  playNext();
                }, 4000);
              });
            }
          };
        }

        // ---------- IMAGE ----------
        else {

          el = document.createElement('img');
          el.src = item.src;

          el.style.width = "100%";
          el.style.height = "100vh";
          el.style.objectFit = "contain";
          el.style.background = "black";

          timeoutId = setTimeout(() => {
            nextIndex();
            playNext();
          }, 3500);
        }

        montageContainer.appendChild(el);
      }

      playNext();
    })
    .catch(err => console.error("Failed to load media.json:", err));
}
