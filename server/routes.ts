import express, { Request, Response, Router } from "express";
import {
  addProduct,
  Category,
  deleteProduct,
  filterProducts,
  getAllCategories,
  getAllOrders,
  getAllProducts,
  Product,
} from "./services/products";
import { upload } from "./imagePost";

const router: Router = express.Router();

// Homepagina
router.get("/", (req: Request, res: Response): void => {
  res.render("index", { title: "Management System" });
});

router.get("/orders", async (req: Request, res: Response): Promise<void> => {
  const data = await getAllOrders();
  res.render("orders", { title: "Orders", data })
})

router.get("/products", async (req: Request, res: Response): Promise<void> => {
  const search: string = req.query.search?.toString() || "";
  const data: Product[] = await getAllProducts(search);
  res.render("products", { title: "Products", data });
});

router.get(
  "/categories",
  async (req: Request, res: Response): Promise<void> => {
    const data: Category[] = await getAllCategories();
    res.render("categories", { title: "Categories", data });
  }
);

router.get("/add-product", async (req: Request, res: Response) => {
  const categories = await getAllCategories();
  res.render("add-product", { title: "Add Product", categories });
});

router.post(
  "/add-product-form",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {

      const newProduct = {
        name: req.body.name?.trim(),
        category_id: parseInt(req.body.category?.trim() || "1"),
        price: parseFloat(req.body.price?.trim() || "1"),
        stock: parseInt(req.body.stock?.trim() || "1"),
        image: req.file?.filename || "default.jpg",
      };

      await addProduct(newProduct);
      res.redirect("/add-product");
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ error: "Failed to add product" });
    }
  }
);

router.get(
  "/products/delete/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        res.status(400).json({ error: "Invalid product ID" });
        return;
      }

      await deleteProduct(productId);
      res.redirect("/products");
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
);

export default router;
