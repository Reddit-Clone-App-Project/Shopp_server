export type UserRole = "buyer" | "seller";

export type NewUser = {
  email: string;
  phone_number: string;
  nationality: string | null;
  password: string;
  role: UserRole;
};

export type User = {
  fullname: string;
  username: string;
  email: string;
  phone_number: string;
  nationality: string | null;
  password: string;
  role: UserRole;
  birthdate: string;
  gender: 'male' | 'female' | 'other' | null;
  refresh_token?: string;
  profile_img?: string;
  otp?: string;
  otp_expires_at?: Date;
};

export type UpdateUser = {
    username: string;
    fullname: string;
    birthdate: string;
    userId: number;
    gender: 'male' | 'female' | 'other' | null;
}

export type UserAddress = {
    id: number;
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    phone_number: string;
    is_default: boolean;
}

export type UpdateUserAddress = {
    address_id: number;
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    phone_number: string;
}