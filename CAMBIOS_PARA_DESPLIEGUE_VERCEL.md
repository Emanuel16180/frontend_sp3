# 📋 CAMBIOS REALIZADOS EN EL FRONTEND PARA DESPLIEGUE EN VERCEL

**Fecha:** 20 de Octubre de 2025  
**Proyecto:** Frontend SAS - Sistema Multi-Tenant  
**Objetivo:** Preparar frontend React + Vite para despliegue en Vercel con arquitectura multi-tenant

---

## 📁 ARCHIVOS NUEVOS CREADOS

### 1. `.env.example`
**Propósito:** Plantilla de variables de entorno para desarrollo local

```env
VITE_API_URL=http://localhost:8000
VITE_TENANT=bienestar
VITE_CLINIC_NAME=Clínica Bienestar
VITE_WS_URL=ws://localhost:8000
```

---

### 2. `.env.production.bienestar`
**Propósito:** Variables de entorno para el proyecto de Bienestar en Vercel

```env
VITE_API_URL=https://bienestar.psicoadmin.xyz
VITE_TENANT=bienestar
VITE_CLINIC_NAME=Clínica Bienestar
VITE_WS_URL=wss://bienestar.psicoadmin.xyz
```

**⚠️ IMPORTANTE:** Estas variables deben configurarse en Vercel manualmente:
- Ve a: Proyecto `bienestar-psico` → Settings → Environment Variables
- Agrega cada variable con su valor correspondiente

---

### 3. `.env.production.mindcare`
**Propósito:** Variables de entorno para el proyecto de Mindcare en Vercel

```env
VITE_API_URL=https://mindcare.psicoadmin.xyz
VITE_TENANT=mindcare
VITE_CLINIC_NAME=MindCare Psicología
VITE_WS_URL=wss://mindcare.psicoadmin.xyz
```

**⚠️ IMPORTANTE:** Estas variables deben configurarse en Vercel manualmente:
- Ve a: Proyecto `mindcare-psico` → Settings → Environment Variables
- Agrega cada variable con su valor correspondiente

---

### 4. `vercel.json`
**Propósito:** Configuración de Vercel para SPA y CORS

```json
{
  "rewrites": [
    {
      "source": "/:path*",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "$VITE_API_URL"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
        }
      ]
    }
  ]
}
```

**Función:** 
- Redirige todas las rutas a `index.html` (necesario para React Router)
- Configura headers CORS para comunicación con el backend

---

## 🔧 ARCHIVOS MODIFICADOS

### 1. `src/config/tenants.js`

#### ✨ Cambio 1: Agregados dominios de producción en TENANT_CONFIG

**ANTES:**
```javascript
export const TENANT_CONFIG = {
    'bienestar.localhost': { ... },
    'mindcare.localhost': { ... },
    'localhost': { ... }
};
```

**DESPUÉS:**
```javascript
export const TENANT_CONFIG = {
    // ⭐ NUEVO: Dominios de PRODUCCIÓN
    'bienestar-app.psicoadmin.xyz': {
        name: 'Clínica Bienestar',
        theme: 'bienestar',
        logo: '/logos/bienestar.png',
        colors: {
            primary: '#0066CC',
            secondary: '#00AA44'
        },
        apiUrl: 'https://bienestar.psicoadmin.xyz' // ⭐ Nueva propiedad
    },
    'mindcare-app.psicoadmin.xyz': {
        name: 'MindCare Psicología',
        theme: 'mindcare',
        logo: '/logos/mindcare.png',
        colors: {
            primary: '#6B46C1',
            secondary: '#EC4899'
        },
        apiUrl: 'https://mindcare.psicoadmin.xyz' // ⭐ Nueva propiedad
    },
    
    // ⭐ NUEVO: Dominios de Vercel (fallback)
    'bienestar-psico.vercel.app': { ... },
    'mindcare-psico.vercel.app': { ... },
    
    // Dominios de desarrollo (sin cambios)
    'bienestar.localhost': { ... },
    'mindcare.localhost': { ... },
    'localhost': { ... }
};
```

