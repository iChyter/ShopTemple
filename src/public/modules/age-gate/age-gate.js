// src/public/modules/age-gate/age-gate.js

const STORAGE_KEY = 'age_verified';

/**
 * Comprueba si el usuario ya verificó su edad y si esa verificación sigue vigente
 * (válida hasta las 00:00 del día siguiente).
 * @returns {boolean}
 */
function isAgeVerified() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;

    const expiresAt = parseInt(raw, 10);
    if (isNaN(expiresAt)) return false;

    // Sigue vigente si aún no pasó la medianoche del día siguiente
    return Date.now() < expiresAt;
}

/**
 * Persiste la verificación hasta las 00:00 del día siguiente.
 */
function saveAgeVerification() {
    const now = new Date();
    // Calcular la medianoche del día siguiente
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    localStorage.setItem(STORAGE_KEY, tomorrow.getTime().toString());
}

/**
 * Inyecta el HTML del modal en el body si aún no existe.
 */
function injectModal() {
    if (document.getElementById('welcome-modal')) return; // ya está en el HTML

    const modalHtml = `
        <div id="welcome-modal" class="welcome-modal-container">
            <div class="welcome-overlay"></div>
            <div class="welcome-modal">
                <h2 class="welcome-title" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    Verificación de Edad 
                    <svg viewBox="0 0 24 24" width="28" height="28" stroke="var(--primary-color)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <text x="12" y="16" text-anchor="middle" font-size="10" font-weight="bold" font-family="Geom, sans-serif" stroke="none" fill="var(--primary-color)">+18</text>
                    </svg>
                </h2>
                <p class="welcome-text">El contenido de este sitio es para mayores de 18 años.</p>
                <div class="welcome-actions">
                    <button id="btn-age-yes" class="btn-go-store">SÍ, SOY MAYOR</button>
                    <button id="btn-age-no" class="btn-stay">No, salir de aquí</button>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('afterbegin', modalHtml);
}

/**
 * Inicializa el age gate en cualquier página pública.
 * - Si ya verificó hoy → no muestra nada.
 * - Si acepta → guarda hasta medianoche del día siguiente.
 * - Si rechaza → redirige a Google (la próxima visita volverá a preguntar).
 */
export function initAgeGate() {
    // Si ya está verificado, no hacer nada
    if (isAgeVerified()) return;

    injectModal();

    const modal = document.getElementById('welcome-modal');
    const btnYes = document.getElementById('btn-age-yes');
    const btnNo = document.getElementById('btn-age-no');

    // Mostrar con leve retraso para que la página cargue visualmente primero
    setTimeout(() => {
        if (modal) modal.classList.add('visible');
    }, 400);

    if (btnYes) {
        btnYes.addEventListener('click', () => {
            saveAgeVerification();
            modal.classList.remove('visible');
        });
    }

    if (btnNo) {
        btnNo.addEventListener('click', () => {
            // No guardamos nada → la próxima visita volverá a preguntar
            window.location.href = 'https://www.google.com';
        });
    }
}
