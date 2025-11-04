# 📨 DOCUMENTO PARA EL EQUIPO DE BACKEND

**De:** Equipo Frontend  
**Para:** Equipo Backend  
**Fecha:** 20 de Octubre de 2025  
**Asunto:** Cambios realizados en Frontend para despliegue multi-tenant en Vercel

---

## 🎯 RESUMEN EJECUTIVO

Hemos preparado el frontend React + Vite para despliegue en Vercel con arquitectura multi-tenant. 

**✅ BUENAS NOTICIAS:** El backend ya tiene TODAS las configuraciones necesarias. **NO se requieren cambios adicionales.**

---

## 📋 CAMBIOS REALIZADOS EN FRONTEND

### 1. **Configuración de Variables de Entorno**

Creamos archivos `.env.production` con las URLs de los backends:

- **Bienestar:** `https://bienestar.psicoadmin.xyz/api`
- **Mindcare:** `https://mindcare.psicoadmin.xyz/api`

### 2. **Habilitamos `withCredentials` en Axios**

Agregamos en `src/api.js`:
```javascript
const apiClient = axios.create({
    withCredentials: true, // ⭐ Ahora envía cookies (sessionid, csrftoken)
});
```

**Impacto en Backend:** Las peticiones ahora incluirán las cookies de sesión automáticamente.

### 3. **Configuración de CORS en Frontend**

Agregamos headers CORS en `vercel.json` para que el navegador permita las peticiones cross-origin.

### 4. **Sistema de Detección de Tenant**

El frontend detecta automáticamente en qué dominio está y usa la API correspondiente:

```
bienestar-app.psicoadmin.xyz  →  https://bienestar.psicoadmin.xyz/api
mindcare-app.psicoadmin.xyz   →  https://mindcare.psicoadmin.xyz/api
```

---

## ✅ VERIFICACIÓN: Configuración del Backend

Revisamos el archivo `config/settings.py` y confirmamos que ya tiene:

### **1. CORS habilitado correctamente ✅**
```python
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",      # Dominios de Vercel
    r"^https://.*\.psicoadmin\.xyz$",  # Dominios personalizados
]
CORS_ALLOW_CREDENTIALS = True  # ✅ Permite cookies
```

### **2. Configuración de Cookies ✅**
```python
SESSION_COOKIE_DOMAIN = '.psicoadmin.xyz'  # ✅ Compartir entre subdominios
SESSION_COOKIE_SAMESITE = 'None'           # ✅ Permitir cross-site
SESSION_COOKIE_SECURE = True               # ✅ Solo HTTPS
CSRF_COOKIE_DOMAIN = '.psicoadmin.xyz'     # ✅ Compartir CSRF
CSRF_COOKIE_SAMESITE = 'None'              # ✅ Permitir cross-site
CSRF_COOKIE_SECURE = True                  # ✅ Solo HTTPS
```

### **3. CSRF Trusted Origins ✅**
```python
CSRF_TRUSTED_ORIGINS = [
    'https://bienestar.psicoadmin.xyz',
    'https://mindcare.psicoadmin.xyz',
    'https://*.vercel.app',
    'https://*.psicoadmin.xyz',
]
```

---

## 🚀 PRÓXIMOS PASOS (ACCIÓN REQUERIDA)

### **Backend NO necesita cambios**, pero sí necesitamos coordinar:

### 1️⃣ **Confirmar que los subdominios del backend estén activos**

Por favor, confirmar que estos endpoints responden correctamente:

```bash
✅ https://bienestar.psicoadmin.xyz/api/
✅ https://mindcare.psicoadmin.xyz/api/
```

### 2️⃣ **Testing conjunto después del deploy**

Una vez que el frontend esté en Vercel, necesitaremos probar:

**Test 1: Login**
- URL: `https://bienestar-app.psicoadmin.xyz/login`
- Verificar que:
  - La petición vaya a `https://bienestar.psicoadmin.xyz/api/login/`
  - Se reciban las cookies `sessionid` y `csrftoken`
  - No haya errores de CORS

**Test 2: Autenticación**
- Verificar que las cookies se envíen en peticiones subsecuentes
- Verificar que el middleware de tenant detecte correctamente

**Test 3: Cookies Cross-Origin**
- Abrir DevTools → Application → Cookies
- Verificar que las cookies tengan:
  - `Domain: .psicoadmin.xyz`
  - `SameSite: None`
  - `Secure: True`

### 3️⃣ **Monitoreo de Logs**

Por favor, monitorear los logs de Django cuando empecemos las pruebas:

```bash
pm2 logs gunicorn
```

Buscar específicamente:
- Errores de CORS
- Headers de tenant incorrectos
- Problemas con cookies/sesiones

---

## 📊 FLUJO DE PETICIÓN ESPERADO

