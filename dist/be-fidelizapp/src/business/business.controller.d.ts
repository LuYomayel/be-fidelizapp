import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { LoginBusinessDto } from './dto/login-business.dto';
export declare class BusinessController {
    private readonly businessService;
    constructor(businessService: BusinessService);
    create(createBusinessDto: CreateBusinessDto, logo?: Express.Multer.File): Promise<{
        success: boolean;
        data: import("./entities/business.entity").Business;
        message: string;
    } | {
        success: boolean;
        data: null;
        message: string;
    }>;
    login(loginBusinessDto: LoginBusinessDto): Promise<{
        success: boolean;
        data: null;
        message: string;
    } | {
        success: boolean;
        data: {
            business: {
                id: number;
                email: string;
                businessName: string;
            };
            token: string;
        };
        message: string;
    }>;
    findAll(): Promise<{
        success: boolean;
        data: import("./entities/business.entity").Business[];
        message?: undefined;
    } | {
        success: boolean;
        data: null;
        message: string;
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: import("./entities/business.entity").Business;
        message?: undefined;
    } | {
        success: boolean;
        data: null;
        message: string;
    }>;
    update(id: number, updateBusinessDto: UpdateBusinessDto, logo?: Express.Multer.File): Promise<{
        success: boolean;
        data: import("./entities/business.entity").Business;
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
