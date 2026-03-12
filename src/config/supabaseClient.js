// src/config/supabaseClient.js

// Coloca aquí tus credenciales
const SUPABASE_URL = 'https://dgrjixcoljemcvokqcfr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRncmppeGNvbGplbWN2b2txY2ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzQxNDgsImV4cCI6MjA4ODkxMDE0OH0.ubAg4AfN6abyekl24ikP32ckAcfelJ2tqqy2bIqVlAE';

// --- CONFIGURACIÓN DE STORAGE ---
export const PRODUCTS_BUCKET = 'product-images';
export const CATEGORIES_BUCKET = 'category-images';

// Creamos la instancia del cliente de Supabase de forma segura
let supabaseInstance = null;

if (window.supabase) {
    supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error('Supabase library not found. Make sure <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script> is included in the HTML before your module scripts.');
}

export const supabase = supabaseInstance;
