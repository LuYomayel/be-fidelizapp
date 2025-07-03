import { AuthService } from './auth.service';
import { Request as ExpressRequest } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: ExpressRequest & {
        user: {
            userId: number;
            username: string;
        };
    }): {
        access_token: string;
    } | {
        success: boolean;
        data: null;
        message: string;
    };
    getProfile(req: ExpressRequest & {
        user: {
            userId: number;
            username: string;
        };
    }): Express.User & {
        userId: number;
        username: string;
    };
}
