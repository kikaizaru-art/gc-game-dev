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

/* パワーアップ設定 */
const POWERUP_FIFTY_FIFTY_COUNT = 1;
const POWERUP_HINT_COUNT = 1;
const POWERUP_ASK_COUNT = 1;

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
    this.quizzesHard = {};
    this.quizzesExpert = {};
    this.selectedHeroine = null;
    this.affinity = INITIAL_AFFINITY;
    this.currentQuizIndex = 0;
    this.correctCount = 0;
    this.currentQuizSet = [];
    this.quizResults = [];
  }

  /* ヒロインデータとクイズデータを読み込む */
  async loadData() {
    const [heroinesRes, quizzesRes, quizzesHardRes, quizzesExpertRes] = await Promise.all([
      fetch('assets/data/heroines.json'),
      fetch('assets/data/quizzes.json'),
      fetch('assets/data/quizzes-hard.json'),
      fetch('assets/data/quizzes-expert.json')
    ]);
    this.heroines = await heroinesRes.json();
    this.quizzes = await quizzesRes.json();
    this.quizzesHard = await quizzesHardRes.json();
    this.quizzesExpert = await quizzesExpertRes.json();
  }

  /* ヒロインを選択してゲーム状態をリセットする */
  selectHeroine(heroineId, isSecondPlay = false, stage = 1) {
    this.selectedHeroine = this.heroines.find(h => h.id === heroineId);
    this.isSecondPlay = isSecondPlay;
    this.currentStage = stage;
    this.affinity = INITIAL_AFFINITY;
    this.currentQuizIndex = 0;
    this.correctCount = 0;
    this.currentQuizSet = this.generateQuizSet(heroineId);
    this.quizResults = [];
    this.powerups = {
      fiftyFifty: POWERUP_FIFTY_FIFTY_COUNT,
      hint: POWERUP_HINT_COUNT,
      ask: POWERUP_ASK_COUNT
    };
  }

  /* クイズセットをシャッフルして指定数を取得する */
  generateQuizSet(heroineId) {
    let source;
    if (this.currentStage === 3) {
      source = this.quizzesExpert[heroineId];
    } else if (this.currentStage === 2) {
      source = this.quizzesHard[heroineId];
    } else {
      source = this.quizzes[heroineId];
    }
    const allQuizzes = [...source];
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

    /* カテゴリ別の結果を記録（問題テキストも含む） */
    this.quizResults.push({
      category: quiz.category || '不明',
      question: quiz.question,
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

  /* ヒロインがヒントコメントを生成する */
  generateHintComment() {
    const quiz = this.getCurrentQuiz();
    const answer = quiz.choices[quiz.correct];
    const heroine = this.selectedHeroine;
    const firstChar = answer.charAt(0);
    const templates = [
      `うーんとね…「${firstChar}」から始まる言葉だよ！`,
      `ヒントだよ！ 最初の文字は「${firstChar}」！`,
      `えへへ、教えちゃう♪ 「${firstChar}」で始まるよ！`,
      `これは内緒だけど…「${firstChar}」が最初の文字だよ！`
    ];
    const randomIndex = Math.floor(Math.random() * templates.length);
    return `${heroine.shortName}「${templates[randomIndex]}」`;
  }

  /* パワーアップを使用する（残り回数を減らす） */
  usePowerup(type) {
    if (this.powerups[type] > 0) {
      this.powerups[type]--;
      return true;
    }
    return false;
  }

  /* パワーアップの残り回数を取得する */
  getPowerupCount(type) {
    return this.powerups[type] || 0;
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
    let endings;
    if (this.currentStage === 3 && this.selectedHeroine.endings3) {
      endings = this.selectedHeroine.endings3;
    } else if (this.currentStage === 2 && this.selectedHeroine.endings2) {
      endings = this.selectedHeroine.endings2;
    } else {
      endings = this.selectedHeroine.endings;
    }
    return {
      type,
      ...endings[type],
      heroine: this.selectedHeroine,
      affinity: this.affinity,
      correctCount: this.correctCount,
      totalQuestions: QUIZ_COUNT,
      currentStage: this.currentStage || 1
    };
  }
}
