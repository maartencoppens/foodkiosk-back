import express, { Request, Response, Router } from "express";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
  getProductById,
} from "./services/products";
import {
  getAllCategories,
  deleteCategory,
  addCategory,
  getCategoryById,
  updateCategory,
} from "./services/categories";
import {
  getAllOrders,
  getOrderById,
  getRecentOrders,
} from "./services/orders";
import { Product, Category } from "./services/interfaces";
import { upload } from "./imagePost";
import fs from 'fs';
import path from 'path';

const router: Router = express.Router();

// Homepagina
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const rawData = await getRecentOrders(10);
  
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
    title: "Management System",
    recentOrders: orders 
  });
});

router.get("/orders", async (req: Request, res: Response): Promise<void> => {
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

  res.render("orders", { title: "Orders", data: orders });
});

router.get("/orders/:id", async (req: Request, res: Response): Promise<void> => {
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
      totalAmount
    });
  } catch (error) {
    console.error("Error loading order:", error);
    res.status(500).json({ error: "Failed to load order" });
  }
});

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

router.get("/categories/delete/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      res.status(400).json({ error: "Invalid product ID" });
      return;
    }

    await deleteCategory(productId);
    res.redirect("/categories");
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete category" });
  
  }

})

router.get("/add-product", async (req: Request, res: Response) => {
  const categories = await getAllCategories();
  res.render("add-product", { 
    title: "Add Product", 
    categories,
    isEdit: false 
  });
});

router.post(
  "/add-product-form",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {

      const newProduct = {
        name: req.body.name?.trim(),
        description: req.body.description?.trim() || "",
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

router.get("/products/edit/:id", async (req: Request, res: Response): Promise<void> => {
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
      isEdit: true 
    });
  } catch (error) {
    console.error("Error loading product:", error);
    res.status(500).json({ error: "Failed to load product" });
  }
});

router.post(
  "/products/edit/:id",
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
      if (req.file && currentProduct.image && currentProduct.image !== 'default.jpg') {
        const oldImagePath = path.join(__dirname, 'public', 'uploads', currentProduct.image);
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
        image: req.file?.filename || req.body.existingImage || "default.jpg",
      };

      await updateProduct(productId, updatedProduct);
      res.redirect("/products");
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  }
);

router.get("/add-category", async (req: Request, res: Response) => {
  res.render("add-category", { 
    title: "Add Category", 
    isEdit: false 
  });
});

router.post("/add-category-form", async (req: Request, res: Response) => {
  try {
    const newCategory = {
      name: req.body.name?.trim(),
      status: req.body.status === 'true'
    };

    await addCategory(newCategory);
    res.redirect("/categories");
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: "Failed to add category" });
  }
});

router.get("/categories/edit/:id", async (req: Request, res: Response): Promise<void> => {
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

router.post("/categories/edit/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      res.status(400).json({ error: "Invalid category ID" });
      return;
    }

    const updatedCategory = {
      name: req.body.name?.trim(),
      status: req.body.status === 'true'
    };

    await updateCategory(categoryId, updatedCategory);
    res.redirect("/categories");
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

export default router;
