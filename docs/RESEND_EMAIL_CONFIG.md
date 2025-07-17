# Configuración de Resend para Email Service

## Descripción

El proyecto ha sido migrado de nodemailer a Resend para el envío de emails. Resend es un servicio moderno de email transaccional que ofrece mejor deliverability y una API más simple.

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env`:

```env
# Resend API Key (obtener desde https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email desde el cual se enviarán los emails
EMAIL_FROM=noreply@stampia.com
```

## Configuración de Resend

### 1. Crear cuenta en Resend

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu dominio o usa el dominio de prueba de Resend

### 2. Obtener API Key

1. En el dashboard de Resend, ve a "API Keys"
2. Crea una nueva API key
3. Copia la key (comienza con `re_`)

### 3. Configurar dominio (opcional)

Para usar tu propio dominio:

1. Ve a "Domains" en el dashboard
2. Agrega tu dominio
3. Configura los registros DNS según las instrucciones
4. Una vez verificado, usa tu dominio en `EMAIL_FROM`

## Funcionalidades

El `EmailService` actualizado mantiene todas las funcionalidades anteriores:

- ✅ **Verificación de email** - Para nuevos usuarios
- ✅ **Recuperación de contraseña** - Para usuarios existentes
- ✅ **Verificación comercial** - Para negocios registrados
- ✅ **Modo desarrollo** - Simula envío en desarrollo
- ✅ **Logging detallado** - Con operation IDs para debugging

## Métodos Disponibles

```typescript
// Verificar conexión
await emailService.verifyConnection(): Promise<boolean>

// Enviar email de verificación
await emailService.sendVerificationEmail(email: string, code: string, name?: string)

// Enviar email de recuperación de contraseña
await emailService.sendPasswordResetEmail(email: string, code: string, name?: string)

// Enviar email de verificación comercial
await emailService.sendBusinessVerificationEmail(email: string, code: string, businessName: string, adminFirstName: string)
```

## Ventajas de Resend

- 🚀 **Mejor deliverability** - Emails llegan a la bandeja de entrada
- 📊 **Analytics** - Tracking de apertura, clicks, etc.
- 🔧 **API simple** - Fácil de usar y mantener
- 💰 **Plan gratuito** - 3,000 emails/mes gratis
- 🌍 **Global** - Servidores en múltiples regiones

## Troubleshooting

### Error: "RESEND_API_KEY is required"

- Verifica que la variable `RESEND_API_KEY` esté configurada en tu `.env`
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto

### Error: "Invalid API key"

- Verifica que la API key sea correcta
- Asegúrate de que la cuenta de Resend esté activa

### Emails no se envían en producción

- Verifica que `NODE_ENV` no sea `development` o `dev`
- Revisa los logs para ver el error específico
- Verifica que el dominio esté verificado en Resend

## Migración desde Nodemailer

Los cambios principales son:

1. **Dependencias**: `nodemailer` → `resend`
2. **Configuración**: Variables SMTP → `RESEND_API_KEY`
3. **API**: `transporter.sendMail()` → `resend.emails.send()`
4. **Logging**: Mejorado con operation IDs

La interfaz pública del servicio se mantiene igual, por lo que no se requieren cambios en el código que usa el `EmailService`.
