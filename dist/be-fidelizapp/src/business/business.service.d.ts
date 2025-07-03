import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
export declare class BusinessService {
    private businessRepository;
    private jwtService;
    constructor(businessRepository: Repository<Business>, jwtService: JwtService);
    create(createBusinessDto: CreateBusinessDto, logoPath?: string): Promise<Business>;
    findAll(): Promise<Business[]>;
    findOne(id: number): Promise<Business>;
    findByEmail(email: string): Promise<Business | null>;
    update(id: number, updateBusinessDto: UpdateBusinessDto & {
        logoPath?: string;
    }): Promise<Business>;
    remove(id: number): Promise<void>;
    validatePassword(password: string, hashedPassword: string): Promise<boolean>;
    validateBusiness(email: string, password: string): Promise<Business | null>;
    generateToken(business: Business): string;
}
