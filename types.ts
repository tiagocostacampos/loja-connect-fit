
export type Category = 'Legging' | 'Top' | 'Conjunto' | 'Camiseta' | 'Shorts';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number; // Preço de Venda Normal
  purchasePrice: number; // Preço de Compra (Custo - Privado ADM)
  promotionPrice?: number; // Preço Promocional
  isOnPromotion: boolean; // Flag de Promoção Ativa
  sizes: string[];
  colors: string[];
  stock: number;
  images: string[]; // Lista de URLs das imagens
  description: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  date: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export type UserRole = 'CLIENT' | 'ADM';

export interface AppState {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  role: UserRole;
}
