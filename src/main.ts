import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // IMPORTANTE: Configurar archivos estáticos ANTES del prefijo global
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('📁 Sirviendo archivos estáticos desde:', uploadsPath);

  // Usar express.static directamente - esto permite /uploads/logos/archivo.png
  app.use('/uploads', express.static(uploadsPath));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Configuración global DESPUÉS de los archivos estáticos
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de CORS más robusta
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  console.log('CORS_ORIGIN', corsOrigin);

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
    ],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400, // 24 horas
  });
  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Stampia API')
    .setDescription(
      `
      ## 📱 API de Stampia - Sistema de Sellos de Clientes
      
      ### Funcionalidades principales:
      - 🏪 **Gestión de Negocios**: Registro, autenticación y administración de negocios
      - 👥 **Gestión de Clientes**: Registro, autenticación (tradicional y Google OAuth)
      - 🔐 **Autenticación**: JWT + Google OAuth para clientes
      - 📊 **Sistema de puntos**: Acumulación y canje de puntos de fidelidad
      
      ### Tipos de usuarios:
      - **Negocios**: Pueden gestionar clientes, puntos y recompensas
      - **Clientes**: Pueden acumular puntos y canjear recompensas
      
      ### Autenticación:
      - Bearer Token (JWT) para endpoints protegidos
      - Google OAuth disponible para clientes
      
      ### Base URL: \`${process.env.API_URL || 'http://localhost:4000'}/api\`
    `,
    )
    .setVersion('1.0.0')
    .addTag('app', 'Endpoints generales de la aplicación')
    .addTag('auth', 'Autenticación y autorización')
    .addTag('businesses', 'Gestión de negocios')
    .addTag('clients', 'Gestión de clientes')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa el token JWT obtenido del login',
      },
      'JWT-auth',
    )
    .addServer(
      process.env.API_URL || 'http://localhost:4000',
      'Servidor de desarrollo',
    )
    .addServer(
      'https://api-stampia.luciano-yomayel.com',
      'Servidor de producción',
    )
    .setContact(
      'Luciano Yomayel',
      'https://luciano-yomayel.com',
      'l.yomayel@gmail.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api-docs', app, document, {
    explorer: true,
    swaggerOptions: {
      filter: true,
      showRequestDuration: true,
      docExpansion: 'none',
      persistAuthorization: true,
    },
    customSiteTitle: 'Stampia API Docs',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #3b82f6; }
    `,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api-docs`);
}

bootstrap();
