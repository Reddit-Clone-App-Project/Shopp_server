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
  email: string;
  phone_number: string;
  nationality: string | null;
  password: string;
  role: UserRole;
  birthdate: string;
  refresh_token?: string;
};

export type UpdateUser = {
    fullname: string;
    birthdate: string;
    avatarImg: string;
    userId: number;
    phone_number: string;
    email: string;
    nationality: string | null;
}

export type UserAddress = {
    id: number;
    full_name: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
    is_default: boolean;
}