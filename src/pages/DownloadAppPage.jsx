import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTenantFromHostname } from '../config/tenants';

export default function DownloadAppPage() {
  const { clinic } = useParams();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar plataforma
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);
    
    setIsIOS(ios);
    setIsAndroid(android);

    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Escuchar evento beforeinstallprompt (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó la instalación');
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleContinueToApp = () => {
    navigate('/login');
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Aplicación Instalada!
          </h1>
          <p className="text-gray-600 mb-8">
            PsicoAdmin ya está instalada en tu dispositivo. Puedes acceder desde tu pantalla de inicio.
          </p>
          <button
            onClick={handleContinueToApp}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Continuar a la App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Descarga PsicoAdmin
          </h1>
          <p className="text-gray-600">
            {clinic ? `Clínica ${clinic.charAt(0).toUpperCase() + clinic.slice(1)}` : 'Tu clínica psicológica'}
          </p>
        </div>

        {/* Instrucciones para Android/Chrome */}
        {(isAndroid || (!isIOS && isInstallable)) && (
          <div className="mb-6">
            <button
              onClick={handleInstallClick}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Instalar Aplicación
            </button>
          </div>
        )}

        {/* Instrucciones para iOS */}
        {isIOS && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Instrucciones para iOS
            </h3>
            <ol className="text-sm text-gray-700 space-y-2">
              <li className="flex gap-2">
                <span className="font-semibold">1.</span>
                <span>Toca el botón de compartir <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/></svg> en Safari</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">2.</span>
                <span>Selecciona "Añadir a pantalla de inicio"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold">3.</span>
                <span>Toca "Añadir" en la esquina superior derecha</span>
              </li>
            </ol>
          </div>
        )}

        {/* Instrucciones genéricas para escritorio */}
        {!isIOS && !isAndroid && !isInstallable && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">
              Instalación desde navegador
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              Para instalar la aplicación en tu computadora:
            </p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex gap-2">
                <span>•</span>
                <span>Busca el ícono de instalación en la barra de direcciones</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>O ve al menú del navegador → "Instalar PsicoAdmin"</span>
              </li>
            </ul>
          </div>
        )}

        {/* Beneficios */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Beneficios de la app:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Acceso rápido desde tu pantalla de inicio</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Funciona sin conexión a internet</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Notificaciones de citas y mensajes</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Experiencia similar a una app nativa</span>
            </li>
          </ul>
        </div>

        {/* Botón para continuar sin instalar */}
        <button
          onClick={handleContinueToApp}
          className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Continuar sin instalar
        </button>
      </div>
    </div>
  );
}
