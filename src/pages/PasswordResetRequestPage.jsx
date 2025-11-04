// src/pages/PasswordResetRequestPage.jsx

import { useState } from 'react';
import apiClient from '../api';
import { Link } from 'react-router-dom';
// import './Auth.css'; // <-- BORRAMOS ESTA LÍNEA

function PasswordResetRequestPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            await apiClient.post('/auth/password-reset/', { email });
            setMessage('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.');
        } catch (err) {
            setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
        }
    };

    return (
        // Aplicamos las clases de Tailwind (igual que en LoginPage)
        <div className="flex justify-center items-center min-h-screen p-4 sm:p-8 bg-background">
            <div className="bg-card text-card-foreground p-8 sm:p-12 rounded-xl shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-primary mb-8">🔑 Recuperar Contraseña</h2>
                
                {message ? (
                    <p className="p-4 bg-green-100 text-green-800 border border-green-200 rounded-lg">{message}</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p className="text-muted-foreground mb-6 text-center">
                            Ingresa tu correo y te enviaremos instrucciones.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full p-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors"
                        >
                            Enviar Instrucciones
                        </button>
                    </form>
                )}

                {error && (
                    <div className="mt-4 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
                        <span className="font-medium">⚠️ {error}</span>
                    </div>
                )}
                
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    <Link to="/login" className="font-medium text-primary hover:underline">Volver a Iniciar Sesión</Link>
                </p>
            </div>
        </div>
    );
}

export default PasswordResetRequestPage;