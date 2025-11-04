# 🛠️ COMANDOS ÚTILES - Despliegue y Troubleshooting

## 📦 Git - Subir Cambios

### Subir todos los cambios
```bash
cd "C:\Users\asus\Documents\SISTEMAS DE INFORMACION 2\2do Sprindt\frontend_sas_sp2"
git add .
git commit -m "feat: Configuración multi-tenant para despliegue en Vercel"
git push origin main
```

### Ver estado
```bash
git status
git log --oneline -5
```

### Ver diferencias
```bash
git diff
git diff src/api.js
```

---

## 🚀 Vercel CLI (Opcional)

### Instalar Vercel CLI
```bash
npm install -g vercel
```

### Login
```bash
vercel login
```

### Deploy manual
```bash
# Desde la raíz del proyecto
vercel

# Deploy a producción
vercel --prod
```

### Ver logs en tiempo real
```bash
vercel logs [url-del-deployment]
```

---

## 🌐 DNS - Verificación

### Verificar propagación DNS (Windows)
```powershell
# Verificar dominios del frontend
nslookup bienestar-app.psicoadmin.xyz
nslookup mindcare-app.psicoadmin.xyz

# Verificar dominios del backend
nslookup bienestar.psicoadmin.xyz
nslookup mindcare.psicoadmin.xyz

# Usar DNS específico (Google)
nslookup bienestar-app.psicoadmin.xyz 8.8.8.8
```

### Verificar DNS desde web
```
https://dnschecker.org/#A/bienestar-app.psicoadmin.xyz
https://dnschecker.org/#CNAME/bienestar-app.psicoadmin.xyz
```

---

## 🧪 Testing - Verificación de Endpoints

### Verificar que el frontend cargue (PowerShell)
```powershell
# Verificar código de respuesta
curl.exe -I https://bienestar-app.psicoadmin.xyz
curl.exe -I https://mindcare-app.psicoadmin.xyz

# Descargar contenido
curl.exe https://bienestar-app.psicoadmin.xyz
```

### Verificar backend API
```powershell
# Verificar endpoint raíz
curl.exe https://bienestar.psicoadmin.xyz/api/

# Verificar con headers
curl.exe -H "Origin: https://bienestar-app.psicoadmin.xyz" https://bienestar.psicoadmin.xyz/api/
```

### Testing con cURL completo
```bash
# Login test
curl -X POST https://bienestar.psicoadmin.xyz/api/login/ \
  -H "Content-Type: application/json" \
  -H "Origin: https://bienestar-app.psicoadmin.xyz" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -c cookies.txt \
  -v

# Ver cookies guardadas
cat cookies.txt
```

---

## 🔍 Debugging - DevTools

### Verificar peticiones API en el navegador

1. Abrir DevTools (F12)
2. Tab **Network**
3. Filtrar por **Fetch/XHR**
4. Hacer login
5. Verificar:
   - Request URL debe ir a `https://bienestar.psicoadmin.xyz/api/...`
   - Response headers debe incluir `Set-Cookie`
   - Request headers (siguientes peticiones) debe incluir `Cookie`

### Verificar cookies en el navegador

1. Abrir DevTools (F12)
2. Tab **Application** (Chrome) o **Storage** (Firefox)
3. Sidebar → **Cookies**
4. Seleccionar `https://bienestar-app.psicoadmin.xyz`
5. Verificar:
   - `sessionid` → Domain: `.psicoadmin.xyz`, SameSite: `None`, Secure: ✅
   - `csrftoken` → Domain: `.psicoadmin.xyz`, SameSite: `None`, Secure: ✅

### Verificar errores de CORS

1. Abrir DevTools (F12)
2. Tab **Console**
3. Buscar errores tipo:
   ```
   Access to XMLHttpRequest at 'https://...' from origin 'https://...' 
   has been blocked by CORS policy
   ```
4. Si aparece este error, verificar:
   - Variables de entorno en Vercel
   - Configuración CORS en backend

---

## 🖥️ Backend - Comandos SSH

### Conectar al servidor
```bash
ssh usuario@167.99.xxx.xxx
# O si tienes configurado el dominio:
ssh usuario@psicoadmin.xyz
```

### Verificar estado de servicios
```bash
# Ver procesos PM2
pm2 status

# Ver logs de Gunicorn
pm2 logs gunicorn

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Verificar que Django esté respondiendo
```bash
# Desde el servidor
curl http://localhost:8000/api/

# Verificar tenant
curl -H "Host: bienestar.psicoadmin.xyz" http://localhost:8000/api/
```

### Reiniciar servicios (si es necesario)
```bash
# Reiniciar Django (PM2)
pm2 restart gunicorn

# Reiniciar Nginx
sudo systemctl restart nginx

# Verificar estado
pm2 status
sudo systemctl status nginx
```

---

## 🔧 Variables de Entorno - Vercel

### Ver variables actuales (Vercel CLI)
```bash
vercel env ls
```

### Agregar variable (Vercel CLI)
```bash
vercel env add VITE_API_URL production
# Luego ingresa el valor cuando te lo pida
```

### Desde la web
```
1. Ve a https://vercel.com
2. Selecciona el proyecto
3. Settings → Environment Variables
4. Add → Name, Value, Environment (Production)
```

---

## 📊 Monitoreo

### Ver logs de Vercel en tiempo real
```bash
# Instalar Vercel CLI si no lo tienes
npm install -g vercel

# Ver logs
vercel logs --follow
```

### Ver logs del backend
```bash
# SSH al servidor
ssh usuario@psicoadmin.xyz

# Ver logs en tiempo real
pm2 logs gunicorn --lines 100

