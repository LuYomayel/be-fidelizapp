import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from '../common/dto';
import { UserProvider } from '@shared';
import { GoogleUser } from '../auth/google.strategy';
import { EmailService } from '../common/services/email.service';
import { VerificationCodeService } from '../common/services/verification-code.service';
import { VerificationCodeType } from './entities/verification-code.entity';
import { ClientProfileService } from './client-profile.service';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private verificationCodeService: VerificationCodeService,
    private clientProfileService: ClientProfileService,
  ) {}

  async create(
    createClientDto: CreateClientDto,
  ): Promise<{ client: Client; requiresVerification: boolean }> {
    try {
      const existingClient = await this.clientRepository.findOne({
        where: { email: createClientDto.email },
      });

      if (existingClient) {
        // Si el cliente existe pero no ha verificado su email
        if (!existingClient.emailVerified) {
          return {
            client: existingClient,
            requiresVerification: true,
          };
        }
        throw new ConflictException('El email ya está registrado');
      }

      const hashedPassword = await bcrypt.hash(createClientDto.password, 10);
      const client = this.clientRepository.create({
        ...createClientDto,
        password: hashedPassword,
        provider: UserProvider.EMAIL,
        emailVerified: false,
      });

      const savedClient = await this.clientRepository.save(client);

      // Enviar código de verificación
      await this.sendVerificationCode(savedClient.email, savedClient.id);

      return {
        client: savedClient,
        requiresVerification: true,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async sendVerificationCode(email: string, clientId?: number): Promise<void> {
    const client = await this.findByEmail(email);
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (client.emailVerified) {
      throw new BadRequestException('El email ya está verificado');
    }

    const verificationCode =
      await this.verificationCodeService.createVerificationCode(
        email,
        VerificationCodeType.EMAIL_VERIFICATION,
        clientId,
      );

    await this.emailService.sendVerificationEmail(
      email,
      verificationCode.code,
      `${client.firstName} ${client.lastName}`,
    );
  }

  async verifyEmail(
    email: string,
    code: string,
  ): Promise<{ success: boolean; message: string }> {
    const validation = await this.verificationCodeService.validateCode(
      email,
      code,
      VerificationCodeType.EMAIL_VERIFICATION,
    );

    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
      };
    }

    // Marcar el email como verificado
    await this.clientRepository.update({ email }, { emailVerified: true });

    return {
      success: true,
      message: 'Email verificado correctamente',
    };
  }

  async sendPasswordResetCode(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const client = await this.findByEmail(email);
    if (!client) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        success: true,
        message: 'Si el email existe, recibirás un código de recuperación',
      };
    }

    const verificationCode =
      await this.verificationCodeService.createVerificationCode(
        email,
        VerificationCodeType.PASSWORD_RESET,
        client.id,
      );

    await this.emailService.sendPasswordResetEmail(
      email,
      verificationCode.code,
      `${client.firstName} ${client.lastName}`,
    );

    return {
      success: true,
      message: 'Código de recuperación enviado',
    };
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    const validation = await this.verificationCodeService.validateCode(
      email,
      code,
      VerificationCodeType.PASSWORD_RESET,
    );

    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
      };
    }

    const client = await this.findByEmail(email);
    if (!client) {
      return {
        success: false,
        message: 'Cliente no encontrado',
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.clientRepository.update({ email }, { password: hashedPassword });

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
    };
  }

  async createGoogleClient(googleUser: GoogleUser): Promise<Client> {
    try {
      // Extraer googleId del accessToken o usar email como identificador único
      const googleId = googleUser.accessToken.substring(0, 50); // Usar parte del token como ID único
      const fullName = googleUser.firstName.split(' ');
      const firstName = fullName[0];
      let lastName = '';
      if (fullName.length > 1) {
        lastName = fullName[1];
      }
      const client = this.clientRepository.create({
        email: googleUser.email,
        firstName: firstName,
        lastName: lastName,
        googleId: googleId,
        profilePicture: googleUser.picture,
        provider: UserProvider.GOOGLE,
        emailVerified: true, // Los usuarios de Google ya tienen el email verificado
        isActive: true,
      });

      console.log('🚀 Creando nuevo cliente de Google OAuth:', {
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        provider: client.provider,
      });

      return await this.clientRepository.save(client);
    } catch (error) {
      console.error('❌ Error creando cliente de Google:', error);
      throw new ConflictException('Error al crear cliente con Google OAuth');
    }
  }

  async findOrCreateGoogleClient(googleUser: GoogleUser): Promise<Client> {
    // Primero intentar encontrar el cliente por email
    let client = await this.findByEmail(googleUser.email);

    if (client) {
      console.log('✅ Cliente existente encontrado:', client.email);

      // Si el cliente existe pero no tiene provider de Google, actualizarlo
      if (client.provider !== UserProvider.GOOGLE) {
        client.provider = UserProvider.GOOGLE;
        client.googleId = googleUser.accessToken.substring(0, 50);
        client.profilePicture = googleUser.picture;
        client.emailVerified = true; // Los usuarios de Google ya tienen el email verificado
        client = await this.clientRepository.save(client);
        console.log('🔄 Cliente actualizado para Google OAuth');
      }

      return client;
    }

    // Si no existe, crear nuevo cliente
    console.log('🆕 Creando nuevo cliente de Google OAuth');
    return await this.createGoogleClient(googleUser);
  }

  async findAll(): Promise<Client[]> {
    return await this.clientRepository.find();
  }

  async findOne(id: number): Promise<Client> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return client;
  }

  async findByEmail(email: string): Promise<Client | null> {
    return await this.clientRepository.findOne({ where: { email } });
  }

  async getProfile(id: number): Promise<any> {
    return await this.clientProfileService.getClientProfile(id);
  }
  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);

    if (updateClientDto.password) {
      updateClientDto.password = await bcrypt.hash(
        updateClientDto.password,
        10,
      );
    }

    Object.assign(client, updateClientDto);
    return await this.clientRepository.save(client);
  }

  async remove(id: number): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    console.log('password', password, password.length);
    console.log('hashedPassword', hashedPassword, hashedPassword.length);
    return await bcrypt.compare(password, hashedPassword);
  }

  async validateClient(
    email: string,
    password: string,
  ): Promise<Client | null> {
    const client = await this.findByEmail(email);
    if (
      client &&
      client.password &&
      (await this.validatePassword(password, client.password))
    ) {
      return client;
    }
    return null;
  }

  generateToken(client: Client): string {
    const payload = {
      sub: client.id,
      username: client.email, // Usar email como username
      email: client.email,
      type: 'client',
      provider: client.provider,
    };
    return this.jwtService.sign(payload);
  }
}
