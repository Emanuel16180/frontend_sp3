# 🔧 FIX URGENTE: CORS Backend para Vercel

## 🚨 Problema Actual

```
Access to XMLHttpRequest at 'https://psico-admin.onrender.com/api/tenants/public/check-subdomain/' 
from origin 'https://bienestar-psico-ml50pmcja-vazquescamila121-7209s-projects.vercel.app' 
has been blocked by CORS policy
```

**El backend NO está permitiendo peticiones desde dominios `.vercel.app`**

---

## ✅ Solución: Agregar Regex para Vercel

### Archivo: `settings.py` (o donde está la configuración CORS)

**BUSCAR:**
```python
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.psicoadmin\.xyz$",
]
```

**REEMPLAZAR POR:**
```python
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.psicoadmin\.xyz$",      # Dominios de producción
    r"^https://.*\.vercel\.app$",          # Dominios de Vercel (preview/production)
]
```

---

## 🔍 Verificación Completa del CORS

Asegúrate de que tu `settings.py` tenga EXACTAMENTE esto:

```python
# CORS Configuration
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.psicoadmin\.xyz$",      # *.psicoadmin.xyz
    r"^https://.*\.vercel\.app$",          # *.vercel.app
]

# Headers permitidos
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Métodos HTTP permitidos
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Exponer headers en respuesta
CORS_EXPOSE_HEADERS = [
    'Content-Type',
    'X-CSRFToken',
]
```

---

## 📋 Checklist de Verificación

- [ ] `CORS_ALLOW_CREDENTIALS = True` está presente
- [ ] Regex para `*.psicoadmin.xyz` existe
- [ ] **Regex para `*.vercel.app` agregado** ⬅️ NUEVO
- [ ] `django-cors-headers` instalado en requirements.txt
- [ ] `corsheaders` en `INSTALLED_APPS`
- [ ] `CorsMiddleware` en `MIDDLEWARE` (ANTES de CommonMiddleware)

---

## 🚀 Deployment

```bash
# En el backend
cd psico_admin_sp1_despliegue2

# Commit
git add config/settings.py  # o el archivo donde esté CORS
git commit -m "fix: Agregar CORS para dominios .vercel.app"
git push origin main

# Render detectará el cambio y redesplegará automáticamente
```

---

## ⏱️ Tiempo Estimado

- Hacer el cambio: **1 minuto**
- Push: **30 segundos**
- Redespliegue en Render: **3-5 minutos**

**Total: ~5-7 minutos**

---

## 🧪 Testing

Una vez desplegado, verifica en la consola de Vercel:

1. El error de CORS debe desaparecer
2. Deberías ver en Network: `check-subdomain` con status `200 OK`
3. La página debe redirigir correctamente a `/login`

---

## 🔗 Referencias

- Django CORS Headers: https://pypi.org/project/django-cors-headers/
- Vercel domains docs: https://vercel.com/docs/projects/domains
