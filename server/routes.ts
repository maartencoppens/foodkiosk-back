import express, { Request, Response, Router } from "express";
import { Category, filterProducts, getAllCategories, getAllProducts, Product } from "./services/products";

const router: Router = express.Router();

// Homepagina
router.get("/", (req: Request, res: Response): void => {
  res.render("index", { title: "Management System" });
});

router.get("/products", async (req: Request, res: Response): Promise<void> => {
  const data: Product[] = await getAllProducts();
  console.log(data);
  
  // const filter: string = req.query.search?.toString() || '';
  // const search: Product[] = await filterProducts(filter);
  res.render("products", { title: "Products", data });
});

router.get("/categories", async (req: Request, res: Response): Promise<void> => {
  const data: Category[] = await getAllCategories();
  res.render("categories", { title: "Categories", data });
});

router.get("/add-product", (req: Request, res: Response): void => {
  res.render("add-product", { title: "Add Product" });
});


export default router;
