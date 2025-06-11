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
    nationality: string | null;
}

