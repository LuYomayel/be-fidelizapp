// Ejemplo de cómo usar las interfaces tipadas para req.user
// Este archivo es solo para documentación y ejemplos

import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt-auth.guard';
import {
  AuthenticatedRequest,
  ClientRequest,
  BusinessRequest,
  AuthenticatedUser,
  ClientUser,
  isClientUser,
  isBusinessUser,
} from '@shared';

@Controller('example')
export class ExampleController {
  // Ejemplo 1: Endpoint que acepta cualquier tipo de usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: AuthenticatedRequest) {
    // req.user puede ser ClientUser o BusinessUser
    const user = req.user;

    // Usar type guards para verificar el tipo
    if (isClientUser(user)) {
      // TypeScript sabe que user es ClientUser aquí
      console.log('Cliente:', user.email, user.emailVerified);
      return {
        type: 'client',
        email: user.email,
        emailVerified: user.emailVerified,
        provider: user.provider,
      };
    } else if (isBusinessUser(user)) {
      // TypeScript sabe que user es BusinessUser aquí
      console.log('Negocio:', user.username);
      return {
        type: 'business',
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
      };
    }
  }

  // Ejemplo 2: Endpoint específico para clientes
  @UseGuards(JwtAuthGuard)
  @Get('client-dashboard')
  async getClientDashboard(@Request() req: ClientRequest) {
    // req.user es garantizado que sea ClientUser
    const client = req.user;

    // Acceso directo a propiedades de cliente sin type guards
    console.log('Dashboard del cliente:', client.email);

    return {
      email: client.email,
      emailVerified: client.emailVerified,
      provider: client.provider,
      // client.firstName y client.lastName están disponibles si existen
      fullName:
        client.firstName && client.lastName
          ? `${client.firstName} ${client.lastName}`
          : 'No especificado',
    };
  }

  // Ejemplo 3: Endpoint específico para negocios
  @UseGuards(JwtAuthGuard)
  @Get('business-dashboard')
  async getBusinessDashboard(@Request() req: BusinessRequest) {
    // req.user es garantizado que sea BusinessUser
    const business = req.user;

    console.log('Dashboard del negocio:', business.username);

    return {
      username: business.username,
      businessId: business.businessId,
    };
  }

  // Ejemplo 4: Endpoint que maneja diferentes tipos de usuario
  @UseGuards(JwtAuthGuard)
  @Get('user-info')
  async getUserInfo(@Request() req: AuthenticatedRequest) {
    const user = req.user;

    // Información común a todos los usuarios
    const commonInfo = {
      userId: user.userId,
      username: user.username,
      type: user.type,
    };

    // Información específica según el tipo
    if (isClientUser(user)) {
      return {
        ...commonInfo,
        email: user.email,
        emailVerified: user.emailVerified,
        provider: user.provider,
        // Campos opcionales
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      };
    } else {
      return {
        ...commonInfo,
        businessId: user.businessId,
      };
    }
  }
}

// Ejemplo de uso en servicios
export class ExampleService {
  // Método que recibe un usuario tipado
  async processUserAction(user: AuthenticatedUser, action: string) {
    if (isClientUser(user)) {
      // Lógica específica para clientes
      if (!user.emailVerified) {
        throw new Error('Cliente debe verificar su email');
      }

      return `Acción ${action} procesada para cliente ${user.email}`;
    } else {
      // Lógica específica para negocios
      return `Acción ${action} procesada para negocio ${user.username}`;
    }
  }

  // Método que requiere específicamente un cliente
  async processClientAction(client: ClientUser, action: string) {
    if (!client.emailVerified) {
      throw new Error('Cliente debe verificar su email');
    }

    return `Acción ${action} procesada para cliente ${client.email} (${client.provider})`;
  }
}
