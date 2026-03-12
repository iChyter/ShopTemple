// src/public/main.js

import { initHeader } from './modules/layout/header/header.js';
import { initProductGrid } from './modules/store/product-grid/product-grid.js';
// import { initCartModal } from './modules/store/cart-modal/cart-modal.js';
import { initToastNotification } from './modules/store/toast-notification/toast.js';
import { initCategoriesBar } from './modules/store/categories-bar/categories-bar.js';

import { initAgeGate } from './modules/age-gate/age-gate.js';
import { initBottomNav } from './modules/layout/bottom-nav/bottom-nav.js';

document.addEventListener('DOMContentLoaded', async () => {
    initBottomNav();

    // 0. Verificación de Edad (Age Gate)
    initAgeGate();
    initHeader('main-header');

    // Modal de carrito eliminado, ahora es standalone page.

    // 3. Inicializa el Toast
    initToastNotification();

    // 4. Inicializa la Barra de Categorías (Visible siempre, estilo Rappi)
    initCategoriesBar();



    // 6. Inicializa la Rejilla de Productos
    await initProductGrid('product-grid-container');

    // 7. Verificar si viene de la página de categorías
    const selectedCatFromPage = localStorage.getItem('selectedCategoryFromPage');
    if (selectedCatFromPage) {
        const selectedCatName = localStorage.getItem('selectedCategoryNameFromPage');
        localStorage.removeItem('selectedCategoryFromPage');
        localStorage.removeItem('selectedCategoryNameFromPage');
        
        // Deseleccionar filtro de ofertas y packs en el sidebar
        const offersCheck = document.getElementById('offers-check');
        const packsCheck = document.getElementById('packs-check');
        const minPriceInput = document.getElementById('min-price-input');
        const maxPriceInput = document.getElementById('max-price-input');
        const brandChecks = document.querySelectorAll('.brand-check');
        
        if (offersCheck) offersCheck.checked = false;
        if (packsCheck) packsCheck.checked = false;
        if (minPriceInput) minPriceInput.value = 0;
        if (maxPriceInput) maxPriceInput.value = 1000;
        brandChecks.forEach(cb => cb.checked = false);
        
        // Forzar que soloOffers sea false antes de cargar la categoría
        window.gridStateFiltersOverride = { onlyOffers: false };
        
        // Forzar un reload limpio de la página para evitar estados viejos
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('category-selected', {
                detail: { 
                    categoryId: selectedCatFromPage,
                    categoryName: selectedCatName || null
                }
            }));
        }, 300);
    }

});
