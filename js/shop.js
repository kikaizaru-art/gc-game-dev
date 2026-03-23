// ショップ管理 - アプリ内課金の抽象化レイヤー
'use strict';

/* ショップ設定 */
const SHOP_STORAGE_KEY = 'heartQuizShop';

/* 商品ID（Google Play / App Store 共通キー） */
const PRODUCT_ID_AD_FREE = 'ad_free_stamina_recovery';

/**
 * ショップの購入状態を管理するクラス
 * 現在はlocalStorage保存。将来的にGoogle Play Billing / StoreKitに差し替え可能。
 */
class ShopManager {
  constructor() {
    this.purchases = {};
    this.load();
  }

  /* localStorageから購入データを読み込む */
  load() {
    try {
      const saved = localStorage.getItem(SHOP_STORAGE_KEY);
      if (saved) {
        this.purchases = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('ショップデータの読み込みに失敗:', e);
    }
  }

  /* localStorageに購入データを保存する */
  save() {
    try {
      localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(this.purchases));
    } catch (e) {
      console.warn('ショップデータの保存に失敗:', e);
    }
  }

  /**
   * 商品を購入する（モック実装）
   * SDK導入時はここでGoogle Play Billing / StoreKitのAPIを呼ぶ
   * @param {string} productId - 商品ID
   * @returns {Promise<boolean>} 購入成功ならtrue
   */
  async purchase(productId) {
    /*
     * TODO: SDK導入時は以下のように差し替え
     *
     * Google Play Billing:
     * const result = await google.payments.inapp.buy({
     *   sku: productId,
     *   type: 'inapp'
     * });
     *
     * App Store (StoreKit):
     * const result = await window.webkit.messageHandlers.storekit.postMessage({
     *   action: 'purchase',
     *   productId: productId
     * });
     */

    /* モック：即座に購入成功とする */
    this.purchases[productId] = {
      purchasedAt: new Date().toISOString(),
      verified: true
    };
    this.save();
    return true;
  }

  /**
   * 商品が購入済みかどうかを返す
   * @param {string} productId - 商品ID
   * @returns {boolean}
   */
  isPurchased(productId) {
    return !!(this.purchases[productId] && this.purchases[productId].verified);
  }

  /* 広告無しプランが購入済みかどうかを返す */
  isAdFree() {
    return this.isPurchased(PRODUCT_ID_AD_FREE);
  }

  /**
   * 購入状態を復元する（アプリ再インストール時等）
   * SDK導入時はここでレシート検証を行う
   */
  async restorePurchases() {
    /*
     * TODO: SDK導入時は以下のように差し替え
     *
     * Google Play:
     * const purchases = await google.payments.inapp.getPurchases();
     *
     * App Store:
     * const result = await window.webkit.messageHandlers.storekit.postMessage({
     *   action: 'restore'
     * });
     */
    console.log('購入状態の復元（モック）');
    return this.purchases;
  }
}
