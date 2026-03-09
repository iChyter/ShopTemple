# Guía de Arquitectura - La Taberna

## Estructura de Proyecto

```
src/
├── config/                    # Configuración global
│   └── supabaseClient.js     # Cliente de Supabase
│
├── core/                      # Utilidades globales
│   └── utils/
│       ├── string.utils.js   # normalizeText, capitalize, etc.
│       ├── format.utils.js   # formatPrice, formatDate
│       └── dom.utils.js      # Helpers del DOM
│
├── services/                  # Comunicación con API
│   ├── products.service.js   # Productos (público)
│   ├── cart.service.js       # Carrito (localStorage)
│   ├── auth.service.js       # Autenticación
│   ├── categories.service.js # Categorías
│   └── extras.service.js     # Extras
│
├── public/                    # Interfaz pública (tienda)
│   ├── main.js               # Entry point tienda
│   ├── landing.js           # Landing page
│   ├── main.css             # Estilos globales
│   └── modules/
│       ├── header/
│       │   ├── header.js           # Orquestador
│       │   ├── header.search.js    # Lógica de búsqueda
│       │   ├── header.menu.js      # Render menú
│       │   ├── header.cart.js      # Lógica carrito
│       │   ├── header.html
│       │   └── header.css
│       │
│       ├── product-grid/
│       │   ├── product-grid.js           # Orquestador
│       │   ├── product-grid.fetch.js     # Traer datos
│       │   ├── product-grid.render.js    # Renderizar UI
│       │   ├── product-grid.utils.js     # Helpers
│       │   ├── product-grid.html
│       │   └── product-grid.css
│       │
│       ├── categories-bar/
│       ├── desktop-sidebar/
│       ├── cart-modal/
│       └── toast-notification/
│
└── admin/                     # Panel de administración
    ├── admin-guard.js         # Guardia de autenticación
    │
    ├── auth/
    │   ├── auth.js           # Orquestador auth
    │   ├── auth.login.js     # Lógica login
    │   └── auth.html
    │
    ├── products/
    │   ├── products.list.js        # Orquestador lista
    │   ├── products.fetch.js      # Traer productos
    │   ├── products.add.js        # Crear producto
    │   ├── products.edit.js       # Editar producto
    │   ├── products.delete.js     # Eliminar producto
    │   └── products.utils.js      # Helpers
    │
    ├── packs/
    ├── categories/
    ├── extras/
    └── profile/
```

---

## Reglas de Nomenclatura

### 1. Un archivo = Una responsabilidad

| Sufijo | Significado | Ejemplo |
|--------|-------------|---------|
| `*.js` (solo) | Orquestador - une las partes | `header.js` |
| `*.fetch.js` | Solo obtener datos de API | `products.fetch.js` |
| `*.render.js` | Solo crear HTML | `product-grid.render.js` |
| `*.utils.js` | Solo funciones helper | `string.utils.js` |
| `*.service.js` | Solo comunicación con backend | `cart.service.js` |

### 2. Prefijo del módulo

Todos los archivos de un mismo componente deben compartir prefijo:

```
header/
├── header.js
├── header.search.js
└── header.menu.js

products/
├── products.fetch.js
├── products.add.js
└── products.edit.js
```

---

## Estructura de un Módulo Típico

### Orquestador (`*.js`)

```javascript
// products.list.js - ORQUESTADOR
import { fetchProducts } from './products.fetch.js';
import { renderProductList } from './products.render.js';

export async function initProductsList(containerId) {
    const products = await fetchProducts({ page: 1 });
    renderProductList(containerId, products);
}
```

### Fetch (`*.fetch.js`)

```javascript
// products.fetch.js - SOLO datos
import { supabase } from '../../../config/supabaseClient.js';

export async function fetchProducts({ filter = 'active', page = 1 }) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', filter === 'active');
    
    if (error) throw error;
    return data;
}
```

### Render (`*.render.js`)

```javascript
// products.render.js - SOLO UI
export function renderProductList(containerId, products) {
    const container = document.getElementById(containerId);
    container.innerHTML = products.map(p => `
        <div class="product-card">${p.name}</div>
    `).join('');
}
```

---

## Imports - Cómo conectar módulos

### Dentro del mismo módulo:
```javascript
import { fetchProducts } from './products.fetch.js';
import { renderProducts } from './products.render.js';
```

### Desde un módulo padre:
```javascript
import { initHeader } from '../header/header.js';
```

### Desde servicios:
```javascript
import { supabase } from '../../config/supabaseClient.js';
import { normalizeText } from '../../core/utils/string.utils.js';
```

### Desde cualquier lugar:
```javascript
// Usar la ruta relativa correcta desde donde estás
import { formatPrice } from '../../core/utils/format.utils.js';
```

---

## Communication entre Módulos

### Custom Events (para comunicar módulos independientes):

```javascript
// Emisor (header.search.js)
window.dispatchEvent(new CustomEvent('search', { 
    detail: { term: 'cerveza' } 
}));

// Receptor (product-grid.js)
window.addEventListener('search', (e) => {
    const term = e.detail.term;
    // hacer algo
});
```

### Llamadas directas (cuando el padre orquesta):

```javascript
// parent.js
import { fetchProducts } from './products.fetch.js';
import { renderProducts } from './products.render.js';

async function onSearch(term) {
    const products = await fetchProducts({ search: term });
    renderProducts('app', products);
}
```

---

## Utils Globales (`src/core/utils/`)

### string.utils.js
```javascript
export function normalizeText(text) {
    if (!text) return '';
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}
```

### format.utils.js
```javascript
export function formatPrice(amount) {
    return new Intl.NumberFormat('es-AR', { 
        style: 'currency', 
        currency: 'ARS' 
    }).format(amount);
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('es-AR');
}
```

### dom.utils.js
```javascript
export function $(selector, parent = document) {
    return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
}

export function createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstElementChild;
}
```

---

## Reglas de Estilo

### Un archivo no debe superar las 100 líneas

Si un archivo crece más, separá la lógica:

```
❌ Mal: header.js (200 líneas)
✅ Bien: header.js + header.search.js + header.menu.js
```

### Nombres descriptivos pero cortos

```
✅ products.fetch.js
✅ products.add.js
❌ productsFetchDataFromApi.js
```

### Un export default por archivo (máximo)

```javascript
// ✅ Bien: export default + exports nombrados
export default function initHeader() { ... }
export function updateCart() { ... }

// ✅ Bien: solo exports nombrados
export function initHeader() { ... }
export function updateCart() { ... }
```

---

## Patrón de Errores

Si hay un error, el stack trace te dice exactamente qué archivo tiene el problema:

| Error en | Busca en |
|----------|----------|
| "Cannot read property of undefined" en búsqueda | `header.search.js` |
| "Error fetching products" | `products.fetch.js` |
| "Products not rendering" | `product-grid.render.js` |
| "Cart not updating" | `cart.service.js` o `header.cart.js` |

---

## Flujo Típico de Datos

```
User Action
    │
    ▼
[Orquestador .js]
    │
    ├──► [*.fetch.js] ──► Supabase API
    │
    └──► [*.render.js] ──► DOM
```

---

## Para Nuevos Módulos

Crear siempre:

```
mi-modulo/
├── mi-modulo.js          # Orquestador
├── mi-modulo.fetch.js   # API (si necesita datos)
├── mi-modulo.render.js  # UI (si renderiza algo)
├── mi-modulo.utils.js   # Helpers (si los necesita)
├── mi-modulo.html       # Template (si carga HTML externo)
└── mi-modulo.css        # Estilos
```

Solo crear los archivos que realmente se necesitan.
