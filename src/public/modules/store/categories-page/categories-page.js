// src/public/modules/store/categories-page/categories-page.js

import { getMenuCategories, getProductsMetadata } from '../../../../services/store/products.service.js';
import { initBottomNav } from '../../layout/bottom-nav/bottom-nav.js';

document.addEventListener('DOMContentLoaded', async () => {
    initBottomNav();
    const gridContainer = document.getElementById('full-categories-grid');

    if (!gridContainer) return;

    try {
        // Pedimos ambas cosas en paralelo
        const [categories, allProducts] = await Promise.all([
            getMenuCategories(), // Trae categorías incl. 'COMBOS'
            getProductsMetadata() // Trae array ligero de todos los productos (id, categoria_id, is_pack, etc)
        ]);

        // Mapear conteos
        // Recorremos los productos y calculamos cuántos hay para cada categoría
        const countMap = {}; // { 'idCategoria': cantidad }
        let totalPacks = 0;

        allProducts.forEach(prod => {
            if (prod.is_pack) {
                totalPacks++;
            }
            if (prod.categoria_id) {
                if (!countMap[prod.categoria_id]) countMap[prod.categoria_id] = 0;
                countMap[prod.categoria_id]++;
            }
        });

        gridContainer.innerHTML = '';

        categories.forEach(cat => {
            // Revisa si es la categoria especial de combos
            const isPackCat = (cat.id === 'packs');
            const count = isPackCat ? totalPacks : (countMap[cat.id] || 0);

            // Determina la palabra "Producto" vs "Productos" o "Pack" vs "Packs"
            let label = isPackCat ? 'Packs' : 'Productos';
            if (count === 1) {
                label = isPackCat ? 'Pack' : 'Producto';
            }

            const fallbackIcon = `https://cdn-icons-png.flaticon.com/512/3565/3565405.png`;
            const imgSrc = cat.image_url ? cat.image_url : fallbackIcon;

            const card = document.createElement('a');
            // Redirigir a store con el param = categoria ID (opcional en el futuro)
            // Por ahora mandaremos al usuaro a store.html guardándolo en LocalStorage
            card.className = 'cat-page-card';
            card.href = 'index.html';

            card.innerHTML = `
                <img class="cat-page-img" src="${imgSrc}" alt="${cat.nombre}" loading="lazy" onerror="this.src='${fallbackIcon}'">
                <h3 class="cat-page-title">${cat.nombre.toLowerCase()}</h3>
                <p class="cat-page-count">${count} ${label}</p>
                <div class="cat-page-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </div>
            `;

            // EVENTO: al hacer clic guardamos la categoría en localStorage para que 'store.html' lo lea
            card.addEventListener('click', (e) => {
                localStorage.setItem('selectedCategoryFromPage', cat.id);
            });

            gridContainer.appendChild(card);
        });

    } catch (e) {
        console.error("Error cargando página de categorías", e);
        gridContainer.innerHTML = '<p style="text-align:center; padding:50px;">Ocurrió un error al cargar.</p>';
    }
});
