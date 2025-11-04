# 🎯 CAMBIOS REALIZADOS - DEPLOYMENT ÚNICO CON DETECCIÓN AUTOMÁTICA

**Fecha:** 20 de Octubre de 2025  
**Cambio:** De 2 deployments separados → 1 deployment único con detección automática de tenant

---

## 🎨 ¿QUÉ CAMBIÓ?

### ❌ ANTES (2 Deployments Separados)

```
Vercel
├── Proyecto: bienestar-psico
│   ├── Variables: VITE_API_URL, VITE_TENANT
│   └── Dominio: bienestar-app.psicoadmin.xyz
│
└── Proyecto: mindcare-psico
    ├── Variables: VITE_API_URL, VITE_TENANT
    └── Dominio: mindcare-app.psicoadmin.xyz
```

**Problemas:**
- 2 deployments para mantener
- Variables de entorno duplicadas
- Más complejo de configurar

---

### ✅ AHORA (1 Deployment Único)

```
Vercel
└── Proyecto: psico-frontend
    ├── Variables: NINGUNA ✨
    ├── Dominio 1: bienestar-app.psicoadmin.xyz
    └── Dominio 2: mindcare-app.psicoadmin.xyz
    
    (El tenant se detecta automáticamente desde la URL)
```

**Ventajas:**
- ✅ Un solo deployment
- ✅ Sin variables de entorno
- ✅ Detección automática
- ✅ Más fácil de mantener

---

## 📝 ARCHIVOS MODIFICADOS

### 1️⃣ `src/config/tenants.js`

#### ✨ Cambio 1: Simplificación de `TENANT_CONFIG`

**ANTES:**
```javascript
export const TENANT_CONFIG = {
    'bienestar-app.psicoadmin.xyz': { ... },
    'mindcare-app.psicoadmin.xyz': { ... },
    'bienestar.localhost': { ... },
    'mindcare.localhost': { ... },
    // etc...
};
```

**DESPUÉS:**
```javascript
export const TENANT_CONFIG = {
    bienestar: {
        name: 'Clínica Bienestar',
        theme: 'bienestar',
        logo: '/logos/bienestar.png',
        colors: { ... }
    },
    mindcare: {
        name: 'MindCare Psicología',
        theme: 'mindcare',
        logo: '/logos/mindcare.png',
        colors: { ... }
    },
    'global-admin': { ... }
};
```

**Razón:** Ya no necesitamos configuración por hostname exacto. Solo por nombre de tenant.

---

#### ✨ Cambio 2: Nueva función `getTenantFromHostname()`

**AGREGADO:**
```javascript
export const getTenantFromHostname = () => {
    const hostname = window.location.hostname;
    
    // Detectar tenant desde subdomain
    if (hostname.includes('mindcare')) {
        return 'mindcare';
    } else if (hostname.includes('bienestar')) {
        return 'bienestar';
    }
    
    // Desarrollo local
    if (hostname.includes('localhost')) {
        const subdomain = hostname.split('.')[0];
        if (subdomain === 'mindcare') return 'mindcare';
        if (subdomain === 'bienestar') return 'bienestar';
        if (subdomain === 'localhost') return 'global-admin';
        return 'bienestar'; // Default
    }
    
    return 'bienestar'; // Default global
};
```

**Función:** Detecta el tenant analizando la URL actual.

**Ejemplos:**
- `bienestar-app.psicoadmin.xyz` → `bienestar`
- `mindcare-app.psicoadmin.xyz` → `mindcare`
- `bienestar.localhost:5174` → `bienestar`
- `localhost:5174` → `global-admin`

---

#### ✨ Cambio 3: Actualizada función `getApiBaseURL()`

**ANTES:**
```javascript
export const getApiBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return `${import.meta.env.VITE_API_URL}/api`;
    }
    // ... más lógica compleja
};
```

**DESPUÉS:**
```javascript
export const getApiBaseURL = () => {
    const tenant = getTenantFromHostname();
    const hostname = window.location.hostname;
    
    // Desarrollo local
    if (hostname.includes('localhost')) {
        if (tenant === 'global-admin') {
            return 'http://localhost:8000/api';
        }
        return `http://${tenant}.localhost:8000/api`;
    }
    
    // Producción: construcción automática
    return `https://${tenant}.psicoadmin.xyz/api`;
};
```

**Razón:** 
- Ya no depende de variables de entorno
- Construcción automática según el tenant detectado
- Más simple y predecible

**Ejemplos:**
- `bienestar-app.psicoadmin.xyz` → API: `https://bienestar.psicoadmin.xyz/api`
- `mindcare-app.psicoadmin.xyz` → API: `https://mindcare.psicoadmin.xyz/api`

