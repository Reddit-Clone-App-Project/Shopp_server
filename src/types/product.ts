export type NewProduct = {
    name: string;
    image_id: number;
    description: string;
    store_id: number;
    category_id: number;
}

export type Product = {
    id: number;
    name: string;
    image_id: number;
    description: string;
    store_id: number;
    category_id: number;
}

export type CompleteProduct = {
    id: number;
    name: string;
    image_id: number;
    description: string;
    store_id: number;
    category_id: number;
    variant: ProductVariant;
}

export type UpdateProduct = {
    name: string;
    image_id: number;
    description: string;
    store_id: number;
    is_active: boolean;
}

export type UpdatedProduct = {
    id: number;
    name: string;
    image_id: number;
    description: string;
    is_active: boolean;
}

export type ProductVariant = {
    product_id: number;
    color: string;
    variant: string;
    price: number;
    stock_quantity: number;
    weight: number;
    dimension: number;
    is_active: boolean;
    sku: string;
}

export type UpdateProductVariant = {
    product_id: number;
    color: string;
    variant: string;
    price: number;
    stock_quantity: number;
    weight: number;
    dimension: number;
    is_active: boolean;
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