**Razón:** Permitir que el frontend detecte automáticamente en qué dominio está y use la API correcta.

---

#### ✨ Cambio 2: Actualizada función `getApiBaseURL()`

**ANTES:**
```javascript
export const getApiBaseURL = () => {
    const hostname = window.location.hostname;
    if (hostname.includes('localhost')) {
        return `http://${hostname}:8000/api`;
    }
    return `https://${hostname}/api`;
};
```

**DESPUÉS:**
```javascript
export const getApiBaseURL = () => {
    // ⭐ Prioridad 1: Variable de entorno de Vite
    if (import.meta.env.VITE_API_URL) {
        return `${import.meta.env.VITE_API_URL}/api`;
    }
    
    // ⭐ Prioridad 2: Configuración basada en hostname
    const hostname = window.location.hostname;
    const tenantConfig = TENANT_CONFIG[hostname];
    
    if (tenantConfig?.apiUrl) {
        return `${tenantConfig.apiUrl}/api`;
    }
    
    // Prioridad 3: Construcción automática (fallback)
    if (hostname.includes('localhost')) {
        return `http://${hostname}:8000/api`;
    }
    
    return `https://${hostname}/api`;
};
```

**Razón:** Sistema de prioridades que permite:
1. Variables de entorno de Vercel (más flexible)
2. Configuración hardcoded por hostname (más seguro)
3. Fallback automático (desarrollo local)

---

### 2. `src/api.js`

#### ✨ Cambio: Agregado `withCredentials: true`

**ANTES:**
```javascript
const apiClient = axios.create({
    baseURL: getApiBaseURL(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
```

**DESPUÉS:**
```javascript
const apiClient = axios.create({
    baseURL: getApiBaseURL(),
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // ⭐ CRÍTICO: Permite cookies cross-origin
});
```

**Razón:** 
- Permite que Axios envíe cookies (sessionid, csrftoken) al backend
- Necesario para autenticación con sesiones de Django
- Compatible con `CORS_ALLOW_CREDENTIALS = True` del backend

---

### 3. `.gitignore`

#### ✨ Cambio: Agregadas reglas para archivos .env

**ANTES:**
```gitignore
node_modules
dist
dist-ssr
*.local
```

**DESPUÉS:**
```gitignore
node_modules
dist
dist-ssr
*.local

# ⭐ Variables de entorno
.env
.env.local
.env.production
.env.development
```

**Razón:** Evitar que se suban variables de entorno sensibles a Git.

---

## 🚀 PASOS PARA DESPLEGAR EN VERCEL

### **PASO 1: Subir cambios a Git**

```bash
git add .
git commit -m "feat: Configuración multi-tenant para despliegue en Vercel"
git push origin main
```

---

### **PASO 2: Crear proyecto en Vercel para Bienestar**

1. Ir a [https://vercel.com/new](https://vercel.com/new)
2. Seleccionar el repositorio del frontend
3. Configurar proyecto:
   - **Project Name:** `bienestar-psico`
   - **Framework Preset:** Vite
   - **Root Directory:** `.` (raíz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment Variables** (copiar de `.env.production.bienestar`):
   ```
   VITE_API_URL=https://bienestar.psicoadmin.xyz
   VITE_TENANT=bienestar
   VITE_CLINIC_NAME=Clínica Bienestar
   VITE_WS_URL=wss://bienestar.psicoadmin.xyz
   ```

5. Click en **Deploy**

---

### **PASO 3: Agregar dominio personalizado a Bienestar**

1. En el proyecto `bienestar-psico` → Settings → Domains
2. Agregar: `bienestar-app.psicoadmin.xyz`
3. Vercel te dará un registro CNAME para agregar en Namecheap

---

### **PASO 4: Crear proyecto en Vercel para Mindcare**

1. Ir a [https://vercel.com/new](https://vercel.com/new)
2. Seleccionar el **MISMO** repositorio del frontend
3. Configurar proyecto:
   - **Project Name:** `mindcare-psico`
   - **Framework Preset:** Vite
   - **Root Directory:** `.` (raíz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment Variables** (copiar de `.env.production.mindcare`):
   ```
   VITE_API_URL=https://mindcare.psicoadmin.xyz
   VITE_TENANT=mindcare
   VITE_CLINIC_NAME=MindCare Psicología
   VITE_WS_URL=wss://mindcare.psicoadmin.xyz
   ```

5. Click en **Deploy**

---

### **PASO 5: Agregar dominio personalizado a Mindcare**

1. En el proyecto `mindcare-psico` → Settings → Domains
2. Agregar: `mindcare-app.psicoadmin.xyz`
3. Vercel te dará un registro CNAME para agregar en Namecheap

---

## 🌐 CONFIGURACIÓN DNS EN NAMECHEAP

Agregar estos registros en **psicoadmin.xyz**:

| Tipo  | Host             | Valor                    | TTL       |
|-------|------------------|--------------------------|-----------|
| CNAME | bienestar-app    | cname.vercel-dns.com     | Automático|
| CNAME | mindcare-app     | cname.vercel-dns.com     | Automático|

**Nota:** Los dominios del backend ya están configurados (bienestar.psicoadmin.xyz, mindcare.psicoadmin.xyz)

---

## ✅ CHECKLIST DE VERIFICACIÓN

```
✅ Archivos .env creados y documentados
✅ vercel.json configurado para SPA
✅ src/config/tenants.js actualizado con dominios de producción
✅ src/api.js configurado con withCredentials
✅ .gitignore actualizado para proteger .env
✅ Backend ya tiene CORS y cookies configuradas (revisar document abajo)
```

---

## 🔗 URLS FINALES ESPERADAS

**Clínica Bienestar:**
- Frontend: `https://bienestar-app.psicoadmin.xyz`
- Backend API: `https://bienestar.psicoadmin.xyz/api`

**Clínica Mindcare:**
- Frontend: `https://mindcare-app.psicoadmin.xyz`
- Backend API: `https://mindcare.psicoadmin.xyz/api`

---

## 📝 NOTAS IMPORTANTES

### ⚠️ Para el equipo de Backend:

**El backend ya tiene las configuraciones necesarias en `config/settings.py`:**

```python
# ✅ YA CONFIGURADO - CORS
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
    r"^https://.*\.psicoadmin\.xyz$",
]
CORS_ALLOW_CREDENTIALS = True

# ✅ YA CONFIGURADO - Cookies
SESSION_COOKIE_DOMAIN = '.psicoadmin.xyz'
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_DOMAIN = '.psicoadmin.xyz'
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
```

**✅ NO SE REQUIEREN CAMBIOS ADICIONALES EN EL BACKEND**

---

### 🧪 Testing después del deploy

**1. Verificar que el frontend cargue:**
```bash
curl -I https://bienestar-app.psicoadmin.xyz
# Debería retornar 200 OK
```

**2. Verificar conexión con API:**
- Abrir DevTools → Network
- Intentar login
- Verificar que las peticiones vayan a `https://bienestar.psicoadmin.xyz/api`
- Verificar que las cookies se guarden correctamente

**3. Verificar CORS:**
- Las peticiones NO deberían tener errores de CORS
- Las cookies (sessionid, csrftoken) deberían aparecer en Application → Cookies

---

## 🐛 TROUBLESHOOTING

### Problema: "CORS error"
**Solución:** Verificar que las variables de entorno estén bien configuradas en Vercel

### Problema: "No se guardan las cookies"
**Solución:** Verificar que `withCredentials: true` esté en `src/api.js`

### Problema: "API no responde"
**Solución:** Verificar que el backend esté corriendo y accesible desde internet

### Problema: "Página en blanco después del deploy"
**Solución:** Verificar que `vercel.json` tenga las reglas de rewrite para SPA

---

## 📞 CONTACTO

Si tienes problemas con el despliegue:
1. Revisa los logs en Vercel: Proyecto → Deployments → [último deploy] → View Function Logs
2. Revisa los logs del backend: `pm2 logs gunicorn`
3. Verifica los DNS con: `nslookup bienestar-app.psicoadmin.xyz`

---

**🎉 ¡Listo! El frontend está preparado para despliegue multi-tenant en Vercel**
