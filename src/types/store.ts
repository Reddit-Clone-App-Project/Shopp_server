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
export interface StoreUpdate {
    id: number;
    name: string;
    profile_img: string;
    phone_number: string;
    email: string;
    address: StoreAddress;
};

export type StoreRole = 'owner' | 'manager' | 'editor';

export type StoreOwner = {
    store_id: number;
    app_user_id: number;
    role: StoreRole;
};


export interface StoreInfo {
    id: number;
    name: string,
    address_id: number,
    profile_img: string,
    phone_number: string,
    email: string;
};

export interface StoreInfoUpdate {
    id: number;
    name: string,
    address_id: number,
    profile_img: string,
    phone_number: string,
    email: string;
    address: StoreAddress;
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