// ポイント交換所 - ポイント管理＆着せ替えアイテム交換
'use strict';

/* localStorageのキー */
const EXCHANGE_STORAGE_KEY = 'heartQuizExchange';

/* ポイント獲得量 */
const POINTS_PER_CORRECT = 10;
const POINTS_ENDING_HAPPY = 100;
const POINTS_ENDING_NORMAL = 50;
const POINTS_ENDING_BAD = 20;
const POINTS_PERFECT_BONUS = 200;
const POINTS_TIME_ATTACK = 30;
const POINTS_ENDURANCE_PER_STREAK = 5;

/* 着せ替えアイテム定義（服のみ） */
const EXCHANGE_ITEMS = [
  {
    id: 'school_uniform',
    name: 'セーラー服',
    icon: '🎒',
    price: 50,
    description: '清楚なセーラー服。学園の定番スタイル',
    cssClass: 'outfit-school-uniform'
  },
  {
    id: 'casual_onepiece',
    name: 'カジュアルワンピ',
    icon: '👗',
    price: 100,
    description: 'ふんわり可愛いカジュアルワンピース',
    cssClass: 'outfit-casual-onepiece'
  },
  {
    id: 'gothic_dress',
    name: 'ゴシックドレス',
    icon: '🖤',
    price: 150,
    description: 'ダークでクールなゴシックドレス',
    cssClass: 'outfit-gothic-dress'
  },
  {
    id: 'kimono',
    name: '着物',
    icon: '👘',
    price: 200,
    description: '華やかな和装スタイル',
    cssClass: 'outfit-kimono'
  },
  {
    id: 'idol_costume',
    name: 'アイドル衣装',
    icon: '🎤',
    price: 250,
    description: 'キラキラ輝くステージ衣装',
    cssClass: 'outfit-idol-costume'
  },
  {
    id: 'maid_outfit',
    name: 'メイド服',
    icon: '🫖',
    price: 180,
    description: 'フリルたっぷりのメイド服',
    cssClass: 'outfit-maid'
  },
  {
    id: 'sports_wear',
    name: 'スポーツウェア',
    icon: '🏃',
    price: 120,
    description: '元気いっぱいスポーティースタイル',
    cssClass: 'outfit-sports'
  },
  {
    id: 'princess_dress',
    name: 'プリンセスドレス',
    icon: '👑',
    price: 500,
    description: '豪華絢爛なお姫様ドレス',
    cssClass: 'outfit-princess'
  }
];

/**
 * ポイント交換所を管理するクラス
 */
class ExchangeManager {
  constructor() {
    this.data = this.load();
  }

  /* localStorageからデータを読み込む */
  load() {
    try {
      const saved = localStorage.getItem(EXCHANGE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('交換所データの読み込みに失敗:', e);
    }
    return this.createEmpty();
  }

  /* 空のデータを作成する */
  createEmpty() {
    return {
      points: 0,
      totalEarned: 0,
      ownedItems: [],
      equippedItem: null
    };
  }

  /* localStorageに保存する */
  save() {
    try {
      localStorage.setItem(EXCHANGE_STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('交換所データの保存に失敗:', e);
    }
  }

  /* 現在のポイントを取得する */
  getPoints() {
    return this.data.points;
  }

  /* 累計獲得ポイントを取得する */
  getTotalEarned() {
    return this.data.totalEarned;
  }

  /* ポイントを加算する */
  addPoints(amount) {
    if (amount <= 0) return;
    this.data.points += amount;
    this.data.totalEarned += amount;
    this.save();
  }

  /* クイズ結果からポイントを計算して加算する */
  awardQuizPoints(correctCount, totalCount, endingType) {
    let earned = correctCount * POINTS_PER_CORRECT;
    /* エンディングボーナス */
    if (endingType === 'happy') earned += POINTS_ENDING_HAPPY;
    else if (endingType === 'normal') earned += POINTS_ENDING_NORMAL;
    else earned += POINTS_ENDING_BAD;
    /* パーフェクトボーナス */
    if (correctCount === totalCount) earned += POINTS_PERFECT_BONUS;
    this.addPoints(earned);
    return earned;
  }

  /* タイムアタック完了時のポイントを加算する */
  awardTimeAttackPoints(correctCount) {
    const earned = POINTS_TIME_ATTACK + (correctCount * 5);
    this.addPoints(earned);
    return earned;
  }

  /* 耐久クイズ完了時のポイントを加算する */
  awardEndurancePoints(streak) {
    const earned = streak * POINTS_ENDURANCE_PER_STREAK;
    this.addPoints(earned);
    return earned;
  }

  /* アイテムを所持しているか判定する */
  ownsItem(itemId) {
    return this.data.ownedItems.includes(itemId);
  }

  /* アイテムを交換（購入）する */
  purchaseItem(itemId) {
    const item = EXCHANGE_ITEMS.find(i => i.id === itemId);
    if (!item) return { success: false, reason: 'アイテムが見つかりません' };
    if (this.ownsItem(itemId)) return { success: false, reason: '既に所持しています' };
    if (this.data.points < item.price) return { success: false, reason: 'ポイントが足りません' };

    this.data.points -= item.price;
    this.data.ownedItems.push(itemId);
    this.save();
    return { success: true };
  }

  /* 服を着替える（1着のみ装備可能） */
  equipItem(itemId) {
    if (!this.ownsItem(itemId)) return false;
    this.data.equippedItem = itemId;
    this.save();
    return true;
  }

  /* 服を脱ぐ（デフォルトに戻す） */
  unequipItem() {
    this.data.equippedItem = null;
    this.save();
    return true;
  }

  /* 装備中の服のIDを取得する */
  getEquippedItemId() {
    return this.data.equippedItem || null;
  }

  /* 装備中の服のアイテム情報を取得する */
  getEquippedItem() {
    if (!this.data.equippedItem) return null;
    return EXCHANGE_ITEMS.find(i => i.id === this.data.equippedItem) || null;
  }

  /* アイテムが装備中か判定する */
  isEquipped(itemId) {
    return this.data.equippedItem === itemId;
  }

  /* 所持アイテム一覧を取得する */
  getOwnedItems() {
    return this.data.ownedItems
      .map(id => EXCHANGE_ITEMS.find(i => i.id === id))
      .filter(Boolean);
  }

  /* 全アイテム定義を取得する */
  getAllItems() {
    return EXCHANGE_ITEMS;
  }

  /* データをリセットする */
  reset() {
    this.data = this.createEmpty();
    this.save();
  }
}
