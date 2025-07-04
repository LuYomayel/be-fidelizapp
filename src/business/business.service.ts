import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Business } from './entities/business.entity';
import { CreateBusinessDto, UpdateBusinessDto } from '../common/dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    private jwtService: JwtService,
  ) {}

  async create(
    createBusinessDto: CreateBusinessDto,
    logoPath?: string,
  ): Promise<Business> {
    const existingBusiness = await this.businessRepository.findOne({
      where: { email: createBusinessDto.email },
    });

    if (existingBusiness) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createBusinessDto.password, 10);

    const business = this.businessRepository.create({
      ...createBusinessDto,
      password: hashedPassword,
      logoPath: logoPath || undefined,
    });

    return await this.businessRepository.save(business);
  }

  async findAll(): Promise<Business[]> {
    return await this.businessRepository.find();
  }

  async findOne(id: number): Promise<Business> {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) {
      throw new NotFoundException(`Negocio con ID ${id} no encontrado`);
    }
    return business;
  }

  async findByEmail(email: string): Promise<Business | null> {
    return await this.businessRepository.findOne({ where: { email } });
  }

  async update(
    id: number,
    updateBusinessDto: UpdateBusinessDto & { logoPath?: string },
  ): Promise<Business> {
    const business = await this.findOne(id);

    if (updateBusinessDto.password) {
      updateBusinessDto.password = await bcrypt.hash(
        updateBusinessDto.password,
        10,
      );
    }

    Object.assign(business, updateBusinessDto);
    return await this.businessRepository.save(business);
  }

  async remove(id: number): Promise<void> {
    const business = await this.findOne(id);
    await this.businessRepository.remove(business);
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async validateBusiness(
    email: string,
    password: string,
  ): Promise<Business | null> {
    const business = await this.findByEmail(email);
    if (
      business &&
      (await this.validatePassword(password, business.password))
    ) {
      return business;
    }
    return null;
  }

  generateToken(business: Business): string {
    const payload = {
      sub: business.id,
      username: business.email, // Usar email como username
      email: business.email,
      type: 'business',
    };
    return this.jwtService.sign(payload);
  }
}
