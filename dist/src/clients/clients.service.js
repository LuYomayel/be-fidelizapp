"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const client_entity_1 = require("./entities/client.entity");
let ClientsService = class ClientsService {
    clientRepository;
    jwtService;
    constructor(clientRepository, jwtService) {
        this.clientRepository = clientRepository;
        this.jwtService = jwtService;
    }
    async create(createClientDto) {
        try {
            const existingClient = await this.clientRepository.findOne({
                where: { email: createClientDto.email },
            });
            console.log(existingClient);
            if (existingClient) {
                throw new common_1.ConflictException('El email ya está registrado');
            }
            const hashedPassword = await bcrypt.hash(createClientDto.password, 10);
            console.log(hashedPassword);
            const client = this.clientRepository.create({
                ...createClientDto,
                password: hashedPassword,
            });
            console.log(client);
            return await this.clientRepository.save(client);
        }
        catch (error) {
            console.log(error);
            throw new common_1.ConflictException(error);
        }
    }
    async findAll() {
        return await this.clientRepository.find();
    }
    async findOne(id) {
        const client = await this.clientRepository.findOne({ where: { id } });
        if (!client) {
            throw new common_1.NotFoundException(`Cliente con ID ${id} no encontrado`);
        }
        return client;
    }
    async findByEmail(email) {
        return await this.clientRepository.findOne({ where: { email } });
    }
    async update(id, updateClientDto) {
        const client = await this.findOne(id);
        if (updateClientDto.password) {
            updateClientDto.password = await bcrypt.hash(updateClientDto.password, 10);
        }
        Object.assign(client, updateClientDto);
        return await this.clientRepository.save(client);
    }
    async remove(id) {
        const client = await this.findOne(id);
        await this.clientRepository.remove(client);
    }
    async validatePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
    async validateClient(email, password) {
        const client = await this.findByEmail(email);
        if (client && (await this.validatePassword(password, client.password))) {
            return client;
        }
        return null;
    }
    generateToken(client) {
        const payload = {
            sub: client.id,
            email: client.email,
            type: 'client',
        };
        return this.jwtService.sign(payload);
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.Client)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], ClientsService);
//# sourceMappingURL=clients.service.js.map