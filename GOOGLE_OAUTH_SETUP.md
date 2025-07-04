# Configuración de Google OAuth para FidelizApp

## Resumen

Este documento describe cómo configurar Google OAuth para permitir que los usuarios inicien sesión con sus cuentas de Google tanto en el panel de administración como en el área de clientes.

## Configuración del Backend

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto backend con las siguientes variables:

```env
# JWT Secret
JWT_SECRET=tu-jwt-secret-aqui

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Port
PORT=4000
```

### 2. Configuración de Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ y Google OAuth2
4. Ve a "Credenciales" → "Crear credenciales" → "ID de cliente OAuth"
5. Configura:
   - **Tipo de aplicación**: Aplicación web
   - **Orígenes autorizados**: `http://localhost:4000`
   - **URIs de redireccionamiento**: `http://localhost:4000/auth/google/callback`
6. Copia el `Client ID` y `Client Secret` a tu archivo `.env`

### 3. Instalación de Dependencias

Las dependencias ya están instaladas, pero para referencia:

```bash
npm install passport-google-oauth20 @types/passport-google-oauth20
```

## Configuración del Frontend

### Variables de Entorno

En el archivo `.env.local` del frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Dependencias Instaladas

```bash
npm install @google-cloud/local-auth googleapis
```

## Flujo de Autenticación

### 1. Inicio de Sesión con Google

- El usuario hace clic en "Continuar con Google"
- Se redirige a `/auth/google` en el backend
- El backend redirige a Google OAuth
- Google autentica al usuario
- Google redirige de vuelta a `/auth/google/callback`

### 2. Manejo del Callback

- El backend procesa los datos de Google
- Crea o busca el usuario en la base de datos
- Genera un JWT token
- Redirige al frontend con el token y datos del usuario

### 3. Finalización en el Frontend

- El frontend captura el token y datos del usuario
- Inicia sesión automáticamente
- Redirige al dashboard correspondiente

## Archivos Creados/Modificados

### Backend

- `src/auth/constants.ts` - Constantes de Google OAuth
- `src/auth/google.strategy.ts` - Estrategia de Passport para Google
- `src/auth/google-auth.guard.ts` - Guard para rutas de Google OAuth
- `src/auth/auth.service.ts` - Métodos para manejar usuarios de Google
- `src/auth/auth.controller.ts` - Endpoints de Google OAuth
- `src/auth/auth.module.ts` - Configuración del módulo
- `src/users/users.service.ts` - Métodos para usuarios de Google

### Frontend

- `components/auth/GoogleSignInButton.tsx` - Botón de inicio de sesión
- `pages/auth/google/callback.tsx` - Página de callback
- `pages/auth/error.tsx` - Página de error
- `pages/admin/login.tsx` - Actualizada con botón de Google
- `pages/cliente/login.tsx` - Actualizada con botón de Google

## Endpoints de API

### Autenticación con Google

- `GET /auth/google` - Inicia el flujo de OAuth
- `GET /auth/google/callback` - Callback después de la autenticación

### Rutas del Frontend

- `/auth/google/callback` - Procesa el callback de Google
- `/auth/error` - Maneja errores de autenticación

## Uso en Producción

Para usar en producción:

1. Actualiza las URLs en Google Cloud Console
2. Configura las variables de entorno de producción
3. Asegúrate de que el frontend use HTTPS
4. Actualiza `GOOGLE_CALLBACK_URL` y `FRONTEND_URL` en las variables de entorno

## Solución de Problemas

### Error "redirect_uri_mismatch"

- Verifica que las URLs en Google Cloud Console coincidan exactamente
- Asegúrate de incluir el protocolo (http/https)

### Error "invalid_client"

- Verifica que GOOGLE_CLIENT_ID esté configurado correctamente
- Revisa que el archivo .env esté en la ubicación correcta

### Error de CORS

- Asegúrate de que el backend esté configurado para aceptar requests del frontend
- Verifica las URLs de origen en la configuración de CORS

## Seguridad

- Nunca commites archivos `.env` al repositorio
- Usa secretos seguros para JWT_SECRET
- Considera usar variables de entorno del sistema en producción
- Revisa los permisos de Google OAuth regularmente