---

#### ✨ Cambio 4: Nuevas funciones helper

**AGREGADO:**
```javascript
export const getCurrentTenantConfig = getCurrentTenant; // Alias más descriptivo

// Actualizadas para usar getTenantFromHostname():
export const isGlobalAdmin = () => {
    const tenant = getTenantFromHostname();
    return tenant === 'global-admin';
};

export const isMultiTenant = () => {
    const tenant = getTenantFromHostname();
    return tenant !== 'global-admin';
};
```

---

### 2️⃣ `vercel.json`

**Cambio:** Actualizado header CORS

**ANTES:**
```json
"Access-Control-Allow-Origin": "$VITE_API_URL"
```

**DESPUÉS:**
```json
"Access-Control-Allow-Origin": "https://*.psicoadmin.xyz"
```

**Razón:** Ya no usamos variables de entorno, así que usamos wildcard para todos los subdominios.

---

### 3️⃣ `.env.example`

**Completamente reescrito:**

```env
# NO se necesitan variables de entorno en producción.
# El tenant se detecta automáticamente desde la URL.

# Para desarrollo local:
# - http://localhost:5174              → Admin Global
# - http://bienestar.localhost:5174    → Clínica Bienestar
# - http://mindcare.localhost:5174     → Clínica Mindcare
```

---

## 🗑️ ARCHIVOS ELIMINADOS

```
❌ .env.production.bienestar
❌ .env.production.mindcare
```

**Razón:** Ya no se necesitan. Todo se detecta automáticamente.

---

## 🚀 NUEVO PROCESO DE DEPLOYMENT EN VERCEL

### Paso 1: Crear UN SOLO proyecto

1. Ir a Vercel → New Project
2. Seleccionar repositorio del frontend
3. **Nombre del proyecto:** `psico-frontend` (o el que prefieras)
4. **Framework:** Vite
5. **Build Command:** `npm run build`
6. **Output Directory:** `dist`
7. **Variables de Entorno:** ❌ NO AGREGAR NINGUNA

### Paso 2: Agregar ambos dominios al mismo proyecto

1. En el proyecto → Settings → Domains
2. Add Domain: `bienestar-app.psicoadmin.xyz`
3. Add Domain: `mindcare-app.psicoadmin.xyz`

¡Listo! Ambos dominios usarán el mismo deployment.

---

## 🌐 CONFIGURACIÓN DNS (Sin cambios)

Sigue siendo la misma:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | `bienestar-app` | `cname.vercel-dns.com` | Automatic |
| CNAME | `mindcare-app` | `cname.vercel-dns.com` | Automatic |

---

## 🔄 FLUJO COMPLETO

```
Usuario → bienestar-app.psicoadmin.xyz
         │
         ▼
    [Vercel Frontend Único]
         │
         ├─→ getTenantFromHostname() detecta: "bienestar"
         ├─→ getApiBaseURL() construye: "https://bienestar.psicoadmin.xyz/api"
         └─→ getCurrentTenantConfig() carga tema de Bienestar
         │
         ▼
    [Backend] https://bienestar.psicoadmin.xyz/api
```

```
Usuario → mindcare-app.psicoadmin.xyz
         │
         ▼
    [Vercel Frontend Único]
         │
         ├─→ getTenantFromHostname() detecta: "mindcare"
         ├─→ getApiBaseURL() construye: "https://mindcare.psicoadmin.xyz/api"
         └─→ getCurrentTenantConfig() carga tema de Mindcare
         │
         ▼
    [Backend] https://mindcare.psicoadmin.xyz/api
```

---

## ✅ TESTING

### Test 1: Verificar detección de tenant

Agregar temporalmente en un componente:

```javascript
import { getTenantFromHostname, getApiBaseURL } from '@/config/tenants';

console.log('🔍 Hostname:', window.location.hostname);
console.log('✅ Tenant detectado:', getTenantFromHostname());
console.log('🌐 API URL:', getApiBaseURL());
```

**Resultado esperado en Bienestar:**
```
🔍 Hostname: bienestar-app.psicoadmin.xyz
✅ Tenant detectado: bienestar
🌐 API URL: https://bienestar.psicoadmin.xyz/api
```

