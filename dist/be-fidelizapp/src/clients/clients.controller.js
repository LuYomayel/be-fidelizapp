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
exports.ClientsController = void 0;
const common_1 = require("@nestjs/common");
const clients_service_1 = require("./clients.service");
const create_client_dto_1 = require("./dto/create-client.dto");
const update_client_dto_1 = require("./dto/update-client.dto");
const login_client_dto_1 = require("./dto/login-client.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ClientsController = class ClientsController {
    clientsService;
    constructor(clientsService) {
        this.clientsService = clientsService;
    }
    async create(createClientDto) {
        try {
            const client = await this.clientsService.create(createClientDto);
            return {
                success: true,
                data: client,
                message: 'Cliente registrado exitosamente',
            };
        }
        catch (error) {
            console.log(error);
            return {
                success: false,
                data: null,
                message: 'Error al registrar el cliente',
            };
        }
    }
    async login(loginClientDto) {
        try {
            const client = await this.clientsService.validateClient(loginClientDto.email, loginClientDto.password);
            if (!client) {
                return {
                    success: false,
                    data: null,
                    message: 'Credenciales inválidas',
                };
            }
            const token = this.clientsService.generateToken(client);
            return {
                success: true,
                data: {
                    client: {
                        id: client.id,
                        email: client.email,
                        firstName: client.firstName,
                        lastName: client.lastName,
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
            const clients = await this.clientsService.findAll();
            return { success: true, data: clients };
        }
        catch (error) {
            console.log(error);
            return {
                success: false,
                data: null,
                message: 'Error al obtener los clientes',
            };
        }
    }
    async findOne(id) {
        try {
            const client = await this.clientsService.findOne(id);
            return { success: true, data: client };
        }
        catch (error) {
            console.log(error);
            return {
                success: false,
                data: null,
                message: 'Error al obtener el cliente',
            };
        }
    }
    async update(id, updateClientDto) {
        try {
            const client = await this.clientsService.update(id, updateClientDto);
            return {
                success: true,
                data: client,
                message: 'Cliente actualizado exitosamente',
            };
        }
        catch (error) {
            console.log(error);
            return {
                success: false,
                data: null,
                message: 'Error al actualizar el cliente',
            };
        }
    }
    async remove(id) {
        try {
            await this.clientsService.remove(id);
            return { success: true, message: 'Cliente eliminado exitosamente' };
        }
        catch (error) {
            console.log(error);
            return { success: false, message: 'Error al eliminar el cliente' };
        }
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_client_dto_1.CreateClientDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_client_dto_1.LoginClientDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "login", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_client_dto_1.UpdateClientDto]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ClientsController.prototype, "remove", null);
exports.ClientsController = ClientsController = __decorate([
    (0, common_1.Controller)('clients'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    __metadata("design:paramtypes", [clients_service_1.ClientsService])
], ClientsController);
//# sourceMappingURL=clients.controller.js.map