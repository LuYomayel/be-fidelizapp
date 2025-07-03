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
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

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
      });
      console.log(client);
      return await this.clientRepository.save(client);
    } catch (error) {
      console.log(error);
      throw new ConflictException(error);
    }
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
    if (client && (await this.validatePassword(password, client.password))) {
      return client;
    }
    return null;
  }

  generateToken(client: Client): string {
    const payload = {
      sub: client.id,
      email: client.email,
      type: 'client',
    };
    return this.jwtService.sign(payload);
  }
}
