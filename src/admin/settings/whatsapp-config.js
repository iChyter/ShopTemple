import { supabase } from '../../config/supabaseClient.js';
import { showToast } from '../../public/modules/store/toast-notification/toast.js';

document.addEventListener('DOMContentLoaded', () => {
    const inputNumber = document.getElementById('whatsapp-number');
    const btnRequestSave = document.getElementById('btn-request-save');
    const modalContainer = document.getElementById('confirm-modal-container');
    const btnCancelSave = document.getElementById('btn-cancel-save');
    const btnConfirmSave = document.getElementById('btn-confirm-save');
    const newNumberDisplay = document.getElementById('new-number-display');

    let currentConfigId = null;

    // Cargar número actual
    loadCurrentNumber();

    async function loadCurrentNumber() {
        try {
            inputNumber.placeholder = 'Cargando número actual...';

            const { data, error } = await supabase
                .from('store_settings')
                .select('*')
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No hay fila todavía
                    inputNumber.value = '';
                    inputNumber.placeholder = 'Ej: 961367961';
                    currentConfigId = null;
                } else {
                    throw error;
                }
            } else if (data) {
                let dbNumber = data.whatsapp_number || '';
                if (dbNumber.startsWith('51') && dbNumber.length > 9) {
                    dbNumber = dbNumber.substring(2);
                } else if (dbNumber.startsWith('+51')) {
                    dbNumber = dbNumber.substring(3);
                }
                inputNumber.value = dbNumber;
                currentConfigId = data.id;
            }
        } catch (error) {
            console.error('Error al obtener configuraciones:', error);
            showToast('⚠️ No se pudo cargar el número actual');
            inputNumber.value = '';
            inputNumber.placeholder = 'Ej: 961367961';
        } finally {
            inputNumber.disabled = false;
            btnRequestSave.disabled = false;
        }
    }

    btnRequestSave.addEventListener('click', () => {
        let val = inputNumber.value.trim();
        
        // Remove '+51' or '51' if user pasted it
        if (val.startsWith('+51')) val = val.substring(3).trim();
        else if (val.startsWith('51') && val.length > 9) val = val.substring(2).trim();

        // Actualizamos el input para que lo vea limpio
        inputNumber.value = val;
        
        // Validación MUY básica (asegurarse de que hay números)
        if (!val || val.length < 8) {
            showToast('⚠️ Por favor ingresa un número de teléfono válido.');
            return;
        }
        
        // Mostramos el modal
        newNumberDisplay.textContent = val;
        modalContainer.classList.add('visible');
    });

    btnCancelSave.addEventListener('click', () => {
        modalContainer.classList.remove('visible');
    });

    btnConfirmSave.addEventListener('click', async () => {
        let val = inputNumber.value.trim();
        const fullNumber = '51' + val;

        modalContainer.classList.remove('visible');

        // Estado cargando
        btnRequestSave.disabled = true;
        btnRequestSave.innerHTML = `
            <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            Guardando...
        `;

        try {
            if (currentConfigId) {
                // Actualizar (Update)
                const { error } = await supabase
                    .from('store_settings')
                    .update({ whatsapp_number: fullNumber })
                    .eq('id', currentConfigId);
                
                if (error) throw error;
            } else {
                // Insertar (Insert) - Es la primera vez que se configura
                const { data, error } = await supabase
                    .from('store_settings')
                    .insert([{ whatsapp_number: fullNumber }])
                    .select();
                
                if (error) throw error;
                if (data && data.length > 0) {
                    currentConfigId = data[0].id;
                }
            }

            showToast('✅ Número actualizado correctamente');

        } catch (error) {
            console.error('Error al guardar el número de WhatsApp:', error);
            showToast('⚠️ Error al guardar el número');
        } finally {
            // Restaurar estado del botón
            btnRequestSave.disabled = false;
            btnRequestSave.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Guardar Cambios
            `;
        }
    });

});
// Adicional: Necesitamos CSS para la animación del spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
