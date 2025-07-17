import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Debug para verificar configuración SMTP
    console.log('🔧 Configuración SMTP:');
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`SMTP_HOST: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
    console.log(`SMTP_PORT: ${process.env.SMTP_PORT || '587'}`);
    console.log(
      `SMTP_USER: ${process.env.SMTP_USER ? 'Configurado ✅' : 'No configurado ❌'}`,
    );
    console.log(
      `SMTP_PASS: ${process.env.SMTP_PASS ? 'Configurado ✅' : 'No configurado ❌'}`,
    );
    console.log(`SMTP_FROM: ${process.env.SMTP_FROM || 'noreply@stampia.com'}`);

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Método para verificar conexión SMTP (útil para debugging)
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Conexión SMTP verificada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error verificando conexión SMTP:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, code: string, name?: string) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@stampia.com',
      to: email,
      subject: 'Verifica tu cuenta - Stampia',
      html: this.getVerificationEmailTemplate(code, name),
    };

    try {
      // En desarrollo, solo simular el envío
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'dev'
      ) {
        console.log('📧 Email de verificación (modo desarrollo):');
        console.log(`Para: ${email}`);
        console.log(`Código: ${code}`);
        console.log(`Nombre: ${name || 'No especificado'}`);
        console.log('✅ Email simulado enviado exitosamente');
        return { success: true, message: 'Email enviado (modo desarrollo)' };
      }

      // En producción, enviar email real
      console.log('📧 Enviando email de verificación...');
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado exitosamente');
      return { success: true, message: 'Email de verificación enviado' };
    } catch (error) {
      console.error('❌ Error enviando email de verificación:', error);
      return { success: false, message: 'Error al enviar el email' };
    }
  }

  async sendPasswordResetEmail(email: string, code: string, name?: string) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@stampia.com',
      to: email,
      subject: 'Recuperar contraseña - Stampia',
      html: this.getPasswordResetEmailTemplate(code, name),
    };

    try {
      // En desarrollo, solo simular el envío
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'dev'
      ) {
        console.log(
          '📧 Email de recuperación de contraseña (modo desarrollo):',
        );
        console.log(`Para: ${email}`);
        console.log(`Código: ${code}`);
        console.log(`Nombre: ${name || 'No especificado'}`);
        console.log('✅ Email simulado enviado exitosamente');
        return { success: true, message: 'Email enviado (modo desarrollo)' };
      }

      // En producción, enviar email real
      console.log('📧 Enviando email de recuperación de contraseña...');
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado exitosamente');
      return { success: true, message: 'Email de recuperación enviado' };
    } catch (error) {
      console.error('❌ Error enviando email de recuperación:', error);
      return { success: false, message: 'Error al enviar el email' };
    }
  }

  async sendBusinessVerificationEmail(
    email: string,
    code: string,
    businessName: string,
    adminFirstName: string,
  ) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@stampia.com',
      to: email,
      subject: 'Verificación de cuenta comercial - Stampia',
      html: this.getBusinessVerificationEmailTemplate(
        code,
        businessName,
        adminFirstName,
      ),
    };

    try {
      // En desarrollo, solo simular el envío
      /*
      if (
        process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'dev'
      ) {
        console.log('📧 Email de verificación comercial (modo desarrollo):');
        console.log(`Para: ${email}`);
        console.log(`Código: ${code}`);
        console.log(`Negocio: ${businessName}`);
        console.log(`Admin: ${adminFirstName}`);
        console.log('✅ Email simulado enviado exitosamente');
        return { success: true, message: 'Email enviado (modo desarrollo)' };
      }
      */

      // En producción, enviar email real
      console.log('📧 Enviando email de verificación comercial...');
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado exitosamente');
      return {
        success: true,
        message: 'Email de verificación comercial enviado',
      };
    } catch (error) {
      console.error(
        '❌ Error enviando email de verificación comercial:',
        error,
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
