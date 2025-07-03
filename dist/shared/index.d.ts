export declare enum BusinessSize {
    SMALL = "1-5 sucursales",
    MEDIUM = "5-10 sucursales",
    LARGE = "+10 sucursales"
}
export declare enum BusinessType {
    CAFETERIA = "Cafeteria",
    RESTAURANT = "Restaurant",
    PELUQUERIA = "Peluqueria",
    MANICURA = "Manicura",
    OTRO = "Otro"
}
export interface IBusiness {
    id?: number | string;
    businessName: string;
    email: string;
    internalPhone?: string;
    externalPhone?: string;
    size: BusinessSize;
    street: string;
    neighborhood: string;
    postalCode: string;
    province: string;
    logoPath?: string;
    type: BusinessType;
    instagram?: string;
    tiktok?: string;
    website?: string;
    createdAt?: Date;
    active?: boolean;
}
export interface Client {
    id?: number | string;
    email: string;
    firstName: string;
    lastName: string;
}
export interface CreateBusinessDto extends Omit<IBusiness, 'id' | 'logoPath'> {
    password: string;
    logo?: File | undefined;
}
export type UpdateBusinessDto = Partial<Omit<CreateBusinessDto, 'password'>>;
export interface CreateClientDto extends Omit<Client, 'id'> {
}
export type UpdateClientDto = Partial<CreateClientDto>;
export interface Reward {
    id: string;
    name: string;
    description: string;
    requiredPoints: number;
    image?: string;
    active: boolean;
    createdAt: Date;
    expirationDate?: Date;
    stock?: number;
    businessId: string;
    specialConditions?: string;
}
export interface Transaction {
    id: string;
    clientId: string;
    businessId: string;
    type: TransactionType;
    points: number;
    description: string;
    date: Date;
    rewardId?: string;
    adminId: string;
}
export interface Admin {
    id: string;
    name: string;
    email: string;
    businessId: string;
    role: AdminRole;
    createdAt: Date;
    activo: boolean;
}
export declare enum TransactionType {
    ACUMULATION = "acumulacion",
    EXCHANGE = "canje",
    REWARD = "bonificacion",
    PENALTY = "penalizacion"
}
export declare enum AdminRole {
    OWNER = "propietario",
    EMPLOYEE = "empleado"
}
export interface ClientRegistrationForm {
    firstName: string;
    lastName: string;
    email: string;
}
export interface BusinessRegistrationForm {
    businessName: string;
    email: string;
    internalPhone: string;
    externalPhone: string;
    size: BusinessSize;
    address: {
        street: string;
        neighborhood: string;
        postalCode: string;
        province: string;
    };
    logo?: string;
    type: BusinessType;
    customType?: string;
    socialMedia: {
        instagram?: string;
        tiktok?: string;
        website?: string;
    };
    logoFile?: File;
}
export interface CreateBusiness {
    createBusinessDto: CreateBusinessDto;
    logo?: File | undefined;
}
export interface CreateRewardForm {
    name: string;
    description: string;
    requiredPoints: number;
    image?: File;
    expirationDate?: Date;
    stock?: number;
    specialConditions?: string;
}
export interface AssignPointsForm {
    clientId: string;
    points: number;
    description: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface BusinessStatistics {
    totalClientes: number;
    clientesActivos: number;
    sellosEmitidos: number;
    recompensasCanjeadas: number;
    retencionClientes: number;
    ventasMes: {
        mes: string;
        ventas: number;
    }[];
    premiosMasCanjeados: {
        premio: string;
        canjes: number;
    }[];
}
