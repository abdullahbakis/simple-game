import type { AdProvider } from './ads/AdProvider';
import { DevModeAdProvider } from './ads/DevModeAdProvider';

let provider: AdProvider = new DevModeAdProvider();

export function setAdProvider(p: AdProvider): void {
  provider = p;
}

export function showRewardedAd(onReward: () => void, onDismiss?: () => void): void {
  provider.showRewardedAd(onReward, onDismiss);
}

export function isAdAvailable(): boolean {
  return provider.isAvailable();
}
