# 🚀 Configuración de Google OAuth para PRODUCCIÓN

## 🚨 **Error Actual: "redirect_uri_mismatch"**

Este error ocurre porque la URL de callback configurada en Google Cloud Console no coincide con la URL que está enviando tu aplicación.

## ✅ **Variables de Entorno Actualizadas**

Tu archivo `.env` ahora tiene las URLs correctas para producción:

```env
# URLs de PRODUCCIÓN ✅
GOOGLE_CALLBACK_URL=https://api-fidelizapp.luciano-yomayel.com/api/auth/google/callback
FRONTEND_URL=https://fidelizapp.luciano-yomayel.com
CORS_ORIGIN=https://fidelizapp.luciano-yomayel.com
```

## 🔧 **PASO 1: Configurar Google Cloud Console**

### 1.1 Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto (donde tienes configurado el OAuth)
3. Ve a **"APIs y servicios"** → **"Credenciales"**

### 1.2 Editar las Credenciales OAuth

1. Busca tu **ID de cliente OAuth 2.0**
2. Haz clic en el ícono de **editar** (lápiz)
3. En la sección **"URIs de redireccionamiento autorizados"**, asegúrate de tener **AMBAS URLs**:

```
✅ DESARROLLO:
http://localhost:4000/api/auth/google/callback

✅ PRODUCCIÓN:
https://api-fidelizapp.luciano-yomayel.com/api/auth/google/callback
```

### 1.3 Configurar Orígenes Autorizados

En la sección **"Orígenes de JavaScript autorizados"**, agrega:

```
✅ DESARROLLO:
http://localhost:3000
http://localhost:4000

✅ PRODUCCIÓN:
https://fidelizapp.luciano-yomayel.com
https://api-fidelizapp.luciano-yomayel.com
```

### 1.4 Guardar Cambios

Haz clic en **"GUARDAR"** y espera unos minutos para que los cambios se propaguen.

## 🔧 **PASO 2: Verificar Configuración del Frontend**

### 2.1 Variables de Entorno del Frontend

En tu frontend (`fidelizapp`), asegúrate de que el archivo `.env.local` o `.env.production` tenga:

```env
NEXT_PUBLIC_API_URL=https://api-fidelizapp.luciano-yomayel.com
```

### 2.2 Verificar GoogleSignInButton

El componente debe usar la URL correcta:

```typescript
// En components/auth/GoogleSignInButton.tsx
const backendUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://api-fidelizapp.luciano-yomayel.com';
const googleAuthUrl = `${backendUrl}/api/auth/google`;
```

## 🔧 **PASO 3: Configuración HTTPS y SSL**

### 3.1 Certificados SSL

- ✅ Asegúrate de que `https://api-fidelizapp.luciano-yomayel.com` tenga un certificado SSL válido
- ✅ Asegúrate de que `https://fidelizapp.luciano-yomayel.com` tenga un certificado SSL válido

### 3.2 Verificar CORS

Tu backend ahora está configurado para permitir:

```env
CORS_ORIGIN=https://fidelizapp.luciano-yomayel.com
```

## 🔧 **PASO 4: Deployment y Restart**

### 4.1 Reiniciar el Servidor Backend

```bash
# Reinicia tu aplicación en producción con las nuevas variables
npm run start:prod
# o el comando que uses para tu deployment
```

### 4.2 Verificar que el Endpoint Funcione

```bash
curl -I https://api-fidelizapp.luciano-yomayel.com/api/auth/google
```

Debería devolver:

```
HTTP/2 302
location: https://accounts.google.com/o/oauth2/v2/auth?...
```

## 🔧 **PASO 5: Testing Completo**

### 5.1 Flujo de Prueba

1. **Frontend**: Ve a `https://fidelizapp.luciano-yomayel.com`
2. **Login**: Haz clic en "Continuar con Google"
3. **Redirección**: Deberías ir a Google OAuth (sin errores)
4. **Autenticación**: Autentica con tu cuenta de Google
5. **Callback**: Deberías volver a tu app autenticado

### 5.2 URLs del Flujo Completo

```
1. Frontend: https://fidelizapp.luciano-yomayel.com/admin/login
2. Clic en Google → https://api-fidelizapp.luciano-yomayel.com/api/auth/google
3. Redirección a Google OAuth
4. Callback: https://api-fidelizapp.luciano-yomayel.com/api/auth/google/callback
5. Redirección final: https://fidelizapp.luciano-yomayel.com/auth/google/callback
```

## 🚨 **Troubleshooting**

### Error "redirect_uri_mismatch"

- ✅ Verifica que las URLs en Google Cloud Console sean **exactamente iguales**
- ✅ Incluye el protocolo (`https://`)
- ✅ No incluyas barras finales (`/`)
- ✅ Espera 5-10 minutos después de guardar cambios en Google

### Error "invalid_client"

- ✅ Verifica que `GOOGLE_CLIENT_ID` sea correcto
- ✅ Verifica que `GOOGLE_CLIENT_SECRET` sea correcto
- ✅ Asegúrate de que no haya espacios extra

### Error CORS

- ✅ Verifica `CORS_ORIGIN` en tu `.env`
- ✅ Reinicia el servidor después de cambiar variables

## 📋 **Checklist Final**

- [ ] ✅ Google Cloud Console configurado con URLs de producción
- [ ] ✅ Variables de entorno actualizadas en backend
- [ ] ✅ Variables de entorno configuradas en frontend
- [ ] ✅ Certificados SSL válidos
- [ ] ✅ Servidor reiniciado con nuevas variables
- [ ] ✅ Endpoint `/api/auth/google` respondiendo 302
- [ ] ✅ Flujo completo probado

## 🔄 **Próximos Pasos**

1. **Actualizar Google Cloud Console** (PASO 1)
2. **Esperar 5-10 minutos** para propagación
3. **Reiniciar servidor** en producción
4. **Probar el flujo completo**

¡Una vez completados estos pasos, tu Google OAuth debería funcionar perfectamente en producción! 🚀
