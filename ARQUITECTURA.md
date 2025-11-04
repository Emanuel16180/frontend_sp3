# 🏗️ ARQUITECTURA MULTI-TENANT - Frontend + Backend

## 📐 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USUARIOS                                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                             │
        ▼                                             ▼
┌─────────────────────┐                   ┌─────────────────────┐
│  Usuario Bienestar   │                   │  Usuario Mindcare    │
│  (Navegador)         │                   │  (Navegador)         │
└──────────┬───────────┘                   └──────────┬───────────┘
           │                                           │
           │ https://bienestar-app.psicoadmin.xyz     │ https://mindcare-app.psicoadmin.xyz
           │                                           │
           ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              VERCEL                                  │
│  ┌─────────────────────┐           ┌─────────────────────┐          │
│  │ Proyecto Bienestar  │           │ Proyecto Mindcare   │          │
│  │ ─────────────────── │           │ ─────────────────── │          │
│  │ React + Vite        │           │ React + Vite        │          │
│  │                     │           │                     │          │
│  │ Variables de Env:   │           │ Variables de Env:   │          │
│  │ VITE_API_URL=       │           │ VITE_API_URL=       │          │
│  │   bienestar...      │           │   mindcare...       │          │
│  └──────────┬──────────┘           └──────────┬──────────┘          │
└─────────────┼───────────────────────────────────┼───────────────────┘
              │                                   │
              │ API Requests                      │ API Requests
              │ (withCredentials: true)           │ (withCredentials: true)
              │                                   │
              ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         NAMECHEAP DNS                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ bienestar.psicoadmin.xyz     →  IP del Servidor VPS          │   │
│  │ mindcare.psicoadmin.xyz      →  IP del Servidor VPS          │   │
│  │ bienestar-app.psicoadmin.xyz →  cname.vercel-dns.com         │   │
│  │ mindcare-app.psicoadmin.xyz  →  cname.vercel-dns.com         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
              │                                   │
              │                                   │
              ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVIDOR VPS (DigitalOcean)                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                        NGINX (Reverse Proxy)                   │  │
│  │  ┌─────────────────────────┐  ┌─────────────────────────┐     │  │
│  │  │ bienestar.psicoadmin.xyz│  │ mindcare.psicoadmin.xyz │     │  │
│  │  │ (Detecta Host header)   │  │ (Detecta Host header)   │     │  │
│  │  └────────────┬─────────────┘  └────────────┬──────────┘     │  │
│  └───────────────┼──────────────────────────────┼───────────────┘  │
│                  │                              │                   │
│                  │                              │                   │
│  ┌───────────────┴──────────────────────────────┴───────────────┐  │
│  │                    GUNICORN (WSGI Server)                     │  │
│  │                      (Puerto 8000)                            │  │
│  └───────────────────────────────────────┬────────────────────────┘│
│                                           │                          │
│  ┌────────────────────────────────────────┴────────────────────────┐│
│  │                     DJANGO (Backend)                            ││
│  │  ┌─────────────────────────────────────────────────────────┐   ││
│  │  │              TenantMiddleware                            │   ││
│  │  │  - Detecta tenant por Host header                        │   ││
│  │  │  - Cambia schema PostgreSQL                              │   ││
│  │  │  - Schema: bienestar o mindcare                          │   ││
│  │  └─────────────────────────────────────────────────────────┘   ││
│  │  ┌─────────────────────────────────────────────────────────┐   ││
│  │  │              CORS Middleware                             │   ││
│  │  │  - Valida origin permitidos                              │   ││
│  │  │  - Permite credentials (cookies)                         │   ││
│  │  │  - Agrega headers CORS                                   │   ││
│  │  └─────────────────────────────────────────────────────────┘   ││
│  │  ┌─────────────────────────────────────────────────────────┐   ││
│  │  │              Session Middleware                          │   ││
│  │  │  - Maneja cookies de sesión                              │   ││
│  │  │  - Domain: .psicoadmin.xyz                               │   ││
│  │  │  - SameSite: None, Secure: True                          │   ││
│  │  └─────────────────────────────────────────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                           │                          │
│                                           ▼                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database                         │  │
│  │  ┌─────────────────┐        ┌─────────────────┐               │  │
│  │  │ Schema: public  │        │ Schema:bienestar│               │  │
│  │  │ (Admin Global)  │        │ (Tenant)        │               │  │
│  │  └─────────────────┘        └─────────────────┘               │  │
│  │  ┌─────────────────┐                                           │  │
│  │  │ Schema:mindcare │                                           │  │
│  │  │ (Tenant)        │                                           │  │
│  │  └─────────────────┘                                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de una Petición (Login de Bienestar)

### 1️⃣ **Usuario ingresa credenciales**
```
Usuario en: https://bienestar-app.psicoadmin.xyz/login
Ingresa: usuario@example.com, password123
```

