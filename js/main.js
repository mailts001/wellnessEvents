// Example: Cycle through videos or photos on landing page
// If you want multiple videos, you can add them here
const videos = [
  'media/videos/intro.mp4',
  'media/videos/montage1.mp4'
];
let videoIndex = 0;
const videoElement = document.getElementById('montage');

if (videoElement) {
  videoElement.addEventListener('ended', () => {
    videoIndex = (videoIndex + 1) % videos.length;
    videoElement.src = videos[videoIndex];
    videoElement.play();
  });
}
