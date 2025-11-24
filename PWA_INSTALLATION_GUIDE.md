# 🚀 Guía de Implementación PWA - Instalación como App Nativa

## 📋 Índice
1. [¿Qué es una PWA?](#qué-es-una-pwa)
2. [Archivos necesarios](#archivos-necesarios)
3. [Configuración paso a paso](#configuración-paso-a-paso)
4. [Ruta oculta de descarga](#ruta-oculta-de-descarga)
5. [Notificaciones Push](#notificaciones-push)
6. [Testing y Deployment](#testing-y-deployment)

---

## 🎯 ¿Qué es una PWA?

Una **Progressive Web App (PWA)** permite que tu aplicación web:
- ✅ Se instale como app nativa (ícono en pantalla de inicio)
- ✅ Funcione offline
- ✅ Reciba notificaciones push
- ✅ Parezca una app (sin barra del navegador)
- ✅ Se actualice automáticamente
- ✅ **NO requiere Google Play / App Store**

---

## 📦 Archivos Necesarios

### 1. **`public/manifest.json`** - Configuración de la PWA

```json
{
  "name": "PsicoAdmin - Sistema de Gestión Clínica",
  "short_name": "PsicoAdmin",
  "description": "Sistema completo de gestión para clínicas de salud mental",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Nueva Cita",
      "short_name": "Cita",
      "description": "Agendar nueva cita",
      "url": "/appointments/new",
      "icons": [{ "src": "/icons/shortcut-appointment.png", "sizes": "192x192" }]
    },
    {
      "name": "Mis Pacientes",
      "short_name": "Pacientes",
      "description": "Ver lista de pacientes",
      "url": "/patients",
      "icons": [{ "src": "/icons/shortcut-patients.png", "sizes": "192x192" }]
    }
  ],
  "categories": ["health", "medical", "productivity"],
  "screenshots": [
    {
      "src": "/screenshots/desktop-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### 2. **`public/sw.js`** - Service Worker (Offline + Notificaciones)

```javascript
// Service Worker - Versión 1.0.0
const CACHE_NAME = 'psicoadmin-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker: Instalado');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cacheando archivos estáticos');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estrategia de caché: Network First, fallback a Cache
self.addEventListener('fetch', (event) => {
  // Solo cachear GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, cachearla
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, usar caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Página offline de respaldo
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// 🔔 NOTIFICACIONES PUSH
self.addEventListener('push', (event) => {
  console.log('📬 Notificación push recibida:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'PsicoAdmin';
  const options = {
    body: data.body || 'Tienes una nueva actualización',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir',
        icon: '/icons/check.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/close.png'
      }
    ],
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Click en notificación:', event);
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data.url;
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
  }
});
```

### 3. **`public/offline.html`** - Página Offline

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sin conexión - PsicoAdmin</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 400px;
    }
    h1 { font-size: 3rem; margin: 0; }
    p { font-size: 1.2rem; opacity: 0.9; }
    button {
      margin-top: 2rem;
      padding: 1rem 2rem;
      font-size: 1rem;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    button:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="container">
    <h1>📡</h1>
    <h2>Sin conexión a Internet</h2>
    <p>Por favor, verifica tu conexión e intenta nuevamente.</p>
    <button onclick="location.reload()">🔄 Reintentar</button>
  </div>
</body>
</html>
```

---

## 🛠️ Configuración Paso a Paso

### **Opción A: React (Create React App / Vite)**

#### 1. Instalar dependencias
```bash
npm install workbox-webpack-plugin workbox-window
# o si usas Vite:
npm install vite-plugin-pwa -D
```

#### 2. Configurar en `src/index.jsx` o `src/main.jsx`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registrar Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado:', registration);
      })
      .catch((error) => {
        console.error('❌ Error registrando Service Worker:', error);
      });
  });
}

// Detectar si es instalable y mostrar prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Mostrar botón de instalación personalizado
  document.getElementById('install-button')?.classList.remove('hidden');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### 3. Configurar `vite.config.js` (si usas Vite)

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        // Tu manifest.json aquí (inline o referencia a archivo)
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.psicoadmin\.xyz\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 horas
              },
            },
          },
        ],
      },
    }),
  ],
});
```

#### 4. Agregar en `public/index.html` (o `index.html`)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#4F46E5">
  <meta name="description" content="Sistema de gestión clínica completo">
  
  <!-- PWA Meta Tags -->
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png">
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
  
  <!-- iOS Meta Tags -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="PsicoAdmin">
  
  <title>PsicoAdmin - Sistema de Gestión Clínica</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

---

## 🔒 Ruta Oculta de Descarga

### **1. Crear componente de descarga** - `src/pages/DownloadApp.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DownloadApp = () => {
  const { clinic } = useParams(); // bienestar o mindcare
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Capturar evento de instalación
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar cuando se instala
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('La instalación no está disponible en este momento.');
      return;
    }

    // Mostrar prompt de instalación
    deferredPrompt.prompt();

    // Esperar respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ Usuario aceptó la instalación');
    } else {
      console.log('❌ Usuario rechazó la instalación');
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const getInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('android')) {
      return {
        platform: 'Android',
        steps: [
          'Toca el botón "Descargar App" abajo',
          'Selecciona "Agregar a pantalla de inicio"',
          'Confirma el nombre y toca "Agregar"',
          '¡Listo! Encontrarás el ícono en tu pantalla de inicio'
        ]
      };
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return {
        platform: 'iOS',
        steps: [
          'Toca el botón de compartir (📤)',
          'Desplázate y selecciona "Agregar a pantalla de inicio"',
          'Confirma el nombre y toca "Agregar"',
          '¡Listo! Encontrarás el ícono en tu pantalla de inicio'
        ]
      };
    } else {
      return {
        platform: 'Escritorio',
        steps: [
          'Haz clic en el botón "Descargar App"',
          'O usa el ícono de instalación en la barra de direcciones',
          'Confirma la instalación',
          '¡La app se abrirá en su propia ventana!'
        ]
      };
    }
  };

  const instructions = getInstructions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
            <span className="text-5xl">📱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Clínica {clinic.charAt(0).toUpperCase() + clinic.slice(1)}
          </h1>
          <p className="text-gray-600">
            Instala nuestra aplicación y accede más rápido
          </p>
        </div>

        {/* Status */}
        {isInstalled && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium flex items-center">
              <span className="mr-2">✅</span>
              ¡App ya instalada!
            </p>
          </div>
        )}

        {/* Instrucciones */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📋</span>
            Instrucciones para {instructions.platform}
          </h2>
          <ol className="space-y-3">
            {instructions.steps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                  {index + 1}
                </span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Botón de instalación */}
        {isInstallable && !isInstalled && (
          <button
            onClick={handleInstall}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            📥 Descargar App
          </button>
        )}

        {!isInstallable && !isInstalled && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              💡 <strong>Consejo:</strong> Para instalar, abre esta página en Chrome, Safari o Edge.
            </p>
          </div>
        )}

        {/* Características */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Características de la App:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="mr-2">⚡</span>
              Acceso ultrarrápido
            </li>
            <li className="flex items-center">
              <span className="mr-2">📴</span>
              Funciona offline
            </li>
            <li className="flex items-center">
              <span className="mr-2">🔔</span>
              Notificaciones en tiempo real
            </li>
            <li className="flex items-center">
              <span className="mr-2">🎨</span>
              Interfaz nativa (sin barra del navegador)
            </li>
          </ul>
        </div>

        {/* Botón volver */}
        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
};

