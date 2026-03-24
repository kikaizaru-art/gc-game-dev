// ゲームエンジン - シーン管理・クイズ進行制御
'use strict';

/**
 * ゲーム全体のフロー制御を行うクラス
 */
class GameEngine {
  constructor(heroineManager, uiManager, audioManager, statsManager, staminaManager, adManager, shopManager) {
    this.heroineManager = heroineManager;
    this.ui = uiManager;
    this.audio = audioManager;
    this.stats = statsManager;
    this.stamina = staminaManager;
    this.ad = adManager || null;
    this.shop = shopManager || null;
    this.timerId = null;
    this.timeRemaining = QUIZ_TIME_LIMIT;
    this.isAnswering = false;
    this.activeStatsHeroineId = 'all';
    this.favoriteHeroineId = this.loadFavoriteHeroine();
  }

  /* ゲーム初期化 */
  async init() {
    await this.heroineManager.loadData();
    this.ui.renderHeroineCards(this.heroineManager.heroines, this.stats, this.getQuizCountByHeroine());
    this.bindEvents();
    this.ui.updateStaminaGauge(this.stamina.getStamina(), this.stamina.getNextRecoveryMs());
    /* スタミナ変更時にUIを自動更新する */
    this.stamina.onChange(() => {
      this.ui.updateStaminaGauge(this.stamina.getStamina(), this.stamina.getNextRecoveryMs());
    });
    /* スタミナ回復タイマーの表示を毎秒更新する */
    setInterval(() => {
      this.ui.updateStaminaGauge(this.stamina.getStamina(), this.stamina.getNextRecoveryMs());
    }, 1000);
    this.ui.showScreen('title');
    console.log('ハートクイズ - 初期化完了');
  }

