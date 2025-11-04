# ✅ CHECKLIST DE DESPLIEGUE - Frontend en Vercel

## 📋 Pre-Deploy (Completado ✅)

- [x] Archivos `.env` creados
- [x] `vercel.json` configurado
- [x] `src/config/tenants.js` actualizado con dominios de producción
- [x] `src/api.js` configurado con `withCredentials: true`
- [x] `.gitignore` actualizado
- [x] Documentación creada

---

## 🚀 Deploy en Vercel

### PASO 1: Git Push
```bash
cd "C:\Users\asus\Documents\SISTEMAS DE INFORMACION 2\2do Sprindt\frontend_sas_sp2"
git add .
git commit -m "feat: Configuración multi-tenant para despliegue en Vercel"
git push origin main
```

- [ ] Cambios subidos a Git

---

### PASO 2: Proyecto Bienestar

#### A) Crear proyecto
1. [ ] Ir a https://vercel.com/new
2. [ ] Seleccionar repositorio `frontend_sas_sp2`
3. [ ] **Project Name:** `bienestar-psico`
4. [ ] **Framework Preset:** Vite
5. [ ] **Build Command:** `npm run build`
6. [ ] **Output Directory:** `dist`

#### B) Variables de Entorno
Copiar exactamente de `.env.production.bienestar`:

```
VITE_API_URL=https://bienestar.psicoadmin.xyz
VITE_TENANT=bienestar
VITE_CLINIC_NAME=Clínica Bienestar
VITE_WS_URL=wss://bienestar.psicoadmin.xyz
```

- [ ] Variable `VITE_API_URL` agregada
- [ ] Variable `VITE_TENANT` agregada
- [ ] Variable `VITE_CLINIC_NAME` agregada
- [ ] Variable `VITE_WS_URL` agregada (opcional)

#### C) Deploy
- [ ] Click en **Deploy**
- [ ] Esperar a que termine (2-3 minutos)
- [ ] Verificar que el build sea exitoso

#### D) Dominio Personalizado
1. [ ] Settings → Domains
2. [ ] Add Domain: `bienestar-app.psicoadmin.xyz`
3. [ ] Copiar el valor CNAME que te da Vercel

---

### PASO 3: Proyecto Mindcare

#### A) Crear proyecto
1. [ ] Ir a https://vercel.com/new
2. [ ] Seleccionar **EL MISMO** repositorio `frontend_sas_sp2`
3. [ ] **Project Name:** `mindcare-psico`
4. [ ] **Framework Preset:** Vite
5. [ ] **Build Command:** `npm run build`
6. [ ] **Output Directory:** `dist`

#### B) Variables de Entorno
Copiar exactamente de `.env.production.mindcare`:

```
VITE_API_URL=https://mindcare.psicoadmin.xyz
VITE_TENANT=mindcare
VITE_CLINIC_NAME=MindCare Psicología
VITE_WS_URL=wss://mindcare.psicoadmin.xyz
```

- [ ] Variable `VITE_API_URL` agregada
- [ ] Variable `VITE_TENANT` agregada
- [ ] Variable `VITE_CLINIC_NAME` agregada
- [ ] Variable `VITE_WS_URL` agregada (opcional)

#### C) Deploy
- [ ] Click en **Deploy**
- [ ] Esperar a que termine (2-3 minutos)
- [ ] Verificar que el build sea exitoso

#### D) Dominio Personalizado
1. [ ] Settings → Domains
2. [ ] Add Domain: `mindcare-app.psicoadmin.xyz`
3. [ ] Copiar el valor CNAME que te da Vercel

---

### PASO 4: Configurar DNS en Namecheap

1. [ ] Ir a Namecheap → psicoadmin.xyz → Advanced DNS
2. [ ] Agregar registros:

| Tipo  | Host          | Valor                  |
|-------|---------------|------------------------|
| CNAME | bienestar-app | cname.vercel-dns.com   |
| CNAME | mindcare-app  | cname.vercel-dns.com   |

3. [ ] Guardar cambios
4. [ ] Esperar propagación DNS (5-15 minutos)

---

## 🧪 Testing

### Test 1: Verificar que los sitios carguen

```bash
# En PowerShell o navegador
curl https://bienestar-app.psicoadmin.xyz
curl https://mindcare-app.psicoadmin.xyz
```

- [ ] Bienestar carga sin errores
- [ ] Mindcare carga sin errores

---

### Test 2: Verificar conexión con API

#### Bienestar
1. [ ] Abrir https://bienestar-app.psicoadmin.xyz
2. [ ] Abrir DevTools (F12) → Network
3. [ ] Ir a página de Login
4. [ ] Verificar que las peticiones vayan a `https://bienestar.psicoadmin.xyz/api/`

