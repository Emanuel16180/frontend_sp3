# ⚡ QUICK START - Landing Page Auto-Registro

## 🎯 Resumen Ejecutivo

**Feature:** Landing page pública para auto-registro de clínicas  
**Backend:** ✅ YA DESPLEGADO en https://psico-admin.onrender.com  
**Tiempo estimado:** 2-3 horas  

---

## 📋 CHECKLIST RÁPIDO

### 1. Código (1 hora)
- [ ] Crear `src/pages/LandingPage.jsx` (copiar código del doc)
- [ ] Agregar ruta en `src/App.jsx`: `<Route path="/" element={<LandingPage />} />`
- [ ] Test local: `npm run dev`
- [ ] Commit: `git add . && git commit -m "feat: Landing page auto-registro" && git push`

### 2. Vercel (30 min)
- [ ] Agregar dominio `psicoadmin.xyz` en Settings → Domains
- [ ] Agregar dominio `www.psicoadmin.xyz`
- [ ] Deploy automático detectará el push

### 3. DNS (30 min + propagación)
- [ ] Namecheap → psicoadmin.xyz → Advanced DNS
- [ ] Agregar CNAME: `www` → `cname.vercel-dns.com`
- [ ] Agregar A records (Vercel te dará las IPs)
- [ ] Esperar 5-15 min para propagación

### 4. Testing (30 min)
- [ ] Acceder a `https://psicoadmin.xyz`
- [ ] Registrar clínica de prueba
- [ ] Verificar acceso al panel admin
- [ ] Testear en diferentes navegadores

---

## 🚀 COMANDOS ÚTILES

### Desarrollo Local
```bash
# Iniciar dev server
npm run dev

# Acceder a landing
# http://localhost:5173

# Build para producción
npm run build
```

### Git
```bash
# Commit y push
cd "c:\Users\asus\Documents\SISTEMAS DE INFORMACION 2\2do Sprindt\frontend_sas_sp2"
git add .
git commit -m "feat: Landing page auto-registro de clínicas"
git push origin main
```

### Testing API (desde terminal)
```bash
# Test 1: Check subdomain
curl -X POST https://psico-admin.onrender.com/api/tenants/public/check-subdomain/ \
  -H "Content-Type: application/json" \
  -d "{\"subdomain\":\"test123\"}"

# Test 2: Registro completo
curl -X POST https://psico-admin.onrender.com/api/tenants/public/register/ \
  -H "Content-Type: application/json" \
  -d "{\"clinic_name\":\"Test\",\"subdomain\":\"test123\",\"admin_email\":\"test@test.com\"}"
```

---

## 📦 DEPENDENCIAS

**Ya tienes todo instalado:**
- ✅ React 19
- ✅ Axios 1.12.0
- ✅ Tailwind CSS

**No necesitas instalar nada nuevo.**

---

## 🎨 ESTRUCTURA DE ARCHIVOS

```
frontend_sas_sp2/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx          ⭐ NUEVO
│   │   ├── LoginPage.jsx
│   │   └── ... (otros)
│   ├── App.jsx                      ✏️ MODIFICAR (agregar ruta)
│   └── ...
├── FEATURE_AUTO_REGISTRO.md         📚 Documentación completa
└── QUICK_START_LANDING.md           📚 Este archivo
```

---

## 🧪 CASOS DE PRUEBA

### Test 1: Subdomain Check
**Input:** `test123`  
**Esperado:** ✅ "Subdominio disponible"

### Test 2: Subdomain Duplicado
**Input:** `bienestar` (ya existe)  
**Esperado:** ❌ "Subdominio no disponible"

### Test 3: Registro Completo
**Input:**
- Nombre: "Clínica Test"
- Subdomain: "test456"
- Email: "test@test.com"

**Esperado:**
- 🎉 Mensaje de éxito
- Credenciales mostradas
- Redirect funciona

---

## 🐛 ERRORES COMUNES

### Error: "Cannot read properties of undefined"
**Causa:** Axios no instalado  
**Solución:** `npm install axios`

### Error: CORS
**Causa:** Backend no permite el dominio  
**Solución:** Ya está configurado en backend, ignorar en dev

### Error: 404 en API
**Causa:** URL incorrecta  
**Solución:** Verificar `https://psico-admin.onrender.com/api/tenants/public/...`

---

## 🎯 PRIORIDADES

| Tarea | Prioridad | Bloqueante |
|-------|-----------|------------|
| Crear LandingPage.jsx | 🔴 Alta | Sí |
| Agregar ruta | 🔴 Alta | Sí |
| Test local | 🟡 Media | No |
| Deploy Vercel | 🔴 Alta | Sí |
| Configurar DNS | 🟡 Media | No (puede esperar) |
| Testing E2E | 🟢 Baja | No |

---

## 📞 NEXT STEPS

1. **Copiar código** de `FEATURE_AUTO_REGISTRO.md` → `src/pages/LandingPage.jsx`
2. **Modificar** `src/App.jsx` para agregar la ruta
3. **Test local:** `npm run dev` → http://localhost:5173
4. **Deploy:** Git push → Vercel automático
5. **DNS:** Configurar en Namecheap
6. **Test producción:** https://psicoadmin.xyz

---

## ✅ VALIDACIÓN FINAL

Después de implementar, verificar:

- [ ] Landing page accesible en `https://psicoadmin.xyz`
- [ ] Formulario muestra correctamente
- [ ] Check de subdomain funciona en tiempo real
- [ ] Registro crea tenant exitosamente
- [ ] Credenciales se muestran correctamente
- [ ] Redirect al panel admin funciona
- [ ] Login con credenciales temporales funciona
- [ ] Diseño responsive (mobile/desktop)

---

**⏱️ Tiempo total estimado:** 2-3 horas

**🚀 ¡Todo listo para implementar!**