### 2️⃣ **Frontend envía petición**
```javascript
// src/api.js
apiClient.post('/login/', { email, password })

// Se envía a:
POST https://bienestar.psicoadmin.xyz/api/login/

// Headers:
Origin: https://bienestar-app.psicoadmin.xyz
Content-Type: application/json
// SIN cookies aún (es el primer login)
```

### 3️⃣ **DNS resuelve a VPS**
```
bienestar.psicoadmin.xyz → 167.99.xxx.xxx (IP del VPS)
```

### 4️⃣ **Nginx recibe petición**
```nginx
# nginx/sites-available/bienestar
server {
    server_name bienestar.psicoadmin.xyz;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;  # ⭐ Crucial para tenant
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 5️⃣ **Gunicorn recibe y pasa a Django**
```
Gunicorn worker recibe petición en puerto 8000
Pasa a Django WSGI application
```

### 6️⃣ **Django Middleware procesa**

**A) TenantMiddleware:**
```python
def process_request(self, request):
    host = request.get_host()  # 'bienestar.psicoadmin.xyz'
    tenant = get_tenant_from_host(host)  # Tenant: bienestar
    connection.set_schema(tenant.schema_name)  # Schema: bienestar
    # ✅ Ahora todas las queries van a schema 'bienestar'
```

**B) CorsMiddleware:**
```python
# Valida que origin esté permitido
origin = request.headers['Origin']  # bienestar-app.psicoadmin.xyz
if origin in CORS_ALLOWED_ORIGINS:  # ✅ Está permitido
    # Agrega headers CORS a la respuesta
```

**C) SessionMiddleware:**
```python
# Busca sessionid en las cookies (no hay aún)
# Prepara para crear nueva sesión
```

### 7️⃣ **Django View procesa login**
```python
# views/login.py
def login_view(request):
    user = authenticate(email=email, password=password)
    if user:
        login(request, user)  # Crea sesión
        return Response({'success': True})
```

### 8️⃣ **Django responde con cookies**
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://bienestar-app.psicoadmin.xyz
Access-Control-Allow-Credentials: true
Set-Cookie: sessionid=abc123xyz...; 
            Domain=.psicoadmin.xyz; 
            Path=/; 
            SameSite=None; 
            Secure; 
            HttpOnly
Set-Cookie: csrftoken=def456uvw...; 
            Domain=.psicoadmin.xyz; 
            Path=/; 
            SameSite=None; 
            Secure

{"success": true, "user": {...}}
```

### 9️⃣ **Nginx pasa respuesta al frontend**
```
Nginx → Internet → Vercel → Usuario
```

### 🔟 **Frontend guarda cookies**
```javascript
// Axios automáticamente guarda las cookies
// Porque está configurado con withCredentials: true

// Las cookies se guardan en el navegador:
// Domain: .psicoadmin.xyz
// Esto significa que se enviarán a:
// - bienestar.psicoadmin.xyz ✅
// - mindcare.psicoadmin.xyz ✅
// - cualquier-subdominio.psicoadmin.xyz ✅
```

---

## 🔄 Flujo de peticiones subsecuentes

### Usuario navega a Dashboard

```javascript
// Frontend hace petición GET
apiClient.get('/dashboard/')

// Se envía a:
GET https://bienestar.psicoadmin.xyz/api/dashboard/

// Headers AUTOMÁTICOS:
Origin: https://bienestar-app.psicoadmin.xyz
Cookie: sessionid=abc123xyz...; csrftoken=def456uvw...
//       ⬆️ ¡Cookies enviadas automáticamente!
```

Django valida:
1. ✅ Cookies presentes
2. ✅ Sesión válida
3. ✅ Usuario autenticado
4. ✅ Devuelve datos del dashboard

---

## 🔐 Seguridad: Por qué funciona Cross-Origin

### Configuración coordinada Frontend-Backend

| Configuración | Frontend | Backend | Resultado |
|---------------|----------|---------|-----------|
| **Cookies** | `withCredentials: true` | `CORS_ALLOW_CREDENTIALS = True` | ✅ Cookies se envían |
| **Domain** | N/A | `SESSION_COOKIE_DOMAIN = '.psicoadmin.xyz'` | ✅ Cookies compartidas entre subdominios |
| **SameSite** | N/A | `SESSION_COOKIE_SAMESITE = 'None'` | ✅ Cookies funcionan cross-site |
| **Secure** | N/A | `SESSION_COOKIE_SECURE = True` | ✅ Solo HTTPS |
| **CORS Origin** | Envía header `Origin` | `CORS_ALLOWED_ORIGINS` lista origins | ✅ Backend valida y permite |

---

## 🌐 Aislamiento de Tenants

### Separación a nivel de Base de Datos

