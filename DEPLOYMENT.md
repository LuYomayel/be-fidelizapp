# Deployment con PM2

Este documento explica cómo deployar tanto el backend (be-fidelizapp) como el frontend (fidelizapp) usando PM2.

## Prerrequisitos

1. **Node.js** (versión 18 o superior)
2. **PM2** instalado globalmente:
   ```bash
   npm install -g pm2
   ```
3. **MySQL** configurado y corriendo
4. **Nginx** (opcional, para proxy reverso)

## Estructura de Archivos

```
/home/
├── be-fidelizapp/           # Backend NestJS
│   ├── ecosystem.config.js  # Configuración PM2 del backend
│   └── dist/               # Código compilado
├── fidelizapp/             # Frontend Next.js
│   ├── ecosystem.config.js # Configuración PM2 del frontend
│   └── .next/              # Build de Next.js
└── ecosystem.combined.config.js # Configuración combinada (opcional)
```

## Variables de Entorno

### Backend (be-fidelizapp)

```bash
# Servidor
NODE_ENV=production
PORT=4000

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=fidelizapp_user
DB_PASSWORD=your_secure_password_here
DB_NAME=fidelizapp

# JWT
JWT_SECRET=your_jwt_secret_key_here_make_it_very_long_and_secure

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (fidelizapp)

```bash
# Servidor
NODE_ENV=production
PORT=3000

# API URL
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## Comandos de Deployment

### Opción 1: Deployar cada proyecto por separado

#### Backend:

```bash
cd /home/be-fidelizapp
npm run build
pm2 start ecosystem.config.js --env production
```

#### Frontend:

```bash
cd /home/fidelizapp
npm run build
pm2 start ecosystem.config.js --env production
```

### Opción 2: Deployar ambos proyectos juntos

```bash
# Desde el directorio padre que contiene ambos proyectos
pm2 start ecosystem.combined.config.js --env production
```

## Comandos Útiles de PM2

```bash
# Ver estado de las aplicaciones
pm2 status

# Ver logs en tiempo real
pm2 logs

# Ver logs de una aplicación específica
pm2 logs be-fidelizapp
pm2 logs fidelizapp

# Reiniciar aplicaciones
pm2 restart be-fidelizapp
pm2 restart fidelizapp

# Detener aplicaciones
pm2 stop be-fidelizapp
pm2 stop fidelizapp

# Eliminar aplicaciones
pm2 delete be-fidelizapp
pm2 delete fidelizapp

# Guardar configuración actual
pm2 save

# Configurar PM2 para iniciar automáticamente
pm2 startup
```

## Configuración de Base de Datos

Antes del deployment, asegúrate de:

1. **Crear la base de datos:**

   ```sql
   CREATE DATABASE fidelizapp;
   CREATE USER 'fidelizapp_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
   GRANT ALL PRIVILEGES ON fidelizapp.* TO 'fidelizapp_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Las migraciones se ejecutarán automáticamente** al iniciar el backend.

## Configuración de Nginx (Opcional)

Si usas Nginx como proxy reverso:

```nginx
# /etc/nginx/sites-available/fidelizapp
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.your-domain.com;

    # Backend API
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoreo

PM2 incluye un monitor web:

```bash
# Instalar PM2 Plus (opcional)
pm2 install pm2-server-monit

# Ver monitor web
pm2 monit
```

## Logs

Los logs se guardan en:

- Backend: `./be-fidelizapp/logs/`
- Frontend: `./fidelizapp/logs/`

## Troubleshooting

### Problemas comunes:

1. **Puerto ya en uso:**

   ```bash
   lsof -i :3000
   lsof -i :4000
   ```

2. **Permisos de archivos:**

   ```bash
   chmod +x be-fidelizapp/dist/src/main.js
   ```

3. **Variables de entorno no cargadas:**
   - Verificar que las variables estén en el archivo `ecosystem.config.js`
   - Usar `pm2 restart app --update-env`

4. **Base de datos no conecta:**
   - Verificar credenciales en las variables de entorno
   - Comprobar que MySQL esté corriendo
   - Verificar permisos del usuario de base de datos
