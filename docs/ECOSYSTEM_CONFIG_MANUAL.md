# Configuración Manual del ecosystem.config.js

## ⚠️ IMPORTANTE: Archivo No Versionado

El archivo `ecosystem.config.js` **NO está versionado** en el repositorio por razones de seguridad, ya que contiene secrets de Google OAuth.

## Ubicación del Archivo

El archivo debe crearse manualmente en la raíz del proyecto backend:

```
be-fidelizapp/ecosystem.config.js
```

## Contenido del Archivo

Crear el archivo con el siguiente contenido, reemplazando los valores de ejemplo:

```javascript
module.exports = {
  apps: [
    // DESARROLLO
    {
      name: 'stampia-backend-dev',
      script: 'dist/main.js',
      cwd: '/path/to/be-fidelizapp',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 4001,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'stampia_dev',
        DB_USER: 'tu_usuario',
        DB_PASSWORD: 'tu_password',
        JWT_SECRET: 'tu_jwt_secret_dev',
        GOOGLE_CLIENT_ID: 'tu_google_client_id',
        GOOGLE_CLIENT_SECRET: 'tu_google_client_secret',
        GOOGLE_CALLBACK_URL:
          'https://dev.stampia.luciano-yomayel.com/auth/google/callback',
        FRONTEND_URL: 'https://dev.stampia.luciano-yomayel.com',
        CORS_ORIGIN: 'https://dev.stampia.luciano-yomayel.com',
        EMAIL_HOST: 'smtp.gmail.com',
        EMAIL_PORT: 587,
        EMAIL_USER: 'tu_email@gmail.com',
        EMAIL_PASS: 'tu_app_password',
      },
    },

    // TESTING
    {
      name: 'stampia-backend-test',
      script: 'dist/main.js',
      cwd: '/path/to/be-fidelizapp',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'test',
        PORT: 4002,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'stampia_test',
        DB_USER: 'tu_usuario',
        DB_PASSWORD: 'tu_password',
        JWT_SECRET: 'tu_jwt_secret_test',
        GOOGLE_CLIENT_ID: 'tu_google_client_id',
        GOOGLE_CLIENT_SECRET: 'tu_google_client_secret',
        GOOGLE_CALLBACK_URL:
          'https://test.stampia.luciano-yomayel.com/auth/google/callback',
        FRONTEND_URL: 'https://test.stampia.luciano-yomayel.com',
        CORS_ORIGIN: 'https://test.stampia.luciano-yomayel.com',
        EMAIL_HOST: 'smtp.gmail.com',
        EMAIL_PORT: 587,
        EMAIL_USER: 'tu_email@gmail.com',
        EMAIL_PASS: 'tu_app_password',
      },
    },

    // PRODUCCIÓN
    {
      name: 'stampia-backend-prod',
      script: 'dist/main.js',
      cwd: '/path/to/be-fidelizapp',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'stampia_prod',
        DB_USER: 'tu_usuario',
        DB_PASSWORD: 'tu_password',
        JWT_SECRET: 'tu_jwt_secret_prod',
        GOOGLE_CLIENT_ID: 'tu_google_client_id',
        GOOGLE_CLIENT_SECRET: 'tu_google_client_secret',
        GOOGLE_CALLBACK_URL:
          'https://stampia.luciano-yomayel.com/auth/google/callback',
        FRONTEND_URL: 'https://stampia.luciano-yomayel.com',
        CORS_ORIGIN: 'https://stampia.luciano-yomayel.com',
        EMAIL_HOST: 'smtp.gmail.com',
        EMAIL_PORT: 587,
        EMAIL_USER: 'tu_email@gmail.com',
        EMAIL_PASS: 'tu_app_password',
      },
    },
  ],
};
```

## Instrucciones de Configuración

1. **Crear el archivo** en la raíz del proyecto backend
2. **Reemplazar todos los valores** con los reales:
   - Rutas absolutas (`/path/to/be-fidelizapp`)
   - Credenciales de base de datos
   - Secrets de JWT (diferentes para cada ambiente)
   - Credenciales de Google OAuth
   - Configuración de email
3. **Verificar permisos** del archivo (solo lectura para el usuario)
4. **No commitear** el archivo al repositorio

## Comandos PM2

```bash
# Iniciar todos los ambientes
pm2 start ecosystem.config.js

# Iniciar solo un ambiente específico
pm2 start ecosystem.config.js --only stampia-backend-dev
pm2 start ecosystem.config.js --only stampia-backend-test
pm2 start ecosystem.config.js --only stampia-backend-prod

# Ver estado
pm2 status

# Ver logs
pm2 logs stampia-backend-dev
pm2 logs stampia-backend-test
pm2 logs stampia-backend-prod

# Reiniciar
pm2 restart stampia-backend-dev
pm2 restart stampia-backend-test
pm2 restart stampia-backend-prod

# Detener
pm2 stop stampia-backend-dev
pm2 stop stampia-backend-test
pm2 stop stampia-backend-prod
```

## Seguridad

- ✅ Archivo agregado al `.gitignore`
- ✅ No se versiona en el repositorio
- ✅ Contiene secrets sensibles
- ⚠️ Debe crearse manualmente en cada servidor
- ⚠️ Mantener permisos restrictivos (600 o 644)
