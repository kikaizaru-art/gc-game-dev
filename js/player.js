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
    this.quizzesHard = {};
    this.quizzesExpert = {};
    this.quizzesMaster = {};
    this.practiceEasy = {};
    this.practiceNormal = {};
    this.practiceHard = {};
    this.practiceMaster = {};
    this.selectedHeroine = null;
    this.affinity = INITIAL_AFFINITY;
    this.currentQuizIndex = 0;
    this.correctCount = 0;
    this.currentQuizSet = [];
    this.quizResults = [];
  }

  /* ヒロインデータとクイズデータを読み込む */
  async loadData() {
    const urls = [
      'assets/data/heroines.json',
      'assets/data/quizzes.json',
      'assets/data/quizzes-hard.json',
      'assets/data/quizzes-expert.json',
      'assets/data/quizzes-master.json',
      'assets/data/practice-easy.json',
      'assets/data/practice-normal.json',
      'assets/data/practice-hard.json',
      'assets/data/practice-master.json'
    ];

    let responses;
    try {
      responses = await Promise.all(urls.map(url => fetch(url)));
    } catch (err) {
      throw new Error(`データの取得に失敗しました: ${err.message}`);
    }

    /* HTTPエラーをチェックする */
    responses.forEach((res, i) => {
      if (!res.ok) {
        throw new Error(`${urls[i]} の読み込みに失敗しました（${res.status}）`);
      }
    });

    try {
      const [
        heroinesData, quizzesData, quizzesHardData, quizzesExpertData, quizzesMasterData,
        practiceEasyData, practiceNormalData, practiceHardData, practiceMasterData
      ] = await Promise.all(responses.map(res => res.json()));
      this.heroines = heroinesData;
      this.quizzes = quizzesData;
      this.quizzesHard = quizzesHardData;
      this.quizzesExpert = quizzesExpertData;
      this.quizzesMaster = quizzesMasterData;
      this.practiceEasy = practiceEasyData;
      this.practiceNormal = practiceNormalData;
      this.practiceHard = practiceHardData;
      this.practiceMaster = practiceMasterData;
    } catch (err) {
      throw new Error(`データのJSON解析に失敗しました: ${err.message}`);
    }
  }

  /* ヒロインを選択してゲーム状態をリセットする */
  selectHeroine(heroineId, isSecondPlay = false, stage = 1, clearedQuestions = null) {
    this.selectedHeroine = this.heroines.find(h => h.id === heroineId);
    this.isSecondPlay = isSecondPlay;
    this.currentStage = stage;
    this.affinity = INITIAL_AFFINITY;
    this.currentQuizIndex = 0;
    this.correctCount = 0;
    this.currentQuizSet = this.generateQuizSet(heroineId, clearedQuestions);
    this.quizResults = [];
    /* パワーアップの使用済みフラグ（各ステージで各アイテム1回まで） */
    this.usedPowerups = new Set();
    this.usedPowerupsStage = new Set();
  }

  /* クイズセットをシャッフルして指定数を取得する（未確認優先対応） */
  generateQuizSet(heroineId, clearedQuestions = null) {
    let source;
    if (this.currentStage === 4) {
      source = this.quizzesMaster[heroineId];
    } else if (this.currentStage === 3) {
      source = this.quizzesExpert[heroineId];
    } else if (this.currentStage === 2) {
      source = this.quizzesHard[heroineId];
    } else {
      source = this.quizzes[heroineId];
    }
    const allQuizzes = [...source];

    /* 未確認クイズ優先：クリア済み問題を後回しにする */
    if (clearedQuestions && clearedQuestions.size > 0) {
      const unconfirmed = allQuizzes.filter(q => !clearedQuestions.has(q.question));
      const confirmed = allQuizzes.filter(q => clearedQuestions.has(q.question));
      const shuffledUnconfirmed = this.shuffle(unconfirmed);
      const shuffledConfirmed = this.shuffle(confirmed);

      /* 未確認を先に、足りなければ確認済みで補充 */
      return [...shuffledUnconfirmed, ...shuffledConfirmed].slice(0, QUIZ_COUNT);
    }

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

  /* 現在の問題でパワーアップ使用済みかチェックする */
  isPowerupUsedThisQuestion(type) {
    const key = `${this.currentQuizIndex}_${type}`;
    return this.usedPowerups.has(key);
  }

  /* このステージでパワーアップ使用済みかチェックする */
  isPowerupUsedThisStage(type) {
    return this.usedPowerupsStage.has(type);
  }

  /* パワーアップを使用済みにする（問題単位＋ステージ単位） */
  markPowerupUsed(type) {
    const key = `${this.currentQuizIndex}_${type}`;
    this.usedPowerups.add(key);
    this.usedPowerupsStage.add(type);
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
    if (this.currentStage === 4 && this.selectedHeroine.endings4) {
      endings = this.selectedHeroine.endings4;
    } else if (this.currentStage === 3 && this.selectedHeroine.endings3) {
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
