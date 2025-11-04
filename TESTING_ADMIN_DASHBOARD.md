# 🧪 TESTING: Admin Global Dashboard - Solución Error 401

**Fecha:** 21 Octubre 2025  
**Última actualización del código:** Commit `9e0d71e`  
**Estado:** ✅ Código corregido y deployed

---

## 🔍 DIAGNÓSTICO DEL PROBLEMA

### **Error Reportado:**
```
GET https://bienestar.psicoadmin.xyz/api/admin/users/ 401 (Unauthorized)
```

### **Causa Raíz:**
El error está ocurriendo por una de estas razones:

1. **Cache del Navegador** - El navegador está usando versión antigua del JavaScript
2. **Cache de Vercel** - La CDN de Vercel no ha propagado los cambios
3. **Componente Incorrecto** - Hay otro componente (no GlobalAdminDashboard) haciendo la llamada

---

## ✅ VERIFICACIÓN 1: Confirmar Deploy de Vercel

### **Pasos:**

1. **Ir a Vercel Dashboard:**
   - URL: https://vercel.com/dashboard
   - Proyecto: `frontend_sas_sp2`

2. **Verificar último deployment:**
   - Debe mostrar: `9e0d71e - fix: GlobalAdminDashboard usar access_token y endpoint correcto /tenants/`
   - Estado: **✅ Ready**
   - Fecha: Reciente (última hora)

3. **Si NO está deployed:**
   ```bash
   cd "C:\Users\asus\Documents\SISTEMAS DE INFORMACION 2\2do Sprindt\frontend_sas_sp2"
   
   # Forzar nuevo deployment
   git commit --allow-empty -m "chore: Force redeploy to Vercel"
   git push origin main
   ```

---

## ✅ VERIFICACIÓN 2: Limpiar Cache del Navegador

### **Opción A: Hard Refresh (Más Rápido)**

1. Abrir `https://psicoadmin.xyz/login`
2. Presionar **Ctrl + Shift + R** (Windows) o **Cmd + Shift + R** (Mac)
3. Esto fuerza recarga sin cache

### **Opción B: Limpiar Storage Completo (Más Seguro)**

1. Abrir DevTools: **F12**
2. Ir a pestaña **Application**
3. En el menú izquierdo, click derecho en **Local Storage**
4. Seleccionar **Clear**
5. En el menú izquierdo, click derecho en **Session Storage**
6. Seleccionar **Clear**
7. Cerrar DevTools
8. Hacer Hard Refresh: **Ctrl + Shift + R**

### **Opción C: Modo Incógnito (Test Limpio)**

1. Abrir ventana incógnita: **Ctrl + Shift + N**
2. Ir a `https://psicoadmin.xyz/login`
3. Login con credenciales admin global
4. Verificar si el error persiste

---

## ✅ VERIFICACIÓN 3: Testing Paso a Paso

### **Paso 1: Login Admin Global**

1. **URL:** https://psicoadmin.xyz/login
2. **Email:** `admin@psicoadmin.xyz`
3. **Password:** `admin123`
4. **Abrir Console (F12) ANTES de hacer login**

### **Paso 2: Verificar Logs Esperados**

Después de hacer login, debes ver estos logs en Console:

```javascript
// ✅ LOGS CORRECTOS:
🔍 Login Debug: {hostname: "psicoadmin.xyz", isRootDomain: true, isGlobalAdminUser: true}
🌐 Admin global detectado - usando backend público: https://psico-admin.onrender.com/api/auth/login/
✅ Login exitoso: {token: "...", user: {...}}
🌐 GlobalAdmin - Cargando datos del backend público: https://psico-admin.onrender.com/api
🔐 Token presente: true
✅ Estadísticas cargadas: [...]
```

### **Paso 3: Verificar Network Tab**

1. Abrir DevTools: **F12**
2. Ir a pestaña **Network**
3. Filtrar por: `tenants`
4. Hacer login
5. Buscar request: `GET /api/tenants/`

**Request esperado:**
```
Request URL: https://psico-admin.onrender.com/api/tenants/
Request Method: GET
Status Code: 200 OK
```

**Headers esperados:**
```
Authorization: Token xxxxxxxxxxxxxxxxx
Content-Type: application/json
```

---

## ❌ SI AÚN VES EL ERROR 401

### **Escenario 1: Error viene de otro componente**

Si ves el error `GET https://bienestar.psicoadmin.xyz/api/admin/users/`, significa que hay **OTRO componente** (no GlobalAdminDashboard) haciendo esa llamada.

