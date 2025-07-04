import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';
import { GoogleUser } from './google.strategy';
import { UserProvider } from '@shared';
import { Client } from '../clients/entities/client.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let clientsService: ClientsService;
  let jwtService: JwtService;

  // Mock data
  const mockUser = {
    userId: 1,
    username: 'test@business.com',
    passwordHash: 'hashedPassword123',
  };

  const mockClient: Client = {
    id: 1,
    email: 'test@client.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    googleId: null,
    profilePicture: null,
    provider: UserProvider.EMAIL,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGoogleClient: Client = {
    id: 2,
    email: 'google@client.com',
    password: null,
    firstName: 'Jane',
    lastName: 'Smith',
    googleId: 'google123',
    profilePicture: 'https://example.com/profile.jpg',
    provider: UserProvider.GOOGLE,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
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
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
        {
          provide: ClientsService,
          useValue: {
            findOrCreateGoogleClient: jest.fn(),
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

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    clientsService = module.get<ClientsService>(ClientsService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      // Arrange
      jest.spyOn(usersService, 'findOne').mockReturnValue(mockUser);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true);

      // Act
      const result = await service.validateUser(
        'test@business.com',
        'password123',
      );

      // Assert
      expect(usersService.findOne).toHaveBeenCalledWith('test@business.com');
      expect(usersService.validatePassword).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
      expect(result).toEqual({
        userId: mockUser.userId,
        username: mockUser.username,
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      jest.spyOn(usersService, 'findOne').mockReturnValue(null);

      // Act
      const result = await service.validateUser(
        'nonexistent@business.com',
        'password123',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      jest.spyOn(usersService, 'findOne').mockReturnValue(mockUser);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(false);

      // Act
      const result = await service.validateUser(
        'test@business.com',
        'wrongPassword',
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('validateGoogleUser', () => {
    it('should process Google OAuth user successfully', async () => {
      // Arrange
      jest
        .spyOn(clientsService, 'findOrCreateGoogleClient')
        .mockResolvedValue(mockGoogleClient);

      // Act
      const result = await service.validateGoogleUser(mockGoogleUser);

      // Assert
      expect(clientsService.findOrCreateGoogleClient).toHaveBeenCalledWith(
        mockGoogleUser,
      );
      expect(result).toEqual({
        userId: mockGoogleClient.id,
        username: mockGoogleClient.email,
        email: mockGoogleClient.email,
        firstName: mockGoogleClient.firstName,
        lastName: mockGoogleClient.lastName,
        picture: mockGoogleClient.profilePicture,
        provider: mockGoogleClient.provider,
      });
    });

    it('should use fallback picture when client profilePicture is null', async () => {
      // Arrange
      const clientWithoutPicture = {
        ...mockGoogleClient,
        profilePicture: null,
      };
      jest
        .spyOn(clientsService, 'findOrCreateGoogleClient')
        .mockResolvedValue(clientWithoutPicture);

      // Act
      const result = await service.validateGoogleUser(mockGoogleUser);

      // Assert
      expect(result.picture).toBe(mockGoogleUser.picture);
    });

    it('should handle errors during Google OAuth processing', async () => {
      // Arrange
      jest
        .spyOn(clientsService, 'findOrCreateGoogleClient')
        .mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.validateGoogleUser(mockGoogleUser)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('login', () => {
    it('should generate JWT token for user', () => {
      // Arrange
      const expectedToken = 'jwt.token.string';
      jest.spyOn(jwtService, 'sign').mockReturnValue(expectedToken);
      const user = { username: 'test@business.com', userId: 1 };

      // Act
      const result = service.login(user);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.userId,
      });
      expect(result).toEqual({
        access_token: expectedToken,
      });
    });
  });

  describe('loginWithGoogle', () => {
    it('should generate JWT token for Google OAuth user', () => {
      // Arrange
      const expectedToken = 'jwt.token.string';
      jest.spyOn(jwtService, 'sign').mockReturnValue(expectedToken);
      const googleUser = {
        userId: 2,
        username: 'google@client.com',
        email: 'google@client.com',
        firstName: 'Jane',
        lastName: 'Smith',
        picture: 'https://example.com/profile.jpg',
        provider: UserProvider.GOOGLE,
      };

      // Act
      const result = service.loginWithGoogle(googleUser);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: googleUser.username,
        sub: googleUser.userId,
        email: googleUser.email,
        provider: googleUser.provider,
        type: 'client',
      });
      expect(result).toEqual({
        access_token: expectedToken,
        user: {
          userId: googleUser.userId,
          username: googleUser.username,
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          picture: googleUser.picture,
          provider: googleUser.provider,
          type: 'client',
        },
      });
    });

    it('should handle Google OAuth login with string provider', () => {
      // Arrange
      const expectedToken = 'jwt.token.string';
      jest.spyOn(jwtService, 'sign').mockReturnValue(expectedToken);
      const googleUser = {
        userId: 2,
        username: 'google@client.com',
        email: 'google@client.com',
        firstName: 'Jane',
        lastName: 'Smith',
        picture: 'https://example.com/profile.jpg',
        provider: 'google', // String instead of enum
      };

      // Act
      const result = service.loginWithGoogle(googleUser);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: googleUser.username,
        sub: googleUser.userId,
        email: googleUser.email,
        provider: googleUser.provider,
        type: 'client',
      });
      expect(result.user.provider).toBe('google');
    });
  });

  describe('Service Integration', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have all dependencies injected', () => {
      expect(usersService).toBeDefined();
      expect(clientsService).toBeDefined();
      expect(jwtService).toBeDefined();
    });
  });
});
