import type { AdProvider } from './AdProvider';

export class DevModeAdProvider implements AdProvider {
  isAvailable(): boolean {
    return true;
  }

  showRewardedAd(onReward: () => void, onDismiss?: () => void): void {
    const overlay = document.createElement('div');
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;background:rgba(0,0,0,0.95);';

    const title = document.createElement('div');
    title.style.cssText =
      'color:#fff;font-size:20px;font-weight:800;font-family:Nunito,sans-serif;letter-spacing:2px;text-transform:uppercase;';
    title.textContent = 'Advertisement Playing...';

    const timer = document.createElement('div');
    timer.style.cssText =
      'color:rgba(0,212,255,0.9);font-size:56px;font-weight:800;font-family:Nunito,sans-serif;';
    timer.textContent = '3';

    const barOuter = document.createElement('div');
    barOuter.style.cssText =
      'width:220px;height:4px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden;';

    const barFill = document.createElement('div');
    barFill.style.cssText =
      'width:0%;height:100%;background:linear-gradient(90deg,#00d4ff,#00ff88);border-radius:2px;transition:width 3s linear;';
    barOuter.appendChild(barFill);

    overlay.appendChild(title);
    overlay.appendChild(timer);
    overlay.appendChild(barOuter);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      barFill.style.width = '100%';
    });

    let secondsLeft = 3;

    const interval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        timer.textContent = String(secondsLeft);
      } else {
        clearInterval(interval);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        onReward();
      }
    }, 1000);

    void onDismiss;
  }
}
