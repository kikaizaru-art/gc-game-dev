// ゲームエンジン - シーン管理・クイズ進行制御
'use strict';

/**
 * ゲーム全体のフロー制御を行うクラス
 */
class GameEngine {
  constructor(heroineManager, uiManager, audioManager, statsManager) {
    this.heroineManager = heroineManager;
    this.ui = uiManager;
    this.audio = audioManager;
    this.stats = statsManager;
    this.timerId = null;
    this.timeRemaining = QUIZ_TIME_LIMIT;
    this.isAnswering = false;
    this.activeStatsHeroineId = 'all';
  }

  /* ゲーム初期化 */
  async init() {
    await this.heroineManager.loadData();
    this.ui.renderHeroineCards(this.heroineManager.heroines, this.stats, this.getQuizCountByHeroine());
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
      this.ui.renderHeroineCards(this.heroineManager.heroines, this.stats, this.getQuizCountByHeroine());
      this.ui.showScreen('select');
    });

    /* ミュートボタン */
    document.getElementById('btn-mute').addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      document.getElementById('btn-mute').textContent = muted ? '🔇' : '🔊';
    });

    /* ステータス画面 */
    document.getElementById('btn-stats').addEventListener('click', () => {
      this.audio.init();
      this.audio.playClick();
      this.showStatsScreen();
    });

    document.getElementById('btn-back-title-stats').addEventListener('click', () => {
      this.audio.playClick();
      this.ui.showScreen('title');
    });

    document.getElementById('btn-stats-reset').addEventListener('click', () => {
      this.audio.playClick();
      if (confirm('プレイデータをすべてリセットしますか？')) {
        this.stats.reset();
        this.showStatsScreen();
      }
    });

    document.getElementById('stats-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.stats-tab');
      if (!tab) return;
      this.audio.playClick();
      this.activeStatsHeroineId = tab.dataset.heroineId;
      this.showStatsScreen();
    });

    /* キャラ別データリセット */
    document.getElementById('stats-content').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-reset-heroine]');
      if (!btn) return;
      this.audio.playClick();
      const heroineId = btn.dataset.resetHeroine;
      const heroine = this.heroineManager.heroines.find(h => h.id === heroineId);
      const name = heroine ? heroine.shortName : heroineId;
      if (confirm(`${name}のプレイデータをリセットしますか？`)) {
        this.stats.resetHeroine(heroineId);
        this.showStatsScreen();
      }
    });

    /* ヒロイン選択画面 */
    document.getElementById('btn-back-title').addEventListener('click', () => {
      this.ui.showScreen('title');
    });

    document.getElementById('heroine-cards').addEventListener('click', (e) => {
      const card = e.target.closest('.heroine-card');
      if (!card || card.classList.contains('locked')) return;
      this.audio.playClick();
      const heroineId = card.dataset.heroineId;
      /* ハッピーエンド達成済みならステージ選択画面を表示 */
      if (this.stats.hasHappyEnd(heroineId)) {
        this.pendingHeroineId = heroineId;
        const heroine = this.heroineManager.heroines.find(h => h.id === heroineId);
        this.ui.renderStageSelect(heroine, this.stats);
        this.ui.showScreen('stageSelect');
      } else if (this.stats.getTotalClears(heroineId) > 0) {
        /* クリア済みだがハッピーエンド未達成 → やり直しストーリー */
        this.startRetry(heroineId);
      } else {
        this.startStory(heroineId);
      }
    });

    /* ステージ選択画面 */
    document.getElementById('btn-back-select').addEventListener('click', () => {
      this.audio.playClick();
      this.ui.showScreen('select');
    });

    document.getElementById('stage-select-cards').addEventListener('click', (e) => {
      const card = e.target.closest('.stage-card');
      if (!card || card.classList.contains('locked')) return;
      this.audio.playClick();
      const stage = parseInt(card.dataset.stage, 10);
      this.startStoryWithStage(this.pendingHeroineId, stage);
    });

    /* ストーリー画面クリックで次へ進む */
    document.getElementById('screen-story').addEventListener('click', () => {
      this.handleStoryClick();
    });

    /* 結果画面 */
    document.getElementById('btn-retry').addEventListener('click', () => {
      this.audio.playClick();
      this.audio.startBgm();
      const heroineId = this.heroineManager.selectedHeroine.id;
      /* ハッピーエンド達成済みならステージ選択画面に戻す */
      if (this.stats.hasHappyEnd(heroineId)) {
        this.pendingHeroineId = heroineId;
        const heroine = this.heroineManager.selectedHeroine;
        this.ui.renderStageSelect(heroine, this.stats);
        this.ui.showScreen('stageSelect');
      } else {
        this.startRetry(heroineId);
      }
    });

    /* 次のステージへボタン */
    document.getElementById('btn-next-stage').addEventListener('click', () => {
      this.audio.playClick();
      this.audio.startBgm();
      const heroineId = this.heroineManager.selectedHeroine.id;
      const currentStage = this.heroineManager.currentStage || 1;
      const nextStage = currentStage + 1;
      this.startStoryWithStage(heroineId, nextStage);
    });

    document.getElementById('btn-back-title-result').addEventListener('click', () => {
      this.audio.playClick();
      this.audio.startBgm();
      this.ui.showScreen('title');
    });

    /* パワーアップボタン */
    document.getElementById('btn-fifty-fifty').addEventListener('click', () => {
      this.useFiftyFifty();
    });

    document.getElementById('btn-hint').addEventListener('click', () => {
      this.useHint();
    });

    document.getElementById('btn-ask').addEventListener('click', () => {
      this.useAsk();
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

  /* リトライ時のストーリー付き再開 */
  startRetry(heroineId) {
    const isSecondPlay = this.stats.hasHappyEnd(heroineId);
    this.heroineManager.selectHeroine(heroineId, isSecondPlay);
    const heroine = this.heroineManager.selectedHeroine;

    /* ステージ1未クリアならリトライストーリーを表示 */
    if (!isSecondPlay && heroine.storyRetry) {
      this.storyLines = heroine.storyRetry;
      this.storyIndex = 0;
      this.ui.renderStoryScene(heroine);
      this.ui.showScreen('story');
      this.showNextStoryLine();
    } else {
      this.ui.showScreen('quiz');
      this.ui.renderScoreDots(QUIZ_COUNT);
      this.ui.highlightCurrentDot(0);
      this.showCurrentQuiz();
    }
  }

  /* ステージ指定でストーリーを開始する */
  startStoryWithStage(heroineId, stage) {
    const isSecondPlay = stage >= 2;
    this.heroineManager.selectHeroine(heroineId, isSecondPlay, stage);
    const heroine = this.heroineManager.selectedHeroine;

    /* ストーリー分岐：ステージ3 → ステージ2 → ハッピーエンド済リプレイ → リトライ */
    const hasHappy = this.stats.hasHappyEnd(heroineId);
    if (stage === 3 && heroine.story3) {
      this.storyLines = heroine.story3;
    } else if (stage === 2 && heroine.story2) {
      this.storyLines = heroine.story2;
    } else if (hasHappy && heroine.storyReplay) {
      this.storyLines = heroine.storyReplay;
    } else if (heroine.storyRetry) {
      this.storyLines = heroine.storyRetry;
    } else {
      this.storyLines = heroine.story || [];
    }
    this.storyIndex = 0;

    this.ui.renderStoryScene(heroine);
    this.ui.showScreen('story');
    this.showNextStoryLine();
  }

  /* ストーリーを開始する（初回プレイ用） */
  startStory(heroineId) {
    this.heroineManager.selectHeroine(heroineId, false);
    const heroine = this.heroineManager.selectedHeroine;
    this.storyLines = heroine.story || [];
    this.storyIndex = 0;

    this.ui.renderStoryScene(heroine);
    this.ui.showScreen('story');
    this.showNextStoryLine();
  }

  /* ストーリーの次の行を表示する */
  async showNextStoryLine() {
    const heroine = this.heroineManager.selectedHeroine;

    if (this.storyIndex >= this.storyLines.length) {
      this.storyClickHandler = null;
      this.startQuizFromStory();
      return;
    }

    const line = this.storyLines[this.storyIndex];
    this.storyIndex++;
    await this.ui.showStoryLine(line, heroine);
  }

  /* ストーリー画面のクリック処理 */
  handleStoryClick() {
    if (this.ui.isTyping()) {
      this.ui.skipTyping();
      return;
    }
    this.audio.playClick();
    this.showNextStoryLine();
  }

  /* ストーリー終了後にクイズを開始する */
  startQuizFromStory() {
    this.ui.showScreen('quiz');
    this.ui.renderScoreDots(QUIZ_COUNT);
    this.ui.highlightCurrentDot(0);
    this.showCurrentQuiz();
  }

  /* クイズを開始する（選択画面から直接） */
  startQuiz(heroineId) {
    this.heroineManager.selectHeroine(heroineId);
    this.ui.showScreen('quiz');
    this.ui.renderScoreDots(QUIZ_COUNT);
    this.ui.highlightCurrentDot(0);
    this.showCurrentQuiz();
  }

  /* 選択肢の並びをシャッフルする */
  shuffleChoices(quiz) {
    const indices = quiz.choices.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return {
      shuffledChoices: indices.map(i => quiz.choices[i]),
      correctIndex: indices.indexOf(quiz.correct)
    };
  }

  /* 現在のクイズを画面に表示する */
  showCurrentQuiz() {
    const quiz = this.heroineManager.getCurrentQuiz();
    const heroine = this.heroineManager.selectedHeroine;

    /* 選択肢をランダムに並び替え */
    const { shuffledChoices, correctIndex } = this.shuffleChoices(quiz);
    this.currentShuffledCorrectIndex = correctIndex;

    this.ui.renderQuiz({
      quiz: { ...quiz, choices: shuffledChoices },
      heroine,
      questionNumber: this.heroineManager.currentQuizIndex + 1,
      totalQuestions: QUIZ_COUNT,
      affinity: this.heroineManager.affinity,
      isSecondPlay: this.heroineManager.isSecondPlay,
      currentStage: this.heroineManager.currentStage
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

    /* パワーアップボタンの状態を更新 */
    this.ui.updatePowerupButtons(this.heroineManager.powerups);
  }

  /* 50/50パワーアップ：不正解の選択肢を1つ消す */
  useFiftyFifty() {
    if (!this.isAnswering) return;
    if (!this.heroineManager.usePowerup('fiftyFifty')) return;

    this.audio.playPowerup();
    const buttons = document.querySelectorAll('.choice-btn');
    const wrongIndices = [];

    buttons.forEach((btn, i) => {
      if (i !== this.currentShuffledCorrectIndex && !btn.classList.contains('eliminated')) {
        wrongIndices.push(i);
      }
    });

    /* 不正解の選択肢を1つランダムに選んで消す */
    if (wrongIndices.length > 0) {
      const removeIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      buttons[removeIndex].classList.add('eliminated');
      buttons[removeIndex].disabled = true;
    }

    this.ui.updatePowerupButtons(this.heroineManager.powerups);
  }

  /* ヒントパワーアップ：正解の選択肢を光らせる */
  useHint() {
    if (!this.isAnswering) return;
    if (!this.heroineManager.usePowerup('hint')) return;

    this.audio.playPowerup();
    const buttons = document.querySelectorAll('.choice-btn');
    buttons[this.currentShuffledCorrectIndex].classList.add('hint-glow');

    this.ui.updatePowerupButtons(this.heroineManager.powerups);
  }

  /* おしえてパワーアップ：ヒロインがヒントコメントを言う */
  useAsk() {
    if (!this.isAnswering) return;
    if (!this.heroineManager.usePowerup('ask')) return;

    this.audio.playPowerup();
    const hintText = this.heroineManager.generateHintComment();
    this.ui.showHintBubble(hintText);
    this.ui.updatePowerupButtons(this.heroineManager.powerups);
  }

  /* 回答を処理する */
  handleAnswer(choiceIndex) {
    if (!this.isAnswering) return;
    this.isAnswering = false;
    this.stopTimer();

    /* シャッフル後のインデックスで正解判定 */
    const isCorrect = choiceIndex === this.currentShuffledCorrectIndex;
    const result = this.heroineManager.recordAnswer(isCorrect);
    result.correctIndex = this.currentShuffledCorrectIndex;

    this.audio[result.isCorrect ? 'playCorrect' : 'playWrong']();
    this.ui.showAnswerResult(result, choiceIndex);
    this.ui.updateScoreDot(this.heroineManager.currentQuizIndex, isCorrect);

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

    /* 時間切れは不正解扱い */
    const result = this.heroineManager.recordAnswer(false);
    result.correctIndex = this.currentShuffledCorrectIndex;
    this.audio.playTimeout();
    this.ui.showTimeoutResult(result);
    this.ui.updateScoreDot(this.heroineManager.currentQuizIndex, false);

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

    /* 統計を記録する */
    const currentStage = this.heroineManager.currentStage || (this.heroineManager.isSecondPlay ? 2 : 1);
    this.stats.recordGameResult(
      this.heroineManager.selectedHeroine.id,
      endingData.type,
      this.heroineManager.quizResults,
      currentStage
    );
  }

  /* ヒロインごとのカテゴリ別クイズ総数を取得する */
  getQuizCountByHeroine() {
    const hm = this.heroineManager;
    const result = {};
    const heroineIds = ['misaki', 'rin', 'hinata'];
    heroineIds.forEach(id => {
      const catCounts = {};
      const seenQuestions = new Set();
      [hm.quizzes, hm.quizzesHard, hm.quizzesExpert].forEach(source => {
        if (source && source[id]) {
          source[id].forEach(q => {
            if (q.category && !seenQuestions.has(q.question)) {
              seenQuestions.add(q.question);
              catCounts[q.category] = (catCounts[q.category] || 0) + 1;
            }
          });
        }
      });
      result[id] = catCounts;
    });
    return result;
  }

  /* ステータス画面を表示する */
  showStatsScreen() {
    const heroines = this.heroineManager.heroines;
    const activeId = this.activeStatsHeroineId || 'all';
    const quizCountByHeroine = this.getQuizCountByHeroine();
    this.ui.renderStatsTabs(heroines, activeId);
    if (activeId === 'all') {
      this.ui.renderStatsAll(heroines, this.stats, quizCountByHeroine);
    } else {
      const heroine = heroines.find(h => h.id === activeId) || heroines[0];
      const quizCounts = quizCountByHeroine[heroine.id] || {};
      this.ui.renderStatsContent(heroine, this.stats, quizCounts);
    }
    this.ui.renderGlobalCategoryStats(this.stats, activeId);
    this.ui.showScreen('stats');
  }
}
