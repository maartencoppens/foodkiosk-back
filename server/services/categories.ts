import sql from "./db";
import { Category } from "./interfaces";

export async function getAllCategories(): Promise<Category[]> {
  try {
    const data: Category[] = await sql`select * from categories`;
    return data;
  } catch (error) {
    console.error("Error fetching news:", error);
    throw new Error("Could not fetch news: " + error);
  }
}

export async function deleteCategory(id: number): Promise<void> {
  try {
    await sql`DELETE FROM categories WHERE id = ${id}`;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Could not delete product: " + error);
  }
}

export async function addCategory(
  category: Omit<Category, "id">
): Promise<void> {
  try {
    await sql`
        INSERT INTO categories (name, status, image)
        VALUES (${category.name}, ${category.status}, ${category.image});
      `;
  } catch (error) {
    console.error("Error adding category:", error);
    throw new Error("Could not add category: " + error);
  }
}

export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const [category] = await sql<Category[]>`
        SELECT id, name, status, image
        FROM categories
        WHERE id = ${id}
      `;
    return category || null;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw new Error("Could not fetch category: " + error);
  }
}

export async function updateCategory(
  id: number,
  category: Omit<Category, "id">
): Promise<void> {
  try {
    await sql`
        UPDATE categories 
        SET name = ${category.name},
            status = ${category.status},
            image = ${category.image}
        WHERE id = ${id}
      `;
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Could not update category: " + error);
  }
}
