import { BusinessSize, BusinessType, IBusiness } from '../../../shared';
export declare class Business implements IBusiness {
    id: number;
    businessName: string;
    email: string;
    password: string;
    internalPhone: string;
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
    createdAt: Date;
    updatedAt: Date;
}
