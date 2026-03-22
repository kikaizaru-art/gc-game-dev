// ゲームエンジン - シーン管理・クイズ進行制御
'use strict';

/**
 * ゲーム全体のフロー制御を行うクラス
 */
class GameEngine {
  constructor(heroineManager, uiManager, audioManager) {
    this.heroineManager = heroineManager;
    this.ui = uiManager;
    this.audio = audioManager;
    this.timerId = null;
    this.timeRemaining = QUIZ_TIME_LIMIT;
    this.isAnswering = false;
  }

  /* ゲーム初期化 */
  async init() {
    await this.heroineManager.loadData();
    this.ui.renderHeroineCards(this.heroineManager.heroines);
    this.bindEvents();
    this.ui.showScreen('title');
    console.log('ハートクイズ - 初期化完了');
  }

  /* イベントリスナーを登録する */
  bindEvents() {
    /* タイトル画面 */
    document.getElementById('btn-start').addEventListener('click', () => {
      this.audio.init();
      this.audio.playClick();
      this.audio.startBgm();
      this.ui.showScreen('select');
    });

    /* ミュートボタン */
    document.getElementById('btn-mute').addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      document.getElementById('btn-mute').textContent = muted ? '🔇' : '🔊';
    });

    /* ヒロイン選択画面 */
    document.getElementById('btn-back-title').addEventListener('click', () => {
      this.ui.showScreen('title');
    });

    document.getElementById('heroine-cards').addEventListener('click', (e) => {
      const card = e.target.closest('.heroine-card');
      if (!card) return;
      this.audio.playClick();
      this.startQuiz(card.dataset.heroineId);
    });

    /* 結果画面 */
    document.getElementById('btn-retry').addEventListener('click', () => {
      this.audio.playClick();
      this.audio.startBgm();
      this.startQuiz(this.heroineManager.selectedHeroine.id);
    });

    document.getElementById('btn-back-title-result').addEventListener('click', () => {
      this.audio.playClick();
      this.audio.startBgm();
      this.ui.showScreen('title');
    });

    /* キーボード操作 */
    document.addEventListener('keydown', (e) => {
      if (!this.isAnswering) return;
      const keyMap = { '1': 0, '2': 1, '3': 2 };
      if (keyMap[e.key] !== undefined) {
        this.handleAnswer(keyMap[e.key]);
      }
    });
  }

  /* クイズを開始する */
  startQuiz(heroineId) {
    this.heroineManager.selectHeroine(heroineId);
    this.ui.showScreen('quiz');
    this.showCurrentQuiz();
  }

  /* 現在のクイズを画面に表示する */
  showCurrentQuiz() {
    const quiz = this.heroineManager.getCurrentQuiz();
    const heroine = this.heroineManager.selectedHeroine;

    this.ui.renderQuiz({
      quiz,
      heroine,
      questionNumber: this.heroineManager.currentQuizIndex + 1,
      totalQuestions: QUIZ_COUNT,
      affinity: this.heroineManager.affinity
    });

    this.ui.hideFeedback();
    this.isAnswering = true;
    this.startTimer();

    /* 選択肢のクリックイベント（新しいボタンなのでリスナー重複なし） */
    const choiceBtns = document.querySelectorAll('.choice-btn');
    choiceBtns.forEach((btn, index) => {
      const handler = () => this.handleAnswer(index);
      btn.addEventListener('click', handler);
    });
  }

  /* 回答を処理する */
  handleAnswer(choiceIndex) {
    if (!this.isAnswering) return;
    this.isAnswering = false;
    this.stopTimer();

    const result = this.heroineManager.answerQuiz(choiceIndex);
    this.audio[result.isCorrect ? 'playCorrect' : 'playWrong']();
    this.ui.showAnswerResult(result, choiceIndex);

    /* フィードバック表示後に次へ進む */
    setTimeout(() => {
      const isFinished = this.heroineManager.nextQuiz();
      if (isFinished) {
        this.showResult();
      } else {
        this.showCurrentQuiz();
      }
    }, FEEDBACK_DISPLAY_MS);
  }

  /* 時間切れ処理 */
  handleTimeout() {
    if (!this.isAnswering) return;
    this.isAnswering = false;

    /* 時間切れは不正解扱い（-1は無効な選択肢） */
    const result = this.heroineManager.answerQuiz(-1);
    this.audio.playTimeout();
    this.ui.showTimeoutResult(result);

    setTimeout(() => {
      const isFinished = this.heroineManager.nextQuiz();
      if (isFinished) {
        this.showResult();
      } else {
        this.showCurrentQuiz();
      }
    }, FEEDBACK_DISPLAY_MS);
  }

  /* タイマーを開始する */
  startTimer() {
    this.timeRemaining = QUIZ_TIME_LIMIT;
    this.ui.updateTimer(this.timeRemaining, QUIZ_TIME_LIMIT);

    this.timerId = setInterval(() => {
      this.timeRemaining -= TIMER_STEP;
      this.ui.updateTimer(this.timeRemaining, QUIZ_TIME_LIMIT);

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeout();
      }
    }, TIMER_INTERVAL_MS);
  }

  /* タイマーを停止する */
  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /* 結果画面を表示する */
  showResult() {
    const endingData = this.heroineManager.getEndingData();
    this.audio.stopBgm();
    this.audio.playEnding(endingData.type);
    this.ui.renderResult(endingData);
    this.ui.showScreen('result');
  }
}
