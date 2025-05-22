import express, { Request, Response } from "express";
import { getAllProducts } from "./services/products";
import { getAllCategories } from "./services/categories";
import { createOrder } from "./services/orders";
import { Product, Category } from "./services/interfaces";

const router = express.Router();

router.get("/categories", async (req: Request, res: Response) => {
  const data: Category[] = await getAllCategories();
  res.json({ data });
});

router.get("/products", async (req: Request, res: Response) => {
  const data: Product[] = await getAllProducts();
  res.json({ data });
});

router.post("/orders", async (req: Request, res: Response) => {
  try {
    console.log('Received request body:', req.body);
    // Get the post data from the body of the fetch
    const { status, items } = req.body;

    // Validate required fields
    if (!status || !items || !Array.isArray(items) || items.length === 0) {
      console.log('Validation failed:', { status, items });
      return res
        .status(400)
        .json({ error: "Missing required fields or invalid items array" });
    }

    // Check if each item is given
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.unit_price) {
        console.log('Item validation failed:', item);
        return res.status(400).json({
          error: "Each item must have product_id, quantity, and unit_price",
        });
      }
    }

    // Create new order and give the data from the fetch to the service function
    const orderId = await createOrder({
      status,
      items: items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      })),
    });

    res
      .status(201)
      .json({ message: "Order created successfully", order_id: orderId });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

export default router;
