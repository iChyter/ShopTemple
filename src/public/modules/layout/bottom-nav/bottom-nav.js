// src/public/modules/layout/bottom-nav/bottom-nav.js

export async function initBottomNav() {
    const navContainer = document.createElement('div');
    navContainer.id = 'mobile-bottom-nav-wrapper';
    document.body.appendChild(navContainer);

    try {
        const response = await fetch('src/public/modules/layout/bottom-nav/bottom-nav.html');
        if (!response.ok) throw new Error('Bottom nav HTML no encontrado');

        const html = await response.text();
        navContainer.innerHTML = html;

        // Establecer el enlace activo
        const currentPath = window.location.pathname.toLowerCase();
        const btnHome = document.getElementById('nav-btn-home');
        const btnCategories = document.getElementById('nav-btn-categories');

        if (btnHome) btnHome.classList.remove('active');
        if (btnCategories) btnCategories.classList.remove('active');

        // Lógica simple de resaltado
        if (currentPath.includes('categorias.html')) {
            if (btnCategories) btnCategories.classList.add('active');
        } else {
            // index.html, / o cualquier otra cosa que sea la tienda ahora
            if (btnHome) btnHome.classList.add('active');
        }

    } catch (error) {
        console.error('Error inicializando el bottom navbar:', error);
    }
}
