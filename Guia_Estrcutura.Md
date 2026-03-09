Estructura Estandarizada para Proyectos Vanilla JS
> Copia y pega este archivo al iniciar cualquier nuevo proyecto.
1. Estructura de Carpetas
mi-proyecto/
├── src/
│   ├── core/                    # Lógica central independiente de UI
│   │   ├── services/           # APIs y comunicación con servidores
│   │   ├── utils/              # Funciones helper puras
│   │   ├── constants/          # Constantes globales
│   │   └── events/             # Event bus / pub-sub
│   │
│   ├── components/              # Componentes UI reutilizables
│   │   ├── Button/
│   │   │   ├── Button.js
│   │   │   ├── Button.css
│   │   │   └── index.js
│   │   └── Modal/
│   │
│   ├── features/               # Funcionalidades por módulo
│   │   ├── auth/
│   │   │   ├── auth.api.js
│   │   │   ├── auth.ui.js
│   │   │   └── auth.css
│   │   ├── products/
│   │   │   ├── products.api.js
│   │   │   ├── products.store.js
│   │   │   ├── products.ui.js
│   │   │   └── products.css
│   │   └── cart/
│   │
│   ├── pages/                  # Vistas completas
│   │   ├── home/
│   │   ├── admin/
│   │   └── store/
│   │
│   └── app.js                  # Punto de entrada
│
├── public/                     # HTMLs entry points
│   ├── index.html
│   ├── store.html
│   └── admin.html
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
└── package.json
2. Convenciones de Nombres
| Tipo | Sufijo | Ejemplo |
|------|--------|---------|
| API/REST | .api.js | products.api.js |
| Estado | .store.js | cart.store.js |
| UI/Vista | .ui.js | header.ui.js |
| NO USAR | .services.js | ❌ |
| Componentes | PascalCase | Button.js |
| Utils | camelCase | formatPrice() |
| Constantes | UPPER_SNAKE | API_BASE_URL |
3. Patrones Clave
Componente Básico
// src/components/Button/Button.js
export class Button {
  constructor(text, onClick, variant = 'primary') {
    this.text = text;
    this.onClick = onClick;
    this.variant = variant;
  }
  render() {
    const btn = document.createElement('button');
    btn.className = `btn btn-${this.variant}`;
    btn.textContent = this.text;
    btn.addEventListener('click', this.onClick);
    return btn;
  }
}
// src/components/Button/index.js
export { Button } from './Button.js';
Servicio API
// src/core/services/products.api.js
const API_BASE_URL = '/api/v1';
export const productsApi = {
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error('Failed');
    return res.json();
  },
  async create(product) {
    return fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    }).then(r => r.json());
  }
};
Store (Estado)
// src/features/cart/cart.store.js
const listeners = new Set();
let state = { items: [], total: 0 };
export const cartStore = {
  getState() { return { ...state }; },
  
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  
  addItem(product, qty = 1) {
    const existing = state.items.find(i => i.id === product.id);
    if (existing) existing.quantity += qty;
    else state.items.push({ ...product, quantity: qty });
    state.total = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
    listeners.forEach(fn => fn(state));
  }
};
Event Bus
// src/core/events/eventBus.js
const events = {};
export const eventBus = {
  on(e, cb) { (events[e] ||= []).push(cb); return () => this.off(e, cb); },
  off(e, cb) { if (events[e]) events[e] = events[e].filter(x => x !== cb); },
  emit(e, data) { (events[e] || []).forEach(cb => cb(data)); }
};
Feature Module
// src/features/products/products.ui.js
import { productsApi } from '../../core/services/products.api.js';
import { productsStore } from './products.store.js';
export const productsUI = {
  async init(containerId) {
    this.container = document.getElementById(containerId);
    productsStore.subscribe(s => this.render(s.products));
    const data = await productsApi.getAll();
    productsStore.setProducts(data);
  },
  render(products) {
    this.container.innerHTML = products.map(p => `<div>${p.name}</div>`).join('');
  }
};
4. app.js (Entry Point)
import { eventBus } from './core/events/eventBus.js';
async function initApp() {
  const page = document.body.dataset.page;
  
  if (page === 'store') {
    await import('./pages/store/store.js').then(m => m.init());
  } else if (page === 'admin') {
    await import('./pages/admin/admin.js').then(m => m.init());
  }
  
  eventBus.emit('app:ready');
}
document.addEventListener('DOMContentLoaded', initApp);
5. HTML Template
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Proyecto</title>
  <link rel="stylesheet" href="/src/main.css">
</head>
<body data-page="store">
  <div id="app"></div>
  <script type="module" src="/src/app.js"></script>
</body>
</html>
6. Reglas de Oro
1. Separar UI de lógica → .ui.js ≠ .api.js
2. Sin fetch en componentes → Usar servicios
3. Estado en stores → No globales sueltas
4. Un archivo = una responsabilidad
5. ES6 modules → import/export siempre
6. CSS por módulo → No un solo CSS gigante
7. Checklist Inicio Proyecto
- [ ] Crear carpetas src/core/, src/components/, src/features/, src/pages/
- [ ] Crear eventBus.js en core/events/
- [ ] Definir constantes en core/constants/
- [ ] Crear servicios base en core/services/
- [ ] Configurar HTML en public/
- [ ] Crear app.js como entry point