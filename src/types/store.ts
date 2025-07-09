export type SellerRole = 'seller';

export type StoreData = {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    address: StoreAddress;
    expressShipping: boolean;
    fastShipping: boolean;
    economicalShipping: boolean;
    bulkyShipping: boolean;
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
export interface StoreUpdate {
    storeId: number;
    storeName: string;
    storeProfile_img: string;
    storeEmail: string;
    storePhone: string;
    address: StoreAddress;
    expressShipping: boolean;
    fastShipping: boolean;
    economicalShipping: boolean;
    bulkyShipping: boolean;
};

export type StoreRole = 'owner' | 'manager' | 'editor';

export type StoreOwner = {
    store_id: number;
    app_user_id: number;
    role: StoreRole;
};


export interface StoreInfo {
    id: number;
    storeName: string,
    address_id: number,
    address: StoreAddress,
    storeProfile_img: string,
    storePhone: string,
    storeEmail: string;
    expressShipping: boolean;
    fastShipping: boolean;
    economicalShipping: boolean;
    bulkyShipping: boolean;
};

export interface StoreInfoUpdate {
    id: number;
    storeName: string;
    storeProfile_img: string;
    storeEmail: string;
    storePhone: string;
    address_id: number;
    address: StoreAddress;
    expressShipping: boolean;
    fastShipping: boolean;
    economicalShipping: boolean;
    bulkyShipping: boolean;
};
export interface RatingStats {
    average_rating: number;
    total_reviews: number;
};

export type StoreReviewList = Review[];
export interface Review {
    id: number;
    user_id: number;
    rating: number;
    comment: string;
    fullname: string;
};


