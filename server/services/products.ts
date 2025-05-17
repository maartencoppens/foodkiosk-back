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

export async function getAllOrders(): Promise<Order[]> {
  try {
    const data: Order[] = await sql`
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
      ORDER BY o.id, oi.id;
    `;
    console.log(data);
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
