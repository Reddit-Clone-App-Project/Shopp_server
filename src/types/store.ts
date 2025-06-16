export type SellerRole = 'seller';

export type Store = {
    name: string;
    address_id: number;
    email: string,
    phone_number: string;
};

export type StoreOutput = {
    id: number;
    name: string;
    address_id: number;
    email: string,
    phone_number: string;
};

export type StoreAddress = {
    full_name: string;
    phone_number: string;
    country: string;
    province: string | null;
    city: string;
    postal_code: string;
    address_line1: string;
    address_line2: string;
};

export type StoreRole = 'owner' | 'manager' | 'editor';

export type StoreOwner = {
    store_id: number;
    app_user_id: number;
    role: StoreRole;
};