  /* イベントリスナーを登録する */
  bindEvents() {
    /* タイトル画面 → マイページへ */
    document.getElementById('btn-start').addEventListener('click', () => {
      this.audio.init();
      this.audio.playClick();
      this.audio.startBgm();
      this.showMyPage();
    });

    /* マイページ → あそぶ（ヒロイン選択へ） */
    document.getElementById('btn-mypage-play').addEventListener('click', () => {
      this.audio.playClick();
      this.ui.renderHeroineCards(this.heroineManager.heroines, this.stats, this.getQuizCountByHeroine());
      this.ui.showScreen('select');
    });

    /* マイページ → お気に入り選択 */
    document.getElementById('btn-mypage-favorite').addEventListener('click', () => {
      this.audio.playClick();
      this.ui.renderFavoriteCards(this.heroineManager.heroines, this.favoriteHeroineId, this.stats);
      this.ui.showScreen('favSelect');
    });

    document.getElementById('btn-back-mypage-fav').addEventListener('click', () => {
      this.audio.playClick();
      this.showMyPage();
    });

    /* お気に入り選択カードのクリック */
    document.getElementById('fav-heroine-cards').addEventListener('click', (e) => {
      const card = e.target.closest('.heroine-card');
      if (!card || card.classList.contains('favorite-current') || card.classList.contains('locked')) return;
      this.audio.playClick();
      const heroineId = card.dataset.heroineId;
      this.saveFavoriteHeroine(heroineId);
      this.showMyPage();
    });

    /* マイページ → タイムアタック */
    document.getElementById('btn-mypage-timeattack').addEventListener('click', () => {
      this.audio.playClick();
      this.showTimeAttackCategorySelect();
    });

    document.getElementById('btn-back-mypage-ta').addEventListener('click', () => {
      this.audio.playClick();
      this.showMyPage();
    });

    /* タイムアタック：カテゴリ選択 */
    document.getElementById('ta-category-list').addEventListener('click', (e) => {
      const btn = e.target.closest('.subgame-category-btn');
      if (!btn) return;
      this.audio.playClick();
      this.startTimeAttack(btn.dataset.category);
    });

    /* タイムアタック：結果画面ボタン */
    document.getElementById('btn-ta-retry').addEventListener('click', () => {
      this.audio.playClick();
      if (this.taState) {
        this.startTimeAttack(this.taState.category);
      }
    });

    document.getElementById('btn-ta-back').addEventListener('click', () => {
      this.audio.playClick();
      this.showTimeAttackCategorySelect();
    });

    /* マイページ → 耐久クイズ */
    document.getElementById('btn-mypage-endurance').addEventListener('click', () => {
      this.audio.playClick();
      /* ベスト記録を開始画面に表示 */
      const best = this.stats.getEnduranceBest();
      const descEl = document.querySelector('#screen-endurance-start .subgame-desc');
      if (best > 0) {
        descEl.textContent = `ミスするまでクイズに答え続けよう！ ベスト記録: ${best}問連続正解`;
      } else {
        descEl.textContent = 'ミスするまでクイズに答え続けよう！何問連続で正解できるかな？';
      }
      this.ui.showScreen('enduranceStart');
    });

    document.getElementById('btn-back-mypage-endurance').addEventListener('click', () => {
      this.audio.playClick();
      this.showMyPage();
    });

    document.getElementById('btn-endurance-go').addEventListener('click', () => {
      this.audio.playClick();
      this.startEndurance();
    });

    /* 耐久クイズ：結果画面ボタン */
    document.getElementById('btn-endurance-retry').addEventListener('click', () => {
      this.audio.playClick();
      this.startEndurance();
    });

    document.getElementById('btn-endurance-back').addEventListener('click', () => {
      this.audio.playClick();
      this.showMyPage();
    });

    /* マイページ → オプション */
    document.getElementById('btn-mypage-options').addEventListener('click', () => {
      this.audio.playClick();
      this.showOptionsScreen();
    });

    document.getElementById('btn-back-title-options').addEventListener('click', () => {
      this.audio.playClick();
      this.showMyPage();
    });

    /* マイページ → ショップ */
    document.getElementById('btn-mypage-shop').addEventListener('click', () => {
      this.audio.playClick();
      this.updateShopScreen();
      this.ui.showScreen('shop');
    });

    document.getElementById('btn-back-title-shop').addEventListener('click', () => {
      this.audio.playClick();
      this.showMyPage();
    });

    document.getElementById('btn-buy-ad-free').addEventListener('click', () => {
      this.audio.playClick();
      this.handleBuyAdFree();
    });

    document.getElementById('btn-restore-purchases').addEventListener('click', () => {
      this.audio.playClick();
      this.handleRestorePurchases();
    });

    /* BGM音量スライダー */
    document.getElementById('range-bgm').addEventListener('input', (e) => {
      const value = parseInt(e.target.value, 10);
      document.getElementById('range-bgm-value').textContent = value;
      this.audio.setBgmVolume(value / 100);
    });

    /* SE音量スライダー */
    document.getElementById('range-se').addEventListener('input', (e) => {
      const value = parseInt(e.target.value, 10);
      document.getElementById('range-se-value').textContent = value;
      this.audio.setSeVolume(value / 100);
    });

    /* SE音量変更時にプレビュー音を鳴らす */
    document.getElementById('range-se').addEventListener('change', () => {
      this.audio.playClick();
    });

    /* ミュートチェックボックス（オプション画面） */
    document.getElementById('chk-mute').addEventListener('change', (e) => {
      this.audio.setMuted(e.target.checked);
    });

    /* 未確認クイズ優先チェックボックス（オプション画面） */
    document.getElementById('chk-prioritize-unconfirmed').addEventListener('change', (e) => {
      this.stats.setPrioritizeUnconfirmed(e.target.checked);
    });

    /* マイページ → ステータス */
    document.getElementById('btn-mypage-stats').addEventListener('click', () => {
      this.audio.playClick();
      this.showStatsScreen();
    });

    document.getElementById('btn-back-title-stats').addEventListener('click', () => {
      this.audio.playClick();
      this.showMyPage();
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
      this.audio.playClick();
      this.showMyPage();
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
      this.showMyPage();
    });

    /* 広告視聴でスタミナ回復ボタン */
    document.getElementById('btn-ad-stamina').addEventListener('click', () => {
      this.audio.playClick();
      this.showAdForStamina();
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
      const keyMap = { '1': 0, '2': 1, '3': 2 };
      if (keyMap[e.key] === undefined) return;
      const idx = keyMap[e.key];

      /* 通常クイズ */
      if (this.isAnswering) {
        this.handleAnswer(idx);
        return;
      }
      /* タイムアタック */
      if (this.taState && this.taState.isAnswering) {
        this.handleTaAnswer(idx);
        return;
      }
      /* 耐久クイズ */
      if (this.enduranceState && this.enduranceState.isAnswering) {
        this.handleEnduranceAnswer(idx);
        return;
      }
    });
  }

