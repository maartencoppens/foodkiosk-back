import express, { Request, Response, Router } from "express";
import { Category, getAllCategories, getAllProducts, Product } from "./services/products";

const router: Router = express.Router();

router.get("/categories", async (req: Request, res: Response) => {
  const data: Category[] = await getAllCategories();
  console.log(data);
  res.json({ data });
});

router.get("/products", async (req: Request, res: Response) => {
  const data: Product[] = await getAllProducts();
  console.log(data);
  res.json({ data });
});

export default router;