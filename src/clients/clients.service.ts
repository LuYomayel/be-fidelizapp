import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from '../common/dto';
import { UserProvider } from '@shared';
import { GoogleUser } from '../auth/google.strategy';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    private jwtService: JwtService,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    try {
      const existingClient = await this.clientRepository.findOne({
        where: { email: createClientDto.email },
      });
      console.log(existingClient);
      if (existingClient) {
        throw new ConflictException('El email ya está registrado');
      }

      const hashedPassword = await bcrypt.hash(createClientDto.password, 10);
      console.log(hashedPassword);
      const client = this.clientRepository.create({
        ...createClientDto,
        password: hashedPassword,
        provider: UserProvider.EMAIL,
      });
      console.log(client);
      return await this.clientRepository.save(client);
    } catch (error) {
      console.log(error);
      throw new ConflictException(error);
    }
  }

  async createGoogleClient(googleUser: GoogleUser): Promise<Client> {
    try {
      // Extraer googleId del accessToken o usar email como identificador único
      const googleId = googleUser.accessToken.substring(0, 50); // Usar parte del token como ID único

      const client = this.clientRepository.create({
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        googleId: googleId,
        profilePicture: googleUser.picture,
        provider: UserProvider.GOOGLE,
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
      email: client.email,
      type: 'client',
      provider: client.provider,
    };
    return this.jwtService.sign(payload);
  }
}