  /* リトライ時のストーリー付き再開 */
  startRetry(heroineId) {
    const isSecondPlay = this.stats.hasHappyEnd(heroineId);
    this.heroineManager.selectHeroine(heroineId, isSecondPlay, 1, this.getClearedQuestionsIfEnabled(heroineId));
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
    this.heroineManager.selectHeroine(heroineId, isSecondPlay, stage, this.getClearedQuestionsIfEnabled(heroineId));
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
    this.heroineManager.selectHeroine(heroineId, false, 1, this.getClearedQuestionsIfEnabled(heroineId));
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
    this.heroineManager.selectHeroine(heroineId, false, 1, this.getClearedQuestionsIfEnabled(heroineId));
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
    this.updatePowerupState();
  }

  /* パワーアップボタンの有効/無効状態を更新する */
  updatePowerupState() {
    const hm = this.heroineManager;
    const staminaLeft = this.stamina.getStamina();
    const states = {
      fiftyFifty: staminaLeft > 0 && !hm.isPowerupUsedThisQuestion('fiftyFifty') && !hm.isPowerupUsedThisStage('fiftyFifty'),
      hint: staminaLeft > 0 && !hm.isPowerupUsedThisQuestion('hint') && !hm.isPowerupUsedThisStage('hint'),
      ask: staminaLeft > 0 && !hm.isPowerupUsedThisQuestion('ask') && !hm.isPowerupUsedThisStage('ask')
    };
    this.ui.updatePowerupButtons(states);
    this.ui.updateStaminaGauge(staminaLeft, this.stamina.getNextRecoveryMs());
  }

  /* 50/50パワーアップ：不正解の選択肢を1つ消す */
  useFiftyFifty() {
    if (!this.isAnswering) return;
    if (this.heroineManager.isPowerupUsedThisQuestion('fiftyFifty')) return;
    if (this.heroineManager.isPowerupUsedThisStage('fiftyFifty')) return;
    if (!this.stamina.consume()) return;

    this.heroineManager.markPowerupUsed('fiftyFifty');
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

    this.updatePowerupState();
  }

  /* ヒントパワーアップ：正解の選択肢を光らせる */
  useHint() {
    if (!this.isAnswering) return;
    if (this.heroineManager.isPowerupUsedThisQuestion('hint')) return;
    if (this.heroineManager.isPowerupUsedThisStage('hint')) return;
    if (!this.stamina.consume()) return;

    this.heroineManager.markPowerupUsed('hint');
    this.audio.playPowerup();
    const buttons = document.querySelectorAll('.choice-btn');
    buttons[this.currentShuffledCorrectIndex].classList.add('hint-glow');

    this.updatePowerupState();
  }

  /* おしえてパワーアップ：ヒロインがヒントコメントを言う */
  useAsk() {
    if (!this.isAnswering) return;
    if (this.heroineManager.isPowerupUsedThisQuestion('ask')) return;
    if (this.heroineManager.isPowerupUsedThisStage('ask')) return;
    if (!this.stamina.consume()) return;

    this.heroineManager.markPowerupUsed('ask');
    this.audio.playPowerup();
    const hintText = this.heroineManager.generateHintComment();
    this.ui.showHintBubble(hintText);
    this.updatePowerupState();
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

    /* 広告無しプラン購入済みならスタミナ全回復 */
    if (this.shop && this.shop.isAdFree()) {
      this.stamina.recover(STAMINA_MAX);
    }

    /* 広告ボタンの表示制御（スタミナ未満＆広告準備OK） */
    this.updateAdButton();

    /* 統計を記録する */
    const currentStage = this.heroineManager.currentStage || (this.heroineManager.isSecondPlay ? 2 : 1);
    this.stats.recordGameResult(
      this.heroineManager.selectedHeroine.id,
      endingData.type,
      this.heroineManager.quizResults,
      currentStage
    );
  }

