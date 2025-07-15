# Setup Multi-Ambiente para Stampia

## Arquitectura de Ambientes

### 🏗️ Estructura de Ambientes

| Ambiente | Backend Port | Frontend Port | Backend URL                          | Frontend URL                     |
| -------- | ------------ | ------------- | ------------------------------------ | -------------------------------- |
| **DEV**  | 4001         | 3002          | api-dev.stampia.luciano-yomayel.com  | dev.stampia.luciano-yomayel.com  |
| **TEST** | 4002         | 3003          | api-test.stampia.luciano-yomayel.com | test.stampia.luciano-yomayel.com |
| **PROD** | 4000         | 3001          | api.stampia.luciano-yomayel.com      | stampia.luciano-yomayel.com      |

### 🗄️ Bases de Datos

- **DEV**: `stampia_dev`
- **TEST**: `stampia_test`
- **PROD**: `stampia_prod`

## Configuración del Servidor

### 1. Directorios de Proyecto

```bash
# Crear directorios para cada ambiente
sudo mkdir -p /home/be-stampia-dev /home/be-stampia-test /home/be-stampia-prod
sudo mkdir -p /home/stampia-dev /home/stampia-test /home/stampia-prod

# Crear directorios de logs
sudo mkdir -p /home/be-stampia-dev/logs /home/be-stampia-test/logs /home/be-stampia-prod/logs
sudo mkdir -p /home/stampia-dev/logs /home/stampia-test/logs /home/stampia-prod/logs

# Establecer permisos
sudo chown -R $USER:$USER /home/be-stampia-* /home/stampia-*
```

### 2. Clonar Repositorios

```bash
# Backend
cd /home/be-stampia-dev && git clone -b dev https://github.com/LuYomayel/be-fidelizapp.git .
cd /home/be-stampia-test && git clone -b test https://github.com/LuYomayel/be-fidelizapp.git .
cd /home/be-stampia-prod && git clone -b main https://github.com/LuYomayel/be-fidelizapp.git .

# Frontend
cd /home/stampia-dev && git clone -b dev https://github.com/LuYomayel/fidelizapp.git .
cd /home/stampia-test && git clone -b test https://github.com/LuYomayel/fidelizapp.git .
cd /home/stampia-prod && git clone -b main https://github.com/LuYomayel/fidelizapp.git .
```

### 3. Configurar Bases de Datos

```sql
-- Crear bases de datos
CREATE DATABASE stampia_dev;
CREATE DATABASE stampia_test;
CREATE DATABASE stampia_prod;

-- Crear usuarios
CREATE USER 'stampia_dev_user'@'localhost' IDENTIFIED BY 'Heladodelimon123';
CREATE USER 'stampia_test_user'@'localhost' IDENTIFIED BY 'Heladodelimon123';
CREATE USER 'stampia_prod_user'@'localhost' IDENTIFIED BY 'Heladodelimon123';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON stampia_dev.* TO 'stampia_dev_user'@'localhost';
GRANT ALL PRIVILEGES ON stampia_test.* TO 'stampia_test_user'@'localhost';
GRANT ALL PRIVILEGES ON stampia_prod.* TO 'stampia_prod_user'@'localhost';

FLUSH PRIVILEGES;
```

## Configuración de Nginx

### Archivo de configuración: `/etc/nginx/sites-available/stampia`

```nginx
# DEV - Backend
server {
    listen 80;
    server_name api-dev.stampia.luciano-yomayel.com;

    location / {
        proxy_pass http://localhost:4001;
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

# DEV - Frontend
server {
    listen 80;
    server_name dev.stampia.luciano-yomayel.com;

    location / {
        proxy_pass http://localhost:3002;
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

# TEST - Backend
server {
    listen 80;
    server_name api-test.stampia.luciano-yomayel.com;

    location / {
        proxy_pass http://localhost:4002;
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

# TEST - Frontend
server {
    listen 80;
    server_name test.stampia.luciano-yomayel.com;

    location / {
        proxy_pass http://localhost:3003;
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

# PROD - Backend
server {
    listen 80;
    server_name api.stampia.luciano-yomayel.com;

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

# PROD - Frontend
server {
    listen 80;
    server_name stampia.luciano-yomayel.com;

    location / {
        proxy_pass http://localhost:3001;
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

### Activar configuración:

```bash
sudo ln -s /etc/nginx/sites-available/stampia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## GitHub Actions Secrets

