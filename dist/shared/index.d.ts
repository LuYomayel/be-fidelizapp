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
export interface Business {
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
    customType?: string;
    instagram?: string;
    tiktok?: string;
    website?: string;
}
export interface Client {
    id?: number | string;
    email: string;
    firstName: string;
    lastName: string;
    points?: number;
    businessId?: string;
}
export interface Admin {
    id?: number | string;
    email: string;
    firstName: string;
    lastName: string;
    role: AdminRole;
}
export declare enum AdminRole {
    SUPER_ADMIN = "super_admin",
    BUSINESS_ADMIN = "business_admin"
}
export interface CreateBusinessDto extends Omit<Business, "id" | "logoPath"> {
    password: string;
    active?: boolean;
    logo?: File | string;
}
export interface CreateBusinessFormData extends Omit<Business, "id" | "logoPath"> {
    password: string;
    active?: boolean;
}
export type UpdateBusinessDto = Partial<Omit<CreateBusinessDto, "password">>;
export interface CreateClientDto extends Omit<Client, "id"> {
    password: string;
}
export type UpdateClientDto = Partial<Omit<CreateClientDto, "password">>;
export interface LoginBusinessDto {
    email: string;
    password: string;
    [key: string]: unknown;
}
export interface LoginClientDto {
    email: string;
    password: string;
    [key: string]: unknown;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export declare enum TransactionType {
    ACUMULATION = "acumulacion",
    EXCHANGE = "canje",
    REWARD = "bonificacion",
    PENALTY = "penalizacion"
}
export interface Reward {
    id: string;
    name: string;
    description: string;
    points: number;
    businessId: string;
    available: boolean;
    validUntil?: Date;
    imageUrl?: string;
    terms?: string;
    stock?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Transaction {
    id: string;
    clientId: string;
    businessId: string;
    type: TransactionType;
    points: number;
    description: string;
    rewardId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export type ClientRegistrationForm = CreateClientDto;
