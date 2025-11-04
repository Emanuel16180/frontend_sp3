// src/api.js

import axios from 'axios';
import { getApiBaseURL } from './config/tenants';

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

export default apiClient;