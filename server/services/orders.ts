import sql from "./db";
import { CreateOrder, Order } from "./interfaces";

// Base query for orders that can be used by both getAllOrders and getOrderById
async function getOrdersQuery(
  orderId?: number,
  limit?: number
): Promise<any[]> {
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
    p.id AS product_id,
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