```sql
-- Cada tenant tiene su propio schema PostgreSQL

-- Schema: bienestar
SELECT * FROM users;  -- Solo usuarios de Bienestar
SELECT * FROM appointments;  -- Solo citas de Bienestar

-- Schema: mindcare
SELECT * FROM users;  -- Solo usuarios de Mindcare
SELECT * FROM appointments;  -- Solo citas de Mindcare

-- Schema: public
SELECT * FROM django_tenants_tenant;  -- Lista de todos los tenants
-- Esta tabla es compartida (no sensible)
```

### Cambio automático de Schema

```python
# Django automáticamente cambia el schema según el Host header

# Petición a bienestar.psicoadmin.xyz
connection.schema_name  # 'bienestar'
User.objects.all()  # SELECT * FROM bienestar.users

# Petición a mindcare.psicoadmin.xyz
connection.schema_name  # 'mindcare'
User.objects.all()  # SELECT * FROM mindcare.users
```

**⚡ Clave:** El TenantMiddleware detecta el tenant ANTES de cualquier query, garantizando aislamiento total.

---

## 📊 Comparación: Antes vs Después

### ANTES (Desarrollo Local)

```
┌────────────────┐
│   localhost    │ → Admin Global
│   :5174        │
└────────────────┘
        │
        ▼
┌────────────────┐
│   localhost    │ → Backend
│   :8000        │
└────────────────┘

┌────────────────┐
│ bienestar.     │ → Tenant Bienestar
│ localhost:5174 │
└────────────────┘
        │
        ▼
┌────────────────┐
│ bienestar.     │ → Backend
│ localhost:8000 │
└────────────────┘
```

### DESPUÉS (Producción en Vercel)

```
┌──────────────────────────────┐
│ bienestar-app.psicoadmin.xyz │ → Frontend en Vercel
└──────────────────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ bienestar.psicoadmin.xyz     │ → Backend en VPS
└──────────────────────────────┘

┌──────────────────────────────┐
│ mindcare-app.psicoadmin.xyz  │ → Frontend en Vercel
└──────────────────────────────┘
              │
              ▼
┌──────────────────────────────┐
│ mindcare.psicoadmin.xyz      │ → Backend en VPS
└──────────────────────────────┘
```

**Ventajas:**
- ✅ Frontend serverless (escalable, rápido)
- ✅ Backend centralizado (una sola instancia para todos)
- ✅ Aislamiento de datos por tenant
- ✅ Dominios profesionales
- ✅ HTTPS automático
- ✅ Despliegues independientes

---

## 🔧 Tecnologías Utilizadas

| Capa | Tecnología | Función |
|------|------------|---------|
| **Frontend** | React 19 + Vite 7 | UI/UX, SPA |
| **Deploy Frontend** | Vercel | Hosting serverless, CDN global |
| **DNS** | Namecheap | Gestión de dominios |
| **Reverse Proxy** | Nginx | Enrutamiento, SSL, cache |
| **Application Server** | Gunicorn | WSGI server para Django |
| **Backend Framework** | Django 5.0 | API REST, lógica de negocio |
| **Multi-tenancy** | django-tenants | Aislamiento por schema PostgreSQL |
| **Base de Datos** | PostgreSQL 14+ | Persistencia con schemas |
| **Authentication** | Django Sessions + Token | Autenticación híbrida |
| **CORS** | django-cors-headers | Comunicación cross-origin |
| **Servidor** | DigitalOcean VPS | Ubuntu 22.04 |
| **Process Manager** | PM2 | Mantener Gunicorn activo |

---

## 📈 Escalabilidad Futura

### Agregar un nuevo tenant (Ej: "VitaPsico")

#### Backend (10 minutos):
```bash
python manage.py create_tenant \
  --schema_name=vitapsico \
  --name="Vita Psicología" \
  --domain=vitapsico.psicoadmin.xyz
```

#### DNS (5 minutos):
```
# Namecheap
CNAME vitapsico → IP del VPS
CNAME vitapsico-app → cname.vercel-dns.com
```

#### Nginx (5 minutos):
```bash
cp /etc/nginx/sites-available/bienestar /etc/nginx/sites-available/vitapsico
# Editar: cambiar server_name a vitapsico.psicoadmin.xyz
sudo systemctl reload nginx
```

#### Frontend (15 minutos):
```bash
# Crear .env.production.vitapsico con:
VITE_API_URL=https://vitapsico.psicoadmin.xyz

# Crear proyecto en Vercel: vitapsico-psico
# Agregar dominio: vitapsico-app.psicoadmin.xyz
```

**Total: ~35 minutos para un nuevo tenant completo** 🚀

---

**📚 Documentos relacionados:**
- `CAMBIOS_PARA_DESPLIEGUE_VERCEL.md` - Guía técnica detallada
- `DOCUMENTO_PARA_BACKEND.md` - Info para compartir con backend
- `CHECKLIST_DESPLIEGUE.md` - Checklist paso a paso
- `RESUMEN_CAMBIOS.md` - Resumen ejecutivo
