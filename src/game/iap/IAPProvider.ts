export interface IAPProduct {
  id: string;
  coins: number;
  price: string;
}

export interface IAPProvider {
  isAvailable(): boolean;
  getProducts(): Promise<IAPProduct[]>;
  purchase(productId: string): Promise<void>;
}

export const IAP_PRODUCTS: IAPProduct[] = [
  { id: 'neonide.coins.5k',   coins: 5000,   price: '$0.99' },
  { id: 'neonide.coins.18k',  coins: 18000,  price: '$2.99' },
  { id: 'neonide.coins.35k',  coins: 35000,  price: '$4.99' },
  { id: 'neonide.coins.80k',  coins: 80000,  price: '$9.99' },
  { id: 'neonide.coins.200k', coins: 200000, price: '$19.99' },
];
