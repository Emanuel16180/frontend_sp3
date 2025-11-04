# 🚀 FRONTEND MULTI-TENANT - DEPLOYMENT ÚNICO

**Sistema de Gestión de Clínicas Psicológicas**  
**Versión:** 2.0 - Deployment Único con Detección Automática

---

## 🎯 ¿QUÉ ES ESTO?

Este es un sistema frontend React + Vite preparado para **deployment único en Vercel** que detecta automáticamente el tenant (clínica) desde la URL.

**Una sola aplicación desplegada → Múltiples clínicas con sus propios datos**

---

## ✨ CARACTERÍSTICAS

- ✅ **Deployment único:** Un solo proyecto en Vercel para todas las clínicas
- ✅ **Detección automática:** El tenant se detecta desde la URL (sin configuración)
- ✅ **Sin variables de entorno:** Todo funciona automáticamente
- ✅ **Multi-tenant:** Cada clínica tiene su propio backend aislado
- ✅ **Theming dinámico:** Cada clínica tiene su propio tema visual
- ✅ **Cross-origin cookies:** Autenticación segura entre subdominios

---

## 🌐 URLS DE PRODUCCIÓN

| Clínica | Frontend | Backend API |
|---------|----------|-------------|
| **Bienestar** | `https://bienestar-app.psicoadmin.xyz` | `https://bienestar.psicoadmin.xyz/api` |
| **Mindcare** | `https://mindcare-app.psicoadmin.xyz` | `https://mindcare.psicoadmin.xyz/api` |

**Importante:** Ambas URLs apuntan al **mismo deployment** en Vercel. El sistema detecta automáticamente cuál es cuál.

---

## 🏗️ ARQUITECTURA

```
Usuario accede a bienestar-app.psicoadmin.xyz
         │
         ▼
    [Vercel - UN SOLO DEPLOYMENT]
         │
         ├─→ getTenantFromHostname() analiza URL
         │   Resultado: "bienestar"
         │
         ├─→ getApiBaseURL() construye URL automáticamente
         │   Resultado: "https://bienestar.psicoadmin.xyz/api"
         │
         └─→ getCurrentTenantConfig() carga tema
             Resultado: Colores azules, logo de Bienestar
         │
         ▼
    [Backend Django - Multi-tenant]
    Schema PostgreSQL: "bienestar"
```

---

## 🚀 QUICK START - DESARROLLO LOCAL

```bash
# 1. Clonar e instalar
git clone <repo>
cd frontend_sas_sp2
npm install

# 2. Iniciar servidor
npm run dev

# 3. Acceder a:
# - http://localhost:5174                  → Admin Global
# - http://bienestar.localhost:5174        → Clínica Bienestar
# - http://mindcare.localhost:5174         → Clínica Mindcare
```

**Nota:** En Windows, agregar a `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 bienestar.localhost
127.0.0.1 mindcare.localhost
```

---

## 📦 DEPLOY EN VERCEL (Primera Vez)

### Paso 1: Push a Git
```bash
git add .
git commit -m "feat: Sistema multi-tenant con deployment único"
git push origin main
```

### Paso 2: Crear Proyecto en Vercel

1. Ir a https://vercel.com/new
2. Seleccionar repositorio
3. Configurar:
   - **Project Name:** `psico-frontend`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:** ❌ NO AGREGAR NINGUNA

### Paso 3: Agregar Dominios

1. Settings → Domains
2. Add: `bienestar-app.psicoadmin.xyz`
3. Add: `mindcare-app.psicoadmin.xyz`

### Paso 4: Configurar DNS

En Namecheap (psicoadmin.xyz):
```
Type    Host              Value
CNAME   bienestar-app     cname.vercel-dns.com
CNAME   mindcare-app      cname.vercel-dns.com
```

---

## 📚 DOCUMENTACIÓN COMPLETA

| Documento | Descripción | Para quién |
|-----------|-------------|------------|
| **[CHECKLIST_DEPLOYMENT_UNICO.md](./CHECKLIST_DEPLOYMENT_UNICO.md)** | Checklist paso a paso | Frontend |
| **[CAMBIOS_DEPLOYMENT_UNICO.md](./CAMBIOS_DEPLOYMENT_UNICO.md)** | Explicación técnica detallada | Frontend |
| **[ACTUALIZACION_BACKEND.md](./ACTUALIZACION_BACKEND.md)** | Resumen para equipo backend | Backend |
| **[COMANDOS_UTILES.md](./COMANDOS_UTILES.md)** | Comandos de referencia | DevOps |
| **[ARQUITECTURA.md](./ARQUITECTURA.md)** | Diagramas y flujos | Todos |

---

## 🔧 CÓMO FUNCIONA LA DETECCIÓN

### Ejemplo 1: Usuario en Bienestar

```javascript
// URL: bienestar-app.psicoadmin.xyz

getTenantFromHostname()  // → "bienestar"
getApiBaseURL()          // → "https://bienestar.psicoadmin.xyz/api"
getCurrentTenantConfig() // → { name: "Clínica Bienestar", colors: {...} }
```

