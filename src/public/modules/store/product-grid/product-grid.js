// src/public/modules/store/product-grid/product-grid.js

import { getProductsMetadata, getProductsPaged } from '../../../../services/store/products.service.js';
import { renderProductCard } from './product-grid.utils.js';
import { updateSidebarFilters } from '../desktop-sidebar/desktop-sidebar.js';

// Configuración de Paginación
const ITEMS_PER_PAGE = 12;

// Estado Global de la Grid
let observer = null;
let gridState = {
    page: 1,
    products: [],
    total: 0,
    isLoading: false,

    // Filtros activos
    filters: {
        categoryIds: [],
        searchTerm: '',
        minPrice: 0,
        maxPrice: Infinity,
        brands: [],
        onlyOffers: true, // Por defecto (Home vacío) muestra solo las ofertas
        onlyPacks: false
    }
};

export async function initProductGrid(containerId) {
    const mainContainer = document.getElementById(containerId);
    if (!mainContainer) return;

    // Estructura base
    mainContainer.innerHTML = `
        <div id="grid-content-area"></div>
        <div id="grid-loader" class="loader-container" style="display:none;">
            <div class="spinner"></div>
        </div>
        <div id="scroll-marker" style="height: 1px; width: 100%;"></div>
    `;

    const contentArea = document.getElementById('grid-content-area');
    const scrollMarker = document.getElementById('scroll-marker');

    // --- SETUP INFINITE SCROLL ---
    if (observer) observer.disconnect();
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !gridState.isLoading) {
            const loadedCount = gridState.page * ITEMS_PER_PAGE;
            if (loadedCount < gridState.total) {
                gridState.page++;
                fetchAndRender(false);
            }
        }
    }, {
        root: null,
        rootMargin: '400px', // Empieza a cargar 400px antes de llegar al final
        threshold: 0
    });
    observer.observe(scrollMarker);

    // 1. Cargar Metadata para el Sidebar
    try {
        const metadata = await getProductsMetadata();
        updateSidebarFilters(metadata);
    } catch (e) {
        console.error("Error metadata:", e);
    }

    // 2. Cargar Primera Página
    await fetchAndRender(true);

    // --- EVENTOS ---

    window.addEventListener('filter-changed', (e) => {
        gridState.filters.minPrice = e.detail.minPrice;
        gridState.filters.maxPrice = e.detail.maxPrice;
        gridState.filters.brands = e.detail.brands;
        gridState.filters.onlyOffers = e.detail.onlyOffers;
        gridState.filters.onlyPacks = e.detail.onlyPacks;

        resetAndReload();
    });

    window.addEventListener('categories-selection-changed', (e) => {
        const selectedIds = e.detail.selectedIds;
        const packsSelected = selectedIds.includes('packs');

        if (packsSelected) {
            gridState.filters.onlyPacks = true;
            gridState.filters.categoryIds = selectedIds.filter(id => id !== 'packs');
            gridState.filters.onlyOffers = false;
        } else {
            gridState.filters.onlyPacks = false;
            gridState.filters.categoryIds = selectedIds;
            // Si desmarcó todas las categorías, es el home (ofertas)
            gridState.filters.onlyOffers = (selectedIds.length === 0);
        }

        gridState.filters.searchTerm = '';
        resetAndReload();
    });

    window.addEventListener('search-query', (e) => {
        gridState.filters.searchTerm = e.detail.term;
        gridState.filters.categoryIds = [];
        gridState.filters.onlyPacks = false;
        gridState.filters.onlyOffers = false; // Al buscar, buscamos en todos
        resetAndReload();
    });

    window.addEventListener('category-selected', (e) => {
        const catId = e.detail.categoryId;
        gridState.filters.categoryIds = (catId === 'all') ? [] : [catId];
        gridState.filters.searchTerm = '';
        gridState.filters.onlyPacks = false;
        
        // Verificar si hay un override (viene de página de categorías)
        if (window.gridStateFiltersOverride && window.gridStateFiltersOverride.onlyOffers !== undefined) {
            gridState.filters.onlyOffers = window.gridStateFiltersOverride.onlyOffers;
            delete window.gridStateFiltersOverride;
        } else {
            gridState.filters.onlyOffers = (gridState.filters.categoryIds.length === 0);
        }
        
        resetAndReload();
    });
}

