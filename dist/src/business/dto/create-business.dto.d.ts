import { BusinessSize, BusinessType } from '../../../shared';
export declare class CreateBusinessDto {
    businessName: string;
    email: string;
    password: string;
    internalPhone?: string;
    externalPhone?: string;
    size: BusinessSize;
    street?: string;
    neighborhood?: string;
    postalCode?: string;
    province?: string;
    type: BusinessType;
    instagram?: string;
    tiktok?: string;
    website?: string;
}
