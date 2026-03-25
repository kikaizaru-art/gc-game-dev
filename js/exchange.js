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

/* 着せ替えアイテム定義 */
const EXCHANGE_ITEMS = [
  {
    id: 'ribbon',
    name: 'リボン',
    icon: '🎀',
    category: '髪飾り',
    price: 50,
    description: 'かわいいリボンの髪飾り',
    cssClass: 'dressup-ribbon'
  },
  {
    id: 'flower_crown',
    name: '花かんむり',
    icon: '🌸',
    category: '髪飾り',
    price: 100,
    description: '春の花をあしらったかんむり',
    cssClass: 'dressup-flower-crown'
  },
  {
    id: 'tiara',
    name: 'ティアラ',
    icon: '👑',
    category: '髪飾り',
    price: 200,
    description: 'キラキラ輝くお姫様のティアラ',
    cssClass: 'dressup-tiara'
  },
  {
    id: 'heart_earrings',
    name: 'ハートピアス',
    icon: '💖',
    category: 'アクセサリー',
    price: 80,
    description: 'ハート型のかわいいピアス',
    cssClass: 'dressup-heart-earrings'
  },
  {
    id: 'star_brooch',
    name: '星のブローチ',
    icon: '⭐',
    category: 'アクセサリー',
    price: 120,
    description: '星が輝くおしゃれなブローチ',
    cssClass: 'dressup-star-brooch'
  },
  {
    id: 'butterfly_pin',
    name: '蝶のヘアピン',
    icon: '🦋',
    category: 'アクセサリー',
    price: 150,
    description: '優雅な蝶モチーフのヘアピン',
    cssClass: 'dressup-butterfly-pin'
  },
  {
    id: 'cat_ears',
    name: 'ねこ耳',
    icon: '🐱',
    category: '髪飾り',
    price: 180,
    description: 'もふもふのねこ耳カチューシャ',
    cssClass: 'dressup-cat-ears'
  },
  {
    id: 'magic_wand',
    name: '魔法のステッキ',
    icon: '🪄',
    category: 'アクセサリー',
    price: 250,
    description: '魔法少女のステッキ',
    cssClass: 'dressup-magic-wand'
  },
  {
    id: 'angel_wings',
    name: '天使の羽',
    icon: '🪽',
    category: 'スペシャル',
    price: 500,
    description: 'ふわふわの天使の羽',
    cssClass: 'dressup-angel-wings'
  },
  {
    id: 'sparkle_frame',
    name: 'キラキラフレーム',
    icon: '✨',
    category: 'スペシャル',
    price: 300,
    description: 'キャラを彩るキラキラ装飾',
    cssClass: 'dressup-sparkle-frame'
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
      equippedItems: []
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

  /* アイテムを装備する */
  equipItem(itemId) {
    if (!this.ownsItem(itemId)) return false;
    if (!this.data.equippedItems.includes(itemId)) {
      this.data.equippedItems.push(itemId);
      this.save();
    }
    return true;
  }

  /* アイテムの装備を外す */
  unequipItem(itemId) {
    const idx = this.data.equippedItems.indexOf(itemId);
    if (idx === -1) return false;
    this.data.equippedItems.splice(idx, 1);
    this.save();
    return true;
  }

  /* アイテムが装備中か判定する */
  isEquipped(itemId) {
    return this.data.equippedItems.includes(itemId);
  }

  /* 装備中のアイテム一覧を取得する */
  getEquippedItems() {
    return this.data.equippedItems
      .map(id => EXCHANGE_ITEMS.find(i => i.id === id))
      .filter(Boolean);
  }

  /* 全アイテム定義を取得する */
  getAllItems() {
    return EXCHANGE_ITEMS;
  }

  /* カテゴリ一覧を取得する */
  getCategories() {
    const cats = new Set();
    EXCHANGE_ITEMS.forEach(item => cats.add(item.category));
    return [...cats];
  }

  /* データをリセットする */
  reset() {
    this.data = this.createEmpty();
    this.save();
  }
}
