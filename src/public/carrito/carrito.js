// src/public/carrito/carrito.js

import { CartService } from '../../../services/store/cart.service.js';

const CONTENT_WRAPPER_ID = 'cart-content-wrapper';
const TOTAL_AMOUNT_ID = 'cart-total-amount';
const BTN_CONTINUE_ID = 'btn-continue-checkout';
const BTN_WHATSAPP_ID = 'btn-confirm-whatsapp';
const PAYMENT_SECTION_ID = 'payment-section';
const REMINDER_VIEW_ID = 'location-reminder-view';

document.addEventListener('DOMContentLoaded', () => {
    initCarritoPage();
});

function initCarritoPage() {
    renderCartState();

    const btnContinue = document.getElementById(BTN_CONTINUE_ID);
    const btnWhatsapp = document.getElementById(BTN_WHATSAPP_ID);

    if (btnContinue) btnContinue.addEventListener('click', handleContinueCheck);
    if (btnWhatsapp) btnWhatsapp.addEventListener('click', handleFinalWhatsappRedirect);

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
    const paymentSection = document.getElementById(PAYMENT_SECTION_ID);

    // CASO VACÍO (EMPTY STATE)
    if (cartItems.length === 0) {
        contentWrapper.innerHTML = `
            <div style="text-align: center; padding: 50px 20px; color: var(--text-muted, #888);">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 15px; opacity: 0.5;">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <h3 style="color: var(--text-main, #1a1a1a); font-size: 18px; margin-bottom: 8px;">Tu carrito está vacío</h3>
                <p style="font-size: 14px;">¡Agrega licores para comenzar tu fiesta!</p>
                <button class="btn-checkout-main" onclick="window.location.href='index.html'" style="margin-top:20px; width: 100%;">Explorar catálogo</button>
            </div>
        `;

        if (paymentSection) paymentSection.style.display = 'none';

        if (btnContinue) {
            btnContinue.disabled = true;
            btnContinue.style.backgroundColor = '#cccccc';
            btnContinue.style.cursor = 'not-allowed';
            btnContinue.style.boxShadow = 'none';
        }

        if (totalAmount) totalAmount.textContent = 'S/ 0.00';
        return;
    }

    // CASO CON PRODUCTOS
    if (paymentSection) paymentSection.style.display = 'block';

    if (btnContinue) {
        btnContinue.disabled = false;
        btnContinue.style.backgroundColor = '#d8831b'; // var(--primary) or the orange color from mock
        btnContinue.style.cursor = 'pointer';
        btnContinue.style.boxShadow = '0 6px 15px rgba(211, 133, 27, 0.4)';
    }

    contentWrapper.innerHTML = cartItems.map(item => `
        <div class="cart-item" style="position: relative;">
            <img src="${item.image_url || 'assets/icons/icon.webp'}" alt="${item.name}" class="cart-img">
            <div class="cart-info">
                <h3 class="cart-title">${item.name}</h3>
                <div class="cart-price-row">
                    <span class="cart-price">S/ ${(item.price * item.qty).toFixed(2)}</span>
                    <div class="cart-quantity">
                        <button class="cart-btn-qty" onclick="window.changeCartQuantity(${item.id}, -1)">−</button>
                        <span class="cart-qty-num">${item.qty}</span>
                        <button class="cart-btn-qty" onclick="window.changeCartQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
            </div>
            <button onclick="window.removeCartItem(${item.id})" style="background:none; border:none; color: #ff3b30; position:absolute; right:15px; top:15px; cursor:pointer;" aria-label="Eliminar item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `).join('');

    if (totalAmount) totalAmount.textContent = `S/ ${CartService.getCartTotal().toFixed(2)}`;
}

function handleContinueCheck() {
    const cart = CartService.getCart();
    if (cart.length === 0) return; // Por si acaso

    const selectedPayment = document.querySelector('input[name="payment_method"]:checked');

    if (!selectedPayment) {
        const section = document.getElementById(PAYMENT_SECTION_ID);
        // Pequeño workaround para alertas visuales, le ponemos alerta de error un segundo
        section.classList.add('shake-animation');
        setTimeout(() => section.classList.remove('shake-animation'), 500);
        return;
    }

    // Mostrar el modal de confirmación
    const reminder = document.getElementById(REMINDER_VIEW_ID);
    if (reminder) reminder.style.display = 'block';
}

function handleFinalWhatsappRedirect() {
    const selectedPayment = document.querySelector('input[name="payment_method"]:checked');
    const paymentMethod = selectedPayment ? selectedPayment.value : 'Efectivo';

    CartService.sendOrderToWhatsapp(paymentMethod);

    // Opcional: una vez se abre whatsapp, podríamos limpiar el carro o solo esconder modal
    returnToCart();
}

function returnToCart() {
    const reminder = document.getElementById(REMINDER_VIEW_ID);
    if (reminder) reminder.style.display = 'none';
}

function changeQuantity(id, change) {
    CartService.updateQuantity(id, change);
    renderCartState(); // Refrescar vista
}

function removeItem(id) {
    CartService.removeFromCart(id);
    renderCartState(); // Refrescar vista
}
