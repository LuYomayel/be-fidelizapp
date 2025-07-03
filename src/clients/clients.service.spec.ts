import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

describe('ClientsService', () => {
  let service: ClientsService;

  const mockClient: Client = {
    id: 1,
    email: 'test@client.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
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
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createClientDto: CreateClientDto = {
      email: 'test@client.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should create a client successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockClient);
      mockRepository.save.mockResolvedValue(mockClient);

      const result = await service.create(createClientDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createClientDto.email },
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockClient);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockClient);

      await expect(service.create(createClientDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      const clients = [mockClient];
      mockRepository.find.mockResolvedValue(clients);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(clients);
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockClient);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockClient);
    });

    it('should throw NotFoundException if client not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a client by email', async () => {
      mockRepository.findOne.mockResolvedValue(mockClient);

      const result = await service.findByEmail('test@client.com');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@client.com' },
      });
      expect(result).toEqual(mockClient);
    });

    it('should return null if client not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@client.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateClientDto: UpdateClientDto = {
      firstName: 'Jane',
    };

    it('should update a client successfully', async () => {
      const updatedClient = { ...mockClient, firstName: 'Jane' };
      mockRepository.findOne.mockResolvedValue(mockClient);
      mockRepository.save.mockResolvedValue(updatedClient);

      const result = await service.update(1, updateClientDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.firstName).toBe('Jane');
    });

    it('should throw NotFoundException if client not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateClientDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a client successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockClient);
      mockRepository.remove.mockResolvedValue(mockClient);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockClient);
    });

    it('should throw NotFoundException if client not found', async () => {
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

  describe('validateClient', () => {
    it('should return client for valid credentials', async () => {
      mockRepository.findOne.mockResolvedValue(mockClient);
      jest.spyOn(service, 'validatePassword').mockResolvedValue(true);

      const result = await service.validateClient(
        'test@client.com',
        'password123',
      );

      expect(result).toEqual(mockClient);
    });

    it('should return null for invalid credentials', async () => {
      mockRepository.findOne.mockResolvedValue(mockClient);
      jest.spyOn(service, 'validatePassword').mockResolvedValue(false);

      const result = await service.validateClient(
        'test@client.com',
        'wrongPassword',
      );

      expect(result).toBeNull();
    });

    it('should return null if client not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.validateClient(
        'nonexistent@client.com',
        'password123',
      );

      expect(result).toBeNull();
    });
  });
});
