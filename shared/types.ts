// Types shared between the Express backend and the React frontend.

export interface Customer {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  price_cents: number;
  stock: number;
  category: string;
}

export interface Order {
  id: number;
  customer_id: number;
  status: "pending" | "paid" | "shipped" | "cancelled";
  created_at: string;
  total_cents: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  qty: number;
  unit_price_cents: number;
}

// Orders joined with their customer for list views.
export interface OrderWithCustomer extends Order {
  customer_name: string;
  customer_email: string;
}
