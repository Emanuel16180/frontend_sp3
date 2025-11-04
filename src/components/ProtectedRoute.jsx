// src/components/ProtectedRoute.jsx

import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, userType }) {
    const token = localStorage.getItem('authToken');
    const storedUserType = localStorage.getItem('userType');
    
    // Obtenemos el objeto 'user' completo
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Necesitamos saber en qué página estamos
    const location = useLocation();

    // 1. Si no hay token, siempre se redirige a login.
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. Si no se requiere un tipo específico, permitir acceso
    if (!userType) {
        return children;
    }

    // 3. Verificar permisos por tipo de usuario
    const hasAccess = (() => {
        if (userType === 'admin') {
            return storedUserType === 'admin' || storedUserType === 'superuser';
        }
        return userType === storedUserType;
    })();

    if (!hasAccess) {
        // Si no tiene el rol correcto, fuera.
        return <Navigate to="/" replace />;
    }

    // --- 4. LÓGICA DE TRIAJE (SOLO PARA PACIENTES) ---
    if (storedUserType === 'patient') {
        
        // Obtenemos el estado del triaje desde el backend (guardado en login)
        // y desde localStorage (si lo acaba de completar)
        const hasCompletedTriage = user?.has_completed_triage;
        const localTriageFlag = localStorage.getItem('triageCompleted');
        const needsTriage = !hasCompletedTriage && !localTriageFlag;

        // Si necesita triaje Y NO está ya en la página de triaje, lo forzamos a ir.
        if (needsTriage && location.pathname !== '/triage') {
            console.log('Paciente sin triaje. Redirigiendo a /triage...');
            return <Navigate to="/triage" replace />;
        }
        
        // Si YA completó el triaje pero intenta volver a la página /triage,
        // lo mandamos al dashboard.
        if (!needsTriage && location.pathname === '/triage') {
            console.log('Triaje ya completado. Redirigiendo a /dashboard...');
            return <Navigate to="/dashboard" replace />;
        }
    }

    // 5. Si todas las verificaciones pasan, muestra la página solicitada.
    return children;
}

export default ProtectedRoute;
