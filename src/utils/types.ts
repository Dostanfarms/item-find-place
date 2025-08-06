
export interface Permission {
  resource: string;
  actions: string[];
}

export interface CartItem {
  id: string;
  productId?: string;
  name: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
  category: string;
  farmerId?: string;
  size?: string; // For fashion products
  type?: 'general' | 'fashion'; // Product type
  imageUrl?: string; // Add imageUrl property
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  branchIds?: string[]; // Multiple branch support
}

// Employee interface
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  profilePhoto?: string;
  dateJoined: string;
  state: string;
  district: string;
  village: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branchIds: string[];
}

// Role interface
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// Farmer interface
export interface Farmer {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  state: string;
  district: string;
  village: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  profile_photo: string;
  date_joined: string;
  branch_id: string;
  products: any[];
  transactions: any[];
}

// Customer interface
export interface Customer {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  address?: string;
  pincode?: string;
  date_joined?: string;
  created_at: string;
}

// Product interface
export interface Product {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  category: string;
  barcode?: string;
  image_url?: string;
  is_active: boolean;
  branch_id?: string;
  created_at: string;
  updated_at: string;
}

// Transaction interface
export interface Transaction {
  id: string;
  customer_name: string;
  customer_mobile: string;
  items: any[];
  subtotal: number;
  discount: number;
  total: number;
  coupon_used: string | null;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  branch_id: string | null;
}

// Ticket interface
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}
