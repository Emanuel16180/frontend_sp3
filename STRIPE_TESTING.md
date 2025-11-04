# 🔐 Guía de Pruebas de Stripe

## ✅ Cambios Realizados

1. **Actualizada la clave pública de Stripe en `src/config/stripe.js`**
   - Antes: `pk_test_51234567890abcdef` (ejemplo inválido)
   - Ahora: `pk_test_51QKV3TH6SewRAuS35O0jNFMm2fKWtEzKdNXqgj4s9mTjWRwmCQXFvKTryhUz6Qg8Yw3cZdYYzTjQ30zXYRpKWxcF00qzdV9uxX` (clave real de prueba de Render)

## 💳 Tarjetas de Prueba de Stripe

### ✅ Tarjeta Exitosa (Usar esta para pruebas normales)
```
Número: 4242 4242 4242 4242
CVC: Cualquier 3 dígitos (ej: 123)
Fecha: Cualquier fecha futura (ej: 12/28)
ZIP: Cualquier 5 dígitos (ej: 12345)
```

### 🔒 Tarjeta con Autenticación 3D Secure
```
Número: 4000 0025 0000 3155
CVC: Cualquier 3 dígitos
Fecha: Cualquier fecha futura
ZIP: Cualquier 5 dígitos
```
Esta tarjeta simulará una autenticación adicional.

### ❌ Tarjeta Declinada (Para probar errores)
```
Número: 4000 0000 0000 9995
CVC: Cualquier 3 dígitos
Fecha: Cualquier fecha futura
ZIP: Cualquier 5 dígitos
```

### 💰 Otras Tarjetas de Prueba

**American Express:**
```
Número: 3782 822463 10005
CVC: 4 dígitos (ej: 1234)
```

**Mastercard:**
```
Número: 5555 5555 5555 4444
CVC: 3 dígitos
```

**Visa Débito:**
```
Número: 4000 0566 5566 5556
CVC: 3 dígitos
```

## 🚀 Cómo Probar

1. **Reinicia el servidor de desarrollo del frontend:**
   ```bash
   cd "C:\Users\asus\Documents\SISTEMAS DE INFORMACION 2\2do Sprindt\frontend_sas_sp2"
   npm run dev
   ```

2. **Ve a la página de pago** en tu aplicación

3. **Usa la tarjeta de prueba `4242 4242 4242 4242`**

4. **El pago debería procesarse exitosamente**

## 🔍 Verificación del Backend

El backend en Render tiene configuradas las claves de Stripe correctamente:

- **Public Key:** `pk_test_51QKV3TH6SewRAuS3...` ✅
- **Endpoint funcionando:** `https://psico-admin.onrender.com/api/payments/stripe-public-key/` ✅

## 🐛 Solución de Problemas

### Si el pago no funciona:

1. **Verifica que el servidor frontend esté corriendo**
2. **Abre la consola del navegador (F12)** y busca errores
3. **Verifica que estés usando una tarjeta de prueba válida**
4. **Asegúrate de que el backend esté respondiendo:**
   ```bash
   curl https://psico-admin.onrender.com/api/payments/stripe-public-key/
   ```

### Si dice "Clave inválida":

1. **Limpia el caché del navegador** (Ctrl+Shift+Delete)
2. **Recarga la página con Ctrl+F5**
3. **Verifica que el archivo `src/config/stripe.js` tenga la clave correcta**

## 📝 Notas

- **Las claves de prueba comienzan con `pk_test_` o `sk_test_`**
- **Las claves de producción comienzan con `pk_live_` o `sk_live_`**
- **Nunca compartas las claves secretas (sk_test_ o sk_live_) en el frontend**
- **El frontend solo necesita la clave pública (pk_test_ o pk_live_)**

## 🔗 Referencias

- [Documentación de Stripe - Tarjetas de Prueba](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard)
