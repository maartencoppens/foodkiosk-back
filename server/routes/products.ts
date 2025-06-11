import express, { Request, Response, Router } from "express";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
  getProductById,
} from "../services/products";
import { getAllCategories } from "../services/categories";
import { Product } from "../services/interfaces";
import { upload } from "../imagePost";
import fs from 'fs';
import path from 'path';

const router: Router = express.Router();

// Get all products
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const search: string = req.query.search?.toString() || "";
  const data: Product[] = await getAllProducts(search);
  res.render("products", { 
    title: "Products", 
    data,
    currentPage: 'products'
  });
});

// Get add product form
router.get("/add", async (req: Request, res: Response) => {
  const categories = await getAllCategories();
  res.render("add-product", { 
    title: "Add Product", 
    categories,
    isEdit: false,
    currentPage: 'products'
  });
});

// Add new product
router.post(
  "/add",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const newProduct = {
        name: req.body.name?.trim(),
        description: req.body.description?.trim() || "",
        category_id: parseInt(req.body.category?.trim() || "1"),
        price: parseFloat(req.body.price?.trim() || "1"),
        stock: parseInt(req.body.stock?.trim() || "1"),
        image: req.file?.filename || "default.png",
      };

      await addProduct(newProduct);
      res.redirect("/products");
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ error: "Failed to add product" });
    }
  }
);

// Delete product
router.get(
  "/delete/:id",
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

// Get edit product form
router.get("/edit/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    const product = await getProductById(productId);
    
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const categories = await getAllCategories();
    res.render("add-product", { 
      title: "Edit Product", 
      categories,
      product,
      isEdit: true,
      currentPage: 'products'
    });
  } catch (error) {
    console.error("Error loading product:", error);
    res.status(500).json({ error: "Failed to load product" });
  }
});

// Update product
router.post(
  "/edit/:id",
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = parseInt(req.params.id);
      if (isNaN(productId)) {
        res.status(400).json({ error: "Invalid product ID" });
        return;
      }

      // Get the current product to check the existing image
      const currentProduct = await getProductById(productId);
      if (!currentProduct) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      // If a new image was uploaded, delete the old one
      if (req.file && currentProduct.image && currentProduct.image !== 'default.png') {
        const oldImagePath = path.join(__dirname, '..', 'public', 'images', currentProduct.image);
        try {
          fs.unlinkSync(oldImagePath);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      const updatedProduct = {
        name: req.body.name?.trim(),
        description: req.body.description?.trim() || "",
        category_id: parseInt(req.body.category?.trim() || "1"),
        price: parseFloat(req.body.price?.trim() || "1"),
        stock: parseInt(req.body.stock?.trim() || "1"),
        image: req.file?.filename || req.body.existingImage || "default.png",
      };

      await updateProduct(productId, updatedProduct);
      res.redirect("/products");
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  }
);

export default router; 