# Ver logs específicos
pm2 logs gunicorn --err  # Solo errores
pm2 logs gunicorn --out  # Solo output estándar
```

---

## 🧹 Limpieza y Mantenimiento

### Frontend - Limpiar caché local
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar caché de Vite
rm -rf .vite
rm -rf dist

# Rebuild
npm run build
```

### Vercel - Limpiar caché de build
```bash
# Desde Vercel CLI
vercel --force

# O desde la web:
# Deployments → [último] → Redeploy → Clear Cache
```

---

## 🔐 Seguridad

### Verificar SSL/TLS
```bash
# Verificar certificado
openssl s_client -connect bienestar-app.psicoadmin.xyz:443 -servername bienestar-app.psicoadmin.xyz

# Ver detalles del certificado
curl -vI https://bienestar-app.psicoadmin.xyz 2>&1 | grep -i "SSL\|TLS"
```

### Verificar headers de seguridad
```bash
curl -I https://bienestar-app.psicoadmin.xyz | grep -i "strict-transport-security\|x-frame-options\|x-content-type-options"
```

---

## 📦 Build Local (Testing)

### Build de producción local
```bash
# Build
npm run build

# Preview (simula producción)
npm run preview

# Acceder a:
# http://localhost:4173
```

### Verificar tamaño del build
```bash
# Después de npm run build
ls -lh dist/
du -sh dist/

# Ver archivos más grandes
find dist/ -type f -exec ls -lh {} \; | sort -k5 -h -r | head -10
```

---

## 🔄 Rollback (Si algo sale mal)

### Vercel - Volver a deployment anterior
```bash
# Desde CLI
vercel rollback [deployment-url]

# O desde la web:
# Deployments → [deployment anterior] → Promote to Production
```

### Git - Volver a commit anterior
```bash
# Ver historial
git log --oneline

# Volver a un commit específico
git revert [commit-hash]
git push origin main

# O reset (CUIDADO, elimina cambios)
git reset --hard [commit-hash]
git push origin main --force
```

---

## 📱 Testing en Dispositivos Móviles

### Obtener IP local
```bash
# Windows
ipconfig | findstr "IPv4"

# Ejemplo: 192.168.1.100
```

### Acceder desde móvil
```
# Desarrollo local (si tu móvil está en la misma red)
http://192.168.1.100:5174

# Producción
https://bienestar-app.psicoadmin.xyz
```

---

## 🎯 Comandos Rápidos de Diagnóstico

### Diagnóstico completo rápido
```bash
# 1. Verificar DNS
nslookup bienestar-app.psicoadmin.xyz

# 2. Verificar frontend responde
curl.exe -I https://bienestar-app.psicoadmin.xyz

# 3. Verificar backend responde
curl.exe -I https://bienestar.psicoadmin.xyz/api/

# 4. Ver logs de Vercel
vercel logs --follow

# 5. Ver logs de backend (SSH)
ssh usuario@psicoadmin.xyz "pm2 logs gunicorn --lines 50 --nostream"
```

---

## 📋 Checklist de Comandos para Deploy

```bash
# 1. Verificar que todo funcione localmente
npm run dev
# Probar en navegador: http://localhost:5174

# 2. Build de prueba
npm run build
npm run preview
# Probar en navegador: http://localhost:4173

# 3. Subir a Git
git add .
git commit -m "feat: Configuración multi-tenant para Vercel"
git push origin main

# 4. Deploy en Vercel (automático después de push)
# O manual:
vercel --prod

# 5. Verificar DNS
nslookup bienestar-app.psicoadmin.xyz

# 6. Testing
curl.exe -I https://bienestar-app.psicoadmin.xyz

# 7. Verificar en navegador
# https://bienestar-app.psicoadmin.xyz
```

---

## 🆘 Comandos de Emergencia

### Si el sitio no carga
```bash
# 1. Verificar Vercel
vercel ls  # Ver deployments
vercel logs [url]  # Ver logs

# 2. Verificar DNS
nslookup bienestar-app.psicoadmin.xyz
# Debe apuntar a Vercel (*.vercel-dns.com)

# 3. Verificar backend
ssh usuario@psicoadmin.xyz
pm2 status
sudo systemctl status nginx
```

### Si hay errores de CORS
```bash
# 1. Verificar variables en Vercel
vercel env ls

# 2. Verificar backend (SSH)
ssh usuario@psicoadmin.xyz
cd /ruta/del/proyecto/backend
cat config/settings.py | grep CORS
```

### Si las cookies no funcionan
```bash
# 1. Verificar configuración del backend (SSH)
ssh usuario@psicoadmin.xyz
cd /ruta/del/proyecto/backend
cat config/settings.py | grep SESSION_COOKIE
cat config/settings.py | grep CSRF_COOKIE

# 2. Verificar en navegador (DevTools)
# Application → Cookies → Verificar Domain, SameSite, Secure
```

---

## 📚 Comandos de Referencia

### npm
```bash
npm install          # Instalar dependencias
npm run dev          # Desarrollo
npm run build        # Build producción
npm run preview      # Preview del build
npm run lint         # Linter
npm update           # Actualizar dependencias
npm outdated         # Ver dependencias desactualizadas
```

### Vercel
```bash
vercel               # Deploy a preview
vercel --prod        # Deploy a producción
vercel ls            # Listar deployments
vercel logs [url]    # Ver logs
vercel env ls        # Listar variables de entorno
vercel domains ls    # Listar dominios
vercel rollback      # Rollback
```

### Git
```bash
git status           # Ver estado
git add .            # Agregar todos los cambios
git commit -m "msg"  # Commit
git push             # Push a origin
git pull             # Pull de origin
git log              # Ver historial
git diff             # Ver diferencias
```

---

**💡 Tip:** Guarda este documento en favoritos para acceso rápido durante el despliegue.
