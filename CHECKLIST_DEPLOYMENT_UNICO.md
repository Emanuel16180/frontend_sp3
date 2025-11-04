# ✅ CHECKLIST RÁPIDO - Deployment Único

## 📦 1. GIT (5 minutos)

```bash
cd "C:\Users\asus\Documents\SISTEMAS DE INFORMACION 2\2do Sprindt\frontend_sas_sp2"

git add .
git commit -m "feat: Cambio a deployment único con detección automática de tenant"
git push origin main
```

- [ ] Cambios subidos a Git

---

## 🚀 2. VERCEL (15 minutos)

### Crear Proyecto Único

1. [ ] Ir a https://vercel.com/new
2. [ ] Seleccionar repositorio `frontend_sas_sp2`
3. [ ] **Project Name:** `psico-frontend` (o el que prefieras)
4. [ ] **Framework Preset:** Vite
5. [ ] **Build Command:** `npm run build`
6. [ ] **Output Directory:** `dist`
7. [ ] **Environment Variables:** ❌ **NO AGREGAR NINGUNA**
8. [ ] Click **Deploy**
9. [ ] Esperar que termine el build (2-3 min)

### Agregar Dominios

1. [ ] Settings → Domains
2. [ ] Add Domain: `bienestar-app.psicoadmin.xyz`
3. [ ] Add Domain: `mindcare-app.psicoadmin.xyz`
4. [ ] Copiar los valores CNAME que te da Vercel

---

## 🌐 3. DNS (10 minutos)

### Namecheap - psicoadmin.xyz

1. [ ] Advanced DNS
2. [ ] Add New Record:
   - Type: `CNAME`
   - Host: `bienestar-app`
   - Value: `cname.vercel-dns.com`
   - TTL: Automatic

3. [ ] Add New Record:
   - Type: `CNAME`
   - Host: `mindcare-app`
   - Value: `cname.vercel-dns.com`
   - TTL: Automatic

4. [ ] Save All Changes
5. [ ] Esperar propagación DNS (5-15 min)

---

## 🧪 4. TESTING (20 minutos)

### Test 1: Sitios Cargan

```powershell
curl.exe -I https://bienestar-app.psicoadmin.xyz
curl.exe -I https://mindcare-app.psicoadmin.xyz
```

- [ ] Bienestar retorna 200 OK
- [ ] Mindcare retorna 200 OK

---

### Test 2: Detección de Tenant

**Abrir DevTools (F12) → Console**

#### En Bienestar (https://bienestar-app.psicoadmin.xyz):

Verificar en console:
```
🔍 Hostname: bienestar-app.psicoadmin.xyz
✅ Tenant detectado: bienestar
🌐 API URL: https://bienestar.psicoadmin.xyz/api
```

- [ ] Tenant detectado: `bienestar` ✅
- [ ] API URL: `https://bienestar.psicoadmin.xyz/api` ✅

#### En Mindcare (https://mindcare-app.psicoadmin.xyz):

Verificar en console:
```
🔍 Hostname: mindcare-app.psicoadmin.xyz
✅ Tenant detectado: mindcare
🌐 API URL: https://mindcare.psicoadmin.xyz/api
```

- [ ] Tenant detectado: `mindcare` ✅
- [ ] API URL: `https://mindcare.psicoadmin.xyz/api` ✅

---

### Test 3: Login y Cookies

#### Bienestar
1. [ ] Ir a `https://bienestar-app.psicoadmin.xyz/login`
2. [ ] Intentar login
3. [ ] Verificar NO hay errores de CORS
4. [ ] DevTools → Application → Cookies
5. [ ] Verificar cookies:
   - [ ] `sessionid` con Domain: `.psicoadmin.xyz`
   - [ ] `csrftoken` con Domain: `.psicoadmin.xyz`
   - [ ] Ambas con SameSite: `None` y Secure: `true`

#### Mindcare
1. [ ] Ir a `https://mindcare-app.psicoadmin.xyz/login`
2. [ ] Intentar login
3. [ ] Verificar NO hay errores de CORS
4. [ ] DevTools → Application → Cookies
5. [ ] Verificar cookies:
   - [ ] `sessionid` con Domain: `.psicoadmin.xyz`
   - [ ] `csrftoken` con Domain: `.psicoadmin.xyz`
   - [ ] Ambas con SameSite: `None` y Secure: `true`

---

### Test 4: Navegación

#### Bienestar
- [ ] Dashboard carga
- [ ] Tema correcto (colores azules)
- [ ] Nombre: "Clínica Bienestar"
- [ ] Navegación entre páginas funciona

#### Mindcare
- [ ] Dashboard carga
- [ ] Tema correcto (colores púrpura)
- [ ] Nombre: "MindCare Psicología"
- [ ] Navegación entre páginas funciona

---

## 🎉 5. COMPLETADO

- [ ] Todos los tests pasaron
- [ ] Frontend en producción
- [ ] Backend notificado
- [ ] Documentación entregada

---

## 🐛 TROUBLESHOOTING RÁPIDO

### ❌ Error: "CORS blocked"
**Solución:** Verificar que backend tenga `CORS_ALLOWED_ORIGIN_REGEXES` con `.*\.psicoadmin\.xyz`

### ❌ Error: "Cookies no se guardan"
**Solución:** Verificar que backend tenga `SESSION_COOKIE_DOMAIN = '.psicoadmin.xyz'`

### ❌ Error: "Tenant incorrecto"
**Solución:** Agregar logs en console para debug:
```javascript
console.log('Hostname:', window.location.hostname);
console.log('Tenant:', getTenantFromHostname());
```

### ❌ Error: "Página en blanco"
**Solución:** Ver logs en Vercel → Deployments → [último] → View Function Logs

---

## 📊 TIEMPO TOTAL ESTIMADO

| Fase | Tiempo |
|------|--------|
| Git Push | 5 min |
| Vercel Deploy | 15 min |
| DNS Config | 10 min |
| Testing | 20 min |
| **TOTAL** | **50 min** |

---

## 📚 DOCUMENTOS DE REFERENCIA

- **CAMBIOS_DEPLOYMENT_UNICO.md** - Detalles técnicos de los cambios
- **ACTUALIZACION_BACKEND.md** - Documento para compartir con backend
- **COMANDOS_UTILES.md** - Comandos de emergencia

---

**🚀 ¡Más simple, más rápido, más elegante!**