**Resultado esperado en Mindcare:**
```
🔍 Hostname: mindcare-app.psicoadmin.xyz
✅ Tenant detectado: mindcare
🌐 API URL: https://mindcare.psicoadmin.xyz/api
```

---

### Test 2: Verificar tema y nombre

Cada sitio debe mostrar:
- ✅ Nombre correcto de la clínica
- ✅ Colores del tema correcto
- ✅ Logo correcto

---

### Test 3: Verificar API

Las peticiones deben ir a:
- `bienestar-app` → `https://bienestar.psicoadmin.xyz/api`
- `mindcare-app` → `https://mindcare.psicoadmin.xyz/api`

---

## 📋 CHECKLIST DE MIGRACIÓN

### Para el Frontend:
- [x] Actualizar `src/config/tenants.js`
- [x] Eliminar `.env.production.*`
- [x] Actualizar `.env.example`
- [x] Actualizar `vercel.json`
- [ ] Commit y push a Git
- [ ] Eliminar proyectos antiguos en Vercel (opcional)
- [ ] Crear nuevo proyecto único en Vercel
- [ ] NO agregar variables de entorno
- [ ] Agregar ambos dominios
- [ ] Testing completo

### Para el Backend:
- [x] Backend ya está configurado correctamente (no requiere cambios)
- [x] CORS permite `*.psicoadmin.xyz` ✅
- [x] Cookies configuradas con `Domain=.psicoadmin.xyz` ✅

---

## 🎉 VENTAJAS DEL NUEVO SISTEMA

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Deployments** | 2 proyectos | 1 proyecto |
| **Variables de entorno** | 8 variables (4 por proyecto) | 0 variables |
| **Mantenimiento** | Deploy en 2 lugares | Deploy en 1 lugar |
| **Configuración** | Manual por proyecto | Automática |
| **Escalabilidad** | Crear nuevo proyecto | Solo agregar dominio |
| **Testing** | 2 URLs diferentes | 2 URLs, mismo código |

---

## 🚀 AGREGAR UN NUEVO TENANT (FUTURO)

Si en el futuro quieren agregar "Clínica Vita":

### Frontend (2 minutos):
1. Agregar en `TENANT_CONFIG`:
   ```javascript
   vita: {
       name: 'Clínica Vita',
       theme: 'vita',
       logo: '/logos/vita.png',
       colors: { ... }
   }
   ```

2. Actualizar `getTenantFromHostname()`:
   ```javascript
   if (hostname.includes('vita')) {
       return 'vita';
   }
   ```

### Vercel (1 minuto):
1. Settings → Domains → Add: `vita-app.psicoadmin.xyz`

### DNS (1 minuto):
1. CNAME: `vita-app` → `cname.vercel-dns.com`

**Total: 4 minutos** 🚀

---

## 📞 DOCUMENTO PARA EL BACKEND

**El backend NO necesita cambios.** Ya está configurado correctamente para recibir peticiones de cualquier subdominio de `psicoadmin.xyz`.

✅ CORS permite: `*.psicoadmin.xyz`  
✅ Cookies con: `Domain=.psicoadmin.xyz`  
✅ Middleware detecta tenant por `Host` header

---

## 🐛 TROUBLESHOOTING

### Problema: Tenant incorrecto detectado

**Solución:** Agregar logs temporales:
```javascript
console.log('Hostname:', window.location.hostname);
console.log('Tenant:', getTenantFromHostname());
```

### Problema: API URL incorrecta

**Solución:** Verificar en Network tab de DevTools que las peticiones vayan a:
- `https://bienestar.psicoadmin.xyz/api/...`
- `https://mindcare.psicoadmin.xyz/api/...`

### Problema: CORS error

**Solución:** Verificar que el backend tenga:
```python
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.psicoadmin\.xyz$",
]
```

---

## 📊 RESUMEN DE CAMBIOS

| Métrica | Valor |
|---------|-------|
| **Archivos modificados** | 3 |
| **Archivos eliminados** | 2 |
| **Líneas de código agregadas** | ~40 |
| **Líneas de código eliminadas** | ~120 |
| **Variables de entorno eliminadas** | 8 |
| **Complejidad reducida** | ✅ Significativamente |

---

**🎉 ¡SISTEMA SIMPLIFICADO Y LISTO PARA DEPLOYMENT ÚNICO!**
