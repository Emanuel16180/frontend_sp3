# 📦 Frontend Multi-Tenant - Sistema de Gestión de Clínicas Psicológicas

Sistema frontend React + Vite preparado para despliegue multi-tenant en Vercel.

---

## 🎯 Estado Actual

✅ **FRONTEND LISTO PARA DESPLEGAR EN VERCEL**

Todos los cambios necesarios han sido implementados y documentados.

---

## 📚 Documentación

### 📖 Para el Equipo de Frontend

| Documento | Descripción | Tiempo de lectura |
|-----------|-------------|-------------------|
| **[RESUMEN_CAMBIOS.md](./RESUMEN_CAMBIOS.md)** | Resumen ejecutivo de todos los cambios | 2 min |
| **[CHECKLIST_DESPLIEGUE.md](./CHECKLIST_DESPLIEGUE.md)** | Checklist paso a paso con tareas | 5 min |
| **[CAMBIOS_PARA_DESPLIEGUE_VERCEL.md](./CAMBIOS_PARA_DESPLIEGUE_VERCEL.md)** | Guía técnica completa y detallada | 15 min |
| **[ARQUITECTURA.md](./ARQUITECTURA.md)** | Diagramas y flujos de la arquitectura | 10 min |

### 📨 Para el Equipo de Backend

| Documento | Descripción | Tiempo de lectura |
|-----------|-------------|-------------------|
| **[DOCUMENTO_PARA_BACKEND.md](./DOCUMENTO_PARA_BACKEND.md)** | Resumen de cambios y coordinación | 10 min |

---

## 🚀 Quick Start - Despliegue

### Paso 1: Preparación (5 minutos)

```bash
# 1. Subir cambios a Git
git add .
git commit -m "feat: Configuración multi-tenant para Vercel"
git push origin main
```

### Paso 2: Deploy en Vercel (30 minutos)

Sigue el checklist detallado en **[CHECKLIST_DESPLIEGUE.md](./CHECKLIST_DESPLIEGUE.md)**

**Resumen:**
1. Crear proyecto `bienestar-psico` en Vercel
2. Crear proyecto `mindcare-psico` en Vercel
3. Configurar variables de entorno (ver `.env.production.*`)
4. Agregar dominios personalizados
5. Configurar DNS en Namecheap

---

## 🔧 Cambios Implementados

### Archivos Nuevos

- ✅ `.env.example` - Plantilla de variables de entorno
- ✅ `.env.production.bienestar` - Configuración para Bienestar
- ✅ `.env.production.mindcare` - Configuración para Mindcare
- ✅ `vercel.json` - Configuración de Vercel
- ✅ Documentación completa (5 archivos .md)

### Archivos Modificados

- ✅ `src/config/tenants.js` - Agregados dominios de producción
- ✅ `src/api.js` - Habilitadas cookies cross-origin
- ✅ `.gitignore` - Protección de archivos .env

---

## 🌐 URLs de Producción

| Clínica | Frontend | Backend |
|---------|----------|---------|
| **Bienestar** | https://bienestar-app.psicoadmin.xyz | https://bienestar.psicoadmin.xyz |
| **Mindcare** | https://mindcare-app.psicoadmin.xyz | https://mindcare.psicoadmin.xyz |

---

## 📋 Variables de Entorno (Vercel)

### Proyecto: bienestar-psico

```env
VITE_API_URL=https://bienestar.psicoadmin.xyz
VITE_TENANT=bienestar
VITE_CLINIC_NAME=Clínica Bienestar
VITE_WS_URL=wss://bienestar.psicoadmin.xyz
```

### Proyecto: mindcare-psico

```env
VITE_API_URL=https://mindcare.psicoadmin.xyz
VITE_TENANT=mindcare
VITE_CLINIC_NAME=MindCare Psicología
VITE_WS_URL=wss://mindcare.psicoadmin.xyz
```

---

## 🏗️ Stack Tecnológico

- **Frontend:** React 19 + Vite 7
- **UI:** Tailwind CSS + Radix UI
- **HTTP Client:** Axios
- **Routing:** React Router DOM 7
- **Deploy:** Vercel (Serverless)
- **DNS:** Namecheap
- **Backend:** Django 5.0 (Multi-tenant)

---

## 🔐 Características

- ✅ Multi-tenant (aislamiento por subdominio)
- ✅ Autenticación con cookies cross-origin
- ✅ CORS configurado correctamente
- ✅ Hot Module Replacement (HMR) en desarrollo
- ✅ Detección automática de tenant
- ✅ Sistema de theming por clínica
- ✅ Responsive design

---

## 🧪 Testing Local

