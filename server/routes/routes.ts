import express, { Request, Response, Router } from "express";
import { getRecentOrders } from "../services/orders";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";

const router: Router = express.Router();

// Homepage
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const rawData = await getRecentOrders(5);
  
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

  res.render("index", { 
    title: "Recent Orders",
    recentOrders: orders,
    currentPage: 'dashboard'
  });
});

// Mount the route modules

router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/orders", ordersRouter);

export default router; 