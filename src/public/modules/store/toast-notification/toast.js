// src/public/modules/store/toast-notification/toast.js

const TOAST_ID = 'toast-notification-container';
const TOAST_TITLE_ID = 'toast-title';
const TOAST_MESSAGE_ID = 'toast-message';
const AUTOHIDE_DELAY = 2500;

let timeoutId = null;

export function initToastNotification() {
    const body = document.body;

    const toastHTML = `
        <div id="${TOAST_ID}">
            <div class="toast-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <div class="toast-content">
                <span id="${TOAST_TITLE_ID}" class="toast-title"></span>
                <span id="${TOAST_MESSAGE_ID}" class="toast-message"></span>
            </div>
            <button class="toast-close-btn" onclick="window.hideToast()">✕</button>
        </div>
    `;

    body.insertAdjacentHTML('beforeend', toastHTML);
    window.hideToast = hideToast;
}

export function showToast(message, title = 'Listo') {
    const toast = document.getElementById(TOAST_ID);
    const titleEl = document.getElementById(TOAST_TITLE_ID);
    const messageEl = document.getElementById(TOAST_MESSAGE_ID);

    if (!toast || !titleEl || !messageEl) return;

    if (timeoutId) {
        clearTimeout(timeoutId);
    }

    titleEl.textContent = title;
    messageEl.textContent = message;

    toast.classList.add('show');

    timeoutId = setTimeout(() => {
        hideToast();
    }, AUTOHIDE_DELAY);
}

export function hideToast() {
    const toast = document.getElementById(TOAST_ID);
    if (toast) {
        toast.classList.remove('show');
    }
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
    }
}