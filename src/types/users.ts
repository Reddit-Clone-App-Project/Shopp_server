export type UserRole = "buyer" | "seller";

export type NewUser = {
  email: string;
  password: string;
  role: UserRole;
};

export type User = {
  fullname: string;
  email: string;
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
}

