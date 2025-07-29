import pool from "../config/db";
import { ActiveCategory, Category, UpdateCategory } from "../types/category";
import { ProductCard } from "../types/product";

// User
export const getAllActiveCategories = async (): Promise<ActiveCategory[]> => {
  const result = await pool.query(
    "SELECT id, name, slug, image_url FROM category WHERE is_active = true"
  );
  return result.rows;
};

// Admin
export const createACategory = async (
  category: Category
): Promise<Category> => {
  const result = await pool.query(
    "INSERT INTO category (name, slug, parent_id, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
    [category.name, category.slug, category.parent_id, category.image_url]
  );
  return result.rows[0];
};

export const getAllCategories = async () => {
  const result = await pool.query("SELECT * FROM category");
  return result.rows;
};

export const updateCategory = async (category: UpdateCategory) => {
  const result = await pool.query(
    "UPDATE category SET name = $1, slug = $2, parent_id = $3, image_url = $4, is_active = $5 WHERE id = $6 RETURNING *",
    [
      category.name,
      category.slug,
      category.parent_id,
      category.image_url,
      category.is_active,
      category.id,
    ]
  );
  return result.rows[0];
};

export const deleteCategory = async (id: number) => {
  const result = await pool.query(
    "DELETE FROM category WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0];
};

// Define an interface for the search options for type safety
interface CategorySearchOptions {
  categoryId: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

export const searchProductsByCategory = async (
  options: CategorySearchOptions
): Promise<ProductCard[]> => {
  const {
    categoryId,
    limit = 20,
    offset = 0,
    sortBy = 'Most Popular',
    minPrice,
    maxPrice,
    rating,
  } = options;

  const params: any[] = [categoryId];
  let paramIndex = 2; // Start params at $2 since $1 is the categoryId

  // The query is now simplified to fetch only ProductCard data
  let query = `
    SELECT
        p.id,
        p.name,
        p.bought,
        p.average_rating,
        (
            SELECT json_build_object('id', id, 'url', url, 'alt_text', alt_text)
            FROM public.product_image
            WHERE product_id = p.id AND is_promotion_image = true
            LIMIT 1
        ) AS promotion_image,
        json_build_object('id', s.id, 'name', s.name) AS store,
        (
            SELECT MIN(price)
            FROM public.product_variant
            WHERE product_id = p.id
        ) AS price
    FROM 
        public.product p
    LEFT JOIN 
        public.store s ON p.store_id = s.id
  `;

  // --- Dynamic WHERE Clause ---
  const whereClauses: string[] = [];
  whereClauses.push(`p.category_id = $1`);
  whereClauses.push(`p.is_active = true AND p.is_published = true`);

  if (rating !== undefined) {
    whereClauses.push(`p.average_rating >= $${paramIndex++}`);
    params.push(rating);
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceConditions: string[] = [];
    if (minPrice !== undefined) {
      priceConditions.push(`pv.price >= $${paramIndex++}`);
      params.push(minPrice);
    }
    if (maxPrice !== undefined) {
      priceConditions.push(`pv.price <= $${paramIndex++}`);
      params.push(maxPrice);
    }
    whereClauses.push(`EXISTS (SELECT 1 FROM public.product_variant pv WHERE pv.product_id = p.id AND ${priceConditions.join(' AND ')})`);
  }

  query += ` WHERE ${whereClauses.join(' AND ')}`;

  // --- Dynamic ORDER BY Clause ---
  let orderByClause = '';
  switch (sortBy) {
    case 'Newest':
      orderByClause = 'ORDER BY p.created_at DESC';
      break;
    case 'Most Bought':
      orderByClause = 'ORDER BY p.bought DESC';
      break;
    case 'Price: Low to High':
      orderByClause = `ORDER BY (SELECT MIN(price) FROM public.product_variant WHERE product_id = p.id) ASC NULLS LAST`;
      break;
    case 'Price: High to Low':
      orderByClause = `ORDER BY (SELECT MIN(price) FROM public.product_variant WHERE product_id = p.id) DESC NULLS LAST`;
      break;
    case 'Most Popular':
    default:
      orderByClause = `ORDER BY p.views DESC, p.bought DESC, p.average_rating DESC, p.created_at DESC`;
      break;
  }
  query += ` ${orderByClause}`;

  // --- Pagination ---
  query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  // Execute the final query
  const result = await pool.query(query, params);
  return result.rows;
};
