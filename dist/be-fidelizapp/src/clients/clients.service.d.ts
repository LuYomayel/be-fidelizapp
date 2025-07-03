import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsService {
    private clientRepository;
    private jwtService;
    constructor(clientRepository: Repository<Client>, jwtService: JwtService);
    create(createClientDto: CreateClientDto): Promise<Client>;
    findAll(): Promise<Client[]>;
    findOne(id: number): Promise<Client>;
    findByEmail(email: string): Promise<Client | null>;
    update(id: number, updateClientDto: UpdateClientDto): Promise<Client>;
    remove(id: number): Promise<void>;
    validatePassword(password: string, hashedPassword: string): Promise<boolean>;
    validateClient(email: string, password: string): Promise<Client | null>;
    generateToken(client: Client): string;
}
