import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(username: string, pass: string): Promise<{
        userId: number;
        username: string;
    } | null>;
    login(user: {
        username: string;
        userId: number;
    }): {
        access_token: string;
    };
}
