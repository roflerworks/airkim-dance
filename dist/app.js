'use strict';
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
const dialog = document.querySelector('.enroll-dialog');
const directionLabel = document.querySelector('#selected-direction');
function closeMenu() {
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
}
menuButton.addEventListener('click', () => {
  const opening = mobileMenu.hidden;
  mobileMenu.hidden = !opening;
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Закрыть меню' : 'Открыть меню');
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => {
  if (!mobileMenu.hidden && !mobileMenu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileMenu.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 961px)').addEventListener('change', event => { if(event.matches) closeMenu(); });
document.querySelectorAll('[data-enroll]').forEach(link => link.addEventListener('click', event => {
  if (typeof dialog.showModal !== 'function') return;
  event.preventDefault();
  closeMenu();
  const direction = link.dataset.direction;
  directionLabel.hidden = !direction;
  directionLabel.textContent = direction ? `Интересует: ${direction}. Уточните наличие группы у администратора.` : '';
  dialog.showModal();
  document.body.style.overflow = 'hidden';
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
});
dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
document.querySelector('#year').textContent = String(new Date().getFullYear());

// Background film: respect motion preferences and avoid playing off screen.
const heroVideo = document.querySelector('#hero-video');
const videoToggle = document.querySelector('.video-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let videoUserPaused = false;
let heroVisible = true;
function updateVideoButton() {
  const paused = heroVideo.paused;
  videoToggle.setAttribute('aria-label', paused ? 'Включить фоновое видео' : 'Поставить фоновое видео на паузу');
  videoToggle.querySelector('span').textContent = paused ? '▶' : 'Ⅱ';
  videoToggle.querySelector('.video-toggle-label').textContent = paused ? 'Смотреть' : 'Пауза';
}
function syncVideo() {
  if (reducedMotion.matches || videoUserPaused || !heroVisible || document.hidden) {
    heroVideo.pause();
    return;
  }
  if (!heroVideo.getAttribute('src')) heroVideo.src = heroVideo.dataset.src;
  heroVideo.play().catch(updateVideoButton);
}
heroVideo.muted = true;
heroVideo.addEventListener('canplay', () => { videoToggle.hidden = false; updateVideoButton(); });
heroVideo.addEventListener('play', updateVideoButton);
heroVideo.addEventListener('pause', updateVideoButton);
heroVideo.addEventListener('error', () => { videoToggle.hidden = true; });
videoToggle.addEventListener('click', () => {
  videoUserPaused = !heroVideo.paused;
  syncVideo();
});
reducedMotion.addEventListener('change', syncVideo);
document.addEventListener('visibilitychange', syncVideo);
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    syncVideo();
  }, {threshold: 0.05}).observe(document.querySelector('.hero'));
}
syncVideo();

// Supplied studio photographs, with keyboard-accessible full-size viewing.
const galleryLinks = [...document.querySelectorAll('[data-gallery]')];
const galleryDialog = document.querySelector('.gallery-dialog');
const galleryImage = document.querySelector('#gallery-image');
let galleryIndex = 0;
function showGalleryImage(index) {
  galleryIndex = (index + galleryLinks.length) % galleryLinks.length;
  const link = galleryLinks[galleryIndex];
  galleryImage.src = link.href;
  galleryImage.alt = link.querySelector('img').alt;
  document.querySelector('#gallery-caption').textContent = link.dataset.caption;
  document.querySelector('#gallery-count').textContent = `${galleryIndex + 1} / ${galleryLinks.length}`;
}
galleryLinks.forEach((link,index) => link.addEventListener('click', event => {
  if (typeof galleryDialog.showModal !== 'function') return;
  event.preventDefault();
  showGalleryImage(index);
  galleryDialog.showModal();
  document.body.style.overflow = 'hidden';
}));
document.querySelector('.gallery-close').addEventListener('click', () => galleryDialog.close());
document.querySelector('.gallery-prev').addEventListener('click', () => showGalleryImage(galleryIndex - 1));
document.querySelector('.gallery-next').addEventListener('click', () => showGalleryImage(galleryIndex + 1));
galleryDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') {event.preventDefault();showGalleryImage(galleryIndex + 1);}
  if (event.key === 'ArrowLeft') {event.preventDefault();showGalleryImage(galleryIndex - 1);}
});
galleryDialog.addEventListener('click', event => {
  const box = galleryDialog.getBoundingClientRect();
  if (event.target === galleryDialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) galleryDialog.close();
});
galleryDialog.addEventListener('close', () => {document.body.style.overflow = '';});