**Componentes sospechosos:**
- `AdminDashboardPage.jsx`
- `ClinicAdminDashboard.jsx`
- `UsersList.jsx`
- Cualquier componente con "Admin" en el nombre

**Acción:**
Busca en todos los archivos:

```powershell
cd "C:\Users\asus\Documents\SISTEMAS DE INFORMACION 2\2do Sprindt\frontend_sas_sp2\src"
Select-String -Path "*.jsx","*.js" -Pattern "/api/admin/users/" -Recurse
```

Si encuentra archivos, repórtame cuáles son.

### **Escenario 2: Vercel no ha desplegado**

**Síntomas:**
- Logs de Console muestran código viejo
- Network tab muestra requests a bienestar.psicoadmin.xyz
- Hard refresh no ayuda

**Solución:**
```bash
cd "C:\Users\asus\Documents\SISTEMAS DE INFORMACION 2\2do Sprindt\frontend_sas_sp2"

# Forzar rebuild completo
npm run build

# Crear deployment manual
git commit --allow-empty -m "chore: Force complete rebuild"
git push origin main

# Esperar 3-5 minutos
# Verificar en Vercel que el deployment esté Ready
```

### **Escenario 3: Token inválido**

**Síntomas:**
- Logs muestran URL correcta (`psico-admin.onrender.com`)
- Pero igual retorna 401

**Causa:** Token es de un tenant, no del admin global

**Solución:**
1. Abrir DevTools → Application → Local Storage
2. Verificar `access_token`:
   ```javascript
   // Copiar el token
   const token = localStorage.getItem('access_token');
   
   // Decodificar en: https://jwt.io/
   // Verificar que el payload contenga:
   {
     "user_id": 1,
     "email": "admin@psicoadmin.xyz",
     "is_superuser": true
   }
   ```

3. Si el token es de otro usuario, hacer logout y volver a login

---

## 📊 CHECKLIST COMPLETO

Marca cada paso que completes:

### **Verificación de Deploy:**
- [ ] Vercel dashboard muestra commit `9e0d71e` deployed
- [ ] Estado del deployment es "Ready"
- [ ] Fecha del deployment es reciente

### **Limpieza de Cache:**
- [ ] Hice hard refresh (Ctrl + Shift + R)
- [ ] Limpié Local Storage
- [ ] Limpié Session Storage
- [ ] Probé en modo incógnito

### **Testing de Login:**
- [ ] Console muestra: "Admin global detectado"
- [ ] Console muestra: "Cargando datos del backend público"
- [ ] Console muestra: "https://psico-admin.onrender.com/api"
- [ ] NO muestra: "bienestar.psicoadmin.xyz"

### **Network Tab:**
- [ ] Request va a: `psico-admin.onrender.com/api/tenants/`
- [ ] Status Code es: `200 OK`
- [ ] Response contiene: Array de clínicas
- [ ] NO veo request a: `bienestar.psicoadmin.xyz/api/admin/users/`

### **Dashboard Funcionando:**
- [ ] Dashboard carga sin errores 401
- [ ] Muestra estadísticas (Total clínicas, usuarios, etc.)
- [ ] Muestra lista de clínicas (Bienestar, Mindcare)
- [ ] Puedo hacer click en "Admin Backend" y "Ver Frontend"

---

## 🆘 SI NADA FUNCIONA

Repórtame esta información:

1. **Screenshot de Console completo** (todos los logs desde login hasta error)
2. **Screenshot de Network tab** (todos los requests)
3. **Resultado de este comando:**
   ```powershell
   cd "C:\Users\asus\Documents\SISTEMAS DE INFORMACION 2\2do Sprindt\frontend_sas_sp2\src"
   Select-String -Path "*.jsx","*.js" -Pattern "api/admin/users" -Recurse
   ```
4. **Token decodificado** (copia el access_token y decodíficalo en https://jwt.io)
5. **URL actual en la barra del navegador**

---

## 🎯 RESULTADO ESPERADO FINAL

Después de completar todos los pasos:

✅ Login exitoso como admin global  
✅ Dashboard carga sin errores  
✅ Muestra 2 clínicas: Bienestar y Mindcare  
✅ Estadísticas muestran: 78 usuarios totales  
✅ Console muestra logs de backend público  
✅ Network tab muestra requests a `psico-admin.onrender.com`  

---

**Última actualización:** 21 Oct 2025, 09:15 UTC  
**Próximo paso:** Una vez que el dashboard funcione, atacar el problema de "Agendar Cita"