### Desarrollo con subdominios locales

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Acceder a:
# - http://localhost:5174 (Admin Global)
# - http://bienestar.localhost:5174 (Clínica Bienestar)
# - http://mindcare.localhost:5174 (Clínica Mindcare)
```

### Configurar hosts (Windows)

Editar `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1 bienestar.localhost
127.0.0.1 mindcare.localhost
```

---

## 📊 Estructura del Proyecto

```
frontend_sas_sp2/
├── src/
│   ├── api.js                      # Cliente HTTP (Axios)
│   ├── App.jsx                     # Componente principal
│   ├── main.jsx                    # Entry point
│   ├── components/                 # Componentes reutilizables
│   ├── config/
│   │   ├── tenants.js             # ⭐ Configuración multi-tenant
│   │   └── stripe.js              # Configuración de Stripe
│   ├── hooks/                      # Custom hooks
│   ├── pages/                      # Páginas/rutas
│   └── services/                   # Servicios/lógica de negocio
├── public/                         # Assets estáticos
├── .env.example                    # ⭐ Plantilla de variables
├── .env.production.bienestar       # ⭐ Config Bienestar
├── .env.production.mindcare        # ⭐ Config Mindcare
├── vercel.json                     # ⭐ Config Vercel
├── vite.config.js                  # Config Vite
├── tailwind.config.js              # Config Tailwind
├── package.json                    # Dependencias
└── README.md                       # Este archivo
```

---

## 🐛 Troubleshooting

### Problema: CORS Error

**Solución:**
1. Verificar variables de entorno en Vercel
2. Verificar que backend tenga CORS configurado (ya debería estar ✅)
3. Ver [CHECKLIST_DESPLIEGUE.md](./CHECKLIST_DESPLIEGUE.md#troubleshooting)

### Problema: Cookies no se guardan

**Solución:**
1. Verificar que `withCredentials: true` esté en `src/api.js` ✅
2. Verificar configuración de cookies en backend
3. Ver [DOCUMENTO_PARA_BACKEND.md](./DOCUMENTO_PARA_BACKEND.md#verificación-configuración-del-backend)

### Problema: Página en blanco después del deploy

**Solución:**
1. Verificar que `vercel.json` exista ✅
2. Verificar Output Directory sea `dist` en Vercel
3. Ver logs en Vercel → Deployments → View Function Logs

---

## 📞 Soporte

### Logs de Vercel
```
https://vercel.com/[tu-cuenta]/[proyecto]/deployments
→ Click en el último deployment
→ View Function Logs
```

### Logs de Backend
```bash
ssh usuario@servidor
pm2 logs gunicorn
```

### Verificar DNS
```bash
nslookup bienestar-app.psicoadmin.xyz
nslookup mindcare-app.psicoadmin.xyz
```

---

## ✅ Checklist Pre-Deploy

Antes de desplegar, verifica:

- [ ] Cambios subidos a Git (`git push`)
- [ ] Backend está corriendo y accesible
- [ ] DNS del backend está configurado (bienestar.psicoadmin.xyz, mindcare.psicoadmin.xyz)
- [ ] Tienes cuenta en Vercel
- [ ] Tienes acceso a Namecheap para configurar DNS

---

## 🎓 Recursos Adicionales

- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Axios](https://axios-http.com/)
- [Documentación de React Router](https://reactrouter.com/)

---

## 👥 Equipo

**Frontend:** [Tu equipo]  
**Backend:** [Equipo backend]  
**DevOps:** [Equipo DevOps]

---

## 📅 Historial de Cambios

### v2.0.0 (20 Oct 2025)
- ✅ Configuración multi-tenant para producción
- ✅ Soporte para despliegue en Vercel
- ✅ Variables de entorno por tenant
- ✅ Documentación completa

### v1.0.0 (Anterior)
- ✅ Sistema multi-tenant local
- ✅ Autenticación con Django
- ✅ Dashboard de administración

---

## 📄 Licencia

[Tu licencia aquí]

---

## 🚀 ¿Listo para desplegar?

1. Lee el **[RESUMEN_CAMBIOS.md](./RESUMEN_CAMBIOS.md)** (2 minutos)
2. Sigue el **[CHECKLIST_DESPLIEGUE.md](./CHECKLIST_DESPLIEGUE.md)** paso a paso
3. Comparte **[DOCUMENTO_PARA_BACKEND.md](./DOCUMENTO_PARA_BACKEND.md)** con el equipo backend
4. ¡Deploy! 🎉

---

**¿Preguntas?** Revisa la sección de Troubleshooting o contacta al equipo.

**¡Éxito con el despliegue!** 🚀
