# FIX: Redirección Automática en Landing Page

## Problema
Cuando accedes a `bienestar-psico-...vercel.app/`, muestra el formulario de registro, pero debería redirigir a `/login` porque la clínica "bienestar" ya existe.

## Solución
Modificar `src/pages/LandingPage.jsx` para que:
1. Al cargar, detecte el tenant actual
2. Verifique si ese tenant ya existe en el backend
3. Si existe, redirija automáticamente a `/login`
4. Si no existe, muestre el formulario de registro

## Cambios Específicos

### 1. Cambiar las importaciones (líneas 1-2)

**ANTES:**
```javascript
import { useState } from 'react';
import axios from 'axios';
```

**DESPUÉS:**
```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getTenantFromHostname } from '../config/tenants';
```

### 2. Agregar estados y lógica al inicio del componente (después de línea 6)

**DESPUÉS de `export default function LandingPage() {`**, agregar:

```javascript
  const navigate = useNavigate();
  const [isCheckingTenant, setIsCheckingTenant] = useState(true);
```

### 3. Agregar useEffect ANTES de los otros estados (después de agregar lo anterior)

```javascript
  // Verificar si el tenant actual ya existe
  useEffect(() => {
    const checkIfTenantExists = async () => {
      const currentTenant = getTenantFromHostname();
      
      // Si estamos en un tenant específico (no global-admin), verificar si existe
      if (currentTenant && currentTenant !== 'global-admin') {
        try {
          const response = await axios.post(`${API_BASE_URL}/check-subdomain/`, {
            subdomain: currentTenant
          });
          
          // Si el tenant NO está disponible (ya existe), redirigir al login
          if (response.data.available === false) {
            console.log(`Tenant '${currentTenant}' ya existe, redirigiendo a login...`);
            navigate('/login');
            return;
          }
        } catch (err) {
          console.error('Error verificando tenant:', err);
        }
      }
      
      setIsCheckingTenant(false);
    };

    checkIfTenantExists();
  }, [navigate]);

  // Mostrar loader mientras verifica
  if (isCheckingTenant) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 text-lg'>Verificando clínica...</p>
        </div>
      </div>
    );
  }
```

### 4. El resto del código queda igual

Todo lo demás (los estados `formData`, `subdomainAvailable`, etc. y el JSX) queda exactamente igual.

## Resultado Esperado

- Al acceder a `bienestar-psico-...vercel.app/` → Se muestra "Verificando clínica..." por 1 segundo → Redirige a `/login`
- Al acceder a `nuevo-tenant.psicoadmin.xyz/` → Se muestra "Verificando clínica..." → Muestra el formulario de registro (porque no existe)

## Commit
Después de hacer los cambios:

```bash
git add src/pages/LandingPage.jsx
git commit -m "feat: Agregar redirección automática a login si el tenant ya existe"
git push origin main
```