function resetAndReload() {
    gridState.page = 1;
    gridState.products = [];
    fetchAndRender(true);
}

async function fetchAndRender(isReset) {
    if (gridState.isLoading) return;
    gridState.isLoading = true;

    const contentArea = document.getElementById('grid-content-area');
    const loader = document.getElementById('grid-loader');

    loader.style.display = 'flex';
    if (isReset) {
        contentArea.innerHTML = '';
    }

    try {
        const { products, total } = await getProductsPaged({
            page: gridState.page,
            limit: ITEMS_PER_PAGE,
            categoryIds: gridState.filters.categoryIds,
            searchTerm: gridState.filters.searchTerm,
            minPrice: gridState.filters.minPrice,
            maxPrice: gridState.filters.maxPrice,
            brands: gridState.filters.brands,
            onlyPacks: gridState.filters.onlyPacks,
            onlyOffers: gridState.filters.onlyOffers
        });

        // Ya no precisamos filtrado Client-Side; el server devuelve solo ofertas si onlyOffers = true
        let productsToShow = products;

        gridState.products = isReset ? productsToShow : [...gridState.products, ...productsToShow];
        gridState.total = total;

        if (gridState.products.length === 0 && isReset) {
            contentArea.innerHTML = '<div class="empty-state-msg">No encontramos productos.</div>';
        } else {
            renderBatch(contentArea, productsToShow);
        }

        // El Infinite Scroll se encarga de la siguiente petición observando el scroll-marker

        // Revisar si el scroll-marker sigue visible en pantallas grandes (PC)
        // para asegurar de que cargue la siguiente página si la primera no llenó la pantalla
        if (gridState.products.length < gridState.total) {
            const scrollMarker = document.getElementById('scroll-marker');
            if (scrollMarker) {
                const rect = scrollMarker.getBoundingClientRect();
                if (rect.top <= window.innerHeight + 400) {
                    gridState.page++;
                    // Usar setTimeout para evitar recursión síncrona profunda
                    setTimeout(() => fetchAndRender(false), 50);
                }
            }
        }

        // Si ya cargamos todo y hay al menos algo rendered, poner el btn final
        if (gridState.products.length >= gridState.total && gridState.products.length > 0) {
            if (!document.getElementById('view-all-cats-btn-global')) {
                const btnHtml = `<div class="view-all-cats-container"><a href="categorias.html" id="view-all-cats-btn-global" class="view-all-cats-btn">Ver todas las categorías</a></div>`;
                contentArea.insertAdjacentHTML('beforeend', btnHtml);
            }
        }
    } catch (error) {
        console.error("Error grid:", error);
        contentArea.innerHTML = '<p class="error-msg">Error de conexión.</p>';
    } finally {
        gridState.isLoading = false;
        loader.style.display = 'none';
    }
}

function renderBatch(container, products) {
    let grid = container.querySelector('.category-products-grid');

    if (!grid) {
        const titleText = getTitleText();
        if (titleText) {
            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = titleText;
            container.appendChild(title);
        }

        grid = document.createElement('div');
        grid.className = 'category-products-grid';
        container.appendChild(grid);
    }

    products.forEach(product => {
        const card = renderProductCard(product);
        grid.appendChild(card);
    });
}

function getTitleText() {
    const f = gridState.filters;
    if (f.searchTerm) return `Resultados para "${f.searchTerm}"`;
    if (f.onlyPacks) return "Combos";
    if (f.categoryIds.length > 0) return "Tu Selección";
    if (f.onlyOffers) return "Ofertas Especiales";
    return null;
}
