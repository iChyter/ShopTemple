// src/public/modules/store/product-grid/product-grid.utils.js

import { CartService } from '../../../../services/store/cart.service.js';
import { showToast } from '../toast-notification/toast.js';

export function renderProductCard(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.setAttribute('data-id', product.id);

    const priceFormatted = `S/ ${product.price.toFixed(2)}`;

    // --- Descuentos ---
    let priceHtml = `<span class="product-price">${priceFormatted}</span>`;
    let discountBadgeHtml = '';

    if (product.has_discount && product.discount_percentage > 0) {
        const originalPrice = product.price / (1 - (product.discount_percentage / 100));
        const originalPriceFormatted = `S/ ${originalPrice.toFixed(2)}`;

        priceHtml = `
            <div class="price-container">
                <span class="original-price-crossed">${originalPriceFormatted}</span>
                <span class="product-price discount-price">${priceFormatted}</span>
            </div>
        `;
        discountBadgeHtml = `<span class="discount-badge">-${product.discount_percentage}%</span>`;
    }

    // Badge PACK
    const packBadgeHtml = product.is_pack
        ? `<span class="pack-badge">Pack</span>`
        : '';

    // Icono carrito SVG (carrito con ruedas)
    const cartIconSvg = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="9" cy="21" r="1" stroke-width="2"/>
            <circle cx="20" cy="21" r="1" stroke-width="2"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke-width="2"/>
        </svg>`;

    card.innerHTML = `
        <div class="card-image-wrapper">
            ${discountBadgeHtml}
            <img src="${product.image_url}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            ${priceHtml}
        </div>
        ${packBadgeHtml}
        <button class="card-cart-btn" aria-label="Agregar al carrito">
            ${cartIconSvg}
        </button>
    `;

    const addButton = card.querySelector('.card-cart-btn');
    addButton.addEventListener('click', (e) => {
        e.stopPropagation();
        CartService.addToCart(product);
        showToast(`${product.name} añadido al carrito.`, 'Producto agregado');
    });

    return card;
}

export function updateProductCard(updatedProduct) {
    // Si necesitas actualizar la tarjeta en tiempo real sin recargar, 
    // podrías volver a llamar a renderProductCard y reemplazar el nodo.
    // Por simplicidad, aquí solo actualizamos nombre y precio base.
    const card = document.querySelector(`.product-card[data-id="${updatedProduct.id}"]`);
    if (card) {
        card.querySelector('.product-name').textContent = updatedProduct.name;
        const priceEl = card.querySelector('.product-price');
        if (priceEl && !updatedProduct.has_discount) {
            // Si quitamos el descuento, deberíamos limpiar la estructura compleja, 
            // pero para actualizaciones rápidas esto basta.
            priceEl.textContent = `S/ ${updatedProduct.price.toFixed(2)}`;
        }
    }
}

export function removeProductCard(productId) {
    const card = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (card) {
        card.remove();
    }
}
