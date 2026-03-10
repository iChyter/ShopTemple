// src/public/landing.js


import { initAgeGate } from './modules/age-gate/age-gate.js';
import { initBottomNav } from './modules/layout/bottom-nav/bottom-nav.js';

document.addEventListener('DOMContentLoaded', () => {
    initBottomNav();


    /* --- VERIFICACIÓN DE EDAD --- */
    initAgeGate();

    /* --- CARRUSEL DE BANNERS --- */
    initBannerCarousel();
});

function initBannerCarousel() {
    // Busca los contenedores <picture>
    const banners = document.querySelectorAll('.banner-slide');

    if (banners.length <= 1) return;

    let currentIndex = 0;
    const intervalTime = 3000;

    // Asegurar inicialización
    if (!document.querySelector('.banner-slide.active')) {
        banners[0].classList.add('active');
    }

    setInterval(() => {
        banners[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % banners.length;
        banners[currentIndex].classList.add('active');
    }, intervalTime);
}
