import express, { Request, Response, Router } from "express";
import {
  getAllOrders,
  getOrderById,
  getRecentOrders,
} from "../services/orders";

const router: Router = express.Router();

// Get all orders
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const rawData = await getAllOrders();
  
  // Process the data to group items by order and calculate totals
  const orders = rawData.reduce((acc: any[], row: any) => {
    const existingOrder = acc.find(o => o.order_id === row.order_id);
    
    if (existingOrder) {
      // Add item to existing order
      existingOrder.items.push({
        quantity: row.quantity,
        unit_price: row.unit_price
      });
    } else {
      // Create new order
      acc.push({
        order_id: row.order_id,
        created_at: row.created_at,
        order_status: row.order_status,
        items: [{
          quantity: row.quantity,
          unit_price: row.unit_price
        }]
      });
    }
    
    return acc;
  }, []);

  res.render("orders", { 
    title: "Orders", 
    data: orders,
    currentPage: 'orders'
  });
});

// Get order details
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      res.status(400).json({ error: "Invalid order ID" });
      return;
    }

    const orderData = await getOrderById(orderId);
    if (!orderData || orderData.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Calculate total amount
    const totalAmount = orderData.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);

    res.render("order-details", { 
      title: `Order #${orderId}`, 
      order: orderData[0],
      items: orderData,
      totalAmount,
      currentPage: 'orders'
    });
  } catch (error) {
    console.error("Error loading order:", error);
    res.status(500).json({ error: "Failed to load order" });
  }
});

export default router; 