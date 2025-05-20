// Importeer sql uit db.ts
import sql from "./db";

// Interface voor een nieuwsartikel
export interface Category {
  id: number;
  name: string;
  status: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  stock: number;
  image: string;
}

export interface Order {
  id: number;
  customer_name: string;
  created_at: string;
  total_amount: number;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateOrder {
  status: string;
  items: OrderItem[];
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

export async function getAllProducts(search?: string): Promise<Product[]> {
  try {
    const data = await sql<Product[]>`
      SELECT 
        p.id, 
        p.name AS product_name, 
        p.image, 
        p.price, 
        p.stock, 
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

// Base query for orders that can be used by both getAllOrders and getOrderById
async function getOrdersQuery(orderId?: number, limit?: number): Promise<any[]> {
  try {
    const data = await sql`
      SELECT
        o.id AS order_id,
        o.created_at,
        o.status AS order_status,
        oi.id AS order_item_id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        p.name AS product_name,
        p.image AS product_image,
        p.price AS product_price,
        p.stock AS product_stock,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        c.status AS category_status
      FROM orders o
      LEFT JOIN "order-items" oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      ${orderId ? sql`WHERE o.id = ${orderId}` : sql``}
      ORDER BY o.created_at DESC
      ${limit ? sql`LIMIT ${limit}` : sql``};
    `;
    return data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Could not fetch orders: " + error);
  }
}

export async function getAllOrders(): Promise<Order[]> {
  return getOrdersQuery();
}

export async function getRecentOrders(limit: number = 10): Promise<Order[]> {
  return getOrdersQuery(undefined, limit);
}

export async function getOrderById(id: number): Promise<any> {
  return getOrdersQuery(id);
}

export async function deleteProduct(id: number): Promise<void> {
  try {
    await sql`DELETE FROM products WHERE id = ${id}`;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Could not delete product: " + error);
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
      INSERT INTO products (name, category_id, price, stock, image)
      VALUES (${product.name}, ${product.category_id}, ${product.price}, ${product.stock}, ${product.image});
    `;
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error("Could not add product: " + error);
  }
}

export async function createOrder(order: CreateOrder): Promise<number> {
  try {
    // Start a transaction
    let newOrderId: number = 0;
    await sql.begin(async (sql) => {
      // Create the order
      const [newOrder] = await sql`
        INSERT INTO orders (status)
        VALUES (${order.status})
        RETURNING id;
      `;
      newOrderId = newOrder.id;

      // Insert order items
      for (const item of order.items) {
        await sql`
          INSERT INTO "order-items" (order_id, product_id, quantity, unit_price)
          VALUES (${newOrderId}, ${item.product_id}, ${item.quantity}, ${item.unit_price});
        `;
      }
    });
    return newOrderId;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Could not create order: " + error);
  }
}

export async function updateProduct(id: number, product: Omit<Product, "id">): Promise<void> {
  try {
    await sql`
      UPDATE products 
      SET name = ${product.name},
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

export async function addCategory(category: Omit<Category, "id">): Promise<void> {
  try {
    await sql`
      INSERT INTO categories (name, status)
      VALUES (${category.name}, ${category.status});
    `;
  } catch (error) {
    console.error("Error adding category:", error);
    throw new Error("Could not add category: " + error);
  }
}

export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const [category] = await sql<Category[]>`
      SELECT id, name, status
      FROM categories
      WHERE id = ${id}
    `;
    return category || null;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw new Error("Could not fetch category: " + error);
  }
}

export async function updateCategory(id: number, category: Omit<Category, "id">): Promise<void> {
  try {
    await sql`
      UPDATE categories 
      SET name = ${category.name},
          status = ${category.status}
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Could not update category: " + error);
  }
}