export default DownloadApp;
```

### **2. Configurar rutas** - `src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DownloadApp from './pages/DownloadApp';
import Home from './pages/Home';
// ... otros imports

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Home />} />
        
        {/* 🔒 RUTA OCULTA DE DESCARGA */}
        <Route path="/descargar-app/:clinic" element={<DownloadApp />} />
        
        {/* Otras rutas... */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### **3. URLs de acceso:**

- **Bienestar:** `https://bienestar.psicoadmin.xyz/descargar-app/bienestar`
- **Mindcare:** `https://mindcare.psicoadmin.xyz/descargar-app/mindcare`

### **4. Botón oculto en la app (opcional)**

Agregar en un menú desplegable o configuración:

```jsx
// En algún componente de Settings o Menu
<button
  onClick={() => navigate(`/descargar-app/${currentClinic}`)}
  className="hidden md:block" // Oculto en desktop, visible en móvil
>
  📥 Instalar App
</button>
```

---

## 🔔 Notificaciones Push

### **Backend Django - Enviar notificaciones**

```python
# apps/notifications/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from pywebpush import webpush, WebPushException
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_push_notification(request):
    """
    Enviar notificación push a un usuario.
    
    Body: {
        "user_id": 123,
        "title": "Nueva cita agendada",
        "body": "Tienes una cita el 25/11 a las 10:00",
        "url": "/appointments/123"
    }
    """
    # Obtener suscripción del usuario (guardada previamente)
    subscription = request.user.push_subscription
    
    payload = {
        "title": request.data.get('title'),
        "body": request.data.get('body'),
        "url": request.data.get('url', '/'),
    }
    
    try:
        webpush(
            subscription_info=json.loads(subscription),
            data=json.dumps(payload),
            vapid_private_key="TU_VAPID_PRIVATE_KEY",
            vapid_claims={"sub": "mailto:admin@psicoadmin.xyz"}
        )
        return Response({"success": True})
    except WebPushException as e:
        return Response({"error": str(e)}, status=400)
```

### **Frontend - Solicitar permiso de notificaciones**

```javascript
// src/utils/notifications.js
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const subscribeUserToPush = async () => {
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array('TU_PUBLIC_VAPID_KEY')
  });

  // Enviar suscripción al backend
  await fetch('https://api.psicoadmin.xyz/api/push/subscribe/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${localStorage.getItem('token')}`,
      'X-Tenant-Schema': localStorage.getItem('clinic')
    },
    body: JSON.stringify(subscription)
  });

  return subscription;
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

