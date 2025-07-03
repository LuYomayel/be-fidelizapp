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
exports.BusinessService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const business_entity_1 = require("./entities/business.entity");
let BusinessService = class BusinessService {
    businessRepository;
    jwtService;
    constructor(businessRepository, jwtService) {
        this.businessRepository = businessRepository;
        this.jwtService = jwtService;
    }
    async create(createBusinessDto, logoPath) {
        const existingBusiness = await this.businessRepository.findOne({
            where: { email: createBusinessDto.email },
        });
        if (existingBusiness) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const hashedPassword = await bcrypt.hash(createBusinessDto.password, 10);
        const business = this.businessRepository.create({
            ...createBusinessDto,
            password: hashedPassword,
            logoPath: logoPath || undefined,
        });
        return await this.businessRepository.save(business);
    }
    async findAll() {
        return await this.businessRepository.find();
    }
    async findOne(id) {
        const business = await this.businessRepository.findOne({ where: { id } });
        if (!business) {
            throw new common_1.NotFoundException(`Negocio con ID ${id} no encontrado`);
        }
        return business;
    }
    async findByEmail(email) {
        return await this.businessRepository.findOne({ where: { email } });
    }
    async update(id, updateBusinessDto) {
        const business = await this.findOne(id);
        if (updateBusinessDto.password) {
            updateBusinessDto.password = await bcrypt.hash(updateBusinessDto.password, 10);
        }
        Object.assign(business, updateBusinessDto);
        return await this.businessRepository.save(business);
    }
    async remove(id) {
        const business = await this.findOne(id);
        await this.businessRepository.remove(business);
    }
    async validatePassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
    async validateBusiness(email, password) {
        const business = await this.findByEmail(email);
        if (business &&
            (await this.validatePassword(password, business.password))) {
            return business;
        }
        return null;
    }
    generateToken(business) {
        const payload = {
            sub: business.id,
            email: business.email,
            type: 'business',
        };
        return this.jwtService.sign(payload);
    }
};
exports.BusinessService = BusinessService;
exports.BusinessService = BusinessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], BusinessService);
//# sourceMappingURL=business.service.js.map