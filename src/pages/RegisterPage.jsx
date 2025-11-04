// src/pages/RegisterPage.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import './Auth.css'; // <-- LÍNEA BORRADA
import apiClient from '../api'; 

function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirm: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.password_confirm) {
            setError('Las contraseñas no coinciden');
            return;
        }
        try {
            await apiClient.post('/auth/register/', formData);
            navigate('/login');
        } catch (err) {
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                const errorMessages = Object.keys(errorData)
                    .map(key => `${key}: ${errorData[key].join(', ')}`)
                    .join(' | ');
                setError(errorMessages || 'Ocurrió un error en el registro.');
            } else {
                setError('No se pudo conectar al servidor.');
            }
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4 sm:p-8 bg-background">
            <div className="bg-card text-card-foreground p-8 sm:p-12 rounded-xl shadow-xl w-full max-w-lg"> {/* Aumentado a max-w-lg */}
                <h2 className="text-3xl font-bold text-center text-primary mb-8">✨ Crear Cuenta</h2>
                <form onSubmit={handleSubmit}>
                    {/* Grid para 2 columnas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-foreground mb-2">Usuario</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
                            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-foreground mb-2">Apellido</label>
                            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        {/* Las contraseñas ocupan todo el ancho */}
                        <div className="sm:col-span-2 mb-4">
                            <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <div className="sm:col-span-2 mb-6">
                            <label className="block text-sm font-medium text-foreground mb-2">Confirmar Contraseña</label>
                            <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange} required className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full p-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors">
                        Registrarse
                    </button>
                </form>
                {error && (
                    <div className="mt-4 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
                        <span className="font-medium">⚠️ {error}</span>
                    </div>
                )}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    ¿Ya tienes cuenta? <Link to="/login" className="font-medium text-primary hover:underline">Inicia Sesión</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;