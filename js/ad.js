// 広告管理 - 将来のSDK組み込みに備えた抽象化レイヤー
'use strict';

/* 広告設定 */
const AD_MOCK_DURATION_MS = 3000; // モック広告の表示時間（3秒）
const AD_STAMINA_REWARD = 1; // 広告視聴で回復するスタミナ数

/**
 * 広告表示を管理するクラス
 * 現在はモック実装。将来的にSDK（AdMob等）を差し替え可能な設計。
 */
class AdManager {
  constructor() {
    this.isAdReady = true;
    this.isShowing = false;
  }

  /**
   * 広告が視聴可能かどうかを返す
   * SDK導入時はここで広告のロード状態を確認する
   */
  isRewardedAdReady() {
    /* TODO: SDK導入時は sdk.isRewardedReady() に置き換え */
    return this.isAdReady && !this.isShowing;
  }

  /**
   * リワード広告を表示し、視聴完了時にコールバックを呼ぶ
   * @param {Function} onRewarded - 視聴完了時のコールバック
   * @param {Function} onClosed - 広告閉じた時のコールバック（報酬なし含む）
   */
  showRewardedAd(onRewarded, onClosed) {
    if (this.isShowing) return;
    this.isShowing = true;

    /* TODO: SDK導入時は以下をSDKの広告表示APIに置き換え */
    /*
     * 例: AdMob の場合
     * admob.showRewardedAd({
     *   onUserEarnedReward: () => { onRewarded(); },
     *   onAdDismissed: () => { onClosed(); this.isShowing = false; },
     * });
     */
    this.showMockAd(onRewarded, onClosed);
  }

  /* モック広告を表示する（開発用） */
  showMockAd(onRewarded, onClosed) {
    const overlay = document.getElementById('ad-overlay');
    const progressBar = document.getElementById('ad-progress-bar');
    const closeBtn = document.getElementById('ad-close-btn');

    overlay.classList.remove('hidden');
    progressBar.style.width = '0%';
    closeBtn.style.display = 'none';

    /* プログレスバーのアニメーション */
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / AD_MOCK_DURATION_MS) * 100, 100);
      progressBar.style.width = `${pct}%`;

      if (pct >= 100) {
        clearInterval(progressInterval);
        closeBtn.style.display = '';
      }
    }, 50);

    /* 閉じるボタンの処理 */
    const handleClose = () => {
      closeBtn.removeEventListener('click', handleClose);
      overlay.classList.add('hidden');
      this.isShowing = false;
      onRewarded();
      if (onClosed) onClosed();
    };
    closeBtn.addEventListener('click', handleClose);
  }
}
