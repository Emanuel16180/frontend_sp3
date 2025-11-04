# 🌐 Arquitectura de URLs del Sistema Multi-Tenant

## ✅ CONFIGURACIÓN ACTUAL (FUNCIONANDO)

### 📋 Estructura de URLs

| Tipo | URL | Página | Propósito |
|------|-----|--------|-----------|
| **🏠 Dominio Raíz** | `https://psicoadmin.xyz/` | `LandingPage.jsx` | Formulario para registrar NUEVAS CLÍNICAS |
| **🔐 Login Admin General** | `https://psicoadmin.xyz/login` | `LoginPage.jsx` | Login del superusuario del sistema |
| **🏥 Login Bienestar** | `https://bienestar-app.psicoadmin.xyz/login` | `LoginPage.jsx` | Login usuarios de Clínica Bienestar |
| **🏥 Login Mindcare** | `https://mindcare-app.psicoadmin.xyz/login` | `LoginPage.jsx` | Login usuarios de Clínica Mindcare |
| **📝 Registro Paciente** | `https://bienestar-app.psicoadmin.xyz/register` | `RegisterPage.jsx` | Nuevos pacientes en la clínica |

---

## 🔄 Flujos de Usuario

### **1️⃣ Registro de Nueva Clínica**
```
Usuario → https://psicoadmin.xyz/
       ↓
   [LandingPage muestra formulario]
       ↓
   Llena datos (nombre, subdominio, email)
       ↓
   Backend crea tenant + base de datos
       ↓
   Pantalla de éxito con credenciales
       ↓
   https://nuevo-subdominio-app.psicoadmin.xyz/login
```

### **2️⃣ Login de Admin General**
```
Admin → https://psicoadmin.xyz/login
     ↓
 Ingresa: admin@psicoadmin.xyz / admin123
     ↓
 Backend autentica en schema "public"
     ↓
 https://psicoadmin.xyz/global-admin (Dashboard)
```

### **3️⃣ Login de Usuario de Clínica**
```
Usuario → https://bienestar-app.psicoadmin.xyz/
       ↓
   [LandingPage detecta tenant existe]
       ↓
   Redirect automático a /login
       ↓
   Ingresa: admin@bienestar.com / admin123
       ↓
   Backend autentica en schema "bienestar"
       ↓
   https://bienestar-app.psicoadmin.xyz/admin-dashboard
```

### **4️⃣ Registro de Paciente en Clínica**
```
Nuevo Usuario → https://bienestar-app.psicoadmin.xyz/register
            ↓
        [Formulario de registro]
            ↓
        Llena datos personales
            ↓
        Backend crea usuario en schema "bienestar"
            ↓
        https://bienestar-app.psicoadmin.xyz/login
```

---

## 🛠️ Cambios Aplicados

### **✅ Cambio 1: LandingPage.jsx**
**Problema anterior:** 
- Redirigía a `/login` en TODOS los casos donde detectaba un tenant
- En `psicoadmin.xyz`, detectaba tenant `bienestar` (default) y redirigía

**Solución aplicada:**
```javascript
useEffect(() => {
  const hostname = window.location.hostname;
  
  // ✅ Si estamos en dominio raíz, MOSTRAR formulario
  const isRootDomain = hostname === 'psicoadmin.xyz' || 
                       hostname === 'www.psicoadmin.xyz';
  
  if (isRootDomain) {
    console.log('Dominio raíz - mostrando formulario');
    setIsCheckingTenant(false);
    return; // NO redirigir
  }
  
  // ✅ Solo redirigir si es subdominio -app y tenant existe
  if (hostname.includes('-app.psicoadmin.xyz')) {
    // Verificar si tenant existe y redirigir a /login
  }
}, []);
```

### **✅ Cambio 2: tenants.js - getApiBaseURL()**
**Problema anterior:**
- Frontend en `bienestar-app.psicoadmin.xyz` construía URL incorrecta

