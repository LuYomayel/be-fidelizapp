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
exports.BusinessController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const business_service_1 = require("./business.service");
const create_business_dto_1 = require("./dto/create-business.dto");
const update_business_dto_1 = require("./dto/update-business.dto");
const login_business_dto_1 = require("./dto/login-business.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let BusinessController = class BusinessController {
    businessService;
    constructor(businessService) {
        this.businessService = businessService;
    }
    async create(createBusinessDto, logo) {
        try {
            const logoPath = logo ? logo.path : undefined;
            const business = await this.businessService.create(createBusinessDto, logoPath);
            return {
                success: true,
                data: business,
                message: 'Negocio registrado exitosamente',
            };
        }
        catch (error) {
            console.log(error);
            return {
                success: false,
                data: null,
                message: 'Error al registrar el negocio',
            };
        }
    }
    async login(loginBusinessDto) {
        try {
            const business = await this.businessService.validateBusiness(loginBusinessDto.email, loginBusinessDto.password);
            if (!business) {
                return {
                    success: false,
                    data: null,
                    message: 'Credenciales inválidas',
                };
            }
            const token = this.businessService.generateToken(business);
            return {
                success: true,
                data: {
                    business: {
                        id: business.id,
                        email: business.email,
                        businessName: business.businessName,
                    },
                    token,
                },
                message: 'Login exitoso',
            };
        }
        catch (error) {
            console.log(error);
            return {
                success: false,
                data: null,
                message: 'Error al iniciar sesión',
            };
        }
    }
    async findAll() {
        try {
            const businesses = await this.businessService.findAll();
            return { success: true, data: businesses };
        }
        catch (error) {
            console.log(error);
            return {
                success: false,
                data: null,
                message: 'Error al obtener los negocios',
            };
        }
    }
    async findOne(id) {
        try {
            const business = await this.businessService.findOne(id);
            return { success: true, data: business };
        }
        catch (error) {
            console.log(error);
            return {
                success: false,
                data: null,
                message: 'Error al obtener el negocio',
            };
        }
    }
    async update(id, updateBusinessDto, logo) {
        const logoPath = logo ? logo.path : undefined;
        const updateData = logoPath
            ? { ...updateBusinessDto, logoPath }
            : updateBusinessDto;
        try {
            const business = await this.businessService.update(id, updateData);
            return {
                success: true,
                data: business,
                message: 'Negocio actualizado exitosamente',
            };
        }
        catch (error) {
            console.log(error);
            return {
                success: false,
                data: null,
                message: 'Error al actualizar el negocio',
            };
        }
    }
    async remove(id) {
        try {
            await this.businessService.remove(id);
            return { success: true, message: 'Negocio eliminado exitosamente' };
        }
        catch (error) {
            console.log(error);
            return { success: false, message: 'Error al eliminar el negocio' };
        }
    }
};
exports.BusinessController = BusinessController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/logos',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, 'logo-' + uniqueSuffix + (0, path_1.extname)(file.originalname));
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Solo se permiten archivos de imagen'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_business_dto_1.CreateBusinessDto, Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_business_dto_1.LoginBusinessDto]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "login", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('logo', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/logos',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, 'logo-' + uniqueSuffix + (0, path_1.extname)(file.originalname));
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Solo se permiten archivos de imagen'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_business_dto_1.UpdateBusinessDto, Object]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BusinessController.prototype, "remove", null);
exports.BusinessController = BusinessController = __decorate([
    (0, common_1.Controller)('business'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    __metadata("design:paramtypes", [business_service_1.BusinessService])
], BusinessController);
//# sourceMappingURL=business.controller.js.map