```
┌─────────────────────────────────┐
│ Usuario en                       │
│ bienestar-app.psicoadmin.xyz    │
└─────────────┬───────────────────┘
              │
              │ 1. Click "Login"
              ▼
┌─────────────────────────────────┐
│ Frontend (React + Axios)         │
│ - Agrega withCredentials: true  │
│ - Detecta tenant: bienestar     │
└─────────────┬───────────────────┘
              │
              │ 2. POST https://bienestar.psicoadmin.xyz/api/login/
              │    Headers:
              │    - Origin: https://bienestar-app.psicoadmin.xyz
              │    - Content-Type: application/json
              ▼
┌─────────────────────────────────┐
│ Nginx (Reverse Proxy)            │
│ - Detecta tenant por Host header│
└─────────────┬───────────────────┘
              │
              │ 3. Proxy a Gunicorn
              ▼
┌─────────────────────────────────┐
│ Django (Backend)                 │
│ - Middleware detecta tenant      │
│ - CORS valida origin             │
│ - Autentica usuario              │
│ - Crea sesión                    │
└─────────────┬───────────────────┘
              │
              │ 4. Response
              │    Set-Cookie: sessionid=...; Domain=.psicoadmin.xyz; SameSite=None; Secure
              │    Set-Cookie: csrftoken=...; Domain=.psicoadmin.xyz; SameSite=None; Secure
              ▼
┌─────────────────────────────────┐
│ Frontend guarda cookies          │
│ Las usa en siguientes peticiones│
└─────────────────────────────────┘
```

---

## 🔍 PUNTOS DE VALIDACIÓN PARA BACKEND

Por favor, revisar que:

### ✅ **Middleware de Tenant**
```python
# En TenantMiddleware
def process_request(self, request):
    tenant = get_tenant_from_request(request)
    print(f"✅ Tenant detectado: {tenant.schema_name}")
    # ...
```

### ✅ **CORS Headers en Response**
Verificar que las respuestas incluyan:
```
Access-Control-Allow-Origin: https://bienestar-app.psicoadmin.xyz
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, ...
```

### ✅ **Cookies en Response**
Verificar que al hacer login, la respuesta incluya:
```
Set-Cookie: sessionid=abc123...; Domain=.psicoadmin.xyz; Path=/; SameSite=None; Secure; HttpOnly
Set-Cookie: csrftoken=xyz789...; Domain=.psicoadmin.xyz; Path=/; SameSite=None; Secure
```

---

## 🐛 POSIBLES PROBLEMAS Y SOLUCIONES

### **Problema 1: CORS preflight OPTIONS no funciona**

**Síntoma:** Error en navegador: "CORS policy: Response to preflight request doesn't pass"

**Solución en Backend:**
```python
# Verificar que corsheaders esté antes que otros middlewares
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ⬅️ Debe ir PRIMERO
    'django.middleware.security.SecurityMiddleware',
    # ...
]
```

---

### **Problema 2: Cookies no se guardan**

**Síntoma:** El login responde OK pero no se guardan las cookies

**Checklist Backend:**
```python
✅ SESSION_COOKIE_DOMAIN = '.psicoadmin.xyz'  # Con punto inicial
✅ SESSION_COOKIE_SAMESITE = 'None'
✅ SESSION_COOKIE_SECURE = True
✅ CORS_ALLOW_CREDENTIALS = True
```

**Checklist Frontend:**
```javascript
✅ withCredentials: true en axios
```

---

### **Problema 3: CSRF Token no se envía**

**Síntoma:** Error 403 Forbidden en POST/PUT/DELETE

**Solución en Backend:**
```python
# Verificar que el frontend pueda leer el csrftoken
CSRF_COOKIE_HTTPONLY = False  # ⬅️ Debe ser False para que JS pueda leerlo
```

---

## 📅 CRONOGRAMA PROPUESTO

| Fase | Actividad | Responsable | Tiempo estimado |
|------|-----------|-------------|-----------------|
| 1 | Deploy frontend en Vercel | Frontend | 30 min |
| 2 | Configurar DNS (CNAMEs) | DevOps | 15 min |
| 3 | Testing básico (carga de páginas) | Frontend | 15 min |
| 4 | Testing de Login | Frontend + Backend | 30 min |
| 5 | Testing de autenticación | Frontend + Backend | 30 min |
| 6 | Testing de funcionalidades | QA | 2 horas |
| 7 | Monitoreo en producción | Backend | Continuo |

**Total estimado:** ~4 horas

---

## 📞 CONTACTO Y COORDINACIÓN

### **Para coordinar testing:**
- Equipo Frontend avisará cuando el deploy esté listo
- Equipo Backend tendrá `pm2 logs` abierto para monitorear
- Usaremos el canal de Slack/Discord para reportar problemas en tiempo real

### **Checklist de Go-Live:**
```
✅ Frontend desplegado en Vercel
✅ DNS configurado y propagado (verificar con nslookup)
✅ Backend responde en subdominios
✅ Login funciona sin errores CORS
✅ Cookies se guardan correctamente
✅ Autenticación persiste entre recargas
✅ Tenant se detecta correctamente
```

---

## 🎉 CONCLUSIÓN

**El backend está perfectamente configurado para recibir el frontend de Vercel.**

Los cambios en el frontend son completamente compatibles con la configuración actual del backend. No se requieren ajustes adicionales en el código de Django.

Solo necesitamos:
1. ✅ Confirmar que los endpoints estén activos
2. ✅ Coordinar testing conjunto
3. ✅ Monitorear logs durante las pruebas

---

**¿Preguntas? ¿Necesitan más detalles sobre algún cambio?**

Estamos listos para coordinar el testing cuando el backend confirme que los subdominios están activos. 🚀
