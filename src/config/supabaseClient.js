// src/config/supabaseClient.js

// Coloca aquí tus credenciales
const SUPABASE_URL = 'https://twawtvmxndjkkmnpquvp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3YXd0dm14bmRqa2ttbnBxdXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNDk1MzksImV4cCI6MjA4NjgyNTUzOX0.nF_3MCGAu2vE7rQOnQFsVHQ9PkBZpeIjbLkMy2xhXx0';

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
