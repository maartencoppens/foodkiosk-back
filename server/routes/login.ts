import express, { Request, Response, NextFunction, Router } from "express";
import bcrypt from "bcrypt";

declare module 'express-serve-static-core' {
  interface Request {
    session: {
      isAdmin?: boolean;
    } | null;
  }
}

const router: Router = express.Router();

// Login page route
router.get("/login", (req: Request, res: Response) => {
  res.render("login", { 
    title: "Login", 
    error: req.query.error,
    layout: 'layouts/login'
  });
});

// Logout route
router.post("/logout", (req: Request, res: Response) => {
  req.session = null;
  res.redirect("/login");
});

export const handleLogin = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER;
  const adminHash = process.env.ADMIN_HASH ?? "";

  if (username !== adminUser) {
    console.log('Username mismatch');
    return res.redirect("/login?error=user");
  }

  const isValid = await bcrypt.compare(password, adminHash);

  if (isValid) {
    req.session = { isAdmin: true };
    return res.redirect("/");
  }

  return res.redirect("/login?error=pass");
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.isAdmin) return next();
  return res.redirect("/login");
};

export default router;


