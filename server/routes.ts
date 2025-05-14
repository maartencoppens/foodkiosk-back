import express, { Request, Response, Router } from "express";
import {
  addProduct,
  Category,
  filterProducts,
  getAllCategories,
  getAllProducts,
  Product,
} from "./services/products";

const router: Router = express.Router();

// Homepagina
router.get("/", (req: Request, res: Response): void => {
  res.render("index", { title: "Management System" });
});

router.get("/products", async (req: Request, res: Response): Promise<void> => {
  const data: Product[] = await getAllProducts();
  res.render("products", { title: "Products", data });
});

router.get(
  "/categories",
  async (req: Request, res: Response): Promise<void> => {
    const data: Category[] = await getAllCategories();
    res.render("categories", { title: "Categories", data });
  }
);

router.get("/products", async (req: Request, res: Response): Promise<void> => {
  const filter: string = req.query.search?.toString() || "";
  const search: Product[] = await filterProducts(filter);
  res.render("products", { title: "Products", search });
});

router.get("/add-product", async (req: Request, res: Response) => {
  const categories = await getAllCategories();
  res.render("add-product", { title: "Add Product", categories });
});

router.post("/add-product-form", (req: Request, res: Response) => {
  //     image: req.body.image?.trim() || "",

  const newProduct = {
    name: req.body.name?.trim() || "",
    category: req.body.category?.trim() || "",
    price: req.body.price?.trim() || "",
    stock: req.body.stock?.trim() || "",
  };
  addProduct(newProduct);
});

export default router;
