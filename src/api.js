// src/api.js

import axios from 'axios';
import { getApiBaseURL, getTenantFromHostname } from './config/tenants';

// Creamos una instancia de axios con configuración dinámica
const apiClient = axios.create({
    baseURL: getApiBaseURL(),
    timeout: 90000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // CRÍTICO: Permite enviar/recibir cookies en peticiones cross-origin
});

// Esto es un "interceptor": se ejecuta ANTES de cada petición.
// Su trabajo es tomar el token del localStorage y añadirlo a los encabezados.
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        // Añadir header X-Tenant-Schema: prioridad localStorage.selectedTenant > subdomain
        try {
            const selectedTenant = localStorage.getItem('selectedTenant');
            const tenantFromHost = getTenantFromHostname();
            const tenant = selectedTenant || tenantFromHost;
            if (tenant) {
                config.headers['X-Tenant-Schema'] = tenant;
            }
        } catch (e) {
            // en caso de SSR o entorno extraño, no hacemos nada
            // console.warn('tenant header not set', e);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userType');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// --- PAGOS: PACIENTE ---
export const getMyPayments = () => {
    return apiClient.get('/payments/my-payments/');
};

// --- PAGOS: PSICÓLOGO ---
export const getPsychologistEarnings = (filters = {}) => {
    // filters puede ser: { start_date: '...', patient_name: '...' }
    return apiClient.get('/payments/psychologist-earnings/', { params: filters });
};

// --- COMÚN: DESCARGAR FACTURA/COMPROBANTE ---
export const downloadInvoicePdf = async (transactionId, filename = 'comprobante.pdf') => {
    try {
        const response = await apiClient.get(`/payments/transactions/${transactionId}/invoice/`, {
            responseType: 'blob', // Importante para archivos binarios (PDF)
        });
        
        // Crear URL temporal y forzar descarga
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error("Error descargando PDF:", error);
        throw error;
    }
};

// --- REPORTES INTELIGENTES (IA) ---
export const generateSmartReport = (prompt) => {
    return apiClient.post('/admin/reports/payments/generate_smart_report/', 
        { prompt }, 
        { 
            responseType: 'blob' // ⚠️ CRÍTICO: Le dice a Axios que viene un archivo
        }
    );
};

export default apiClient;