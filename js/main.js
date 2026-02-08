const montageContainer = document.getElementById('montage-container');

// ==== STEP 1: Fetch the photo list from JSON ====
fetch('media/photos.json')
  .then(response => response.json())
  .then(photos => {

    // Add videos here
    const videos = [
      'media/videos/video1.mp4',
      'media/videos/video2.mp4'
    ];

    // Combine photos + videos
    const mediaList = [...photos, ...videos];

    // ==== STEP 2: Slideshow logic ====
    let currentIndex = 0;

    function showNextMedia() {
      montageContainer.innerHTML = ''; // Clear previous

      const currentMedia = mediaList[currentIndex];
      let element;

      if (currentMedia.endsWith('.mp4')) {
        // Video element
        element = document.createElement('video');
        element.src = currentMedia;
        element.autoplay = true;
        element.muted = true;
        element.playsInline = true;
        element.style.width = '100%';
        element.style.height = '60vh';
        element.style.objectFit = 'cover';

        element.addEventListener('ended', () => {
          currentIndex = (currentIndex + 1) % mediaList.length;
          showNextMedia();
        });

      } else {
        // Image element
        element = document.createElement('img');
        element.src = currentMedia;
        element.style.width = '100%';
        element.style.height = '60vh';
        element.style.objectFit = 'cover';

        setTimeout(() => {
          currentIndex = (currentIndex + 1) % mediaList.length;
          showNextMedia();
        }, 3000); // 3 seconds per photo
      }

      montageContainer.appendChild(element);
    }

    // ==== STEP 3: Start the montage ====
    showNextMedia();

  })
  .catch(err => {
    console.error('Failed to load photos.json', err);
  });
