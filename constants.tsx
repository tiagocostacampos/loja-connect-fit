
import { Product, Sale, Expense, Category } from './types';

export const CATEGORIES: Category[] = ['Legging', 'Top', 'Conjunto', 'Camiseta', 'Shorts'];
export const SIZES = ['P', 'M', 'G', 'GG'];
export const COLORS = ['Preto', 'Azul Marinho', 'Cinza', 'Rosa', 'Verde Militar', 'Vinho'];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Legging High Compression',
    category: 'Legging',
    price: 129.90,
    purchasePrice: 45.00,
    promotionPrice: 99.90,
    isOnPromotion: true,
    sizes: ['P', 'M', 'G'],
    colors: ['Preto', 'Azul Marinho'],
    stock: 15,
    description: 'Legging de alta compressão com cintura alta.',
    images: ['https://picsum.photos/id/101/400/600', 'https://picsum.photos/id/102/400/600']
  },
  {
    id: '2',
    name: 'Top Power Fit',
    category: 'Top',
    price: 79.90,
    purchasePrice: 25.00,
    isOnPromotion: false,
    sizes: ['P', 'M'],
    colors: ['Rosa', 'Preto'],
    stock: 22,
    description: 'Top de suporte médio para atividades físicas intensas.',
    images: ['https://picsum.photos/id/103/400/600']
  },
  {
    id: '4',
    name: 'Camiseta Dry-Fit Pro',
    category: 'Camiseta',
    price: 64.90,
    purchasePrice: 18.50,
    promotionPrice: 49.90,
    isOnPromotion: false,
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Vinho'],
    stock: 30,
    description: 'Tecido leve e respirável para treinos diários.',
    images: ['https://picsum.photos/id/104/400/600']
  }
];

export const INITIAL_SALES: Sale[] = [
  { id: 's1', productId: '1', productName: 'Legging High Compression', quantity: 2, amount: 259.80, date: '2023-10-01' },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'e1', description: 'Reposição Estoque', amount: 1200.00, date: '2023-09-25', category: 'Estoque' },
];
