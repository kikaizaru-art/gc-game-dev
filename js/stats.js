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
        misaki: { clears: { happy: 0, normal: 0, bad: 0 }, stage2Clears: { happy: 0, normal: 0, bad: 0 }, stage3Clears: { happy: 0, normal: 0, bad: 0 }, categories: {} },
        rin: { clears: { happy: 0, normal: 0, bad: 0 }, stage2Clears: { happy: 0, normal: 0, bad: 0 }, stage3Clears: { happy: 0, normal: 0, bad: 0 }, categories: {} },
        hinata: { clears: { happy: 0, normal: 0, bad: 0 }, stage2Clears: { happy: 0, normal: 0, bad: 0 }, stage3Clears: { happy: 0, normal: 0, bad: 0 }, categories: {} }
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

    /* 既存データ互換：未初期化なら追加 */
    if (!heroineStats.stage2Clears) {
      heroineStats.stage2Clears = { happy: 0, normal: 0, bad: 0 };
    }
    if (!heroineStats.stage3Clears) {
      heroineStats.stage3Clears = { happy: 0, normal: 0, bad: 0 };
    }

    /* クリア回数を加算 */
    if (stage === 3) {
      heroineStats.stage3Clears[endingType]++;
    } else if (stage === 2) {
      heroineStats.stage2Clears[endingType]++;
    } else {
      heroineStats.clears[endingType]++;
    }

    /* キャラ別カテゴリのクリア済み問題を更新 */
    if (!heroineStats.categories) heroineStats.categories = {};
    quizResults.forEach(result => {
      if (!result.isCorrect) return;
      const category = result.category || '不明';
      if (!heroineStats.categories[category]) {
        heroineStats.categories[category] = { clearedQuestions: [] };
      }
      const cat = heroineStats.categories[category];
      /* 既存データ互換：旧形式からの移行 */
      if (!cat.clearedQuestions) cat.clearedQuestions = [];
      /* 重複しないように追加 */
      if (!cat.clearedQuestions.includes(result.question)) {
        cat.clearedQuestions.push(result.question);
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

  /* キャラ別のカテゴリデータを取得する */
  getHeroineCategoryStats(heroineId) {
    const h = this.stats.heroines[heroineId];
    return (h && h.categories) ? h.categories : {};
  }

  /* キャラ別のカテゴリクリア状況を取得する（問題単位） */
  getHeroineCategoryClearStatus(heroineId, quizCountByCategory) {
    const cats = this.getHeroineCategoryStats(heroineId);
    return Object.keys(quizCountByCategory).map(cat => {
      const catData = cats[cat];
      const cleared = catData && catData.clearedQuestions ? catData.clearedQuestions.length : 0;
      return {
        name: cat,
        cleared,
        total: quizCountByCategory[cat]
      };
    });
  }

  /* キャラ別データのみリセットする */
  resetHeroine(heroineId) {
    const h = this.stats.heroines[heroineId];
    if (!h) return;
    h.clears = { happy: 0, normal: 0, bad: 0 };
    h.stage2Clears = { happy: 0, normal: 0, bad: 0 };
    h.stage3Clears = { happy: 0, normal: 0, bad: 0 };
    h.categories = {};
    this.save();
  }

  /* ヒロインのステージ1ハッピーエンドクリア済みかを判定する */
  hasHappyEnd(heroineId) {
    return this.stats.heroines[heroineId].clears.happy >= 1;
  }

  /* ヒロインのステージ2ハッピーエンドクリア済みかを判定する */
  hasStage2HappyEnd(heroineId) {
    const s2 = this.stats.heroines[heroineId].stage2Clears;
    return s2 && s2.happy >= 1;
  }

  /* ヒロインの最高到達点を取得する（表示用テキスト） */
  getBestProgress(heroineId) {
    const h = this.stats.heroines[heroineId];
    if (!h) return null;
    const s3 = h.stage3Clears || { happy: 0, normal: 0, bad: 0 };
    const s2 = h.stage2Clears || { happy: 0, normal: 0, bad: 0 };

    /* ステージ3（HARD）の最高エンディングを判定 */
    if (s3.happy > 0) return { stage: 3, ending: 'happy', label: 'STAGE 3 HARD - パーフェクト' };
    if (s3.normal > 0) return { stage: 3, ending: 'normal', label: 'STAGE 3 HARD - ノーマル' };
    if (s3.bad > 0) return { stage: 3, ending: 'bad', label: 'STAGE 3 HARD - バッド' };

    /* ステージ2（NORMAL）の最高エンディングを判定 */
    if (s2.happy > 0) return { stage: 2, ending: 'happy', label: 'STAGE 2 NORMAL - ハッピー' };
    if (s2.normal > 0) return { stage: 2, ending: 'normal', label: 'STAGE 2 NORMAL - ノーマル' };
    if (s2.bad > 0) return { stage: 2, ending: 'bad', label: 'STAGE 2 NORMAL - バッド' };

    /* ステージ1（EASY）の最高エンディングを判定 */
    if (h.clears.happy > 0) return { stage: 1, ending: 'happy', label: 'STAGE 1 EASY - ハッピー' };
    if (h.clears.normal > 0) return { stage: 1, ending: 'normal', label: 'STAGE 1 EASY - ノーマル' };
    if (h.clears.bad > 0) return { stage: 1, ending: 'bad', label: 'STAGE 1 EASY - バッド' };

    return null;
  }

  /* ヒロインのステージ3ハッピーエンドクリア済みかを判定する */
  hasStage3HappyEnd(heroineId) {
    const s3 = this.stats.heroines[heroineId].stage3Clears;
    return s3 && s3.happy >= 1;
  }

  /* ヒロインの全クイズクリア済みかを判定する */
  hasAllQuizzesCleared(heroineId, totalQuizCount) {
    const cats = this.getHeroineCategoryStats(heroineId);
    let clearedCount = 0;
    Object.values(cats).forEach(cat => {
      if (cat.clearedQuestions) {
        clearedCount += cat.clearedQuestions.length;
      }
    });
    return totalQuizCount > 0 && clearedCount >= totalQuizCount;
  }

  /* ヒロインが解放済みかを判定する（美咲は常に解放、他は美咲ステージ1ハッピーエンドで解放） */
  isHeroineUnlocked(heroineId) {
    if (heroineId === 'misaki') return true;
    return this.hasHappyEnd('misaki');
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
