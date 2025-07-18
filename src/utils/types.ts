export interface Farmer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  account_number?: string;
  bank_name?: string;
  ifsc_code?: string;
  date_joined: string;
  products?: Product[];
  transactions?: Transaction[];
  email: string;
  password: string;
  profile_photo?: string;
  state?: string;
  district?: string;
  village?: string;
  branch_id?: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  category: string;
  created_at: string;
  updated_at: string;
  farmer_id?: string;
  barcode?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  type: 'credit' | 'debit';
  description: string;
  farmerId: string;
  settled: boolean;
  paymentMode?: 'Cash' | 'Online';
  branch_id?: string;
}

export interface DailyEarning {
  date: string;
  amount: number;
}

export interface MonthlyEarning {
  month: string;
  amount: number;
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  unit: string;
  category: string;
  farmerId: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  address?: string | null;
  pincode?: string | null;
  date_joined: string;
  profile_photo?: string | null;
  password: string;
  created_at: string;
  updated_at: string;
}

// Order Management types
export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'placed' | 'packed' | 'shipping' | 'delivered' | 'cancelled';
  date: string;
  trackingInfo?: string;
  estimatedDelivery?: string;
  paymentMethod?: 'cash' | 'online';
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

// Coupon system types
export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiry_date: string;
  is_active: boolean;
  max_discount_limit: number | null;
  target_type: 'all' | 'customer' | 'employee';
  target_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CouponValidationResult {
  success: boolean;
  coupon?: Coupon;
  error?: string;
}

// Role-based access control types - updated to match Supabase schema
export type Role = string;

export interface Permission {
  resource: string;
  actions: ('view' | 'create' | 'edit' | 'delete')[];
}

export interface RolePermission {
  role: Role;
  permissions: Permission[];
}

// Updated Role interface to match Supabase schema
export interface RoleData {
  id: string;
  name: string;
  permissions: Permission[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  profilePhoto?: string;
  dateJoined: Date;
  state?: string;
  district?: string;
  village?: string;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  branchId?: string;
  branch_id?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Updated Ticket system types to match database schema
export interface Ticket {
  id: string;
  user_id: string;
  user_name: string;
  user_type: string;
  user_contact: string;
  message: string;
  status: string;
  assigned_to: string | null;
  resolution: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
  branch_id?: string | null;
  // Legacy properties for backward compatibility
  userId?: string;
  userType?: string;
  userName?: string;
  userContact?: string;
  dateCreated?: Date;
  lastUpdated?: Date;
}

// New interface for ticket replies
export interface TicketReply {
  id: string;
  ticket_id: string;
  replied_by: string;
  reply_message: string;
  attachment_url?: string | null;
  created_at: string;
}
