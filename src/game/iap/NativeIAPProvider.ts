import type { IAPProvider, IAPProduct } from './IAPProvider';
import { IAP_PRODUCTS } from './IAPProvider';

declare global {
  interface Window {
    CdvPurchase?: {
      store: {
        register: (products: { type: string; id: string; platform: string }[]) => void;
        initialize: (platforms: string[]) => Promise<void>;
        get: (id: string) => { price?: string } | undefined;
        order: (product: { id: string }) => Promise<{ isError: boolean; message?: string }>;
        when: () => {
          productUpdated: (cb: () => void) => { approved: (cb: (t: { verify: () => void }) => void) => { verified: (cb: (t: { finish: () => void }) => void) => void } };
        };
      };
      ProductType: { CONSUMABLE: string };
      Platform: { GOOGLE_PLAY: string; APPLE_APPSTORE: string };
    };
  }
}

export class NativeIAPProvider implements IAPProvider {
  private initialized = false;
  private products: IAPProduct[] = [];

  isAvailable(): boolean {
    return !!window.CdvPurchase;
  }

  async getProducts(): Promise<IAPProduct[]> {
    if (!this.isAvailable()) return IAP_PRODUCTS;
    if (!this.initialized) await this.initialize();
    return this.products.length > 0 ? this.products : IAP_PRODUCTS;
  }

  private async initialize() {
    if (!window.CdvPurchase) return;
    const { store, ProductType, Platform } = window.CdvPurchase;

    store.register(
      IAP_PRODUCTS.map(p => ({
        type: ProductType.CONSUMABLE,
        id: p.id,
        platform: /iPhone|iPad/.test(navigator.userAgent)
          ? Platform.APPLE_APPSTORE
          : Platform.GOOGLE_PLAY,
      }))
    );

    await store.initialize([
      /iPhone|iPad/.test(navigator.userAgent)
        ? Platform.APPLE_APPSTORE
        : Platform.GOOGLE_PLAY,
    ]);

    this.products = IAP_PRODUCTS.map(p => {
      const storeProduct = store.get(p.id);
      return {
        ...p,
        price: storeProduct?.price ?? p.price,
      };
    });

    this.initialized = true;
  }

  async purchase(productId: string): Promise<void> {
    if (!window.CdvPurchase) throw new Error('IAP not available');
    if (!this.initialized) await this.initialize();
    const result = await window.CdvPurchase.store.order({ id: productId });
    if (result.isError) throw new Error(result.message ?? 'Purchase failed');
  }
}
