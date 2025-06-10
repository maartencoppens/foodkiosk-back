import express, { Request, Response, Router } from "express";
import {
  getAllCategories,
  deleteCategory,
  addCategory,
  getCategoryById,
  updateCategory,
} from "../services/categories";
import { Category } from "../services/interfaces";
import { upload } from "../imagePost";
import fs from 'fs';
import path from 'path';

const router: Router = express.Router();

// Get all categories
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const data: Category[] = await getAllCategories();
  res.render("categories", { title: "Categories", data });
});

// Get add category form
router.get("/add", async (req: Request, res: Response) => {
  res.render("add-category", { 
    title: "Add Category", 
    isEdit: false 
  });
});

// Add new category
router.post(
  "/add",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const newCategory = {
        name: req.body.name?.trim(),
        status: req.body.status === 'true',
        image: req.file?.filename || "default.png"
      };

      await addCategory(newCategory);
      res.redirect("/categories");
    } catch (error) {
      console.error("Error adding category:", error);
      res.status(500).json({ error: "Failed to add category" });
    }
  }
);

// Delete category
router.get(
  "/delete/:id",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        res.status(400).json({ error: "Invalid category ID" });
        return;
      }

      await deleteCategory(categoryId);
      res.redirect("/categories");
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  }
);

// Get edit category form
router.get("/edit/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }

    const category = await getCategoryById(categoryId);
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.render("add-category", { 
      title: "Edit Category", 
      category,
      isEdit: true 
    });
  } catch (error) {
    console.error("Error loading category:", error);
    res.status(500).json({ error: "Failed to load category" });
  }
});

// Update category
router.post(
  "/edit/:id",
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);
      if (isNaN(categoryId)) {
        res.status(400).json({ error: "Invalid category ID" });
        return;
      }

      // Get the current category to check the existing image
      const currentCategory = await getCategoryById(categoryId);
      if (!currentCategory) {
        res.status(404).json({ error: "Category not found" });
        return;
      }

      // If a new image was uploaded, delete the old one
      if (req.file && currentCategory.image && currentCategory.image !== 'default.png') {
        const oldImagePath = path.join(__dirname, '..', 'public', 'images', currentCategory.image);
        try {
          fs.unlinkSync(oldImagePath);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      const updatedCategory = {
        name: req.body.name?.trim(),
        status: req.body.status === 'true',
        image: req.file?.filename || req.body.existingImage || "default.png"
      };

      await updateCategory(categoryId, updatedCategory);
      res.redirect("/categories");
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Failed to update category" });
    }
  }
);

export default router; 