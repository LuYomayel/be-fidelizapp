import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BusinessService } from './business.service';
import {
  Business,
  BusinessSize,
  BusinessType,
} from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

describe('BusinessService', () => {
  let service: BusinessService;

  const mockBusiness: Business = {
    id: 1,
    businessName: 'Test Business',
    email: 'test@business.com',
    password: 'hashedPassword',
    internalPhone: '123456789',
    externalPhone: '987654321',
    size: BusinessSize.SMALL,
    street: 'Test Street 123',
    neighborhood: 'Test Neighborhood',
    postalCode: '12345',
    province: 'Test Province',
    logoPath: '',
    type: BusinessType.RESTAURANT,
    customType: '',
    instagram: '',
    tiktok: '',
    website: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: getRepositoryToken(Business),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createBusinessDto: CreateBusinessDto = {
      businessName: 'Test Business',
      email: 'test@business.com',
      password: 'password123',
      internalPhone: '123456789',
      externalPhone: '987654321',
      size: BusinessSize.SMALL,
      street: 'Test Street 123',
      neighborhood: 'Test Neighborhood',
      postalCode: '12345',
      province: 'Test Province',
      type: BusinessType.RESTAURANT,
    };

    it('should create a business successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockBusiness);
      mockRepository.save.mockResolvedValue(mockBusiness);

      const result = await service.create(createBusinessDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createBusinessDto.email },
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockBusiness);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockBusiness);

      await expect(service.create(createBusinessDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of businesses', async () => {
      const businesses = [mockBusiness];
      mockRepository.find.mockResolvedValue(businesses);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(businesses);
    });
  });

  describe('findOne', () => {
    it('should return a business by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockBusiness);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockBusiness);
    });

    it('should throw NotFoundException if business not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a business by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockBusiness);

      const result = await service.findByEmail('test@business.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@business.com' },
      });
      expect(result).toEqual(mockBusiness);
    });

    it('should return null if business not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@business.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateBusinessDto: UpdateBusinessDto = {
      businessName: 'Updated Business',
    };

    it('should update a business successfully', async () => {
      const updatedBusiness = {
        ...mockBusiness,
        businessName: 'Updated Business',
      };
      mockRepository.findOne.mockResolvedValue(mockBusiness);
      mockRepository.save.mockResolvedValue(updatedBusiness);

      const result = await service.update(1, updateBusinessDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.businessName).toBe('Updated Business');
    });

    it('should throw NotFoundException if business not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateBusinessDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a business successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockBusiness);
      mockRepository.remove.mockResolvedValue(mockBusiness);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockBusiness);
    });

    it('should throw NotFoundException if business not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validatePassword(
        'password123',
        'hashedPassword',
      );

      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validatePassword(
        'wrongPassword',
        'hashedPassword',
      );

      expect(result).toBe(false);
    });
  });

  describe('validateBusiness', () => {
    it('should return business for valid credentials', async () => {
      mockRepository.findOne.mockResolvedValue(mockBusiness);
      jest.spyOn(service, 'validatePassword').mockResolvedValue(true);

      const result = await service.validateBusiness(
        'test@business.com',
        'password123',
      );

      expect(result).toEqual(mockBusiness);
    });

    it('should return null for invalid credentials', async () => {
      mockRepository.findOne.mockResolvedValue(mockBusiness);
      jest.spyOn(service, 'validatePassword').mockResolvedValue(false);

      const result = await service.validateBusiness(
        'test@business.com',
        'wrongPassword',
      );

      expect(result).toBeNull();
    });

    it('should return null if business not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.validateBusiness(
        'nonexistent@business.com',
        'password123',
      );

      expect(result).toBeNull();
    });
  });
});