  /* 広告ボタンの表示状態を更新する */
  updateAdButton() {
    const btn = document.getElementById('btn-ad-stamina');
    /* 広告無しプラン購入済みなら常に非表示 */
    if (this.shop && this.shop.isAdFree()) {
      btn.style.display = 'none';
      return;
    }
    const canShow = this.ad
      && this.ad.isRewardedAdReady()
      && this.stamina.getStamina() < STAMINA_MAX;
    btn.style.display = canShow ? '' : 'none';
  }

  /* 広告を視聴してスタミナを回復する */
  showAdForStamina() {
    if (!this.ad || !this.ad.isRewardedAdReady()) return;

    this.ad.showRewardedAd(
      () => {
        /* 報酬：スタミナ回復 */
        this.stamina.recover(AD_STAMINA_REWARD);
        this.audio.playPowerup();
        this.updateAdButton();
      },
      () => {
        /* 広告閉じた後の処理 */
        this.updateAdButton();
      }
    );
  }

  /* オプション画面を表示する */
  showOptionsScreen() {
    this.ui.renderOptions(this.audio, this.stats);
    this.ui.showScreen('options');
  }

  /* 未確認クイズ優先時のクリア済み問題を取得する */
  getClearedQuestionsIfEnabled(heroineId) {
    if (this.stats.getPrioritizeUnconfirmed()) {
      return this.stats.getClearedQuestions(heroineId);
    }
    return null;
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

  /* ショップ画面の表示状態を更新する */
  updateShopScreen() {
    const btn = document.getElementById('btn-buy-ad-free');
    const priceEl = document.getElementById('shop-price-ad-free');
    const item = document.getElementById('shop-item-ad-free');

    if (this.shop && this.shop.isAdFree()) {
      btn.textContent = '購入済み';
      btn.disabled = true;
      btn.classList.add('purchased');
      priceEl.textContent = '';
      item.classList.add('purchased');
    } else {
      btn.textContent = '購入する';
      btn.disabled = false;
      btn.classList.remove('purchased');
      priceEl.textContent = '¥480';
      item.classList.remove('purchased');
    }
  }

  /* 広告無しプランの購入処理 */
  async handleBuyAdFree() {
    if (!this.shop) return;
    if (this.shop.isAdFree()) return;

    const confirmed = confirm('広告なしプラン（¥480）を購入しますか？');
    if (!confirmed) return;

    const success = await this.shop.purchase(PRODUCT_ID_AD_FREE);
    if (success) {
      this.audio.playPowerup();
      this.updateShopScreen();
      /* スタミナを全回復する */
      this.stamina.recover(STAMINA_MAX);
    }
  }

  /* 購入の復元処理 */
  async handleRestorePurchases() {
    if (!this.shop) return;
    await this.shop.restorePurchases();
    this.updateShopScreen();
  }

  /* お気に入りヒロインをlocalStorageから読み込む */
  loadFavoriteHeroine() {
    try {
      return localStorage.getItem('heartQuizFavoriteHeroine') || 'misaki';
    } catch (e) {
      return 'misaki';
    }
  }

  /* お気に入りヒロインをlocalStorageに保存する */
  saveFavoriteHeroine(heroineId) {
    this.favoriteHeroineId = heroineId;
    try {
      localStorage.setItem('heartQuizFavoriteHeroine', heroineId);
    } catch (e) {
      console.warn('お気に入り保存に失敗:', e);
    }
  }

  /* マイページを表示する */
  showMyPage() {
    const heroine = this.heroineManager.heroines.find(h => h.id === this.favoriteHeroineId)
      || this.heroineManager.heroines[0];
    this.ui.renderMyPage(heroine);
    this.ui.showScreen('mypage');
  }

  /* ===========================
     タイムアタック
     =========================== */

  /* タイムアタック用の全カテゴリ一覧を取得する */
  getAllCategories() {
    const categories = new Set();
    const hm = this.heroineManager;
    [hm.quizzes, hm.quizzesHard, hm.quizzesExpert].forEach(source => {
      Object.values(source).forEach(quizArray => {
        quizArray.forEach(q => {
          if (q.category) categories.add(q.category);
        });
      });
    });
    return [...categories];
  }

  /* タイムアタック用に指定カテゴリのクイズをシャッフルして取得する */
  getQuizzesByCategory(category) {
    const hm = this.heroineManager;
    const all = [];
    [hm.quizzes, hm.quizzesHard, hm.quizzesExpert].forEach(source => {
      Object.values(source).forEach(quizArray => {
        quizArray.forEach(q => {
          if (q.category === category) all.push(q);
        });
      });
    });
    /* シャッフル */
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }

  /* タイムアタックのカテゴリ選択画面を表示する */
  showTimeAttackCategorySelect() {
    const categories = this.getAllCategories();
    const records = this.stats.getTimeAttackRecords();
    this.ui.renderTaCategoryList(categories, records);
    this.ui.showScreen('taCategory');
  }

  /* タイムアタックを開始する */
  startTimeAttack(category) {
    const TA_QUIZ_COUNT = 10;
    const quizPool = this.getQuizzesByCategory(category);
    this.taState = {
      category,
      quizzes: quizPool.slice(0, TA_QUIZ_COUNT),
      currentIndex: 0,
      correctCount: 0,
      startTime: null,
      elapsedTimerId: null,
      isAnswering: false
    };
    /* キャラ画像をお気に入りヒロインに設定 */
    const heroine = this.heroineManager.heroines.find(h => h.id === this.favoriteHeroineId)
      || this.heroineManager.heroines[0];
    const charaImg = document.getElementById('ta-quiz-chara-img');
    charaImg.src = CHARA_IMAGES[heroine.id];
    charaImg.alt = heroine.shortName;

    this.ui.renderTaScoreDots(this.taState.quizzes.length);
    this.ui.showScreen('taQuiz');
    this.showTaCurrentQuiz();
  }

  /* タイムアタック：現在のクイズを表示する */
  showTaCurrentQuiz() {
    const st = this.taState;
    const quiz = st.quizzes[st.currentIndex];
    const { shuffledChoices, correctIndex } = this.shuffleChoices(quiz);
    st.currentCorrectIndex = correctIndex;
    st.isAnswering = true;

    this.ui.hideTaFeedback();
    this.ui.renderTaQuiz(
      { ...quiz, choices: shuffledChoices },
      st.category,
      st.currentIndex + 1,
      st.quizzes.length
    );

    /* 最初の問題でタイマー開始 */
    if (st.currentIndex === 0) {
      st.startTime = performance.now();
      st.elapsedTimerId = setInterval(() => {
        const elapsed = performance.now() - st.startTime;
        this.ui.updateTaTimer(elapsed);
      }, TIMER_INTERVAL_MS);
    }

    /* ドットのハイライト */
    const dots = document.getElementById('ta-score-dots').querySelectorAll('.score-dot');
    dots.forEach(d => d.classList.remove('current'));
    if (dots[st.currentIndex]) dots[st.currentIndex].classList.add('current');

    /* 選択肢のクリックイベント */
    const choiceBtns = document.getElementById('ta-quiz-choices').querySelectorAll('.choice-btn');
    choiceBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => this.handleTaAnswer(index));
    });
  }

  /* タイムアタック：回答を処理する */
  handleTaAnswer(choiceIndex) {
    const st = this.taState;
    if (!st.isAnswering) return;
    st.isAnswering = false;

    const isCorrect = choiceIndex === st.currentCorrectIndex;
    if (isCorrect) st.correctCount++;

    this.audio[isCorrect ? 'playCorrect' : 'playWrong']();
    this.ui.showTaAnswerResult(choiceIndex, st.currentCorrectIndex, isCorrect);
    this.ui.updateTaScoreDot(st.currentIndex, isCorrect);

    const TA_FEEDBACK_MS = 800;
    setTimeout(() => {
      st.currentIndex++;
      if (st.currentIndex >= st.quizzes.length) {
        this.showTaResult();
      } else {
        this.showTaCurrentQuiz();
      }
    }, TA_FEEDBACK_MS);
  }

  /* タイムアタック：結果画面を表示する */
  showTaResult() {
    const st = this.taState;
    if (st.elapsedTimerId) {
      clearInterval(st.elapsedTimerId);
      st.elapsedTimerId = null;
    }
    const elapsedMs = performance.now() - st.startTime;
    const isNewRecord = this.stats.recordTimeAttackResult(
      st.category, elapsedMs, st.correctCount, st.quizzes.length
    );
    this.ui.renderTaResult(elapsedMs, st.correctCount, st.quizzes.length, st.category, isNewRecord);
    this.audio.playEnding(st.correctCount >= 8 ? 'happy' : 'normal');
    this.ui.showScreen('taResult');
  }

  /* ===========================
     耐久クイズ
     =========================== */

  /* 耐久クイズ用に全クイズをシャッフルして取得する */
  getAllQuizzesShuffled() {
    const hm = this.heroineManager;
    const all = [];
    [hm.quizzes, hm.quizzesHard, hm.quizzesExpert].forEach(source => {
      Object.values(source).forEach(quizArray => {
        quizArray.forEach(q => all.push(q));
      });
    });
    /* シャッフル */
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }

  /* 耐久クイズを開始する */
  startEndurance() {
    this.enduranceState = {
      quizPool: this.getAllQuizzesShuffled(),
      currentIndex: 0,
      streak: 0,
      isAnswering: false,
      currentCorrectIndex: null
    };

    /* キャラ画像をお気に入りヒロインに設定 */
    const heroine = this.heroineManager.heroines.find(h => h.id === this.favoriteHeroineId)
      || this.heroineManager.heroines[0];
    const charaImg = document.getElementById('endurance-quiz-chara-img');
    charaImg.src = CHARA_IMAGES[heroine.id];
    charaImg.alt = heroine.shortName;

    this.ui.showScreen('enduranceQuiz');
    this.showEnduranceCurrentQuiz();
  }

  /* 耐久クイズ：現在のクイズを表示する */
  showEnduranceCurrentQuiz() {
    const st = this.enduranceState;
    /* プールが尽きたら再シャッフル */
    if (st.currentIndex >= st.quizPool.length) {
      st.quizPool = this.getAllQuizzesShuffled();
      st.currentIndex = 0;
    }

    const quiz = st.quizPool[st.currentIndex];
    const { shuffledChoices, correctIndex } = this.shuffleChoices(quiz);
    st.currentCorrectIndex = correctIndex;
    st.isAnswering = true;

    this.ui.hideEnduranceFeedback();
    this.ui.renderEnduranceQuiz(
      { ...quiz, choices: shuffledChoices },
      st.streak
    );

    /* 選択肢のクリックイベント */
    const choiceBtns = document.getElementById('endurance-quiz-choices').querySelectorAll('.choice-btn');
    choiceBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => this.handleEnduranceAnswer(index));
    });
  }

  /* 耐久クイズ：回答を処理する */
  handleEnduranceAnswer(choiceIndex) {
    const st = this.enduranceState;
    if (!st.isAnswering) return;
    st.isAnswering = false;

    const isCorrect = choiceIndex === st.currentCorrectIndex;
    this.audio[isCorrect ? 'playCorrect' : 'playWrong']();
    this.ui.showEnduranceAnswerResult(choiceIndex, st.currentCorrectIndex, isCorrect);

    if (isCorrect) {
      st.streak++;
      st.currentIndex++;
      const ENDURANCE_FEEDBACK_MS = 600;
      setTimeout(() => {
        this.showEnduranceCurrentQuiz();
      }, ENDURANCE_FEEDBACK_MS);
    } else {
      /* ゲームオーバー */
      const missedQuestion = st.quizPool[st.currentIndex].question;
      const ENDURANCE_GAMEOVER_MS = 1500;
      setTimeout(() => {
        this.showEnduranceResult(missedQuestion);
      }, ENDURANCE_GAMEOVER_MS);
    }
  }

  /* 耐久クイズ：結果画面を表示する */
  showEnduranceResult(missedQuestion) {
    const st = this.enduranceState;
    const isNewRecord = this.stats.recordEnduranceResult(st.streak);
    this.ui.renderEnduranceResult(st.streak, missedQuestion, isNewRecord);
    this.audio.playEnding(st.streak >= 10 ? 'happy' : 'normal');
    this.ui.showScreen('enduranceResult');
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
