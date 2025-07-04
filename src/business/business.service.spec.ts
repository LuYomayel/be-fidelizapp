import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BusinessService } from './business.service';
import { Business } from './entities/business.entity';
import { CreateBusinessDto, UpdateBusinessDto } from '../common/dto';
import { BusinessSize, BusinessType } from '@shared';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('BusinessService', () => {
  let service: BusinessService;
  let repository: jest.Mocked<Repository<Business>>;
  let jwtService: jest.Mocked<JwtService>;

  // Mock data
  const mockBusiness: Business = {
    id: 1,
    businessName: 'Test Business',
    email: 'test@business.com',
    password: 'hashedPassword123',
    internalPhone: '+54 11 1234-5678',
    externalPhone: '+54 11 8765-4321',
    size: BusinessSize.SMALL,
    street: 'Test Street 123',
    neighborhood: 'Test Neighborhood',
    postalCode: '1000',
    province: 'CABA',
    logoPath: undefined,
    type: BusinessType.CAFETERIA,
    instagram: '@testbusiness',
    tiktok: '@testbusiness',
    website: 'https://testbusiness.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateBusinessDto: CreateBusinessDto = {
    businessName: 'Test Business',
    email: 'test@business.com',
    password: 'password123',
    internalPhone: '+54 11 1234-5678',
    externalPhone: '+54 11 8765-4321',
    size: BusinessSize.SMALL,
    street: 'Test Street 123',
    neighborhood: 'Test Neighborhood',
    postalCode: '1000',
    province: 'CABA',
    type: BusinessType.CAFETERIA,
    instagram: '@testbusiness',
    tiktok: '@testbusiness',
    website: 'https://testbusiness.com',
  };

  const mockUpdateBusinessDto: UpdateBusinessDto = {
    businessName: 'Updated Business',
    instagram: '@updatedbusiness',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: getRepositoryToken(Business),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
    repository = module.get(getRepositoryToken(Business));
    jwtService = module.get(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new business successfully', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      (repository.create as jest.Mock).mockReturnValue(mockBusiness);
      (repository.save as jest.Mock).mockResolvedValue(mockBusiness);

      // Act
      const result = await service.create(mockCreateBusinessDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockCreateBusinessDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockCreateBusinessDto.password,
        10,
      );
      expect(repository.create).toHaveBeenCalledWith({
        ...mockCreateBusinessDto,
        password: 'hashedPassword123',
      });
      expect(repository.save).toHaveBeenCalledWith(mockBusiness);
      expect(result).toEqual(mockBusiness);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(mockBusiness);

      // Act & Assert
      await expect(service.create(mockCreateBusinessDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockCreateBusinessDto.email },
      });
    });
  });

  describe('findAll', () => {
    it('should return all businesses', async () => {
      // Arrange
      const businesses = [mockBusiness];
      (repository.find as jest.Mock).mockResolvedValue(businesses);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(businesses);
    });
  });

  describe('findOne', () => {
    it('should return a business when found', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(mockBusiness);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockBusiness);
    });

    it('should throw NotFoundException when business not found', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('findByEmail', () => {
    it('should return a business when found by email', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(mockBusiness);

      // Act
      const result = await service.findByEmail('test@business.com');

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@business.com' },
      });
      expect(result).toEqual(mockBusiness);
    });

    it('should return null when business not found by email', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.findByEmail('nonexistent@business.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a business successfully', async () => {
      // Arrange
      const updatedBusiness = { ...mockBusiness, ...mockUpdateBusinessDto };
      (repository.findOne as jest.Mock).mockResolvedValue(mockBusiness);
      (repository.save as jest.Mock).mockResolvedValue(updatedBusiness);

      // Act
      const result = await service.update(1, mockUpdateBusinessDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.save).toHaveBeenCalledWith(updatedBusiness);
      expect(result).toEqual(updatedBusiness);
    });

    it('should hash password when updating password', async () => {
      // Arrange
      const updateWithPassword = {
        ...mockUpdateBusinessDto,
        password: 'newPassword123',
      };
      const expectedBusiness = {
        ...mockBusiness,
        password: 'hashedNewPassword123',
      };

      (repository.findOne as jest.Mock).mockResolvedValue(mockBusiness);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword123');
      (repository.save as jest.Mock).mockResolvedValue(expectedBusiness);

      // Act
      const result = await service.update(1, updateWithPassword);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(repository.save).toHaveBeenCalledWith(expectedBusiness);
      expect(result.password).toBe('hashedNewPassword123');
    });

    it('should throw NotFoundException when business not found', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(999, mockUpdateBusinessDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a business successfully', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(mockBusiness);
      (repository.remove as jest.Mock).mockResolvedValue(mockBusiness);

      // Act
      await service.remove(1);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(mockBusiness);
    });

    it('should throw NotFoundException when business not found', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      // Arrange
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validatePassword(
        'password123',
        'hashedPassword123',
      );

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      // Arrange
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validatePassword(
        'wrongPassword',
        'hashedPassword123',
      );

      // Assert
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongPassword',
        'hashedPassword123',
      );
      expect(result).toBe(false);
    });
  });

  describe('validateBusiness', () => {
    it('should return business when email and password are valid', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(mockBusiness);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateBusiness(
        'test@business.com',
        'password123',
      );

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@business.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
      expect(result).toEqual(mockBusiness);
    });

    it('should return null when business not found', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.validateBusiness(
        'nonexistent@business.com',
        'password123',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      (repository.findOne as jest.Mock).mockResolvedValue(mockBusiness);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validateBusiness(
        'test@business.com',
        'wrongPassword',
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      // Arrange
      const expectedToken = 'jwt.token.string';
      (jwtService.sign as jest.Mock).mockReturnValue(expectedToken);

      // Act
      const result = service.generateToken(mockBusiness);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockBusiness.id,
        email: mockBusiness.email,
        businessName: mockBusiness.businessName,
        type: 'business',
      });
      expect(result).toBe(expectedToken);
    });
  });
});
