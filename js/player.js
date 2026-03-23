// ヒロイン・親密度管理
'use strict';

/* 親密度の初期値・上限・下限 */
const INITIAL_AFFINITY = 50;
const MAX_AFFINITY = 100;
const MIN_AFFINITY = 0;
const AFFINITY_CORRECT = 10;
const AFFINITY_WRONG = -5;

/* エンディング判定の閾値 */
const THRESHOLD_HAPPY = 80;
const THRESHOLD_BAD = 40;

/* クイズ設定 */
const QUIZ_COUNT = 10;
const QUIZ_TIME_LIMIT = 15;

/* UI制御 */
const FEEDBACK_DISPLAY_MS = 2000;
const TIMER_INTERVAL_MS = 100;
const TIMER_STEP = 0.1;

/**
 * ヒロインデータとクイズデータを管理するクラス
 */
class HeroineManager {
  constructor() {
    this.heroines = [];
    this.quizzes = {};
    this.selectedHeroine = null;
    this.affinity = INITIAL_AFFINITY;
    this.currentQuizIndex = 0;
    this.correctCount = 0;
    this.currentQuizSet = [];
    this.quizResults = [];
  }

  /* ヒロインデータを読み込む */
  async loadData() {
    const [heroinesRes, quizzesRes] = await Promise.all([
      fetch('assets/data/heroines.json'),
      fetch('assets/data/quizzes.json')
    ]);
    this.heroines = await heroinesRes.json();
    this.quizzes = await quizzesRes.json();
  }

  /* ヒロインを選択してゲーム状態をリセットする */
  selectHeroine(heroineId) {
    this.selectedHeroine = this.heroines.find(h => h.id === heroineId);
    this.affinity = INITIAL_AFFINITY;
    this.currentQuizIndex = 0;
    this.correctCount = 0;
    this.currentQuizSet = this.generateQuizSet(heroineId);
    this.quizResults = [];
  }

  /* クイズセットをシャッフルして指定数を取得する */
  generateQuizSet(heroineId) {
    const allQuizzes = [...this.quizzes[heroineId]];
    return this.shuffle(allQuizzes).slice(0, QUIZ_COUNT);
  }

  /* 配列をシャッフルする（Fisher-Yates） */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /* 現在のクイズを取得する */
  getCurrentQuiz() {
    return this.currentQuizSet[this.currentQuizIndex];
  }

  /* 正誤結果を受け取りスコアを更新する */
  recordAnswer(isCorrect) {
    const quiz = this.getCurrentQuiz();

    if (isCorrect) {
      this.affinity = Math.min(MAX_AFFINITY, this.affinity + AFFINITY_CORRECT);
      this.correctCount++;
    } else {
      this.affinity = Math.max(MIN_AFFINITY, this.affinity + AFFINITY_WRONG);
    }

    /* カテゴリ別の結果を記録 */
    this.quizResults.push({
      category: quiz.category || '不明',
      isCorrect
    });

    return {
      isCorrect,
      comment: quiz.comment,
      affinity: this.affinity
    };
  }

  /* 次のクイズに進む。全問終了ならtrueを返す */
  nextQuiz() {
    this.currentQuizIndex++;
    return this.currentQuizIndex >= QUIZ_COUNT;
  }

  /* エンディングの種類を判定する */
  getEndingType() {
    if (this.affinity >= THRESHOLD_HAPPY) return 'happy';
    if (this.affinity < THRESHOLD_BAD) return 'bad';
    return 'normal';
  }

  /* エンディングデータを取得する */
  getEndingData() {
    const type = this.getEndingType();
    return {
      type,
      ...this.selectedHeroine.endings[type],
      heroine: this.selectedHeroine,
      affinity: this.affinity,
      correctCount: this.correctCount,
      totalQuestions: QUIZ_COUNT
    };
  }
}
