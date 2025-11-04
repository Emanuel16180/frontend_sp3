// src/pages/LoginPage.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../api';
import { isGlobalAdmin, getApiBaseURL } from '../config/tenants';

function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const hostname = window.location.hostname;
            const isRootDomain = hostname === 'psicoadmin.xyz' || 
                                hostname === 'www.psicoadmin.xyz';
            
            // Detectar si es el admin global
            const isGlobalAdminUser = formData.email === 'admin@psicoadmin.xyz';

            console.log('🔍 Login Debug:', {
                hostname,
                isRootDomain,
                isGlobalAdminUser,
                email: formData.email
            });

            // Validación: Admin global debe estar en dominio raíz
            if (isGlobalAdminUser && !isRootDomain) {
                setError('⚠️ El admin general debe iniciar sesión en: https://psicoadmin.xyz/login');
                setLoading(false);
                setTimeout(() => {
                    window.location.href = 'https://psicoadmin.xyz/login';
                }, 2000);
                return;
            }

            // Validación: Usuarios de clínica deben estar en su subdominio
            if (!isGlobalAdminUser && isRootDomain && formData.email.includes('@')) {
                const emailDomain = formData.email.split('@')[1];
                if (emailDomain && emailDomain !== 'psicoadmin.xyz') {
                    const clinicName = emailDomain.split('.')[0];
                    setError(`⚠️ Debe iniciar sesión en: https://${clinicName}-app.psicoadmin.xyz/login`);
                    setLoading(false);
                    setTimeout(() => {
                        window.location.href = `https://${clinicName}-app.psicoadmin.xyz/login`;
                    }, 2000);
                    return;
                }
            }

            let loginResponse;

            // Decisión: ¿Qué backend usar?
            if (isRootDomain && isGlobalAdminUser) {
                // Admin global → Backend público sin tenant
                const publicApiUrl = 'https://psico-admin.onrender.com/api/auth/login/';
                console.log('🌐 Admin global detectado - usando backend público:', publicApiUrl);
                
                loginResponse = await axios.post(publicApiUrl, formData, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            } else {
                // Usuario de clínica → Backend del tenant
                const tenantApiUrl = getApiBaseURL() + '/auth/login/';
                console.log('🏥 Usuario de clínica - usando backend tenant:', tenantApiUrl);
                
                loginResponse = await apiClient.post('/auth/login/', formData);
            }
            
            console.log('✅ Login exitoso:', loginResponse.data);
            
            // Guardamos el token (usar mismo nombre en todo el sistema)
            localStorage.setItem('access_token', loginResponse.data.token);
            localStorage.setItem('authToken', loginResponse.data.token); // Compatibilidad
            localStorage.setItem('refresh_token', loginResponse.data.refresh_token || ''); // Si existe
            
            // Guardamos el tipo de usuario
            const userType = loginResponse.data.user.user_type;
            localStorage.setItem('userType', userType);
            localStorage.setItem('user', JSON.stringify(loginResponse.data.user));            // Guardamos info básica del usuario
            localStorage.setItem('currentUser', JSON.stringify({
                id: loginResponse.data.user.id,
                first_name: loginResponse.data.user.first_name
            }));

            // Redirigimos según el tipo de usuario
            if (userType === 'admin' || userType === 'superuser') {
                navigate(isGlobalAdmin() ? '/global-admin' : '/admin-dashboard');
            } else if (userType === 'professional') {
                navigate('/psychologist-dashboard');
            } else {
                navigate('/dashboard');
            }
        
        } catch (err) {
            console.error("❌ Error en el login:", err);
            if (err.response && err.response.data) {
                setError(err.response.data.non_field_errors?.[0] || 'Credenciales incorrectas.');
            } else {
                setError('Error de red o el servidor no responde.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ... (resto de tu return) ...

    return (
        <div className="flex justify-center items-center min-h-screen p-4 sm:p-8 bg-background">
            <div className="bg-card text-card-foreground p-8 sm:p-12 rounded-xl shadow-xl w-full max-w-md">
                <h2 className={`text-3xl font-bold text-center mb-2 ${isGlobalAdmin() ? 'text-purple-600' : 'text-primary'}`}>
                    🔒 Iniciar Sesión
                </h2>
                
                {isGlobalAdmin() ? (
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-purple-800">🌐 Administrador General</h3>
                        <p className="text-sm text-gray-600">Gestiona todas las clínicas del sistema</p>
                        <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
                            <strong>Credenciales:</strong> admin@psico.com / admin123
                        </div>
                    </div>
                ) : (
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-primary">🏥 Acceso a Clínica</h3>
                        <p className="text-sm text-gray-600">
                            {window.location.hostname.includes('bienestar') ? 'Clínica Bienestar' : 
                             window.location.hostname.includes('mindcare') ? 'Clínica MindCare' :
                             'Sistema de Clínicas'}
                        </p>
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                            <strong>Credenciales:</strong> admin@psico.com / admin123
                        </div>
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full p-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Iniciando sesión...' : 'Entrar'}
                    </button>
                </form>
                
                {error && (
                    <div className="mt-4 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
                        <span className="font-medium">⚠️ {error}</span>
                    </div>
                )}

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    ¿Olvidaste tu contraseña? <Link to="/reset-password" className="font-medium text-primary hover:underline">Recupérala aquí</Link>
                </p>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    ¿No tienes cuenta? <Link to="/register" className="font-medium text-primary hover:underline">Regístrate</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;