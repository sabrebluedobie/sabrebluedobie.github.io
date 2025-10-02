// lightbox.js
// This script handles the lightbox functionality for image thumbnails
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.querySelectorAll('.lightbox-thumb').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.dataset.full;
    lightbox.style.display = 'flex';
  });
});

function closeLightbox() {
  lightbox.style.display = 'none';
  lightboxImg.src = '';
}

lightbox.addEventListener('click', closeLightbox);

