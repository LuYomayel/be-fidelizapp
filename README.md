# Stampia Backend

API Backend para la aplicación de sellos de clientes desarrollada con NestJS, TypeORM y MySQL.

## Características

- 🔐 **Autenticación JWT** completa con Passport
- 👥 **Gestión de usuarios** con dos tipos: Negocios y Clientes
- 📊 **CRUD completo** para ambos tipos de usuarios
- 🔒 **Guards de autenticación** para proteger rutas
- 📁 **Upload de archivos** para logos de negocios
- 🧪 **Tests unitarios** completos para todos los servicios
- 🗄️ **Base de datos MySQL** con TypeORM
- 📝 **Validación de datos** con class-validator

## Tecnologías

- **NestJS** - Framework de Node.js
- **TypeORM** - ORM para TypeScript
- **MySQL** - Base de datos
- **Passport JWT** - Autenticación
- **bcrypt** - Hashing de contraseñas
- **class-validator** - Validación de DTOs
- **multer** - Upload de archivos
- **Jest** - Testing

## Instalación

1. Clona el repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno en `.env`:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=stampia
JWT_SECRET=your-super-secret-jwt-key
```

4. Asegúrate de tener MySQL ejecutándose y crea la base de datos:

```sql
CREATE DATABASE stampia;
```

5. Ejecuta la aplicación:

```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

## API Endpoints

### Autenticación

- `POST /auth/login` - Login con credenciales (devuelve JWT)
- `GET /auth/profile` - Obtener perfil del usuario autenticado (requiere JWT)

### Negocios

- `POST /business/register` - Registrar nuevo negocio (con upload de logo)
- `POST /business/login` - Login de negocio
- `GET /business` - Listar todos los negocios (requiere JWT)
- `GET /business/:id` - Obtener negocio por ID (requiere JWT)
- `PATCH /business/:id` - Actualizar negocio (requiere JWT)
- `DELETE /business/:id` - Eliminar negocio (requiere JWT)

### Clientes

- `POST /clients/register` - Registrar nuevo cliente
- `POST /clients/login` - Login de cliente
- `GET /clients` - Listar todos los clientes (requiere JWT)
- `GET /clients/:id` - Obtener cliente por ID (requiere JWT)
- `PATCH /clients/:id` - Actualizar cliente (requiere JWT)
- `DELETE /clients/:id` - Eliminar cliente (requiere JWT)

## Entidades

### Business (Negocios)

- Nombre del negocio
- Email (único)
- Contraseña (hasheada)
- Teléfono interno y externo
- Tamaño (1-5, 5-10, +10 sucursales)
- Ubicación (calle, barrio, código postal, provincia)
- Logo (archivo subido)
- Tipo (Cafetería, Restaurant, Peluquería, Manicura, Otro)
- Redes sociales (Instagram, TikTok, página web)

### Client (Clientes)

- Email (único)
- Contraseña (hasheada)
- Nombre
- Apellido

## Testing

Ejecutar todos los tests:

```bash
npm test
```

Ejecutar tests específicos:

```bash
npm test -- --testPathPattern=business.service.spec.ts
npm test -- --testPathPattern=clients.service.spec.ts
```

Tests con coverage:

```bash
npm run test:cov
```

## Ejemplos de Uso

### Registrar un negocio

```bash
curl -X POST http://localhost:3000/business/register \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Mi Cafetería",
    "email": "cafe@ejemplo.com",
    "password": "password123",
    "internalPhone": "123456789",
    "externalPhone": "987654321",
    "size": "1-5 sucursales",
    "street": "Av. Principal 123",
    "neighborhood": "Centro",
    "postalCode": "12345",
    "province": "Buenos Aires",
    "type": "Cafeteria",
    "instagram": "@micafeteria",
    "website": "https://micafeteria.com"
  }'
```

### Login de negocio

```bash
curl -X POST http://localhost:3000/business/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cafe@ejemplo.com",
    "password": "password123"
  }'
```

### Registrar un cliente

```bash
curl -X POST http://localhost:3000/clients/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@ejemplo.com",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Pérez"
  }'
```

## Seguridad

- Las contraseñas se hashean con bcrypt (salt rounds: 10)
- JWT para autenticación stateless
- Validación de datos en todos los endpoints
- Guards para proteger rutas sensibles
- Validación de archivos en uploads (solo imágenes)

## Desarrollo

```bash
# Modo desarrollo con hot reload
npm run start:dev

# Modo debug
npm run start:debug

# Linting
npm run lint

# Formateo de código
npm run format
```

## Producción

```bash
# Build
npm run build

# Ejecutar en producción
npm run start:prod
```

## Notas Importantes

- `synchronize: true` está habilitado solo para desarrollo. En producción usar migraciones.
- Los logs están habilitados para desarrollo. Desactivar en producción.
- Cambiar `JWT_SECRET` en producción por una clave segura.
- Configurar límites de archivos para uploads según necesidades.

## Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
# be-stampia
