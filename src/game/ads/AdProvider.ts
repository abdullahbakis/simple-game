export interface AdProvider {
  showRewardedAd(onReward: () => void, onDismiss?: () => void): void;
  isAvailable(): boolean;
}
