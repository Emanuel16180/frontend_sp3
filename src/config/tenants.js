// src/config/tenants.js

// Configuración de tenants (simplificada - NO depende del hostname exacto)
export const TENANT_CONFIG = {
    bienestar: {
        name: 'Clínica Bienestar',
        theme: 'bienestar',
        logo: '/logos/bienestar.png',
        colors: {
            primary: '#0066CC',
            secondary: '#00AA44'
        }
    },
    mindcare: {
        name: 'MindCare Psicología',
        theme: 'mindcare',
        logo: '/logos/mindcare.png',
        colors: {
            primary: '#6B46C1',
            secondary: '#EC4899'
        }
    },
    'global-admin': {
        name: 'Administrador General - Psico SAS',
        theme: 'global-admin',
        logo: '/logos/global-admin.png',
        colors: {
            primary: '#1F2937',
            secondary: '#3B82F6'
        },
        isGlobalAdmin: true
    }
};

//  FUNCIÓN CORREGIDA: Detectar tenant desde el hostname
export const getTenantFromHostname = () => {
    const hostname = window.location.hostname;

    //  DOMINIO RAÍZ = Admin Global (NO es un tenant específico)
    if (hostname === 'psicoadmin.xyz' || 
        hostname === 'www.psicoadmin.xyz' || 
        hostname === 'localhost' ||
        hostname === '127.0.0.1') {
        return null; //  NO hay tenant, es dominio raíz
    }

    //  Detectar tenant desde subdomain con -app
    // Ejemplos:
    // - bienestar-app.psicoadmin.xyz  bienestar
    // - mindcare-app.psicoadmin.xyz  mindcare
    if (hostname.includes('-app.psicoadmin.xyz')) {
        if (hostname.includes('mindcare')) return 'mindcare';
        if (hostname.includes('bienestar')) return 'bienestar';
    }

    //  Detectar tenant desde subdomain directo (backend)
    // - bienestar.psicoadmin.xyz  bienestar
    // - mindcare.psicoadmin.xyz  mindcare
    if (hostname.includes('.psicoadmin.xyz')) {
        if (hostname.startsWith('mindcare.')) return 'mindcare';
        if (hostname.startsWith('bienestar.')) return 'bienestar';
    }

    //  Desarrollo local con subdominios
    if (hostname.includes('localhost')) {
        const parts = hostname.split('.');
        if (parts.length > 1) {
            const subdomain = parts[0];
            if (subdomain === 'mindcare') return 'mindcare';
            if (subdomain === 'bienestar') return 'bienestar';
        }
    }

    //  Vercel deployments
    if (hostname.includes('vercel.app')) {
        // Detectar por URL completa si tiene tenant en el nombre
        if (hostname.includes('mindcare')) return 'mindcare';
        if (hostname.includes('bienestar')) return 'bienestar';
        return 'bienestar'; // Default para Vercel
    }

    //  Si llegamos aquí, NO hay tenant (dominio raíz o desconocido)
    return null;
};

// Función para obtener la configuración del tenant actual
export const getCurrentTenant = () => {
    const tenant = getTenantFromHostname();
    if (!tenant) return null; //  Dominio raíz, no hay tenant
    return TENANT_CONFIG[tenant] || TENANT_CONFIG.bienestar;
};

// Función helper más descriptiva (alias de getCurrentTenant)
export const getCurrentTenantConfig = getCurrentTenant;

// src/config/tenants.js

// ... otras funciones ...

// Función para obtener la URL base de la API (construcción dinámica según tenant)
export const getApiBaseURL = () => {
    const tenant = getTenantFromHostname();
    const hostname = window.location.hostname;

    const isLocalDevelopment = hostname.includes('localhost') || hostname.includes('127.0.0.1');

    // 1. Dominio Raíz / Admin Global
    if (!tenant) {
        if (isLocalDevelopment) {
            // Admin global usa http://localhost:8000
            return 'http://localhost:8000/api';
        }
        return 'https://psico-admin.onrender.com/api';
    }

    // 2. Tenant específico (¡USAR URL LOCAL CORRECTA!)
    if (isLocalDevelopment) {
        // CORRECCIÓN: Usamos el subdominio local (bienestar.localhost) y el puerto 8000.
        // Esto garantiza que el Host header enviado sea "bienestar.localhost:8000".
        // La detección del tenant ocurrirá en el backend por el subdominio `bienestar`.
        return `http://${tenant}.localhost:8000/api`;
    }

    // 3. Producción (lógica original)
    if (hostname.includes('-app.psicoadmin.xyz')) {
        const backendHost = hostname.replace('-app', '');
        return `https://${backendHost}/api`;
    }

    return `https://${tenant}.psicoadmin.xyz/api`;
};

// Función para verificar si estamos en modo admin global
export const isGlobalAdmin = () => {
    const tenant = getTenantFromHostname();
    return tenant === null || tenant === 'global-admin';
};

// Función para verificar si estamos en modo multi-tenant (clínica específica)
export const isMultiTenant = () => {
    const tenant = getTenantFromHostname();
    return tenant !== null && tenant !== 'global-admin';
};
