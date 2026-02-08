// ============================================================
// GLOBAL SAFE TIMER HANDLING (prevents blank screen freezes)
// ============================================================
let timeoutId = null;

function clearTimers() {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

// ============================================================
// ===== HOME PAGE PHOTO + VIDEO MONTAGE ======================
// ============================================================
const montageContainer = document.getElementById("montage-container");

if (montageContainer) {
  fetch('./media/media.json')
    .then(res => res.json())
    .then(mediaList => {

      if (!mediaList || mediaList.length === 0) return;

      let index = 0;

      function nextIndex() {
        index = (index + 1) % mediaList.length;
      }

      function playNext() {

        clearTimers();
        montageContainer.innerHTML = '';

        const item = mediaList[index];

        // ---------- BACKGROUND (blurred fill) ----------
        const bg = document.createElement(item.type === "video" ? "video" : "img");
        bg.src = item.src;
        bg.className = "media-bg";

        if (item.type === "video") {
          bg.muted = true;
          bg.autoplay = true;
          bg.loop = true;
          bg.playsInline = true;
        }

        montageContainer.appendChild(bg);

        // ---------- MAIN MEDIA ----------
        const main = document.createElement(item.type === "video" ? "video" : "img");
        main.src = item.src;
        main.className = "media-main";

        if (item.type === "video") {

          main.muted = true;
          main.autoplay = true;
          main.playsInline = true;
          main.preload = "auto";

          // normal ending
          main.onended = () => {
            nextIndex();
            playNext();
          };

          // corrupted video fallback
          main.onerror = main.onstalled = () => {
            timeoutId = setTimeout(() => {
              nextIndex();
              playNext();
            }, 4000);
          };

          // mobile autoplay protection
          main.oncanplay = () => {
            const p = main.play();
            if (p) {
              p.catch(() => {
                timeoutId = setTimeout(() => {
                  nextIndex();
                  playNext();
                }, 4000);
              });
            }
          };

        } else {
          // image timing
          timeoutId = setTimeout(() => {
            nextIndex();
            playNext();
          }, 3500);
        }

        montageContainer.appendChild(main);
      }

      playNext();
    })
    .catch(err => console.error("Failed to load media.json:", err));
}

// ============================================================
// ===== SERVICES PAGE FORM MODAL ==============================
// ============================================================
const servicesContainer = document.getElementById("servicesContainer");
const modal = document.getElementById("formModal");
const frame = document.getElementById("formFrame");
const closeBtn = document.getElementById("closeForm");

if (servicesContainer) {

  fetch('./media/forms.json')
    .then(res => res.json())
    .then(forms => {

      forms.forEach(f => {
        const card = document.createElement("div");
        card.className = "service-card";

        card.innerHTML = `
          <h2>${f.title}</h2>
          <p>${f.description}</p>
          <button class="btn open-form" data-form="${f.formUrl}">Open Survey</button>
        `;

        servicesContainer.appendChild(card);
      });

      document.querySelectorAll(".open-form").forEach(btn => {
        btn.addEventListener("click", e => {
          const url = e.target.dataset.form;
          frame.src = url;
          modal.style.display = "flex";
          document.body.style.overflow = "hidden";
        });
      });

    })
    .catch(err => console.error("Failed to load forms.json:", err));
}

if (closeBtn) {
  closeBtn.onclick = () => {
    modal.style.display = "none";
    frame.src = "";
    document.body.style.overflow = "auto";
  };
}
