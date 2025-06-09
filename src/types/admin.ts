export type AdminRole = "admin" | "shipper" | "storage";

// Admin employee

export type NewAdmin = {
    fullname: string;
    email: string;
    password: string;
    birthdate: string;
}

export type Admin = {
    fullname: string;
    email: string;
    password: string;
    birthdate: string;
    profile_img?: string;
    refresh_token?: string;
};

export type UpdateAdmin = {
    fullname: string;
    birthdate: string;
    avatarImg: string;
    adminId: number;
};

// Storage
export type NewStorage = {
    email: string;
    password: string;
    shipping_unit: string;
    location: string;
};

export type Storage = {
    email: string;
    password: string;
    shipping_unit: string;
    location: string;
    profile_img?: string;
    refresh_token?: string;
};

export type UpdateStorage = {
    email: string;
    shipping_unit: string;
    location: string;
    avatarImg: string;
    storageId: number;
};

// Shipper
export type NewShipper = {
    fullname: string;
    email: string;
    password: string;
    birthdate: string;
    shipping_unit: string;
    storage_id: number;
}

export type Shipper = {
    fullname: string;
    email: string;
    password: string;
    birthdate: string;
    shipping_unit: string;
    storage_id: number;
    profile_img?: string;
    refresh_token?: string;
};

export type UpdateShipper = {
    fullname: string;
    birthdate: string;
    avatarImg: string;
    shipperId: number;
};