// ============================================================
// CONFIGURATION
// ============================================================
const GITHUB_USER  = "yogandrea";
const GITHUB_REPO  = "Wellness";
const PHOTOS_PATH  = "media/photos";
const VIDEOS_PATH  = "media/videos";

// ── GitHub Personal Access Token ──────────────────────────
// Raises API limit from 60 → 5,000 requests/hour.
// This is a read-only public-repo token — safe to include here.
// To regenerate: github.com → Settings → Developer settings
// → Personal access tokens → Fine-grained tokens
// → New token → Repository access: Wellness → Contents: Read-only
const GH_TOKEN = "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"; // ← PASTE YOUR TOKEN HERE e.g. "github_pat_abc123..."

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const VIDEO_EXTS = [".mp4", ".webm", ".mov"];

function isImage(n) { return IMAGE_EXTS.some(e => n.toLowerCase().endsWith(e)); }
function isVideo(n) { return VIDEO_EXTS.some(e => n.toLowerCase().endsWith(e)); }

// ── Shared GitHub API fetch with auth header ───────────────
async function ghFetch(path) {
  const headers = { "Accept": "application/vnd.github+json" };
  if (GH_TOKEN) headers["Authorization"] = `Bearer ${GH_TOKEN}`;

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${path}`,
    { headers }
  );

  if (res.status === 403) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    const reset     = res.headers.get("x-ratelimit-reset");
    const resetTime = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : "soon";
    console.warn(`[GitHub] Rate limited (0/${remaining} remaining). Resets at ${resetTime}. Add a GH_TOKEN to main.js to fix this.`);
    return [];
  }
  if (!res.ok) {
    console.warn(`[GitHub] ${res.status} for "${path}"`);
    return [];
  }
  const d = await res.json();
  return Array.isArray(d) ? d : [];
}

// ── Export ghFetch so schedule.html / about.html can use it
window.ghFetch  = ghFetch;
window.GH_TOKEN = GH_TOKEN;

// ============================================================
// TIMER SAFETY
// ============================================================
let timeoutId    = null;
let stallWatchId = null;

function clearTimers() {
  if (timeoutId)    { clearTimeout(timeoutId);    timeoutId    = null; }
  if (stallWatchId) { clearTimeout(stallWatchId); stallWatchId = null; }
}

// ============================================================
// DOM READY
// ============================================================
document.addEventListener("DOMContentLoaded", async function () {

  // ==========================================================
  // HOME PAGE MONTAGE
  // ==========================================================
  const montageContainer = document.getElementById("montage-container");

  if (montageContainer) {
    try {
      const [photoFiles, videoFiles] = await Promise.all([
        ghFetch(PHOTOS_PATH),
        ghFetch(VIDEOS_PATH)
      ]);

      const mediaList = [
        ...photoFiles.filter(f => isImage(f.name)).map(f => ({ type: "image", src: f.download_url, name: f.name })),
        ...videoFiles.filter(f => isVideo(f.name)).map(f => ({ type: "video", src: f.download_url, name: f.name }))
      ];

      // Shuffle so photos and videos are interspersed
      for (let i = mediaList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mediaList[i], mediaList[j]] = [mediaList[j], mediaList[i]];
      }

      console.log(`[Montage] ${mediaList.length} items (${photoFiles.filter(f=>isImage(f.name)).length} photos, ${videoFiles.filter(f=>isVideo(f.name)).length} videos)`);

      if (mediaList.length === 0) {
        montageContainer.innerHTML = `<div style="color:#fff;padding:30px;text-align:center;">
          No media found.<br><small>Add images to <code>media/photos</code> and videos to <code>media/videos</code>.</small>
        </div>`;
        return;
      }

      let index = 0;

      function advance() {
        index = (index + 1) % mediaList.length;
        playNext();
      }

      function playNext() {
        clearTimers();
        montageContainer.innerHTML = "";

        const item = mediaList[index];

        // Blurred background layer
        const bg = document.createElement(item.type === "video" ? "video" : "img");
        bg.src = item.src;
        bg.className = "media-bg";
        if (item.type === "video") {
          bg.muted = bg.autoplay = bg.loop = bg.playsInline = true;
        }
        montageContainer.appendChild(bg);

        // Sharp foreground layer
        const el = document.createElement(item.type === "video" ? "video" : "img");
        el.src       = item.src;
        el.className = "media-main";

        if (item.type === "video") {
          el.muted = el.autoplay = el.playsInline = true;
          el.preload = "auto";

          el.addEventListener("ended", advance);

          el.addEventListener("error", () => {
            console.warn("[Montage] Video error, skipping:", item.name);
            clearTimers();
            timeoutId = setTimeout(advance, 500);
          });

          el.addEventListener("canplay", () => {
            const p = el.play();
            if (p) p.catch(() => {
              console.warn("[Montage] Autoplay blocked:", item.name);
              timeoutId = setTimeout(advance, 5000);
            });

            // Watchdog: skip only if currentTime is genuinely frozen for 12s
            let lastTime = -1;
            stallWatchId = setInterval(() => {
              if (el.paused || el.ended) { clearInterval(stallWatchId); return; }
              if (el.currentTime === lastTime) {
                console.warn("[Montage] Video stuck, skipping:", item.name);
                clearInterval(stallWatchId);
                stallWatchId = null;
                advance();
              }
              lastTime = el.currentTime;
            }, 12000);
          });

        } else {
          el.addEventListener("error", () => {
            console.warn("[Montage] Image failed:", item.name);
            timeoutId = setTimeout(advance, 300);
          });
          el.addEventListener("load", () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(advance, 3500);
          });
          timeoutId = setTimeout(advance, 5000); // fallback
        }

        montageContainer.appendChild(el);
      }

      playNext();

    } catch (err) {
      console.error("[Montage]", err);
      montageContainer.innerHTML = `<div style="color:#fff;padding:30px;text-align:center;">⚠️ ${err.message}</div>`;
    }
  }

  // ==========================================================
  // SERVICES PAGE
  // ==========================================================
  const servicesContainer = document.getElementById("servicesContainer");
  const modal    = document.getElementById("formModal");
  const frame    = document.getElementById("formFrame");
  const closeBtn = document.getElementById("closeForm");

  if (servicesContainer) {
    try {
      const res = await fetch("media/forms.json");
      if (!res.ok) throw new Error(`HTTP ${res.status} — media/forms.json not found`);
      const forms = await res.json();

      if (!forms || forms.length === 0) {
        servicesContainer.innerHTML = `<p style="padding:20px;color:#888;">No services listed yet.</p>`;
      } else {
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
            const url = e.currentTarget.dataset.form;
            if (frame) frame.src = url;
            if (modal) { modal.style.display = "flex"; document.body.classList.add("modal-open"); }
          });
        });
      }
    } catch (err) {
      console.error("[Services]", err.message);
      servicesContainer.innerHTML = `<p style="padding:20px;color:#c00;">⚠️ ${err.message}</p>`;
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
      if (frame) frame.src = "";
      document.body.classList.remove("modal-open");
    });
  }

});
