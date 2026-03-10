// src/public/carrito/carrito.js

import { CartService } from '../../services/store/cart.service.js';

const CONTENT_WRAPPER_ID = 'cart-content-wrapper';
const TOTAL_AMOUNT_ID = 'cart-total-amount';
const BTN_CONTINUE_ID = 'btn-continue-checkout';
const BTN_WHATSAPP_ID = 'btn-confirm-whatsapp';
const PAYMENT_SECTION_ID = 'payment-section'; // Keeping constant assigned, but will comment out usage.
const REMINDER_VIEW_ID = 'location-reminder-view';

const DELETE_MODAL_ID = 'delete-confirm-modal';
const BTN_CONFIRM_DELETE = 'btn-confirm-delete';
const BTN_CANCEL_DELETE = 'btn-cancel-delete';
const ITEM_DELETE_NAME = 'item-to-delete-name';

let pendingDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
    initCarritoPage();
});

function initCarritoPage() {
    // Sincronizar con la DB para recuperar fotos si faltan
    CartService.syncCartItems().then(() => renderCartState());

    const btnContinue = document.getElementById(BTN_CONTINUE_ID);
    const btnWhatsapp = document.getElementById(BTN_WHATSAPP_ID);

    if (btnContinue) btnContinue.addEventListener('click', handleContinueCheck);
    if (btnWhatsapp) btnWhatsapp.addEventListener('click', handleFinalWhatsappRedirect);

    const btnConfirmDelete = document.getElementById(BTN_CONFIRM_DELETE);
    const btnCancelDelete = document.getElementById(BTN_CANCEL_DELETE);

    if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', executePendingDelete);
    if (btnCancelDelete) btnCancelDelete.addEventListener('click', cancelPendingDelete);

    // Adjuntar funciones al scope global para que los onclick inline funcionen (botones de + - y remover)
    window.changeCartQuantity = changeQuantity;
    window.removeCartItem = removeItem;
    window.returnToCart = returnToCart;
}

function renderCartState() {
    const cartItems = CartService.getCart();
    const contentWrapper = document.getElementById(CONTENT_WRAPPER_ID);
    const totalAmount = document.getElementById(TOTAL_AMOUNT_ID);
    const btnContinue = document.getElementById(BTN_CONTINUE_ID);

    // CASO VACÍO (EMPTY STATE)
    if (cartItems.length === 0) {
        contentWrapper.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon-wrapper">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ddd" stroke-width="1.5">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                </div>
                <h3>Tu carrito está vacío</h3>
                <p>¡No dejes que se acabe la fiesta! Agrega tus bebidas favoritas.</p>
                <a href="index.html" class="btn-explore">Explorar catálogo</a>
            </div>
        `;


        if (btnContinue) {
            btnContinue.disabled = true;
            btnContinue.classList.remove('active');
        }

        if (totalAmount) totalAmount.textContent = 'S/ 0.00';
        return;
    }


    if (btnContinue) {
        btnContinue.disabled = false;
        btnContinue.classList.add('active');
    }

    contentWrapper.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <div class="cart-img-wrapper">
                <img src="${item.image_url || 'assets/icons/icon.webp'}" alt="${item.name}" class="cart-img">
            </div>
            <div class="cart-info">
                <h3 class="cart-title">${item.name}</h3>
                <div class="cart-price-row">
                    <span class="cart-price">S/ ${item.price.toFixed(2)}</span>
                    <div class="cart-quantity">
                        <button class="cart-btn-qty" onclick="window.changeCartQuantity(${item.id}, -1)">−</button>
                        <span class="cart-qty-num">${item.qty}</span>
                        <button class="cart-btn-qty" onclick="window.changeCartQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    if (totalAmount) totalAmount.textContent = `S/ ${CartService.getCartTotal().toFixed(2)}`;

    // Update local count badge if it exists
    const countElement = document.getElementById('cart-count-value');
    if (countElement) {
        const totalItems = cartItems.reduce((total, item) => total + item.qty, 0);
        countElement.textContent = totalItems;
        countElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function handleContinueCheck() {
    const cart = CartService.getCart();
    if (cart.length === 0) return; // Por si acaso

    // Redirigir a la nueva pestaña de checkout
    window.location.href = 'checkout.html';
}

// Ya no se usa directamente desde carrito
function handleFinalWhatsappRedirect() {

    // Como quitaste el método de pago, mandamos un default o vacío al service
    CartService.sendOrderToWhatsapp('Coordinar por intern');

    // Opcional: una vez se abre whatsapp, podríamos limpiar el carro o solo esconder modal
    returnToCart();
}

function returnToCart() {
    const reminder = document.getElementById(REMINDER_VIEW_ID);
    if (reminder) reminder.style.display = 'none';
}

function changeQuantity(id, change) {
    const cart = CartService.getCart();
    const item = cart.find(i => i.id === id);

    // Si intenta bajar de 1, mostramos el modal
    if (item && item.qty === 1 && change === -1) {
        pendingDeleteId = id;
        const modal = document.getElementById(DELETE_MODAL_ID);
        const nameSpan = document.getElementById(ITEM_DELETE_NAME);

        if (nameSpan) nameSpan.textContent = item.name;
        if (modal) modal.style.display = 'block';
        return;
    }

    CartService.updateQuantity(id, change);
    renderCartState(); // Refrescar vista
}

function executePendingDelete() {
    if (pendingDeleteId) {
        CartService.removeFromCart(pendingDeleteId);
        pendingDeleteId = null;
        renderCartState();
    }
    const modal = document.getElementById(DELETE_MODAL_ID);
    if (modal) modal.style.display = 'none';
}

function cancelPendingDelete() {
    pendingDeleteId = null;
    const modal = document.getElementById(DELETE_MODAL_ID);
    if (modal) modal.style.display = 'none';
}

function removeItem(id) {
    CartService.removeFromCart(id);
    renderCartState(); // Refrescar vista
}
