export declare class UsersService {
    private readonly users;
    constructor();
    findOne(username: string): {
        userId: number;
        username: string;
        passwordHash: string;
    } | undefined;
    validatePassword(password: string, passwordHash: string): Promise<boolean>;
}
