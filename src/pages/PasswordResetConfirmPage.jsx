// src/pages/PasswordResetConfirmPage.jsx

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
// import './Auth.css'; // <-- LÍNEA BORRADA

function PasswordResetConfirmPage() {
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setError('');
        setMessage('');

        try {
            await apiClient.post('/auth/password-reset-confirm/', {
                uid,
                token,
                new_password: password,
                new_password_confirm: passwordConfirm,
            });
            setMessage('¡Tu contraseña ha sido restablecida con éxito! Ahora puedes iniciar sesión.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError('El enlace es inválido o ha expirado. Por favor, solicita un nuevo restablecimiento.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4 sm:p-8 bg-background">
            <div className="bg-card text-card-foreground p-8 sm:p-12 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-primary mb-8">🔒 Establecer Nueva Contraseña</h2>
                
                {message ? (
                    <p className="p-4 bg-green-100 text-green-800 border border-green-200 rounded-lg">{message}</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-foreground mb-2">Nueva Contraseña</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-foreground mb-2">Confirmar Nueva Contraseña</label>
                            <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <button type="submit" className="w-full p-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors">
                            Guardar Contraseña
                        </button>
                    </form>
                )}
                
                {error && (
                    <div className="mt-4 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
                        <span className="font-medium">⚠️ {error}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PasswordResetConfirmPage;