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
        misaki: this.createHeroineStats(),
        rin: this.createHeroineStats(),
        hinata: this.createHeroineStats()
      }
    };
  }

  /* ヒロインごとの空の統計データ */
  createHeroineStats() {
    return {
      clears: { happy: 0, normal: 0, bad: 0 },
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
  recordGameResult(heroineId, endingType, quizResults) {
    const heroineStats = this.stats.heroines[heroineId];
    if (!heroineStats) return;

    /* クリア回数を加算 */
    heroineStats.clears[endingType]++;

    /* カテゴリ別正解率を更新 */
    quizResults.forEach(result => {
      const category = result.category || '不明';
      if (!heroineStats.categories[category]) {
        heroineStats.categories[category] = { correct: 0, total: 0 };
      }
      heroineStats.categories[category].total++;
      if (result.isCorrect) {
        heroineStats.categories[category].correct++;
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

  /* ヒロインのカテゴリ別正解率を取得する */
  getCategoryStats(heroineId) {
    return this.stats.heroines[heroineId].categories;
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
