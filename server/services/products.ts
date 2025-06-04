// Importeer sql uit db.ts
import sql from "./db";
import { Product } from "./interfaces";

export async function getAllProducts(search?: string): Promise<Product[]> {
  try {
    const data = await sql<Product[]>`
      SELECT 
      p.id, 
      p.description,
      p.name AS product_name, 
      p.image, 
      p.price, 
      p.stock, 
      p.category_id,
      c.name AS category_name
      FROM 
      products p
      JOIN 
      categories c ON p.category_id = c.id
      ${search ? sql`WHERE p.name LIKE ${`%${search}%`}` : sql``}
    `;
    return data;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error("Could not fetch news: " + error);
  }
}

export async function deleteProduct(id: number): Promise<void> {
  try {
    await sql`DELETE FROM products WHERE id = ${id}`;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Could not delete product: " + error);
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

export async function addProduct(product: Omit<Product, "id">): Promise<void> {
  try {
    await sql`
      INSERT INTO products (name, description, category_id, price, stock, image)
      VALUES (${product.name}, ${product.description}, ${product.category_id}, ${product.price}, ${product.stock}, ${product.image});
    `;
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error("Could not add product: " + error);
  }
}

export async function updateProduct(
  id: number,
  product: Omit<Product, "id">
): Promise<void> {
  try {
    await sql`
      UPDATE products 
      SET name = ${product.name},
          description = ${product.description},
          category_id = ${product.category_id},
          price = ${product.price},
          stock = ${product.stock},
          image = ${product.image}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Could not update product: " + error);
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const [product] = await sql<Product[]>`
      SELECT 
        p.id, 
        p.name,
        p.description,
        p.image, 
        p.price, 
        p.stock,
        p.category_id
      FROM 
        products p
      WHERE 
        p.id = ${id}
    `;
    return product || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Could not fetch product: " + error);
  }
}
