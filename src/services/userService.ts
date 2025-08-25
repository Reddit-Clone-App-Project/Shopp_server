import pool from '../config/db';
import { User, NewUser, UpdateUser, UserAddress, UpdateUserAddress } from '../types/users';
import validator  from 'validator';

export const createUser = async (user: NewUser) => {
    const result = await pool.query(
        'INSERT INTO app_user (email, phone_number, nationality, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, phone_number, nationality, role',
        [user.email, user.phone_number, user.nationality, user.password, user.role]
    );
    return result.rows[0];
};


export const getUserById = async (userId: number): Promise<User | undefined> => {
    const result = await pool.query(
        'SELECT * FROM app_user WHERE id = $1',
        [userId]
    );
    return result.rows[0];
};

export const updateUserById = async (user: UpdateUser)  => {
    const result = await pool.query(
        'UPDATE app_user SET username = $1, full_name = $2, date_of_birth = $3, gender = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
        [user.username, user.fullname, user.birthdate, user.gender, user.userId]
    );
    return result.rows[0];
};

export const updateUserAvatarById = async (userId: number, avatarUrl: string) => {
    const result = await pool.query(
        'UPDATE app_user SET profile_img = $1 WHERE id = $2 RETURNING *',
        [avatarUrl, userId]
    );
    return result.rows[0];
}

export const deleteUserById = async (userId: number): Promise<number | null> => {
    const result = await pool.query(
        'DELETE FROM app_user WHERE id = $1',
        [userId]
    );
    return result.rowCount;
};

export const getAddressesByUserId = async (userId: number): Promise<UserAddress[] | undefined> => {
    // This gets the default address of the user
    const result = await pool.query(
        'SELECT * FROM address WHERE app_user_id = $1',
        [userId]
    );
    return result.rows;
}

export const addAddressByUserId = async (address: UserAddress): Promise<UserAddress | undefined> => {
    const result = await pool.query(
        'INSERT INTO address (full_name, address_line1, address_line2, city, province, postal_code, country, phone_number, is_default, app_user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
        [address.full_name, address.address_line1, address.address_line2, address.city, address.province, address.postal_code, address.country, address.phone_number, address.is_default, address.id]
    );
    return result.rows[0];
};

export const updateAddressById = async (address: UpdateUserAddress): Promise<UserAddress | undefined> => {
    const result = await pool.query(
        'UPDATE address SET full_name = $1, address_line1 = $2, address_line2 = $3, city = $4, province = $5, postal_code = $6, country = $7, phone_number = $8 WHERE id = $9 RETURNING *',
        [address.full_name, address.address_line1, address.address_line2, address.city, address.province, address.postal_code, address.country, address.phone_number, address.address_id]
    );
    return result.rows[0];
};

export const removeAddressById = async (addressId: number) => {
    await pool.query(
        'DELETE FROM address WHERE id = $1',
        [addressId]
    );
};

export const setAllIsDefaultFalse = async (userId: number) => {
    await pool.query(
        'UPDATE address SET is_default = false WHERE app_user_id = $1',
        [userId]
    );
}

export const setAddressIsDefaultTrue = async (addressId: number) => {
    await pool.query(
        'UPDATE address SET is_default = true WHERE id = $1',
        [addressId]
    );
}
/*
!The functions below are deprecated(Code and types are updated, so if want to reuse this code, must look at it carefully) and unnecessary, may be removed, or changed in the future
export const getUserByEOrP = async (eOrP: string): Promise<User | undefined> => {
    let result: any;
    if (validator.isEmail(eOrP)) {
        result = await pool.query(
            'SELECT * FROM app_user WHERE email = $1',
            [eOrP]
        );
    } else if (validator.isMobilePhone(eOrP, 'any', { strictMode: false })) {
        result = await pool.query(
            'SELECT * FROM app_user WHERE phone_number = $1',
            [eOrP]
        );
    }

    return result.rows[0];
};

export const updateUser = async (user: UpdateUser): Promise<User | undefined>  => {
    const result = await pool.query(
        'UPDATE app_user SET full_name = $1, phone_number = $2, email: $3, nationality = $4, date_of_birth = $5, profile_img = $6, updated_at = NOW() WHERE email = $3 RETURNING full_name, phone_number, nationality, date_of_birth, profile_img',
        [user.fullname, user.phone_number, user.email, user.nationality, user.birthdate, user.avatarImg]
    );
    
    return result.rows[0];
};


export const deleteUserByEOrP = async (eOrP: string): Promise<number | undefined> => {
    let result: any;
    if (validator.isEmail(eOrP)) {
        result = await pool.query(
            'DELETE FROM app_user WHERE email = $1',
            [eOrP]
        );
    } else if (validator.isMobilePhone(eOrP, 'any', { strictMode: false })) {
        result = await pool.query(
            'DELETE FROM app_user WHERE phone_number = $1',
            [eOrP]
        );
    }
    return result.rowCount;
};
*/





