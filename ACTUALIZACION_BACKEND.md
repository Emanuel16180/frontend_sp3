# 📨 ACTUALIZACIÓN PARA EL BACKEND - Deployment Único

**De:** Equipo Frontend  
**Para:** Equipo Backend  
**Fecha:** 20 de Octubre de 2025  
**Asunto:** Frontend cambiado a deployment único (no requiere cambios en backend)

---

## 🎯 RESUMEN EJECUTIVO

Simplificamos el frontend de **2 deployments separados** a **1 deployment único** que detecta automáticamente el tenant desde la URL.

**✅ BUENA NOTICIA: El backend NO requiere cambios. Ya está perfectamente configurado.**

---

## 🔄 ¿QUÉ CAMBIÓ EN EL FRONTEND?

### ANTES
```
2 proyectos en Vercel:
- bienestar-psico (con variables de entorno)
- mindcare-psico (con variables de entorno)
```

### AHORA
```
1 proyecto en Vercel:
- psico-frontend (sin variables de entorno)
  - Dominio: bienestar-app.psicoadmin.xyz
  - Dominio: mindcare-app.psicoadmin.xyz
  
El tenant se detecta automáticamente desde la URL.
```

---

## 🔍 CÓMO FUNCIONA LA DETECCIÓN AUTOMÁTICA

El frontend ahora tiene una función que analiza la URL:

```javascript
// bienestar-app.psicoadmin.xyz → tenant: "bienestar"
// mindcare-app.psicoadmin.xyz  → tenant: "mindcare"

// Luego construye la API URL automáticamente:
// tenant: "bienestar" → https://bienestar.psicoadmin.xyz/api
// tenant: "mindcare"  → https://mindcare.psicoadmin.xyz/api
```

**Resultado:** Mismo código frontend, diferentes APIs según el dominio.

---

## ✅ VERIFICACIÓN: Configuración del Backend

El backend ya está configurado correctamente. **NO se necesitan cambios.**

### ✅ CORS (Ya configurado)
```python
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.psicoadmin\.xyz$",  # ✅ Permite cualquier subdominio
    r"^https://.*\.vercel\.app$",
]
CORS_ALLOW_CREDENTIALS = True  # ✅ Permite cookies
```

### ✅ Cookies (Ya configurado)
```python
SESSION_COOKIE_DOMAIN = '.psicoadmin.xyz'  # ✅ Compartir entre subdominios
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_DOMAIN = '.psicoadmin.xyz'
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
```

### ✅ Middleware de Tenant (Ya configurado)
```python
# Detecta tenant por Host header
# bienestar-app.psicoadmin.xyz → consulta a bienestar.psicoadmin.xyz/api
# mindcare-app.psicoadmin.xyz → consulta a mindcare.psicoadmin.xyz/api
```

---

## 🔄 FLUJO DE PETICIÓN (Sin cambios para el backend)

```
Usuario → bienestar-app.psicoadmin.xyz/login
         │
         ▼
    [Frontend en Vercel]
    Detecta: tenant = "bienestar"
         │
         │ POST https://bienestar.psicoadmin.xyz/api/login/
         ▼
    [Nginx] Recibe petición
         │
         │ Host: bienestar.psicoadmin.xyz
         ▼
    [Django Middleware]
    Detecta tenant por Host header
    Cambia schema a "bienestar"
         │
         ▼
    [Django View]
    Procesa login
    Devuelve cookies
```

**El backend sigue funcionando exactamente igual.**

---

## 🧪 TESTING CONJUNTO

### URLs de Testing

| Frontend | Backend API |
|----------|-------------|
| `https://bienestar-app.psicoadmin.xyz` | `https://bienestar.psicoadmin.xyz/api` |
| `https://mindcare-app.psicoadmin.xyz` | `https://mindcare.psicoadmin.xyz/api` |

### Puntos de Verificación

1. **Login funciona correctamente** ✅
   - Usuario puede iniciar sesión desde ambos dominios
   
2. **Cookies se guardan correctamente** ✅
   - Domain: `.psicoadmin.xyz`
   - SameSite: `None`
   - Secure: `True`

3. **Tenant se detecta correctamente** ✅
   - Peticiones a `bienestar-app` van a backend de `bienestar`
   - Peticiones a `mindcare-app` van a backend de `mindcare`

4. **No hay errores de CORS** ✅
   - Headers CORS presentes en respuestas
   - Cookies se envían en peticiones subsecuentes

---

## 📅 CRONOGRAMA

| Fase | Tiempo | Estado |
|------|--------|--------|
| Cambios en código frontend | 30 min | ✅ Completado |
| Deploy en Vercel | 15 min | 🔄 Pendiente |
| Configuración DNS | 10 min | 🔄 Pendiente |
| Testing conjunto | 30 min | 🔄 Pendiente |

**Total estimado:** ~1.5 horas

---

## 🎉 VENTAJAS PARA EL BACKEND

- ✅ **Menos peticiones de soporte:** Frontend más simple = menos errores
- ✅ **Más fácil debugging:** Un solo deployment para revisar
- ✅ **Sin cambios requeridos:** Backend sigue funcionando igual
- ✅ **Escalable:** Agregar nuevos tenants es más fácil

---

## 🚀 PRÓXIMOS PASOS

### Coordinación Necesaria

1. **Frontend:** Desplegará en Vercel (1 solo proyecto)
2. **Backend:** Confirmar que endpoints responden ✅
3. **Testing:** Coordinar pruebas conjuntas

### Checklist de Go-Live

```
✅ Frontend desplegado en Vercel
✅ DNS configurado
✅ Backend endpoints activos
⏳ Testing de login (ambos dominios)
⏳ Testing de cookies
⏳ Testing de funcionalidades
```

---

## 🐛 SI ALGO FALLA

### Comandos de Diagnóstico para Backend

```bash
# Ver logs
pm2 logs gunicorn --lines 100

# Verificar que Django recibe las peticiones
# Buscar en logs:
# - Host header correcto (bienestar.psicoadmin.xyz o mindcare.psicoadmin.xyz)
# - Tenant detectado correctamente
# - Headers CORS en respuesta
```

### Puntos de Verificación

1. ✅ Nginx está corriendo: `sudo systemctl status nginx`
2. ✅ Django está corriendo: `pm2 status`
3. ✅ Endpoints responden: `curl https://bienestar.psicoadmin.xyz/api/`
4. ✅ CORS headers presentes en respuestas

---

## 📞 CONTACTO

Si tienen dudas o necesitan coordinación para el testing, estamos disponibles.

**El backend ya está perfecto. Solo necesitamos coordinar el testing final.** 👍

---

**¿Preguntas?** Estamos listos para el deploy cuando confirmen que los endpoints están activos. 🚀
