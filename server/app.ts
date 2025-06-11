import express, { Application } from "express";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import cors from "cors";
import routes from "./routes/routes";
import apiRoutes from "./api";
import loginRoutes, { handleLogin, adminOnly } from "./routes/login";
import session from "express-session";

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

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  rolling: true // Refresh the session on each request
}));

// Routes gebruiken
app.post("/login", handleLogin);
app.use("/", loginRoutes);
app.use("/", adminOnly, routes);
app.use("/api", apiRoutes);

// Server starten
app.listen(PORT, (): void => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