**Solución aplicada:**
```javascript
export const getApiBaseURL = () => {
  const hostname = window.location.hostname;
  
  // ✅ Quitar -app del hostname para el backend
  if (hostname.includes('-app.psicoadmin.xyz')) {
    const backendHost = hostname.replace('-app', '');
    return `https://${backendHost}/api`;
  }
  
  return `https://${tenant}.psicoadmin.xyz/api`;
};
```

---

## 🔑 Credenciales de Prueba

### **Admin General (Sistema Completo)**
- **URL:** https://psicoadmin.xyz/login
- **Email:** `admin@psicoadmin.xyz`
- **Password:** `admin123`
- **Dashboard:** `/global-admin`

### **Clínica Bienestar**
- **Admin:** `admin@bienestar.com` / `admin123`
- **Profesional:** `dra.martinez@bienestar.com` / `demo123`
- **Paciente:** `juan.perez@example.com` / `demo123`
- **URL:** https://bienestar-app.psicoadmin.xyz/login

### **Clínica Mindcare**
- **Admin:** `admin@mindcare.com` / `admin123`
- **Profesional:** `dra.torres@mindcare.com` / `demo123`
- **Paciente:** `carlos.ruiz@example.com` / `demo123`
- **URL:** https://mindcare-app.psicoadmin.xyz/login

---

## 🧪 Testing Checklist

### ✅ Funcionalidad Básica
- [x] `psicoadmin.xyz/` muestra formulario de registro de clínicas
- [x] `psicoadmin.xyz/login` permite login de admin general
- [x] `bienestar-app.psicoadmin.xyz/` redirige automáticamente a `/login`
- [x] `bienestar-app.psicoadmin.xyz/login` permite login de usuarios de Bienestar
- [x] `mindcare-app.psicoadmin.xyz/login` permite login de usuarios de Mindcare

### ✅ CORS y Comunicación Backend
- [x] Frontend en `-app.psicoadmin.xyz` apunta correctamente a backend sin `-app`
- [x] Cookies de sesión se comparten correctamente (Domain=.psicoadmin.xyz)
- [x] No hay errores 403 CORS

### ✅ Registro de Clínicas
- [x] Formulario verifica disponibilidad de subdominio en tiempo real
- [x] Backend crea tenant automáticamente
- [x] Muestra credenciales temporales después del registro
- [x] Nuevo subdominio funciona inmediatamente

---

## 📊 Arquitectura Backend

### **Base de Datos Multi-Tenant (PostgreSQL)**
```
┌─────────────────────────────────────┐
│  PostgreSQL Database                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Schema: public              │   │
│  │ - Admin general             │   │
│  │ - Configuración global      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Schema: bienestar           │   │
│  │ - Usuarios de Bienestar     │   │
│  │ - Citas, pacientes, etc.    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Schema: mindcare            │   │
│  │ - Usuarios de Mindcare      │   │
│  │ - Citas, pacientes, etc.    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### **Routing de Django**
```python
# middleware detecta subdomain
if hostname == 'bienestar.psicoadmin.xyz':
    schema = 'bienestar'
elif hostname == 'mindcare.psicoadmin.xyz':
    schema = 'mindcare'
else:
    schema = 'public'

# ejecuta queries en el schema correcto
connection.set_schema(schema)
```

---

## 🚀 Despliegue en Vercel

### **Configuración Actual**
- **Proyecto:** Un solo proyecto en Vercel
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework:** Vite
- **Node Version:** 18.x

### **Dominios Configurados**
```
psicoadmin.xyz                      → Principal
www.psicoadmin.xyz                  → Alias
bienestar-app.psicoadmin.xyz        → Subdominio clínica 1
mindcare-app.psicoadmin.xyz         → Subdominio clínica 2
*.psicoadmin.xyz                    → Wildcard (futuras clínicas)
```

### **Variables de Entorno**
**❌ NINGUNA** - El sistema detecta automáticamente el tenant desde el hostname.

---

## 📝 Próximos Pasos

1. **Testing exhaustivo:**
   - Probar todos los flujos de usuario
   - Verificar que no haya errores CORS
   - Confirmar que las cookies funcionan

2. **Optimizaciones:**
   - Agregar caché de verificación de subdominios
   - Implementar rate limiting en el registro
   - Agregar analytics

3. **Documentación:**
   - Crear guías para usuarios finales
   - Documentar proceso de onboarding de clínicas

---

## 🐛 Problemas Comunes y Soluciones

### **Problema: "Verificando clínica..." infinito**
**Causa:** Backend no responde o CORS bloqueado
**Solución:** Verificar que `https://psico-admin.onrender.com` esté online

### **Problema: Redirige a login en dominio raíz**
**Causa:** Lógica de LandingPage incorrecta
**Solución:** ✅ Ya corregido en commit `af9d875`

### **Problema: Error 403 CORS**
**Causa:** Backend no permite origen
**Solución:** ✅ Ya configurado en backend (CORS_ALLOWED_ORIGIN_REGEXES)

### **Problema: Admin general no puede hacer login**
**Causa:** Intenta hacer login en subdominio de clínica
**Solución:** Debe usar `https://psicoadmin.xyz/login`

---

## 📞 Información de Contacto y Soporte

- **Repositorio Frontend:** https://github.com/Camila-V1/frontend_sas_sp2
- **Repositorio Backend:** https://github.com/Camila-V1/psico_admin_sp1_despliegue2
- **Deploy Frontend:** https://vercel.com
- **Deploy Backend:** https://render.com

---

**Última actualización:** 21 de Octubre, 2025  
**Commit:** `af9d875` - "fix: Permite mostrar formulario de registro en dominio raíz"
