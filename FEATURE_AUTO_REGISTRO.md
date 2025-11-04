# 🎉 NUEVA FUNCIONALIDAD - AUTO-REGISTRO DE CLÍNICAS

**Fecha:** 20 de Octubre de 2025  
**Feature:** Landing page pública para auto-registro de clínicas  
**Estado Backend:** ✅ COMPLETADO Y DESPLEGADO

---

## 🎯 OBJETIVO

Crear una landing page pública en `https://psicoadmin.xyz` donde nuevas clínicas puedan registrarse automáticamente y obtener su propio sistema multi-tenant.

---

## 🔥 FLUJO DE USUARIO

```
1. Usuario accede a https://psicoadmin.xyz
   ↓
2. Completa formulario de registro
   - Nombre de clínica
   - Subdominio deseado
   - Email del administrador
   - Teléfono (opcional)
   - Dirección (opcional)
   ↓
3. Sistema verifica disponibilidad de subdominio en tiempo real
   ↓
4. Click en "Crear Mi Clínica"
   ↓
5. Backend crea automáticamente:
   - Tenant en PostgreSQL (nuevo schema)
   - Usuario administrador
   - Configuración de DNS
   - Configuración inicial
   ↓
6. Usuario recibe credenciales temporales
   - Email: su email
   - Password: Admin123!
   ↓
7. Redirigido a https://[subdominio].psicoadmin.xyz/admin/
```

---

## 🛠️ API ENDPOINTS (Backend Ya Implementado)

### 1️⃣ Verificar Disponibilidad de Subdominio

**Endpoint:** `POST https://psico-admin.onrender.com/api/tenants/public/check-subdomain/`

**Request:**
```json
{
  "subdomain": "miclinica"
}
```

**Response:**
```json
{
  "available": true,
  "message": "Subdominio disponible"
}
```

**Validaciones del backend:**
- Mínimo 3 caracteres
- Máximo 63 caracteres
- Solo letras, números y guiones
- No puede empezar o terminar con guión
- No puede ser "www", "api", "admin", etc.

---

### 2️⃣ Registrar Nueva Clínica

**Endpoint:** `POST https://psico-admin.onrender.com/api/tenants/public/register/`

**Request:**
```json
{
  "clinic_name": "Mi Clínica Psicológica",
  "subdomain": "miclinica",
  "admin_email": "admin@example.com",
  "admin_phone": "+34 600 000 000",  // opcional
  "address": "Calle Principal 123"    // opcional
}
```

**Response (éxito):**
```json
{
  "success": true,
  "data": {
    "clinic_name": "Mi Clínica Psicológica",
    "subdomain": "miclinica",
    "admin_url": "https://miclinica.psicoadmin.xyz/admin/",
    "admin_email": "admin@example.com",
    "temporary_password": "Admin123!"
  }
}
```

**Response (error):**
```json
{
  "success": false,
  "errors": {
    "subdomain": ["Este subdominio ya está en uso"],
    "admin_email": ["Email inválido"]
  }
}
```

---

## 📝 IMPLEMENTACIÓN FRONTEND

### Paso 1: Crear Componente Landing Page

**Archivo:** `src/pages/LandingPage.jsx` (o `PublicRegisterPage.jsx`)

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

### Paso 2: Agregar Ruta en el Router

En tu archivo de rutas principal (ej: `src/App.jsx`):

```jsx
import LandingPage from './pages/LandingPage';

// Agregar esta ruta ANTES de las rutas protegidas
<Route path="/" element={<LandingPage />} />
```

---

### Paso 3: Configurar Dominios en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Add Domain:
   - `psicoadmin.xyz`
   - `www.psicoadmin.xyz`

---

### Paso 4: Configurar DNS en Namecheap

Agregar estos registros en `psicoadmin.xyz`:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | `www` | `cname.vercel-dns.com` | Automatic |
| A | `@` | [IP de Vercel] | Automatic |

*Nota: Vercel te dará las IPs A records específicas cuando agregues el dominio.*

---

## 🧪 TESTING

### Test 1: Verificar Disponibilidad de Subdominio

