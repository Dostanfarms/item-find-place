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
  branchIds?: string[]; // Changed from branch_id to branchIds for multiple branch support
}
