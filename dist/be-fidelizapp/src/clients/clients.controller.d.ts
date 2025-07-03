import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { LoginClientDto } from './dto/login-client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(createClientDto: CreateClientDto): Promise<{
        success: boolean;
        data: import("./entities/client.entity").Client;
        message: string;
    } | {
        success: boolean;
        data: null;
        message: string;
    }>;
    login(loginClientDto: LoginClientDto): Promise<{
        success: boolean;
        data: null;
        message: string;
    } | {
        success: boolean;
        data: {
            client: {
                id: number;
                email: string;
                firstName: string;
                lastName: string;
            };
            token: string;
        };
        message: string;
    }>;
    findAll(): Promise<{
        success: boolean;
        data: import("./entities/client.entity").Client[];
        message?: undefined;
    } | {
        success: boolean;
        data: null;
        message: string;
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: import("./entities/client.entity").Client;
        message?: undefined;
    } | {
        success: boolean;
        data: null;
        message: string;
    }>;
    update(id: number, updateClientDto: UpdateClientDto): Promise<{
        success: boolean;
        data: import("./entities/client.entity").Client;
        message: string;
    } | {
        success: boolean;
        data: null;
        message: string;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
