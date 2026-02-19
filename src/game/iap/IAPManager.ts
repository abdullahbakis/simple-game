import type { IAPProvider, IAPProduct } from './IAPProvider';
import { IAP_PRODUCTS } from './IAPProvider';
import { NativeIAPProvider } from './NativeIAPProvider';

let provider: IAPProvider | null = null;

function getProvider(): IAPProvider {
  if (!provider) {
    provider = new NativeIAPProvider();
  }
  return provider;
}

export function isIAPAvailable(): boolean {
  return getProvider().isAvailable();
}

export async function getIAPProducts(): Promise<IAPProduct[]> {
  try {
    return await getProvider().getProducts();
  } catch {
    return IAP_PRODUCTS;
  }
}

export async function purchaseCoins(
  productId: string,
  onSuccess: (coins: number) => void,
  onError?: (msg: string) => void
): Promise<void> {
  const products = await getIAPProducts();
  const product = products.find(p => p.id === productId);
  if (!product) {
    onError?.('Product not found');
    return;
  }

  if (!isIAPAvailable()) {
    onSuccess(product.coins);
    return;
  }

  try {
    await getProvider().purchase(productId);
    onSuccess(product.coins);
  } catch (e) {
    onError?.(e instanceof Error ? e.message : 'Purchase failed');
  }
}

export { IAP_PRODUCTS };
export type { IAPProduct };