---

## ✅ Testing y Deployment

### **1. Lighthouse (Chrome DevTools)**

```bash
# Abrir Chrome DevTools > Lighthouse
# Seleccionar "Progressive Web App"
# Run audit
```

**Checklist PWA:**
- ✅ Manifest válido
- ✅ Service Worker registrado
- ✅ Funciona offline
- ✅ HTTPS habilitado
- ✅ Ícones de todos los tamaños
- ✅ Splash screen

### **2. Probar instalación local**

```bash
# Vite
npm run dev

# Abrir https://localhost:5173
# Chrome > Menú (⋮) > "Instalar app"
```

### **3. Deploy en Vercel**

```bash
# vercel.json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

---

## 📱 Generar Íconos

Usa [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator):

```bash
npx pwa-asset-generator logo.png public/icons --background "#4F46E5" --padding "10%"
```

O usa herramientas online:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

---

## 🎯 Resumen Final

1. **Archivos a crear:**
   - `public/manifest.json`
   - `public/sw.js`
   - `public/offline.html`
   - `public/icons/` (todos los tamaños)
   - `src/pages/DownloadApp.jsx`

2. **Configurar:**
   - Service Worker registration
   - Vite PWA plugin (si usas Vite)
   - Rutas de descarga ocultas

3. **URLs finales:**
   - App: `https://bienestar.psicoadmin.xyz`
   - Descarga: `https://bienestar.psicoadmin.xyz/descargar-app/bienestar`

4. **Testing:**
   - Lighthouse audit
   - Probar en móvil real (Chrome/Safari)
   - Verificar notificaciones

---

**¿Necesitas ayuda con algún paso específico?**
