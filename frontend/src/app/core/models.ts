export interface Farmer { id?: number; name: string; phone: string; village: string; landAcres: number; currentBalance?: number; }
export interface Category { id?: number; name: string; }
export interface Product { id?: number; name: string; unit: string; pricePerUnit: number; category: Category; }
export interface Stock { id: number; product: Product; quantity: number; }
export interface CreditItemRequest { type: 'CASH' | 'PRODUCT'; categoryId?: number; productId?: number; quantity: number; price: number; }
