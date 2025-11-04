# ⚡ RESUMEN RÁPIDO - Cambios en Frontend para Vercel

## 📝 ¿Qué se hizo?

Se preparó el frontend React + Vite para despliegue multi-tenant en Vercel.

## 📁 Archivos Creados

1. **`.env.example`** - Plantilla de variables de entorno
2. **`.env.production.bienestar`** - Variables para Clínica Bienestar
3. **`.env.production.mindcare`** - Variables para Clínica Mindcare
4. **`vercel.json`** - Configuración de Vercel (SPA + CORS)

## 🔧 Archivos Modificados

1. **`src/config/tenants.js`**
   - ✅ Agregados dominios de producción
   - ✅ Actualizada función `getApiBaseURL()` para usar variables de entorno

2. **`src/api.js`**
   - ✅ Agregado `withCredentials: true` (permite cookies)

3. **`.gitignore`**
   - ✅ Agregadas reglas para archivos `.env`

## 🎯 URLs Finales

| Clínica | Frontend | Backend API |
|---------|----------|-------------|
| Bienestar | `https://bienestar-app.psicoadmin.xyz` | `https://bienestar.psicoadmin.xyz/api` |
| Mindcare | `https://mindcare-app.psicoadmin.xyz` | `https://mindcare.psicoadmin.xyz/api` |

## ✅ Estado del Backend

**✅ NO SE NECESITAN CAMBIOS EN EL BACKEND**

El backend ya tiene:
- ✅ CORS configurado correctamente
- ✅ Cookies cross-origin habilitadas
- ✅ CSRF trusted origins configurados
- ✅ Sistema multi-tenant funcionando

## 🚀 Próximos Pasos

### 1. Subir a Git
```bash
git add .
git commit -m "feat: Configuración multi-tenant para Vercel"
git push origin main
```

### 2. Crear proyectos en Vercel

**Proyecto 1: bienestar-psico**
- Variables de entorno:
  ```
  VITE_API_URL=https://bienestar.psicoadmin.xyz
  VITE_TENANT=bienestar
  VITE_CLINIC_NAME=Clínica Bienestar
  ```

**Proyecto 2: mindcare-psico**
- Variables de entorno:
  ```
  VITE_API_URL=https://mindcare.psicoadmin.xyz
  VITE_TENANT=mindcare
  VITE_CLINIC_NAME=MindCare Psicología
  ```

### 3. Configurar DNS en Namecheap

```
Tipo    Host              Valor
CNAME   bienestar-app     cname.vercel-dns.com
CNAME   mindcare-app      cname.vercel-dns.com
```

## 📚 Documentos Completos

- **`CAMBIOS_PARA_DESPLIEGUE_VERCEL.md`** - Guía detallada paso a paso
- **`DOCUMENTO_PARA_BACKEND.md`** - Documento para compartir con el equipo backend

## ⏱️ Tiempo Estimado de Deploy

- Subir a Git: 5 min
- Crear proyectos en Vercel: 20 min
- Configurar DNS: 10 min
- Testing: 30 min

**Total: ~1 hora**

---

**🎉 ¡Todo listo para desplegar!**
