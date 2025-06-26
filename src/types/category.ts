// User
export type ActiveCategory = {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
}

// May be use in admin
export type Category = {
    name: string;
    slug: string;
    parent_id: number | null;
    description: string;
    image_url: string;
}

export type UpdateCategory = {
    id?: number;
    name: string;
    slug: string;
    parent_id: number | null;
    description: string;
    image_url: string;
    is_active: boolean;
}