```bash
curl -X POST https://psico-admin.onrender.com/api/tenants/public/check-subdomain/ \
  -H "Content-Type: application/json" \
  -d '{"subdomain":"prueba123"}'
```

**Resultado esperado:**
```json
{"available": true, "message": "Subdominio disponible"}
```

---

### Test 2: Registro Completo

1. Abrir `https://psicoadmin.xyz`
2. Completar formulario:
   - **Nombre:** "Clínica Test"
   - **Subdominio:** "test123"
   - **Email:** "test@example.com"
   - **Teléfono:** "+34 600 000 000"
   - **Dirección:** "Calle Test 123"
3. Click en "Crear Mi Clínica"
4. Verificar mensaje de éxito
5. Verificar que aparecen las credenciales
6. Click en "Ir al Panel de Administración"
7. Verificar que redirige a `https://test123.psicoadmin.xyz/admin/`
8. Login con las credenciales mostradas

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Frontend:
- [ ] Crear `src/pages/LandingPage.jsx`
- [ ] Agregar ruta `/` en el router
- [ ] Testear formulario localmente
- [ ] Commit y push a Git

### Vercel:
- [ ] Agregar dominio `psicoadmin.xyz`
- [ ] Agregar dominio `www.psicoadmin.xyz`
- [ ] Deploy

### DNS:
- [ ] Configurar registros en Namecheap
- [ ] Esperar propagación (5-15 min)

### Testing:
- [ ] Verificar landing page carga
- [ ] Verificar check de subdominio funciona
- [ ] Registrar clínica de prueba
- [ ] Verificar acceso al panel de admin

---

## 🎨 MEJORAS OPCIONALES

### 1. Validación en Tiempo Real

Agregar validación visual mientras el usuario escribe:

```jsx
const validateSubdomain = (value) => {
  if (value.length < 3) return "Mínimo 3 caracteres";
  if (!/^[a-z0-9-]+$/.test(value)) return "Solo letras, números y guiones";
  if (value.startsWith('-') || value.endsWith('-')) return "No puede empezar o terminar con guión";
  return null;
};
```

### 2. Toast Notifications

Usar `react-toastify` para notificaciones:

```jsx
import { toast } from 'react-toastify';

// En el éxito:
toast.success('¡Clínica creada exitosamente!');

// En el error:
toast.error('Error al crear la clínica');
```

### 3. Analytics

Agregar Google Analytics o similar para trackear conversiones:

```jsx
// Después del registro exitoso:
gtag('event', 'signup', {
  method: 'landing_page',
  clinic_name: success.clinic_name
});
```

---

## 🐛 TROUBLESHOOTING

### Problema: CORS Error

**Causa:** Backend no permite peticiones desde el dominio  
**Solución:** Verificar que backend tenga en settings.py:
```python
CORS_ALLOWED_ORIGINS = [
    'https://psicoadmin.xyz',
    'https://www.psicoadmin.xyz',
]
```

### Problema: Subdominio siempre "no disponible"

**Causa:** Error en la petición al backend  
**Debug:**
```jsx
console.log('Respuesta del backend:', response);
```

### Problema: Redirect después del registro no funciona

**Causa:** URL malformada  
**Solución:** Verificar que `success.admin_url` tenga formato correcto

---

## 📊 MÉTRICAS DE ÉXITO

- ✅ Landing page carga en < 2 segundos
- ✅ Check de subdominio responde en < 500ms
- ✅ Registro completo toma < 5 segundos
- ✅ Conversión: 70%+ de visitantes completan registro

---

## 🎉 RESULTADO FINAL

Después de implementar esto, el sistema permitirá:

1. ✅ Clínicas se registran automáticamente desde `psicoadmin.xyz`
2. ✅ Obtienen su propia instancia aislada en `[subdomain].psicoadmin.xyz`
3. ✅ Reciben credenciales temporales inmediatamente
4. ✅ Pueden empezar a usar el sistema en segundos

---

**¿Listo para implementar?** 🚀

**Tiempo estimado:** 2-3 horas de desarrollo + testing
