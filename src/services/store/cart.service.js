import { supabase } from '../../config/supabaseClient.js';
import { updateCartCount } from '../../public/modules/layout/header/header.js';
import { renderCartItems } from '../../public/modules/store/cart-modal/cart-modal.js';

const CART_KEY = 'lataberna_cart';

const CartService = {
    getCart: () => JSON.parse(localStorage.getItem(CART_KEY)) || [],

    _saveCart: (cart) => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCount();
        renderCartItems();
    },

    /**
     * Sincroniza los items del carrito con la base de datos para recuperar fotos o precios actualizados.
     */
    syncCartItems: async () => {
        let cart = CartService.getCart();
        if (cart.length === 0) return;

        const ids = cart.map(item => item.id);

        try {
            const { data: dbProducts, error } = await supabase
                .from('products')
                .select('id, name, price, image_url')
                .in('id', ids);

            if (error) throw error;

            let modified = false;
            cart = cart.map(item => {
                const dbProd = dbProducts.find(p => p.id === item.id);
                if (dbProd) {
                    // Si faltaba la imagen o el precio cambió, lo actualizamos
                    if (item.image_url !== dbProd.image_url || item.price !== dbProd.price) {
                        modified = true;
                        return { ...item, image_url: dbProd.image_url, price: dbProd.price, name: dbProd.name };
                    }
                }
                return item;
            });

            if (modified) {
                CartService._saveCart(cart);
            }
        } catch (e) {
            console.error("Error syncing cart items:", e);
        }
    },

    addToCart: (product) => {
        let cart = CartService.getCart();
        const existingItemIndex = cart.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            // Actualizamos la cantidad y nos aseguramos de que tenga los datos frescos (como la imagen)
            cart[existingItemIndex].qty += 1;
            cart[existingItemIndex].name = product.name;
            cart[existingItemIndex].price = product.price;
            cart[existingItemIndex].image_url = product.image_url;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                qty: 1
            });
        }

        CartService._saveCart(cart);
    },
    updateQuantity: (productId, change) => {
        let cart = CartService.getCart();
        const existingItemIndex = cart.findIndex(item => item.id === productId);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].qty += change;

            if (cart[existingItemIndex].qty <= 0) {
                cart.splice(existingItemIndex, 1);
            }

            CartService._saveCart(cart);
        }
    },

    removeFromCart: (productId) => {
        let cart = CartService.getCart();
        const newCart = cart.filter(item => item.id !== productId);
        CartService._saveCart(newCart);
    },

    getCartTotal: () => {
        const cart = CartService.getCart();
        return cart.reduce((total, item) => total + (item.price * item.qty), 0);
    },

    sendOrderToWhatsapp: (options = {}) => {
        // Soporte para ambos: si es string (anticuado) o un objeto.
        const opts = typeof options === 'string' ? { paymentMethod: options } : options;
        const { paymentMethod = "Efectivo", locationUrl = null } = opts;

        const cart = CartService.getCart();
        const total = CartService.getCartTotal();
        const phoneNumber = "51901437847";

        if (cart.length === 0) {
            alert("Tu carrito está vacío. ¡Agrega unos tragos primero!");
            return;
        }

        // --- CONSTRUCCIÓN DEL MENSAJE DE WHATSAPP ---
        let message = `¡Hola! Quiero hacer un pedido. 🍾\n\n`;
        message += `🛍️ Resumen:\n`;

        cart.forEach(item => {
            let subtotal = item.price * item.qty;
            message += `- ${item.qty}x ${item.name} (S/ ${subtotal.toFixed(2)})\n`;
        });

        message += `\n💳 Método de pago: ${paymentMethod}\n`;
        message += `💰 Total a pagar: S/ ${total.toFixed(2)}\n\n`;

        if (locationUrl) {
            message += `📍 Ubicación de entrega (GPS):\n${locationUrl}\n\n`;
        } else {
            message += `📍 Ubicación de entrega:\n(Enviaré mi ubicación actual a continuación)\n\n`;
        }

        message += `Quedo atento a tu confirmación.`;

        const encodedMessage = encodeURIComponent(message);

        window.open(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`, '_blank');

        CartService.clearCart();
    },

    clearCart: () => {
        CartService._saveCart([]);
    }
};

export { CartService };
