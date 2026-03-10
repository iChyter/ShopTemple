// src/public/main.js

import { initHeader } from './modules/layout/header/header.js';
import { initProductGrid } from './modules/store/product-grid/product-grid.js';
// import { initCartModal } from './modules/store/cart-modal/cart-modal.js';
import { initToastNotification } from './modules/store/toast-notification/toast.js';
import { initCategoriesBar } from './modules/store/categories-bar/categories-bar.js';

import { initAgeGate } from './modules/age-gate/age-gate.js';
import { initBottomNav } from './modules/layout/bottom-nav/bottom-nav.js';

document.addEventListener('DOMContentLoaded', () => {
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
    initProductGrid('product-grid-container');

});
