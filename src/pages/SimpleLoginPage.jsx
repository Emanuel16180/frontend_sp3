// src/pages/SimpleLoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SimpleLoginPage() {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');

    const handleFakeLogin = () => {
        setMessage('Iniciando login simulado...');
        
        // Limpiar localStorage
        localStorage.clear();
        
        // Simular login exitoso
        localStorage.setItem('authToken', 'fake-token-123');
        localStorage.setItem('userType', 'superuser');
        localStorage.setItem('currentUser', JSON.stringify({
            id: 1,
            first_name: 'TestAdmin'
        }));
        
        setMessage('Login simulado completado. Redirigiendo...');
        
        // Esperar un poco y redirigir
        setTimeout(() => {
            navigate('/global-admin');
        }, 1000);
    };

    const clearStorage = () => {
        localStorage.clear();
        setMessage('localStorage limpiado');
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <h1>🧪 Login Simplificado para Testing</h1>
            
            <div style={{ margin: '20px 0' }}>
                <p><strong>Estado actual:</strong></p>
                <p>Token: {localStorage.getItem('authToken') || 'No existe'}</p>
                <p>User Type: {localStorage.getItem('userType') || 'No existe'}</p>
            </div>
            
            <div style={{ margin: '20px 0' }}>
                <button 
                    onClick={handleFakeLogin}
                    style={{ 
                        padding: '10px 20px', 
                        background: '#007bff', 
                        color: 'white', 
                        border: 'none',
                        borderRadius: '4px',
                        marginRight: '10px'
                    }}
                >
                    Simular Login como Superuser
                </button>
                
                <button 
                    onClick={clearStorage}
                    style={{ 
                        padding: '10px 20px', 
                        background: '#dc3545', 
                        color: 'white', 
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    Limpiar Storage
                </button>
            </div>
            
            {message && (
                <div style={{ 
                    margin: '20px 0', 
                    padding: '10px', 
                    background: '#d4edda', 
                    border: '1px solid #c3e6cb',
                    borderRadius: '4px'
                }}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default SimpleLoginPage;