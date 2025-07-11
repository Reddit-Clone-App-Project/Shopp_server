export type NewProduct = {
    name: string;
    description: string;
    store_id: number;
    category_id: number;
}

export type BasicProduct = {
    id: number;
    name: string;
    description: string;
    store_id: number;
    category_id: number;
}

export type CompleteProduct = {
    id: number;
    name: string;
    description: string;
    store_id: number;
    category_id: number;
}

export type UpdateProduct = {
    name: string;
    description: string;
    is_active: boolean;
}


export type BasicProductVariant = {
    id: number;
    product_id: number;
    variant_name: string;
    price: string;
    stock_quantity: number;
    weight: number;
    sku: string;
}

export type UpdateProductVariant = {
    product_id: number;
    variant_name: string;
    price: number;
    stock_quantity: number;
    weight: number;
    is_available: boolean;
}

export type UpdateProductImage = {
    product_id: number;
    url: string;
    alt_text: string;
    position: number;
}

export type VariantImage = {
    variant_id: number;
    url: string;
    alt_text: string;
    position: number;
}

export type UpdateVariantImage = {
    variant_id: number;
    url: string;
    alt_text: string;
    position: number;
}

/* 
    This section is used for product retrieval
    ! Some types are Store, Category, Discount are not relevant to the name product, but I included them here, because they are used in the product retrieval process.
    ! I don't move them to files like category.ts, store.ts, discount.ts, because they can be only used in the product retrieval process.   
    ! if there are any changes in the future, may be I will move them to their own files. 
*/
interface Store {
    id: number;
    name: string;
    profile_img: string | null;
}

interface Category {
    id: number;
    name: string;
    slug: string | null;
}

interface Discount {
    id: number;
    name: string;
    discount_type: string;
    discount_value: string;
    start_at: Date;
    end_at: Date;
}

export interface ProductImage {
    id: number;
    url: string;
    alt_text: string | null;
}

interface ProductVariant {
    id: number;
    variant_name: string;
    price: string;
    stock_quantity: number;
    sku: string;
    images: ProductImage[] | null;
    discounts: Discount[] | null;
}

export interface Product {
    id: number;
    name: string;
    description: string | null;
    created_at: Date;
    updated_at: Date;
    is_published: boolean;
    views: string;
    bought: number;
    sku: string;
    store: Store | null;
    category_hierarchy: Category[] | null; // Show all categories associated with the product
    promotion_image: ProductImage | null;
    variants: ProductVariant[] | null;
    product_images: ProductImage[] | null;
}