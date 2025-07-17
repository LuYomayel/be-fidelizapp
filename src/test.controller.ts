import { Controller, Get } from '@nestjs/common';
import { EmailService } from './common/services/email.service';

@Controller('test')
export class TestController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  getTest() {
    return { message: 'API funcionando correctamente' };
  }

  @Get('smtp')
  async testSMTP() {
    try {
      const isConnected = await this.emailService.verifyConnection();
      return {
        success: isConnected,
        message: isConnected
          ? 'Conexión SMTP exitosa'
          : 'Error en conexión SMTP',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error verificando SMTP',
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
}
