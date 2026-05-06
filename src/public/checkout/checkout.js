// src/public/checkout/checkout.js

import { CartService } from '../../services/store/cart.service.js';

document.addEventListener('DOMContentLoaded', () => {
    initCheckoutPage();
});

function initCheckoutPage() {
    const total = CartService.getCartTotal();
    const totalElement = document.getElementById('checkout-total');
    if (totalElement) {
        totalElement.textContent = `S/ ${total.toFixed(2)}`;
    }

    // Comportamiento de radio buttons estilo card
    setupCardOptions('shipping');
    setupCardOptions('payment');

    const btnConfirm = document.getElementById('btn-confirm-order');
    if (btnConfirm) {
        btnConfirm.addEventListener('click', handleConfirmOrder);
    }

    const btnAcceptError = document.getElementById('btn-accept-location-error');
    if (btnAcceptError) {
        btnAcceptError.addEventListener('click', () => {
            const modal = document.getElementById('location-error-overlay');
            if (modal) modal.style.display = 'none';
        });
    }
}

function setupCardOptions(radioName) {
    const radios = document.querySelectorAll(`input[name="${radioName}"]`);
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            // Eliminar clase active de todos
            document.querySelectorAll(`input[name="${radioName}"]`).forEach(r => {
                r.closest('.option-card').classList.remove('active');
            });
            // Añadir clase active al seleccionado
            if (radio.checked) {
                radio.closest('.option-card').classList.add('active');
            }
        });
    });
}

async function handleConfirmOrder() {
    const shippingMethod = document.querySelector('input[name="shipping"]:checked').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    // Cambiar el texto del botón mientras procesa
    const btnConfirm = document.getElementById('btn-confirm-order');
    const originalText = btnConfirm.textContent;
    btnConfirm.textContent = "Procesando...";
    btnConfirm.disabled = true;

    if (shippingMethod === 'auto') {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const locationUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                    await CartService.sendOrderToWhatsapp({ paymentMethod, locationUrl });

                    btnConfirm.textContent = originalText;
                    btnConfirm.disabled = false;
                    window.location.href = 'index.html'; // volver a inicio
                },
                async (error) => {
                    console.error("Error obteniendo ubicación:", error);
                    showLocationErrorModal(originalText, btnConfirm);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            showLocationErrorModal(originalText, btnConfirm);
        }
    } else {
        // Manual
        await CartService.sendOrderToWhatsapp({ paymentMethod });
        btnConfirm.textContent = originalText;
        btnConfirm.disabled = false;
        window.location.href = 'index.html';
    }
}

function showLocationErrorModal(originalText, btnConfirm) {
    // Restaurar botón
    btnConfirm.textContent = originalText;
    btnConfirm.disabled = false;

    // Cambiar a manual
    const manualRadio = document.querySelector('input[name="shipping"][value="manual"]');
    if (manualRadio) {
        manualRadio.checked = true;
        manualRadio.dispatchEvent(new Event('change'));
    }

    // Mostrar custom modal
    const modal = document.getElementById('location-error-overlay');
    if (modal) modal.style.display = 'flex';
}
