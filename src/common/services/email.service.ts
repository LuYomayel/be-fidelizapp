import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.initializeResend();
  }

  private initializeResend(): void {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    this.logger.log('🔧 Configuración Resend:');
    this.logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    this.logger.log(
      `RESEND_API_KEY: ${apiKey ? 'Configurado ✅' : 'No configurado ❌'}`,
    );
    this.logger.log(
      `EMAIL_FROM: ${this.configService.get<string>('EMAIL_FROM') || 'noreply@stampia.app'}`,
    );

    if (!apiKey) {
      this.logger.error('❌ RESEND_API_KEY no está configurado');
      throw new Error('RESEND_API_KEY is required');
    }

    try {
      this.resend = new Resend(apiKey);
      this.logger.log('✅ Resend inicializado correctamente');
    } catch (error) {
      this.logger.error('❌ Error inicializando Resend:', error);
      throw error;
    }
  }

  // Método para verificar conexión Resend (útil para debugging)
  verifyConnection(): Promise<boolean> {
    try {
      // Resend no tiene un método de verificación directo, pero podemos hacer una prueba
      this.logger.log('✅ Resend está configurado correctamente');
      return Promise.resolve(true);
    } catch (error) {
      this.logger.error('❌ Error verificando conexión Resend:', error);
      return Promise.resolve(false);
    }
  }

  async sendVerificationEmail(email: string, code: string, name?: string) {
    const operationId = `verification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(
      `[${operationId}] 📧 Enviando email de verificación a: ${email}`,
    );

    try {
      // En desarrollo, solo simular el envío
      /*
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'dev'
      ) {
        this.logger.log(
          `[${operationId}] 📧 Email de verificación (modo desarrollo):`,
        );
        this.logger.log(`Para: ${email}`);
        this.logger.log(`Código: ${code}`);
        this.logger.log(`Nombre: ${name || 'No especificado'}`);
        this.logger.log('✅ Email simulado enviado exitosamente');
        return { success: true, message: 'Email enviado (modo desarrollo)' };
      }
      */
      // En producción, enviar email real con Resend
      const from =
        this.configService.get<string>('EMAIL_FROM') || 'noreply@stampia.app';

      const result = await this.resend.emails.send({
        from,
        to: email,
        subject: 'Verifica tu cuenta - Stampia',
        html: this.getVerificationEmailTemplate(code, name),
      });

      this.logger.log(`[${operationId}] ✅ Email enviado exitosamente`);
      this.logger.log(`[${operationId}] 📧 Message ID: ${result.data?.id}`);

      return { success: true, message: 'Email de verificación enviado' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[${operationId}] ❌ Error enviando email de verificación:`,
        errorMessage,
      );
      return { success: false, message: 'Error al enviar el email' };
    }
  }

  async sendPasswordResetEmail(email: string, code: string, name?: string) {
    const operationId = `password-reset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(
      `[${operationId}] 📧 Enviando email de recuperación de contraseña a: ${email}`,
    );

    try {
      // En desarrollo, solo simular el envío
      /*
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'dev'
      ) {
        this.logger.log(
          `[${operationId}] 📧 Email de recuperación de contraseña (modo desarrollo):`,
        );
        this.logger.log(`Para: ${email}`);
        this.logger.log(`Código: ${code}`);
        this.logger.log(`Nombre: ${name || 'No especificado'}`);
        this.logger.log('✅ Email simulado enviado exitosamente');
        return { success: true, message: 'Email enviado (modo desarrollo)' };
      }
      */

      // En producción, enviar email real con Resend
      const from =
        this.configService.get<string>('EMAIL_FROM') || 'noreply@stampia.app';

      const result = await this.resend.emails.send({
        from,
        to: email,
        subject: 'Recuperar contraseña - Stampia',
        html: this.getPasswordResetEmailTemplate(code, name),
      });

      this.logger.log(`[${operationId}] ✅ Email enviado exitosamente`);
      this.logger.log(`[${operationId}] 📧 Message ID: ${result.data?.id}`);

      return { success: true, message: 'Email de recuperación enviado' };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[${operationId}] ❌ Error enviando email de recuperación:`,
        errorMessage,
      );
      return { success: false, message: 'Error al enviar el email' };
    }
  }

  async sendBusinessVerificationEmail(
    email: string,
    code: string,
    businessName: string,
    adminFirstName: string,
  ) {
    const operationId = `business-verification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(
      `[${operationId}] 📧 Enviando email de verificación comercial a: ${email}`,
    );

    try {
      // En desarrollo, solo simular el envío
      /*
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'dev'
      ) {
        this.logger.log(
          `[${operationId}] 📧 Email de verificación comercial (modo desarrollo):`,
        );
        this.logger.log(`Para: ${email}`);
        this.logger.log(`Código: ${code}`);
        this.logger.log(`Negocio: ${businessName}`);
        this.logger.log(`Admin: ${adminFirstName}`);
        this.logger.log('✅ Email simulado enviado exitosamente');
        return { success: true, message: 'Email enviado (modo desarrollo)' };
      }
      */
      // En producción, enviar email real con Resend
      const from =
        this.configService.get<string>('EMAIL_FROM') || 'noreply@stampia.app';

      const result = await this.resend.emails.send({
        from,
        to: email,
        subject: 'Verificación de cuenta comercial - Stampia',
        html: this.getBusinessVerificationEmailTemplate(
          code,
          businessName,
          adminFirstName,
        ),
      });

      this.logger.log(`[${operationId}] ✅ Email enviado exitosamente`);
      this.logger.log(`[${operationId}] 📧 Message ID: ${result.data?.id}`);

      return {
        success: true,
        message: 'Email de verificación comercial enviado',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[${operationId}] ❌ Error enviando email de verificación comercial:`,
        errorMessage,
      );
      return { success: false, message: 'Error al enviar el email' };
    }
  }

  private getVerificationEmailTemplate(code: string, name?: string): string {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifica tu cuenta</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }
            .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }
            .code-box {
                background: white;
                border: 2px solid #667eea;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }
            .code {
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 4px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎉 ¡Bienvenido${name ? ` ${name}` : ''}!</h1>
            <p>Verifica tu cuenta en Stampia</p>
        </div>
        <div class="content">
            <p>Gracias por registrarte en Stampia. Para completar tu registro, por favor verifica tu dirección de email usando el código de verificación a continuación:</p>
            
            <div class="code-box">
                <div class="code">${code}</div>
                <p style="margin: 10px 0 0 0; color: #666;">Código de verificación</p>
            </div>
            
            <p><strong>Importante:</strong></p>
            <ul>
                <li>Este código expira en 15 minutos</li>
                <li>Solo se puede usar una vez</li>
                <li>Si no solicitaste este código, ignora este email</li>
            </ul>
            
            <p>Una vez verificado tu email, podrás acceder a todas las funcionalidades de Stampia y comenzar a acumular puntos en tus negocios favoritos.</p>
        </div>
        <div class="footer">
            <p>Este email fue enviado desde Stampia</p>
            <p>Si no te registraste en nuestra plataforma, puedes ignorar este mensaje</p>
        </div>
    </body>
    </html>
    `;
  }

  private getPasswordResetEmailTemplate(code: string, name?: string): string {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar contraseña</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }
            .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }
            .code-box {
                background: white;
                border: 2px solid #f5576c;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }
            .code {
                font-size: 32px;
                font-weight: bold;
                color: #f5576c;
                letter-spacing: 4px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔐 Recuperar Contraseña</h1>
            <p>Restablece tu contraseña en Stampia</p>
        </div>
        <div class="content">
            <p>Hola${name ? ` ${name}` : ''},</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código para continuar:</p>
            
            <div class="code-box">
                <div class="code">${code}</div>
                <p style="margin: 10px 0 0 0; color: #666;">Código de recuperación</p>
            </div>
            
            <p><strong>Importante:</strong></p>
            <ul>
                <li>Este código expira en 15 minutos</li>
                <li>Solo se puede usar una vez</li>
                <li>Si no solicitaste este cambio, ignora este email</li>
            </ul>
            
            <p>Si tienes problemas para restablecer tu contraseña, contacta a nuestro equipo de soporte.</p>
        </div>
        <div class="footer">
            <p>Este email fue enviado desde Stampia</p>
            <p>Si no solicitaste este cambio, puedes ignorar este mensaje</p>
        </div>
    </body>
    </html>
    `;
  }

  private getBusinessVerificationEmailTemplate(
    code: string,
    businessName: string,
    adminFirstName: string,
  ): string {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de cuenta comercial</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }
            .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }
            .code-box {
                background: white;
                border: 2px solid #00f2fe;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }
            .code {
                font-size: 32px;
                font-weight: bold;
                color: #00f2fe;
                letter-spacing: 4px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 14px;
            }
            .alert {
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeeba;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                font-size: 15px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏢 ¡Bienvenido${adminFirstName ? ` ${adminFirstName}` : ''}!</h1>
            <p>Verifica tu cuenta comercial en Stampia</p>
        </div>
        <div class="content">
            <p>Gracias por registrar tu negocio "<strong>${businessName}</strong>" en Stampia. Para completar el proceso de verificación, por favor usa el código de verificación a continuación:</p>
            
            <div class="code-box">
                <div class="code">${code}</div>
                <p style="margin: 10px 0 0 0; color: #666;">Código de verificación</p>
            </div>
            
            <p><strong>Importante:</strong></p>
            <ul>
                <li>Este código expira en 15 minutos</li>
                <li>Solo se puede usar una vez</li>
                <li>Si no solicitaste este código, ignora este email</li>
            </ul>

            <div class="alert">
                <strong>¿No pudiste confirmar tu email a tiempo?</strong><br>
                Si tu código expiró y no lograste confirmar tu email, puedes ir a la página de <b>login</b> e iniciar sesión usando tu email tanto como usuario como contraseña (contraseña temporal). Desde ahí podrás continuar con la verificación.
            </div>
            
            <p>Una vez verificado tu email, podrás acceder a todas las funcionalidades de Stampia y comenzar a gestionar tu programa de fidelización.</p>
            
            <p><strong>Próximos pasos:</strong></p>
            <ol>
                <li>Verifica tu email con el código proporcionado</li>
                <li>Cambia tu contraseña temporal por una segura</li>
                <li>Completa la configuración de tu negocio</li>
                <li>¡Comienza a acumular clientes leales!</li>
            </ol>
        </div>
        <div class="footer">
            <p>Este email fue enviado desde Stampia</p>
            <p>Si no te registraste en nuestra plataforma, puedes ignorar este mensaje</p>
        </div>
    </body>
    </html>
    `;
  }
}
