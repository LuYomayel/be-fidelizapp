import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  const mockUser = {
    userId: 1,
    username: 'john',
    passwordHash: 'hashedPassword',
  };

  const usersServiceMock = {
    findOne: jest.fn(),
    validatePassword: jest.fn(),
  };

  const jwtServiceMock = {
    sign: jest.fn().mockReturnValue('jwt.token.here'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      usersServiceMock.findOne.mockReturnValue(mockUser);
      usersServiceMock.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser('john', 'changeme');

      expect(result).toEqual({
        userId: mockUser.userId,
        username: mockUser.username,
      });
    });

    it('should return null when user is not found', async () => {
      usersServiceMock.findOne.mockReturnValue(undefined);

      const result = await service.validateUser('unknown', 'changeme');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      usersServiceMock.findOne.mockReturnValue(mockUser);
      usersServiceMock.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser('john', 'wrong');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token', () => {
      const result = service.login({
        userId: mockUser.userId,
        username: mockUser.username,
      });

      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.userId,
      });
      expect(result).toEqual({ access_token: 'jwt.token.here' });
    });
  });
});
