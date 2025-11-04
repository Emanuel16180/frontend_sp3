# 💻 CÓDIGO LISTO PARA COPIAR - Landing Page

## 📋 Archivo: `src/pages/LandingPage.jsx`

```jsx
import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://psico-admin.onrender.com/api/tenants/public';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    clinic_name: '',
    subdomain: '',
    admin_email: '',
    admin_phone: '',
    address: ''
  });
  
  const [subdomainAvailable, setSubdomainAvailable] = useState(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState(null);
  
  // Verificar disponibilidad del subdominio con debounce
  const checkSubdomain = async (subdomain) => {
    if (subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }
    
    setCheckingSubdomain(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/check-subdomain/`, {
        subdomain
      });
      setSubdomainAvailable(response.data.available);
    } catch (err) {
      console.error('Error verificando subdominio:', err);
      setSubdomainAvailable(null);
    } finally {
      setCheckingSubdomain(false);
    }
  };
  
  // Manejar cambio de subdominio con debounce
  const handleSubdomainChange = (value) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({...formData, subdomain: cleanValue});
    
    // Debounce: esperar 500ms antes de verificar
    clearTimeout(window.subdomainCheckTimeout);
    window.subdomainCheckTimeout = setTimeout(() => {
      checkSubdomain(cleanValue);
    }, 500);
  };
  
  // Registrar clínica
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/register/`, formData);
      
      if (response.data.success) {
        setSuccess(response.data.data);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ general: ['Error al registrar la clínica. Inténtalo de nuevo.'] });
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🧠 Psico Admin
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Sistema de Gestión para Clínicas Psicológicas
          </p>
          <p className="text-gray-500">
            Crea tu propia instancia en menos de 2 minutos
          </p>
        </div>
        
        {/* Formulario / Resultado */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
          {!success ? (
            // FORMULARIO DE REGISTRO
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Registra Tu Clínica
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre de la clínica */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Clínica <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clinic_name}
                    onChange={(e) => setFormData({...formData, clinic_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Ej: Clínica Bienestar"
                  />
                  {errors?.clinic_name && (
                    <p className="text-red-600 text-sm mt-1">{errors.clinic_name[0]}</p>
                  )}
                </div>
                
                {/* Subdominio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subdominio <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        required
                        value={formData.subdomain}
                        onChange={(e) => handleSubdomainChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                        placeholder="miclinica"
                      />
                      {checkingSubdomain && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                    <span className="text-gray-600 font-medium whitespace-nowrap">
                      .psicoadmin.xyz
                    </span>
                  </div>
                  
                  {/* Indicador de disponibilidad */}
                  {subdomainAvailable === true && (
                    <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                      <span className="text-lg">✅</span> Subdominio disponible
                    </p>
                  )}
                  {subdomainAvailable === false && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <span className="text-lg">❌</span> Subdominio no disponible
                    </p>
                  )}
                  {errors?.subdomain && (
                    <p className="text-red-600 text-sm mt-1">{errors.subdomain[0]}</p>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Mínimo 3 caracteres. Solo letras, números y guiones.
                  </p>
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email del Administrador <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.admin_email}
                    onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="admin@example.com"
                  />
                  {errors?.admin_email && (
                    <p className="text-red-600 text-sm mt-1">{errors.admin_email[0]}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Recibirás las credenciales de acceso en este email
                  </p>
                </div>
                
                {/* Teléfono (opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono <span className="text-gray-400">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.admin_phone}
                    onChange={(e) => setFormData({...formData, admin_phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="+34 600 000 000"
                  />
                  {errors?.admin_phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.admin_phone[0]}</p>
                  )}
                </div>
                
                {/* Dirección (opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección <span className="text-gray-400">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Calle Principal 123, Madrid"
                  />
                  {errors?.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.address[0]}</p>
                  )}
                </div>
                
                {/* Error general */}
                {errors?.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.general[0]}
                  </div>
                )}
                
                {/* Botón */}
                <button
                  type="submit"
                  disabled={loading || subdomainAvailable === false || checkingSubdomain}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creando Tu Clínica...
                    </span>
                  ) : (
                    '🚀 Crear Mi Clínica Ahora'
                  )}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  Al registrarte, aceptas nuestros términos y condiciones
                </p>
              </form>
            </div>
          ) : (
            // MENSAJE DE ÉXITO
            <div className="p-8 text-center space-y-6">
              <div className="text-8xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600">
                ¡Clínica Creada Exitosamente!
              </h2>
              <p className="text-gray-600 text-lg">
                Tu sistema está listo para usar
              </p>
              
              {/* Credenciales */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 p-6 rounded-lg text-left">
                <p className="font-semibold text-lg mb-4 text-gray-900">
                  📧 Datos de Acceso:
                </p>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-lg">{success.admin_email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Contraseña temporal:</span>
                    <div className="bg-white px-4 py-2 rounded border border-gray-300 font-mono text-lg mt-1">
                      {success.temporary_password}
                    </div>
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ Cambia esta contraseña después del primer inicio de sesión
                    </p>
                  </div>
                  <div className="pt-3 border-t border-gray-300">
                    <span className="font-medium">URL de tu sistema:</span>
                    <a 
                      href={success.admin_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:underline text-lg mt-1 break-all"
                    >
                      {success.admin_url}
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Botón de acceso */}
              <button
                onClick={() => window.location.href = success.admin_url}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-green-700 hover:to-blue-700 transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                🔐 Ir al Panel de Administración
              </button>
              
              <p className="text-sm text-gray-500">
                También hemos enviado estos datos a tu email
              </p>
            </div>
          )}
        </div>
        
        {/* Features */}
        {!success && (
          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Activación Instantánea</h3>
              <p className="text-gray-600 text-sm">
                Tu sistema estará listo en menos de 30 segundos
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Datos Aislados</h3>
              <p className="text-gray-600 text-sm">
                Cada clínica tiene su propia base de datos privada
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Personalizable</h3>
              <p className="text-gray-600 text-sm">
                Configura colores, logo y funcionalidades a tu medida
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 📝 Modificación en `src/App.jsx`

Agregar esta línea en las rutas:

```jsx
import LandingPage from './pages/LandingPage';

// En tu <Routes>:
<Route path="/" element={<LandingPage />} />
```

**IMPORTANTE:** Esta ruta debe estar ANTES de las rutas protegidas.

---

## 🎯 LISTO PARA COPIAR

1. Copia el código de `LandingPage.jsx` completo
2. Pégalo en un nuevo archivo: `src/pages/LandingPage.jsx`
3. Modifica `src/App.jsx` para agregar la ruta
4. Ejecuta: `npm run dev`
5. Accede a: http://localhost:5173

---

**✅ Código 100% funcional y listo para usar**
