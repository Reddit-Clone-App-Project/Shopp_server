// User
export type ActiveCategory = {
    id: number;
    name: string;
    slug: string;
    // description: string;
    image_url: string | null;
}

// May be use in admin
export type Category = {
    name: string;
    slug: string;
    parent_id: number | null;
    // description: string;
    image_url: string | null;
}

export type UpdateCategory = {
    id?: number;
    name: string;
    slug: string;
    parent_id: number | null;
    // description: string;
    image_url: string | null;
    is_active: boolean;
}