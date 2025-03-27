import express, { Request, Response, Router } from "express";

const router: Router = express.Router();

// Homepagina
router.get("/", (req: Request, res: Response): void => {
  res.render("index", { title: "Management System" });
});

router.get("/products", (req: Request, res: Response): void => {
  res.render("products", { title: "Products" });
});

router.get("/add-product", (req: Request, res: Response): void => {
  res.render("add-product", { title: "Add Product" });
});

export default router;