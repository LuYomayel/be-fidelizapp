# Configuración de Google OAuth para Stampia

## 🚨 Error: redirect_uri_mismatch

Este error ocurre cuando las URLs configuradas en Google Cloud Console no coinciden con las URLs que usa tu aplicación.

## 📋 URLs que debes configurar en Google Cloud Console

### 1. Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Edita tu **OAuth 2.0 Client ID**

### 2. Configurar URLs autorizadas

#### **JavaScript origins** (URLs del frontend):

```
https://stampia.luciano-yomayel.com
https://dev.stampia.luciano-yomayel.com
https://test.stampia.luciano-yomayel.com
```

#### **Authorized redirect URIs** (URLs del backend):

```
https://api.stampia.luciano-yomayel.com/auth/google/callback
https://api-dev.stampia.luciano-yomayel.com/auth/google/callback
https://api-test.stampia.luciano-yomayel.com/auth/google/callback
```

## 🔧 Configuración por Ambiente

### Producción

- **Frontend**: `https://stampia.luciano-yomayel.com`
- **Backend**: `https://api.stampia.luciano-yomayel.com`
- **Callback**: `https://api.stampia.luciano-yomayel.com/auth/google/callback`

### Testing

- **Frontend**: `https://test.stampia.luciano-yomayel.com`
- **Backend**: `https://api-test.stampia.luciano-yomayel.com`
- **Callback**: `https://api-test.stampia.luciano-yomayel.com/auth/google/callback`

### Desarrollo

- **Frontend**: `https://dev.stampia.luciano-yomayel.com`
- **Backend**: `https://api-dev.stampia.luciano-yomayel.com`
- **Callback**: `https://api-dev.stampia.luciano-yomayel.com/auth/google/callback`

## 🔑 Variables de Entorno

### Backend (be-fidelizapp)

```bash
# Producción
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_CALLBACK_URL=https://api.stampia.luciano-yomayel.com/auth/google/callback
FRONTEND_URL=https://stampia.luciano-yomayel.com

# Desarrollo
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_CALLBACK_URL=https://api-dev.stampia.luciano-yomayel.com/auth/google/callback
FRONTEND_URL=https://dev.stampia.luciano-yomayel.com

# Testing
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_CALLBACK_URL=https://api-test.stampia.luciano-yomayel.com/auth/google/callback
FRONTEND_URL=https://test.stampia.luciano-yomayel.com
```

## 🔄 Flujo de Autenticación

1. **Usuario hace clic en "Iniciar sesión con Google"** en el frontend
2. **Frontend redirige a**: `https://api.stampia.luciano-yomayel.com/auth/google`
3. **Backend redirige a Google** con el `client_id` y `callback_url`
4. **Google autentica al usuario** y redirige a: `https://api.stampia.luciano-yomayel.com/auth/google/callback`
5. **Backend procesa la respuesta** y redirige al frontend con el token: `https://stampia.luciano-yomayel.com/auth/google/callback?token=xxx`

## 🛠️ Pasos para Resolver el Error

### 1. Actualizar Google Cloud Console

- Agrega todas las URLs mencionadas arriba
- Asegúrate de que no haya URLs antiguas de fidelizapp

### 2. Verificar Variables de Entorno

- Revisa que `GOOGLE_CALLBACK_URL` esté configurada correctamente
- Revisa que `FRONTEND_URL` esté configurada correctamente

### 3. Reiniciar Aplicación

```bash
# En el servidor
pm2 restart be-stampia-prod  # o el ambiente que estés usando
```

### 4. Verificar Configuración

```bash
# Ver logs para verificar las URLs
pm2 logs be-stampia-prod
```

## 🔍 Debugging

### Verificar URLs en el Backend

Al iniciar el backend, deberías ver estos logs:

```
🔧 Variables de entorno OAuth (con dotenv manual):
GOOGLE_CLIENT_ID: Configurado ✅
GOOGLE_CLIENT_SECRET: Configurado ✅
GOOGLE_CALLBACK_URL: https://api.stampia.luciano-yomayel.com/auth/google/callback
```

### Verificar en Google Cloud Console

1. Ve a tu proyecto en Google Cloud Console
2. APIs & Services > Credentials
3. Haz clic en tu OAuth 2.0 Client ID
4. Verifica que las URLs estén exactamente como se muestran arriba

## ⚠️ Notas Importantes

1. **No uses `localhost`** en producción
2. **Todas las URLs deben usar HTTPS** (excepto localhost para desarrollo)
3. **Las URLs deben coincidir exactamente** (sin barras finales extra)
4. **Puede tomar unos minutos** para que los cambios en Google Cloud Console se propaguen

## 🆘 Si el Error Persiste

1. **Verifica los logs del backend** para ver qué URL está enviando a Google
2. **Compara con Google Cloud Console** que las URLs coincidan exactamente
3. **Espera 5-10 minutos** después de cambiar la configuración en Google
4. **Prueba en modo incógnito** para evitar cache del navegador
