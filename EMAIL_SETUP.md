# Configuración de Email - FidelizApp

## Variables de Entorno Requeridas

Para que el sistema de envío de emails funcione correctamente, debes configurar las siguientes variables de entorno en tu archivo `.env`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@tudominio.com
SMTP_PASS=tu-contraseña-de-aplicacion
SMTP_FROM=noreply@tudominio.com
NODE_ENV=production
```

## Configuración con Gmail

### 1. Crear una Contraseña de Aplicación

1. Ve a tu [Cuenta de Google](https://myaccount.google.com/)
2. Selecciona **Seguridad** en el panel izquierdo
3. En "Iniciar sesión en Google", selecciona **Verificación en 2 pasos**
4. En la parte inferior, selecciona **Contraseñas de aplicaciones**
5. Selecciona la aplicación y el dispositivo para los que quieres generar la contraseña de aplicación
6. Selecciona **Generar**
7. Copia la contraseña de 16 caracteres que aparece en pantalla

### 2. Configurar Variables de Entorno

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=la-contraseña-de-aplicacion-de-16-caracteres
SMTP_FROM=noreply@tudominio.com
NODE_ENV=production
```

## Configuración con Dominio Propio

Si tienes tu propio dominio, configura las variables según tu proveedor de email:

### Ejemplo con cPanel/WHM:

```env
SMTP_HOST=mail.tudominio.com
SMTP_PORT=587
SMTP_USER=noreply@tudominio.com
SMTP_PASS=tu-contraseña
SMTP_FROM=noreply@tudominio.com
```

### Ejemplo con Office 365:

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=noreply@tudominio.com
SMTP_PASS=tu-contraseña
SMTP_FROM=noreply@tudominio.com
```

## Modo Desarrollo

Durante el desarrollo (NODE_ENV=development), los emails no se envían realmente. En su lugar, se muestran en la consola del servidor con el mensaje:

```
📧 Email de verificación (modo desarrollo):
Para: usuario@email.com
Código: 123456
Esta funcionalidad está en desarrollo
```

## Funcionalidades de Email Implementadas

### 1. Verificación de Email

- Se envía al registrarse sin Google OAuth
- Código de 6 dígitos que expira en 15 minutos
- Posibilidad de reenviar el código

### 2. Recuperación de Contraseña

- Se envía al solicitar recuperación de contraseña
- Código de 6 dígitos que expira en 15 minutos
- Permite establecer nueva contraseña

## Endpoints de API

### Verificación de Email

- `POST /api/clients/verify-email` - Verificar código
- `POST /api/clients/resend-verification` - Reenviar código

### Recuperación de Contraseña

- `POST /api/clients/forgot-password` - Solicitar código
- `POST /api/clients/reset-password` - Restablecer contraseña

## Plantillas de Email

Las plantillas de email están incluidas en el servicio y son responsivas. Incluyen:

- **Email de Verificación**: Diseño con gradiente azul/morado
- **Email de Recuperación**: Diseño con gradiente rosa/rojo
- Ambas con estilos modernos y información clara sobre el código y su expiración

## Seguridad

- Los códigos expiran automáticamente en 15 minutos
- Los códigos usados se marcan como inválidos
- Solo un código válido por email y tipo a la vez
- No se revela si un email existe en el sistema (para recuperación de contraseña)

## Troubleshooting

### Error: "Error al enviar el email"

- Verifica que las credenciales SMTP sean correctas
- Asegúrate de que la verificación en 2 pasos esté habilitada (Gmail)
- Verifica que la contraseña de aplicación sea correcta

### Los emails no llegan

- Revisa la carpeta de spam
- Verifica que SMTP_FROM sea un email válido de tu dominio
- Asegúrate de que el puerto 587 no esté bloqueado

### Error de autenticación

- Para Gmail, usa contraseñas de aplicación, no tu contraseña normal
- Verifica que el usuario SMTP sea correcto
