// Importeer sql uit db.ts
import sql from "./db";

// Interface voor een nieuwsartikel
export interface Category {
  id: number;
  category: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const data: Category[] = await sql`select * from categories`;
    return data;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error("Could not fetch news: " + error);
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const data: Product[] = await sql`SELECT 
      p.id, 
      p.name AS product_name, 
      p.image, 
      p.price, 
      p.stock, 
      c.name AS category_name
  FROM 
      products p
  JOIN 
      categories c ON p.category_id = c.id;
  
    `;
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error("Could not fetch news: " + error);
  }
}

export async function filterProducts(search: string): Promise<Product[]> {
  try {
    const data: Product[] =
      await sql`select * from products where name like ${search}`;
    return data;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error("Could not fetch news: " + error);
  }
}
