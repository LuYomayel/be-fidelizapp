import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { CreateClientDto, UpdateClientDto } from '../common/dto';
import { UserProvider } from '@shared';
import { GoogleUser } from '../auth/google.strategy';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: Repository<Client>;
  let jwtService: JwtService;

  // Mock data
  const mockClient: Client = {
    id: 1,
    email: 'test@client.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    googleId: undefined,
    profilePicture: undefined,
    provider: UserProvider.EMAIL,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGoogleClient: Client = {
    id: 2,
    email: 'google@client.com',
    password: undefined,
    firstName: 'Jane',
    lastName: 'Smith',
    googleId: 'google123',
    profilePicture: 'https://example.com/profile.jpg',
    provider: UserProvider.GOOGLE,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateClientDto: CreateClientDto = {
    email: 'test@client.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockUpdateClientDto: UpdateClientDto = {
    firstName: 'John Updated',
    lastName: 'Doe Updated',
  };

  const mockGoogleUser: GoogleUser = {
    email: 'google@client.com',
    firstName: 'Jane',
    lastName: 'Smith',
    picture: 'https://example.com/profile.jpg',
    accessToken: 'google-access-token-123',
    refreshToken: 'google-refresh-token-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    repository = module.get<Repository<Client>>(getRepositoryToken(Client));
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new client successfully', async () => {
      // Arrange
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashedPassword123' as never);
      jest.spyOn(repository, 'create').mockReturnValue(mockClient);
      jest.spyOn(repository, 'save').mockResolvedValue(mockClient);

      // Act
      const result = await service.create(mockCreateClientDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockCreateClientDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        mockCreateClientDto.password,
        10,
      );
      expect(repository.create).toHaveBeenCalledWith({
        ...mockCreateClientDto,
        password: 'hashedPassword123',
        provider: UserProvider.EMAIL,
      });
      expect(repository.save).toHaveBeenCalledWith(mockClient);
      expect(result).toEqual(mockClient);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockClient);

      // Act & Assert
      await expect(service.create(mockCreateClientDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: mockCreateClientDto.email },
      });
    });
  });

  describe('createGoogleClient', () => {
    it('should create a new Google OAuth client successfully', async () => {
      // Arrange
      jest.spyOn(repository, 'create').mockReturnValue(mockGoogleClient);
      jest.spyOn(repository, 'save').mockResolvedValue(mockGoogleClient);

      // Act
      const result = await service.createGoogleClient(mockGoogleUser);

      // Assert
      expect(repository.create).toHaveBeenCalledWith({
        email: mockGoogleUser.email,
        firstName: mockGoogleUser.firstName,
        lastName: mockGoogleUser.lastName,
        googleId: mockGoogleUser.accessToken.substring(0, 50),
        profilePicture: mockGoogleUser.picture,
        provider: UserProvider.GOOGLE,
        isActive: true,
      });
      expect(repository.save).toHaveBeenCalledWith(mockGoogleClient);
      expect(result).toEqual(mockGoogleClient);
    });

    it('should throw ConflictException on save error', async () => {
      // Arrange
      jest.spyOn(repository, 'create').mockReturnValue(mockGoogleClient);
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.createGoogleClient(mockGoogleUser)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOrCreateGoogleClient', () => {
    it('should return existing client when found', async () => {
      // Arrange
      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockGoogleClient);

      // Act
      const result = await service.findOrCreateGoogleClient(mockGoogleUser);

      // Assert
      expect(service.findByEmail).toHaveBeenCalledWith(mockGoogleUser.email);
      expect(result).toEqual(mockGoogleClient);
    });

    it('should update existing email client to Google OAuth', async () => {
      // Arrange
      const emailClient = { ...mockClient, provider: UserProvider.EMAIL };
      const updatedClient = { ...emailClient, provider: UserProvider.GOOGLE };

      jest.spyOn(service, 'findByEmail').mockResolvedValue(emailClient);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedClient);

      // Act
      const result = await service.findOrCreateGoogleClient(mockGoogleUser);

      // Assert
      expect(service.findByEmail).toHaveBeenCalledWith(mockGoogleUser.email);
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: UserProvider.GOOGLE,
          googleId: mockGoogleUser.accessToken.substring(0, 50),
          profilePicture: mockGoogleUser.picture,
        }),
      );
      expect(result).toEqual(updatedClient);
    });

    it('should create new client when not found', async () => {
      // Arrange
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(service, 'createGoogleClient')
        .mockResolvedValue(mockGoogleClient);

      // Act
      const result = await service.findOrCreateGoogleClient(mockGoogleUser);

      // Assert
      expect(service.findByEmail).toHaveBeenCalledWith(mockGoogleUser.email);
      expect(service.createGoogleClient).toHaveBeenCalledWith(mockGoogleUser);
      expect(result).toEqual(mockGoogleClient);
    });
  });

  describe('findAll', () => {
    it('should return all clients', async () => {
      // Arrange
      const clients = [mockClient, mockGoogleClient];
      jest.spyOn(repository, 'find').mockResolvedValue(clients);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(clients);
    });
  });

  describe('findOne', () => {
    it('should return a client when found', async () => {
      // Arrange
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockClient);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockClient);
    });

    it('should throw NotFoundException when client not found', async () => {
      // Arrange
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('findByEmail', () => {
    it('should return a client when found by email', async () => {
      // Arrange
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockClient);

      // Act
      const result = await service.findByEmail('test@client.com');

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@client.com' },
      });
      expect(result).toEqual(mockClient);
    });

    it('should return null when client not found by email', async () => {
      // Arrange
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      // Act
      const result = await service.findByEmail('nonexistent@client.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a client successfully', async () => {
      // Arrange
      const updatedClient = { ...mockClient, ...mockUpdateClientDto };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockClient);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedClient);

      // Act
      const result = await service.update(1, mockUpdateClientDto);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.save).toHaveBeenCalledWith(updatedClient);
      expect(result).toEqual(updatedClient);
    });

    it('should hash password when updating password', async () => {
      // Arrange
      const updateWithPassword = {
        ...mockUpdateClientDto,
        password: 'newPassword123',
      };
      const expectedClient = {
        ...mockClient,
        password: 'hashedNewPassword123',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockClient);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashedNewPassword123' as never);
      jest.spyOn(repository, 'save').mockResolvedValue(expectedClient);

      // Act
      const result = await service.update(1, updateWithPassword);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(result.password).toBe('hashedNewPassword123');
    });

    it('should throw NotFoundException when client not found', async () => {
      // Arrange
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.update(999, mockUpdateClientDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a client successfully', async () => {
      // Arrange
      jest.spyOn(service, 'findOne').mockResolvedValue(mockClient);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockClient);

      // Act
      await service.remove(1);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.remove).toHaveBeenCalledWith(mockClient);
    });

    it('should throw NotFoundException when client not found', async () => {
      // Arrange
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      // Arrange
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

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
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

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

  describe('validateClient', () => {
    it('should return client when email and password are valid', async () => {
      // Arrange
      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockClient);
      jest.spyOn(service, 'validatePassword').mockResolvedValue(true);

      // Act
      const result = await service.validateClient(
        'test@client.com',
        'password123',
      );

      // Assert
      expect(service.findByEmail).toHaveBeenCalledWith('test@client.com');
      expect(service.validatePassword).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
      expect(result).toEqual(mockClient);
    });

    it('should return null when client not found', async () => {
      // Arrange
      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);

      // Act
      const result = await service.validateClient(
        'nonexistent@client.com',
        'password123',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      jest.spyOn(service, 'findByEmail').mockResolvedValue(mockClient);
      jest.spyOn(service, 'validatePassword').mockResolvedValue(false);

      // Act
      const result = await service.validateClient(
        'test@client.com',
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
      jest.spyOn(jwtService, 'sign').mockReturnValue(expectedToken);

      // Act
      const result = service.generateToken(mockClient);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockClient.id,
        email: mockClient.email,
        type: 'client',
        provider: mockClient.provider,
      });
      expect(result).toBe(expectedToken);
    });
  });
});
