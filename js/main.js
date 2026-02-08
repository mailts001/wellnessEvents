const container = document.getElementById('montage-container');

fetch('./media/media.json')
  .then(res => res.json())
  .then(mediaList => {

    let index = 0;

    function playNext() {
      container.innerHTML = '';

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

      container.appendChild(el);
    }

    playNext();
  })
  .catch(err => console.error("media.json failed to load:", err));