### Ejemplo 2: Usuario en Mindcare

```javascript
// URL: mindcare-app.psicoadmin.xyz

getTenantFromHostname()  // → "mindcare"
getApiBaseURL()          // → "https://mindcare.psicoadmin.xyz/api"
getCurrentTenantConfig() // → { name: "MindCare Psicología", colors: {...} }
```

**Todo automático, sin configuración manual** ✨

---

## 🧪 TESTING

```bash
# Verificar que los sitios carguen
curl.exe -I https://bienestar-app.psicoadmin.xyz
curl.exe -I https://mindcare-app.psicoadmin.xyz

# Deben retornar: 200 OK
```

En el navegador (DevTools → Console):
```javascript
// Verificar tenant detectado
console.log(getTenantFromHostname());
// Bienestar: "bienestar"
// Mindcare: "mindcare"

// Verificar API URL
console.log(getApiBaseURL());
// Bienestar: "https://bienestar.psicoadmin.xyz/api"
// Mindcare: "https://mindcare.psicoadmin.xyz/api"
```

---

## 📊 STACK TECNOLÓGICO

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 19 + Vite 7 |
| **UI** | Tailwind CSS + Radix UI |
| **HTTP Client** | Axios (con `withCredentials: true`) |
| **Routing** | React Router DOM 7 |
| **Deploy** | Vercel (Serverless) |
| **Backend** | Django 5.0 Multi-tenant |
| **Database** | PostgreSQL (schemas separados) |

---

## 🔐 SEGURIDAD

- ✅ **HTTPS Only:** Solo funciona con HTTPS en producción
- ✅ **Cross-Origin Cookies:** `SameSite=None; Secure`
- ✅ **CORS Configurado:** Backend permite subdominios de `psicoadmin.xyz`
- ✅ **Aislamiento de Datos:** Cada tenant tiene su schema PostgreSQL separado

---

## 🐛 TROUBLESHOOTING

### Problema: "CORS Error"
**Causa:** Backend no está configurado correctamente  
**Solución:** Verificar que backend tenga `CORS_ALLOWED_ORIGIN_REGEXES` con `.*\.psicoadmin\.xyz`

### Problema: "Tenant incorrecto detectado"
**Causa:** URL no contiene el nombre del tenant  
**Debug:**
```javascript
console.log('Hostname:', window.location.hostname);
console.log('Tenant:', getTenantFromHostname());
```

### Problema: "Cookies no se guardan"
**Causa:** Backend no tiene configuración correcta de cookies  
**Solución:** Verificar que backend tenga `SESSION_COOKIE_DOMAIN = '.psicoadmin.xyz'`

Ver más en: [COMANDOS_UTILES.md](./COMANDOS_UTILES.md)

---

## 🚀 AGREGAR UN NUEVO TENANT

### Frontend (2 minutos):

1. Editar `src/config/tenants.js`:
```javascript
export const TENANT_CONFIG = {
    // ... existentes
    vita: {
        name: 'Clínica Vita',
        theme: 'vita',
        logo: '/logos/vita.png',
        colors: {
            primary: '#FF6B6B',
            secondary: '#4ECDC4'
        }
    }
};

export const getTenantFromHostname = () => {
    // ... código existente
    if (hostname.includes('vita')) return 'vita';
    // ... resto
};
```

### Vercel (1 minuto):
- Settings → Domains → Add: `vita-app.psicoadmin.xyz`

### DNS (1 minuto):
- CNAME: `vita-app` → `cname.vercel-dns.com`

**Total: 4 minutos** 🚀

---

## 📞 SOPORTE

### Logs
```bash
# Vercel (frontend)
vercel logs --follow

# Backend (SSH al servidor)
pm2 logs gunicorn
```

### Verificar DNS
```powershell
nslookup bienestar-app.psicoadmin.xyz
nslookup mindcare-app.psicoadmin.xyz
```

---

## 📈 VENTAJAS VS SISTEMA ANTERIOR

| Aspecto | Sistema Anterior | Sistema Actual |
|---------|------------------|----------------|
| Deployments | 2 proyectos | 1 proyecto ✅ |
| Variables de entorno | 8 variables | 0 variables ✅ |
| Complejidad | Media | Baja ✅ |
| Mantenimiento | Deploy 2x | Deploy 1x ✅ |
| Agregar tenant | ~30 min | ~4 min ✅ |

---

## 📄 LICENCIA

[Tu licencia aquí]

---

## 👥 CONTRIBUIDORES

- Frontend: [Tu equipo]
- Backend: [Equipo backend]
- DevOps: [Equipo DevOps]

---

## 🎉 ESTADO ACTUAL

✅ **Código listo**  
✅ **Documentación completa**  
✅ **Backend compatible (sin cambios requeridos)**  
⏳ **Pendiente: Deploy en Vercel**

---

**¿Listo para desplegar?** Lee [CHECKLIST_DEPLOYMENT_UNICO.md](./CHECKLIST_DEPLOYMENT_UNICO.md)

**🚀 ¡Deployment único, múltiples clínicas!**