### Secrets requeridos por ambiente:

#### DEV Environment

- `DEV_HOST` - IP del servidor de desarrollo
- `DEV_USERNAME` - Usuario SSH para desarrollo
- `DEV_SSH_KEY` - Clave SSH privada para desarrollo
- `DEV_PORT` - Puerto SSH (normalmente 22)

#### TEST Environment

- `TEST_HOST` - IP del servidor de testing
- `TEST_USERNAME` - Usuario SSH para testing
- `TEST_SSH_KEY` - Clave SSH privada para testing
- `TEST_PORT` - Puerto SSH (normalmente 22)

#### PROD Environment

- `PROD_HOST` - IP del servidor de producción
- `PROD_USERNAME` - Usuario SSH para producción
- `PROD_SSH_KEY` - Clave SSH privada para producción
- `PROD_PORT` - Puerto SSH (normalmente 22)

## Branches de Git

### Crear branches necesarias:

```bash
# Crear branch de desarrollo
git checkout -b dev
git push -u origin dev

# Crear branch de testing
git checkout -b test
git push -u origin test

# Main ya existe para producción
```

### Flujo de trabajo:

1. **Desarrollo**: Commits van a `dev` → Deploy automático a DEV
2. **Testing**: Merge de `dev` a `test` → Deploy automático a TEST
3. **Producción**: Merge de `test` a `main` → Deploy automático a PROD

## Comandos PM2

### Iniciar todos los ambientes:

```bash
pm2 start ecosystem.config.js
```

### Comandos por ambiente:

```bash
# Desarrollo
pm2 start ecosystem.config.js --only be-stampia-dev
pm2 start ecosystem.config.js --only stampia-dev

# Testing
pm2 start ecosystem.config.js --only be-stampia-test
pm2 start ecosystem.config.js --only stampia-test

# Producción
pm2 start ecosystem.config.js --only be-stampia-prod
pm2 start ecosystem.config.js --only stampia-prod
```

### Monitoreo:

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs be-stampia-dev
pm2 logs stampia-dev

# Reiniciar
pm2 restart be-stampia-dev
pm2 restart stampia-dev
```

## SSL/HTTPS

### Configurar certificados SSL con Let's Encrypt:

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Generar certificados para todos los dominios
sudo certbot --nginx -d dev.stampia.luciano-yomayel.com
sudo certbot --nginx -d api-dev.stampia.luciano-yomayel.com
sudo certbot --nginx -d test.stampia.luciano-yomayel.com
sudo certbot --nginx -d api-test.stampia.luciano-yomayel.com
sudo certbot --nginx -d stampia.luciano-yomayel.com
sudo certbot --nginx -d api.stampia.luciano-yomayel.com
```

## Verificación del Setup

### Health checks:

```bash
# DEV
curl https://api-dev.stampia.luciano-yomayel.com/health
curl https://dev.stampia.luciano-yomayel.com

# TEST
curl https://api-test.stampia.luciano-yomayel.com/health
curl https://test.stampia.luciano-yomayel.com

# PROD
curl https://api.stampia.luciano-yomayel.com/health
curl https://stampia.luciano-yomayel.com
```

## Troubleshooting

### Logs útiles:

```bash
# PM2 logs
pm2 logs --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Sistema
sudo journalctl -u nginx -f
```

### Comandos de diagnóstico:

```bash
# Verificar puertos
netstat -tlnp | grep :300[1-3]
netstat -tlnp | grep :400[0-2]

# Verificar procesos
ps aux | grep node
pm2 status

# Verificar nginx
sudo nginx -t
sudo systemctl status nginx
```