#### Mindcare
1. [ ] Abrir https://mindcare-app.psicoadmin.xyz
2. [ ] Abrir DevTools (F12) → Network
3. [ ] Ir a página de Login
4. [ ] Verificar que las peticiones vayan a `https://mindcare.psicoadmin.xyz/api/`

---

### Test 3: Login y Cookies

#### Bienestar
1. [ ] Intentar hacer login
2. [ ] Verificar que NO haya errores de CORS
3. [ ] Abrir DevTools → Application → Cookies
4. [ ] Verificar cookies:
   - [ ] `sessionid` presente con Domain=`.psicoadmin.xyz`
   - [ ] `csrftoken` presente con Domain=`.psicoadmin.xyz`
   - [ ] Ambas tienen `SameSite=None` y `Secure=true`

#### Mindcare
1. [ ] Intentar hacer login
2. [ ] Verificar que NO haya errores de CORS
3. [ ] Abrir DevTools → Application → Cookies
4. [ ] Verificar cookies:
   - [ ] `sessionid` presente con Domain=`.psicoadmin.xyz`
   - [ ] `csrftoken` presente con Domain=`.psicoadmin.xyz`
   - [ ] Ambas tienen `SameSite=None` y `Secure=true`

---

### Test 4: Funcionalidades

#### Bienestar
- [ ] Login exitoso
- [ ] Dashboard carga correctamente
- [ ] Navegación entre páginas funciona
- [ ] Datos se cargan de la API
- [ ] Logout funciona

#### Mindcare
- [ ] Login exitoso
- [ ] Dashboard carga correctamente
- [ ] Navegación entre páginas funciona
- [ ] Datos se cargan de la API
- [ ] Logout funciona

---

## 🐛 Troubleshooting

### ❌ Error: "CORS policy blocked"

**Verificar:**
- [ ] Variables `VITE_API_URL` en Vercel están correctas
- [ ] Backend tiene CORS configurado (ya debería estar ✅)

**Solución:**
1. Verificar en Vercel que la variable `VITE_API_URL` sea exactamente: `https://bienestar.psicoadmin.xyz` (sin `/api`)
2. Re-deploy el proyecto en Vercel

---

### ❌ Error: "Cookies not being set"

**Verificar:**
- [ ] Backend tiene `SESSION_COOKIE_DOMAIN = '.psicoadmin.xyz'`
- [ ] Backend tiene `CORS_ALLOW_CREDENTIALS = True`
- [ ] Frontend tiene `withCredentials: true` en axios

**Solución:**
1. Verificar `src/api.js` tenga `withCredentials: true` ✅ (ya lo tiene)
2. Contactar al equipo de Backend para verificar configuración

---

### ❌ Error: "Page blank after deploy"

**Verificar:**
- [ ] `vercel.json` existe y tiene las reglas de rewrite ✅ (ya existe)
- [ ] Build output está en carpeta `dist`

**Solución:**
1. En Vercel: Settings → General → Output Directory debe ser `dist`
2. Re-deploy

---

### ❌ Error: "API not responding"

**Verificar:**
- [ ] Backend está corriendo: `pm2 status`
- [ ] Nginx está corriendo: `sudo systemctl status nginx`
- [ ] DNS está propagado: `nslookup bienestar.psicoadmin.xyz`

**Solución:**
1. SSH al servidor backend
2. Verificar logs: `pm2 logs gunicorn`
3. Verificar Nginx: `sudo tail -f /var/log/nginx/error.log`

---

## 📊 Resumen de URLs

| Componente | URL |
|------------|-----|
| **Frontend Bienestar** | https://bienestar-app.psicoadmin.xyz |
| **Backend Bienestar** | https://bienestar.psicoadmin.xyz/api |
| **Frontend Mindcare** | https://mindcare-app.psicoadmin.xyz |
| **Backend Mindcare** | https://mindcare.psicoadmin.xyz/api |

---

## 📞 Soporte

### Logs de Vercel
```
Proyecto → Deployments → [último deploy] → View Function Logs
```

### Logs de Backend
```bash
pm2 logs gunicorn
```

### Verificar DNS
```bash
nslookup bienestar-app.psicoadmin.xyz
nslookup mindcare-app.psicoadmin.xyz
```

---

## 🎉 Completado

- [ ] Todos los tests pasaron
- [ ] Frontend está en producción
- [ ] Documentación entregada al backend
- [ ] Equipo notificado

**¡DEPLOY EXITOSO! 🚀**
