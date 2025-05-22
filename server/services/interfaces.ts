export interface Category {
  id: number;
  name: string;
  status: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  stock: number;
  image: string;
}

export interface Order {
  id: number;
  customer_name: string;
  created_at: string;
  total_amount: number;
  status: "completed" | "pending" | "cancelled";
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateOrder {
  status: string;
  items: OrderItem[];
}
