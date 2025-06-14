import express, { Application } from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import cors from "cors";
import routes from "./routes/routes";
import apiRoutes from "./api";
import loginRoutes, { handleLogin, adminOnly } from "./routes/login";
import cookieSession from "cookie-session";

const app: Application = express();
const PORT: number = 3000;

// EJS als template-engine instellen
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware voor layouts
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Middleware om statische bestanden te serveren
app.use(express.static(path.join(__dirname, "public")));

// Middleware om formulierdata te verwerken
app.use(express.urlencoded({ extended: true }));

// Middleware om JSON-data te verwerken
app.use(express.json());

// CORS middleware configureren
app.use(cors());

// Ensure SESSION_SECRET is available
if (!process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET environment variable is not set');
  process.exit(1);
}

// Cookie session middleware
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  secure: false,
  httpOnly: true,
  sameSite: 'lax'
}));
//secure: process.env.NODE_ENV === 'production'

// Routes gebruiken
app.use("/api", apiRoutes);  // API routes first, completely separate

// Login and admin routes
app.post("/login", handleLogin);
app.use("/", loginRoutes);

// Admin protected routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
  } else {
    adminOnly(req, res, next);
  }
}, routes);

// Server starten
app.listen(PORT, (): void => {
  console.log(`Server draait op http://localhost:${PORT}`);
});