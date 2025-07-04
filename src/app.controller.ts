import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Endpoint para verificar el estado de la API',
  })
  @ApiResponse({
    status: 200,
    description: 'API funcionando correctamente',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  @ApiExcludeEndpoint()
  getHello(): string {
    return this.appService.getHello();
  }
}
