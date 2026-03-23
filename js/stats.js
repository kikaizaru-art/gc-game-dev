// ステータス管理 - クリア回数・正解率の記録と取得
'use strict';

/* localStorageのキー */
const STATS_STORAGE_KEY = 'heartQuizStats';

/**
 * プレイ統計を管理するクラス
 */
class StatsManager {
  constructor() {
    this.stats = this.load();
  }

  /* localStorageから統計データを読み込む */
  load() {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('統計データの読み込みに失敗:', e);
    }
    return this.createEmpty();
  }

  /* 空の統計データを作成する */
  createEmpty() {
    return {
      heroines: {
        misaki: { clears: { happy: 0, normal: 0, bad: 0 }, stage2Clears: { happy: 0, normal: 0, bad: 0 } },
        rin: { clears: { happy: 0, normal: 0, bad: 0 }, stage2Clears: { happy: 0, normal: 0, bad: 0 } },
        hinata: { clears: { happy: 0, normal: 0, bad: 0 }, stage2Clears: { happy: 0, normal: 0, bad: 0 } }
      },
      categories: {}
    };
  }

  /* localStorageに保存する */
  save() {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(this.stats));
    } catch (e) {
      console.warn('統計データの保存に失敗:', e);
    }
  }

  /* ゲームクリア時に結果を記録する */
  recordGameResult(heroineId, endingType, quizResults, stage) {
    const heroineStats = this.stats.heroines[heroineId];
    if (!heroineStats) return;

    /* stage2Clearsが未初期化なら追加（既存データ互換） */
    if (!heroineStats.stage2Clears) {
      heroineStats.stage2Clears = { happy: 0, normal: 0, bad: 0 };
    }

    /* クリア回数を加算 */
    if (stage === 2) {
      heroineStats.stage2Clears[endingType]++;
    } else {
      heroineStats.clears[endingType]++;
    }

    /* 全体のカテゴリ別正解率を更新 */
    if (!this.stats.categories) this.stats.categories = {};
    quizResults.forEach(result => {
      const category = result.category || '不明';
      if (!this.stats.categories[category]) {
        this.stats.categories[category] = { correct: 0, total: 0 };
      }
      this.stats.categories[category].total++;
      if (result.isCorrect) {
        this.stats.categories[category].correct++;
      }
    });

    this.save();
  }

  /* ヒロインの合計クリア回数を取得する */
  getTotalClears(heroineId) {
    const clears = this.stats.heroines[heroineId].clears;
    return clears.happy + clears.normal + clears.bad;
  }

  /* ヒロインのエンディング別クリア回数を取得する */
  getClearsByType(heroineId) {
    return this.stats.heroines[heroineId].clears;
  }

  /* 全体のカテゴリ別正解率を取得する */
  getAllCategoryStats() {
    return this.stats.categories || {};
  }

  /* ヒロインのハッピーエンドクリア済みかを判定する */
  hasHappyEnd(heroineId) {
    return this.stats.heroines[heroineId].clears.happy >= 1;
  }

  /* ヒロインの最高到達点を取得する（表示用テキスト） */
  getBestProgress(heroineId) {
    const h = this.stats.heroines[heroineId];
    if (!h) return null;
    const s2 = h.stage2Clears || { happy: 0, normal: 0, bad: 0 };

    /* ステージ2の最高エンディングを判定 */
    if (s2.happy > 0) return { stage: 2, ending: 'happy', label: 'STAGE 2 - ハッピーエンド' };
    if (s2.normal > 0) return { stage: 2, ending: 'normal', label: 'STAGE 2 - ノーマルエンド' };
    if (s2.bad > 0) return { stage: 2, ending: 'bad', label: 'STAGE 2 - バッドエンド' };

    /* ステージ1の最高エンディングを判定 */
    if (h.clears.happy > 0) return { stage: 1, ending: 'happy', label: 'STAGE 1 - ハッピーエンド' };
    if (h.clears.normal > 0) return { stage: 1, ending: 'normal', label: 'STAGE 1 - ノーマルエンド' };
    if (h.clears.bad > 0) return { stage: 1, ending: 'bad', label: 'STAGE 1 - バッドエンド' };

    return null;
  }

  /* 全ヒロインの合計クリア回数を取得する */
  getAllTotalClears() {
    let total = 0;
    Object.keys(this.stats.heroines).forEach(id => {
      total += this.getTotalClears(id);
    });
    return total;
  }

  /* 統計データをリセットする */
  reset() {
    this.stats = this.createEmpty();
    this.save();
  }
}
