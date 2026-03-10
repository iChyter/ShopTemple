// src/public/modules/store/categories-bar/categories-bar.js

import { getMenuCategories } from '../../../../services/store/products.service.js';

const CONTAINER_ID = 'categories-bar-container';

// Set para manejar las selecciones activas
const selectedCategories = new Set();

export async function initCategoriesBar() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    // Lógica de Sombra al Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            container.classList.add('is-pinned');
        } else {
            container.classList.remove('is-pinned');
        }
    });

    try {
        const categories = await getMenuCategories();
        renderBar(container, categories);

        // Sincronización con el Sidebar (externo)
        window.addEventListener('category-selected', (e) => {
            const externalCatId = e.detail.categoryId;
            selectedCategories.clear();

            if (externalCatId !== 'all') {
                selectedCategories.add(externalCatId);
                scrollToCategory(externalCatId);
            }
            updateBarVisualState();
        });

    } catch (error) {
        console.error("Error loading categories bar:", error);
        container.style.display = 'none';
    }
}

function renderBar(container, categories) {
    const wrapper = document.createElement('div');
    wrapper.className = 'categories-bar-wrapper';
    wrapper.id = 'categories-scroll-wrapper';

    // --- Flechas de navegación (solo visibles en PC vía CSS) ---
    const arrowLeft = document.createElement('button');
    arrowLeft.className = 'categories-arrow categories-arrow--left';
    arrowLeft.setAttribute('aria-label', 'Desplazar categorías a la izquierda');
    arrowLeft.innerHTML = '&#8249;'; // ‹
    container.appendChild(arrowLeft);

    const arrowRight = document.createElement('button');
    arrowRight.className = 'categories-arrow categories-arrow--right';
    arrowRight.setAttribute('aria-label', 'Desplazar categorías a la derecha');
    arrowRight.innerHTML = '&#8250;'; // ›
    container.appendChild(arrowRight);

    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'cat-nav-item';
        // Guardamos el ID tal cual (puede ser numero o string 'packs')
        item.dataset.id = cat.id;

        const fallbackIcon = `https://cdn-icons-png.flaticon.com/512/3565/3565405.png`;
        const imgSrc = cat.image_url ? cat.image_url : fallbackIcon;

        item.innerHTML = `
            <div class="cat-nav-icon">
                <img src="${imgSrc}" alt="${cat.nombre}" loading="lazy" onerror="this.src='${fallbackIcon}'">
            </div>
            <span class="cat-nav-label">${cat.nombre.toLowerCase()}</span>
        `;

        item.addEventListener('click', () => {
            if (selectedCategories.has(cat.id)) {
                selectedCategories.delete(cat.id);
            } else {
                selectedCategories.clear();
                selectedCategories.add(cat.id);
            }

            updateBarVisualState();

            window.dispatchEvent(new CustomEvent('categories-selection-changed', {
                detail: { selectedIds: Array.from(selectedCategories) }
            }));
        });

        wrapper.appendChild(item);
    });

    container.appendChild(wrapper);

    // --- Listeners de scroll en el wrapper ---
    wrapper.addEventListener('scroll', () => {
        handleScrollMask(wrapper);
        updateArrows(wrapper, arrowLeft, arrowRight);
    });

    // --- Listeners de las flechas ---
    const SCROLL_AMOUNT = (75 + 20) * 3; // ~3 items (ancho 75px + gap 20px)

    arrowLeft.addEventListener('click', () => {
        wrapper.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    });

    arrowRight.addEventListener('click', () => {
        wrapper.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    });

    // Estado inicial de flechas y al redimensionar
    const syncArrows = () => updateArrows(wrapper, arrowLeft, arrowRight);
    window.addEventListener('resize', syncArrows);

    // Esperar a que el DOM pinte para calcular overflow correctamente
    // Doble rAF: el primero aplica el layout, el segundo lo mide ya pintado
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            syncArrows();
            handleScrollMask(wrapper);
        });
    });

    setTimeout(() => {
        triggerScrollHint(wrapper);
    }, 1500);
}

/**
 * Muestra u oculta cada flecha según si hay overflow y la posición de scroll.
 * Solo activo en PC (≥ 1024px).
 */
function updateArrows(wrapper, arrowLeft, arrowRight) {
    const isPC = window.innerWidth >= 1024;
    if (!isPC) {
        arrowLeft.classList.remove('visible');
        arrowRight.classList.remove('visible');
        return;
    }

    // Usamos Math.round para evitar errores de subpixel
    const scrollLeft = Math.round(wrapper.scrollLeft);
    const scrollWidth = Math.round(wrapper.scrollWidth);
    const clientWidth = Math.round(wrapper.clientWidth);

    const hasOverflow = scrollWidth > clientWidth + 1;
    const atStart = scrollLeft <= 2;
    // Tolerancia de 8px para subpixel y scroll snapping
    const atEnd = scrollLeft >= scrollWidth - clientWidth - 8;

    arrowLeft.classList.toggle('visible', hasOverflow && !atStart);
    arrowRight.classList.toggle('visible', hasOverflow && !atEnd);
}

function updateBarVisualState() {
    const allItems = document.querySelectorAll('.cat-nav-item');
    allItems.forEach(item => {
        let id = item.dataset.id;
        if (!isNaN(id)) {
            id = Number(id);
        }

        if (selectedCategories.has(id)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function triggerScrollHint(wrapper) {
    if (wrapper.scrollWidth > wrapper.clientWidth) {
        wrapper.scrollBy({ left: 40, behavior: 'smooth' });
        setTimeout(() => {
            wrapper.scrollBy({ left: -40, behavior: 'smooth' });
        }, 600);
    }
}

function handleScrollMask(wrapper) {
    const scrollLeft = Math.round(wrapper.scrollLeft);
    const scrollWidth = Math.round(wrapper.scrollWidth);
    const clientWidth = Math.round(wrapper.clientWidth);

    const atStart = scrollLeft <= 2;
    const atEnd = scrollLeft >= scrollWidth - clientWidth - 8;
    const hasOverflow = scrollWidth > clientWidth + 1;

    wrapper.classList.remove('mask-start', 'mask-end', 'mask-both', 'mask-none');

    if (!hasOverflow) {
        wrapper.classList.add('mask-none');
    } else if (atStart) {
        wrapper.classList.add('mask-start');
    } else if (atEnd) {
        wrapper.classList.add('mask-end');
    } else {
        wrapper.classList.add('mask-both');
    }
}

function scrollToCategory(catId) {
    const item = document.querySelector(`.cat-nav-item[data-id="${catId}"]`);
    if (item) {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}
