// ===== HOME PAGE PHOTO + VIDEO MONTAGE =====
const montageContainer = document.getElementById("montage-container");

if (montageContainer) {
  fetch('./media/media.json')
    .then(res => res.json())
    .then(mediaList => {
      let index = 0;

      function playNext() {
        montageContainer.innerHTML = '';
        const item = mediaList[index];
        let el;

        if (item.type === "video") {
          el = document.createElement('video');
          el.src = item.src;
          el.autoplay = true;
          el.muted = true;
          el.playsInline = true;
          el.style.width = "100%";
          el.style.height = "65vh";
          el.style.objectFit = "cover";

          el.onended = () => {
            index = (index + 1) % mediaList.length;
            playNext();
          };
        } else {
          el = document.createElement('img');
          el.src = item.src;
          el.style.width = "100%";
          el.style.height = "65vh";
          el.style.objectFit = "cover";

          setTimeout(() => {
            index = (index + 1) % mediaList.length;
            playNext();
          }, 3000);
        }

        montageContainer.appendChild(el);
      }

      playNext();
    })
    .catch(err => console.error("Failed to load media.json:", err));
}

// ===== SERVICES PAGE FORM MODAL =====
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
