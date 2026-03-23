// UI管理 - 画面遷移・表示更新（恋愛シミュレーション風）
'use strict';

/* キャラクター画像パスのマッピング */
const CHARA_IMAGES = {
  misaki: 'assets/images/misaki.png',
  rin: 'assets/images/rin.png',
  hinata: 'assets/images/hinata.png'
};

/**
 * 画面描画と遷移を管理するクラス
 */
class UiManager {
  constructor() {
    this.screens = {
      title: document.getElementById('screen-title'),
      select: document.getElementById('screen-select'),
      stageSelect: document.getElementById('screen-stage-select'),
      story: document.getElementById('screen-story'),
      quiz: document.getElementById('screen-quiz'),
      result: document.getElementById('screen-result'),
      stats: document.getElementById('screen-stats')
    };
  }

  /* 画面を切り替える */
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      screen.classList.remove('active');
    });
    this.screens[screenName].classList.add('active');
  }

  /* ヒロイン選択カードを生成する（バストアップ画像付き） */
  renderHeroineCards(heroines, statsManager) {
    const container = document.getElementById('heroine-cards');
    container.innerHTML = heroines.map(h => {
      const progress = statsManager && statsManager.getBestProgress(h.id);
      let stageBadge;
      if (progress) {
        let badgeClass;
        if (progress.stage === 3) {
          badgeClass = progress.ending === 'happy' ? 'hard' : progress.ending === 'normal' ? 'cleared' : 'bad';
        } else if (progress.stage === 2) {
          badgeClass = progress.ending === 'happy' ? 'normal-badge' : progress.ending === 'normal' ? 'cleared' : 'bad';
        } else {
          badgeClass = progress.ending === 'happy' ? 'easy' : progress.ending === 'normal' ? 'cleared' : 'bad';
        }
        stageBadge = `<span class="card-stage-badge ${badgeClass}">${progress.label}</span>`;
      } else {
        stageBadge = '<span class="card-stage-badge easy">STAGE 1 - EASY</span>';
      }
      return `
        <div class="heroine-card" data-heroine-id="${h.id}" data-color="${h.colorName}">
          <div class="heroine-card-image">
            <img src="${CHARA_IMAGES[h.id]}" alt="${h.shortName}">
          </div>
          <div class="heroine-card-info">
            <div class="heroine-card-name" style="color: ${h.color};">${h.shortName}</div>
            <div class="heroine-card-personality">${h.personality}</div>
            <div class="heroine-card-likes">${h.description}</div>
            ${stageBadge}
          </div>
        </div>
      `;
    }).join('');
  }

  /* ステージ選択画面を描画する */
  renderStageSelect(heroine, statsManager) {
    /* 背景とキャラ画像を設定 */
    const bg = document.getElementById('stage-select-bg');
    bg.className = `stage-select-bg ${heroine.colorName}`;
    const charaImg = document.getElementById('stage-select-chara-img');
    charaImg.src = CHARA_IMAGES[heroine.id];
    charaImg.alt = heroine.shortName;

    const hasHappy = statsManager.hasHappyEnd(heroine.id);
    const hasStage2Happy = statsManager.hasStage2HappyEnd(heroine.id);
    const container = document.getElementById('stage-select-cards');

    container.innerHTML = `
      <div class="stage-card" data-stage="1">
        <div class="stage-card-badge easy">STAGE 1</div>
        <div class="stage-card-difficulty">EASY</div>
        <div class="stage-card-desc">もう一度${heroine.shortName}と会話しよう</div>
        <div class="stage-card-note">※ クリア後限定ストーリー</div>
      </div>
      <div class="stage-card ${hasHappy ? '' : 'locked'}" data-stage="2">
        <div class="stage-card-badge normal">STAGE 2</div>
        <div class="stage-card-difficulty">NORMAL</div>
        <div class="stage-card-desc">${hasHappy ? `${heroine.shortName}との特別なデート` : '???'}</div>
        ${hasHappy ? '' : '<div class="stage-card-lock">🔒 ハッピーエンドで解放</div>'}
      </div>
      <div class="stage-card ${hasStage2Happy ? '' : 'locked'}" data-stage="3">
        <div class="stage-card-badge hard">STAGE 3</div>
        <div class="stage-card-difficulty">HARD</div>
        <div class="stage-card-desc">${hasStage2Happy ? `${heroine.shortName}との最後の試練` : '???'}</div>
        ${hasStage2Happy ? '' : '<div class="stage-card-lock">🔒 STAGE 2 ハッピーエンドで解放</div>'}
      </div>
    `;
  }

  /* ストーリー画面を初期化する */
  renderStoryScene(heroine) {
    const storyBg = document.getElementById('story-bg');
    storyBg.className = `story-bg ${heroine.colorName}`;

    const charaImg = document.getElementById('story-chara-img');
    charaImg.src = CHARA_IMAGES[heroine.id];
    charaImg.alt = heroine.shortName;

    const charaContainer = document.getElementById('story-chara-container');
    charaContainer.classList.remove('visible');
  }

  /* ストーリーのセリフを表示する */
  showStoryLine(line, heroine) {
    const namePlate = document.getElementById('story-name-plate');
    const textEl = document.getElementById('story-text');
    const charaContainer = document.getElementById('story-chara-container');

    if (line.speaker === 'narration') {
      namePlate.classList.add('hidden');
      charaContainer.classList.remove('visible');
    } else {
      namePlate.classList.remove('hidden');
      namePlate.textContent = heroine.shortName;
      namePlate.style.color = heroine.color;
      charaContainer.classList.add('visible');
    }

    /* テキストを1文字ずつ表示する */
    textEl.textContent = '';
    return this.typeText(textEl, line.text);
  }

  /* テキストを1文字ずつ表示するアニメーション */
  typeText(element, text) {
    return new Promise((resolve) => {
      const CHAR_DELAY_MS = 40;
      let charIndex = 0;
      element.classList.add('typing');

      const typeInterval = setInterval(() => {
        charIndex++;
        element.textContent = text.slice(0, charIndex);

        if (charIndex >= text.length) {
          clearInterval(typeInterval);
          element.classList.remove('typing');
          resolve();
        }
      }, CHAR_DELAY_MS);

      /* スキップ用にintervalIdを保存 */
      element.dataset.typeInterval = typeInterval;
      element.dataset.fullText = text;
    });
  }

  /* タイピングアニメーションをスキップして全文表示する */
  skipTyping() {
    const textEl = document.getElementById('story-text');
    const intervalId = parseInt(textEl.dataset.typeInterval, 10);
    if (intervalId) {
      clearInterval(intervalId);
      textEl.textContent = textEl.dataset.fullText || '';
      textEl.classList.remove('typing');
      textEl.dataset.typeInterval = '';
    }
  }

  /* タイピング中かどうかを判定する */
  isTyping() {
    const textEl = document.getElementById('story-text');
    return textEl.classList.contains('typing');
  }

  /* クイズ画面を描画する（VN風レイアウト） */
  renderQuiz({ quiz, heroine, questionNumber, totalQuestions, affinity, isSecondPlay, currentStage }) {
    /* 背景をキャラ別に変更 */
    const quizBg = document.getElementById('quiz-bg');
    quizBg.className = `quiz-bg ${heroine.colorName}`;

    /* ヒロイン名 */
    const nameLabel = document.getElementById('quiz-heroine-name');
    nameLabel.textContent = heroine.shortName;
    nameLabel.style.color = heroine.color;

    /* 難易度バッジ */
    const diffBadge = document.getElementById('quiz-difficulty-badge');
    const stage = currentStage || (isSecondPlay ? 2 : 1);
    const diffLabels = { 1: 'EASY', 2: 'NORMAL', 3: 'HARD' };
    const diffClasses = { 1: 'easy', 2: 'normal', 3: 'hard' };
    diffBadge.textContent = diffLabels[stage] || 'EASY';
    diffBadge.className = `difficulty-badge ${diffClasses[stage] || 'easy'}`;

    /* ネームプレート */
    const namePlate = document.getElementById('vn-name-plate');
    namePlate.textContent = heroine.shortName;
    namePlate.style.color = heroine.color;

    /* バストアップ画像 */
    const charaImg = document.getElementById('quiz-chara-img');
    charaImg.src = CHARA_IMAGES[heroine.id];
    charaImg.alt = heroine.shortName;

    /* キャラリアクションをリセット */
    const charaContainer = document.getElementById('quiz-chara-container');
    charaContainer.classList.remove('react-correct', 'react-wrong');

    /* 親密度バー */
    this.updateAffinity(affinity);

    /* ヒント吹き出しをリセット */
    this.hideHintBubble();

    /* 質問文 */
    document.getElementById('quiz-question').textContent = quiz.question;

    /* 選択肢 */
    const choicesContainer = document.getElementById('quiz-choices');
    choicesContainer.innerHTML = quiz.choices.map((choice, i) => `
      <button class="choice-btn animate-fade-in" style="animation-delay: ${i * 0.1}s">
        <span class="choice-number">${i + 1}</span>${choice}
      </button>
    `).join('');
  }

  /* パワーアップボタンの状態を更新する */
  updatePowerupButtons(powerups) {
    const btnMap = {
      fiftyFifty: { btn: 'btn-fifty-fifty', count: 'fifty-fifty-count' },
      hint: { btn: 'btn-hint', count: 'hint-count' },
      ask: { btn: 'btn-ask', count: 'ask-count' }
    };

    Object.entries(btnMap).forEach(([key, ids]) => {
      const btn = document.getElementById(ids.btn);
      const countEl = document.getElementById(ids.count);
      countEl.textContent = powerups[key];

      if (powerups[key] <= 0) {
        btn.classList.add('used');
        btn.disabled = true;
      } else {
        btn.classList.remove('used');
        btn.disabled = false;
      }
    });
  }

  /* ヒントコメント吹き出しを表示する */
  showHintBubble(text) {
    const bubble = document.getElementById('hint-bubble');
    const bubbleText = document.getElementById('hint-bubble-text');
    bubbleText.textContent = text;
    bubble.classList.remove('hidden');
    bubble.classList.add('animate-fade-in');
  }

  /* ヒントコメント吹き出しを非表示にする */
  hideHintBubble() {
    const bubble = document.getElementById('hint-bubble');
    bubble.classList.add('hidden');
    bubble.classList.remove('animate-fade-in');
  }

  /* 親密度バーを更新する */
  updateAffinity(value) {
    const bar = document.getElementById('affinity-bar');
    const valueEl = document.getElementById('affinity-value');
    bar.style.width = `${value}%`;
    valueEl.textContent = value;

    /* 色を親密度に応じて変える */
    if (value >= THRESHOLD_HAPPY) {
      bar.style.background = 'linear-gradient(90deg, #FF6B9D, #FF8FB8)';
      bar.style.boxShadow = '0 0 12px rgba(255, 107, 157, 0.6)';
    } else if (value < THRESHOLD_BAD) {
      bar.style.background = 'linear-gradient(90deg, #6b7280, #9ca3af)';
      bar.style.boxShadow = '0 0 8px rgba(107, 114, 128, 0.3)';
    } else {
      bar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
      bar.style.boxShadow = '0 0 8px rgba(245, 158, 11, 0.4)';
    }
  }

  /* 円形タイマーを更新する */
  updateTimer(remaining, total) {
    const circleBar = document.getElementById('timer-circle-bar');
    const timerText = document.getElementById('timer-text');
    const container = document.getElementById('timer-circle-container');
    const circumference = 2 * Math.PI * 18; /* r=18 */
    const offset = circumference * (1 - remaining / total);

    circleBar.style.strokeDashoffset = offset;
    timerText.textContent = Math.ceil(remaining);

    /* 残り時間に応じて色を変える */
    circleBar.classList.remove('warning', 'danger');
    container.classList.remove('pulse');
    if (remaining <= 5) {
      circleBar.classList.add('danger');
      container.classList.add('pulse');
    } else if (remaining <= 10) {
      circleBar.classList.add('warning');
    }
  }

  /* 正解数ドットを初期化する */
  renderScoreDots(totalQuestions) {
    const container = document.getElementById('quiz-score-dots');
    container.innerHTML = '';
    for (let i = 0; i < totalQuestions; i++) {
      const dot = document.createElement('span');
      dot.className = 'score-dot';
      dot.dataset.index = i;
      container.appendChild(dot);
    }
  }

  /* 正解数ドットを更新する（現在の問題をハイライト） */
  updateScoreDot(index, result) {
    const dots = document.querySelectorAll('.score-dot');
    if (dots[index]) {
      dots[index].classList.remove('current');
      dots[index].classList.add(result ? 'correct' : 'wrong');
    }
    /* 次の問題をハイライト */
    if (dots[index + 1]) {
      dots[index + 1].classList.add('current');
    }
  }

  /* 現在の問題ドットをハイライトする */
  highlightCurrentDot(index) {
    const dots = document.querySelectorAll('.score-dot');
    dots.forEach(d => d.classList.remove('current'));
    if (dots[index]) {
      dots[index].classList.add('current');
    }
  }

  /* 回答結果を表示する（キャラリアクション付き） */
  showAnswerResult(result, selectedIndex) {
    const buttons = document.querySelectorAll('.choice-btn');
    const charaContainer = document.getElementById('quiz-chara-container');

    buttons.forEach((btn, i) => {
      btn.classList.add('disabled');
      if (i === result.correctIndex) {
        btn.classList.add('correct');
      }
      if (i === selectedIndex && !result.isCorrect) {
        btn.classList.add('wrong');
      }
    });

    /* キャラクターのリアクション */
    charaContainer.classList.add(result.isCorrect ? 'react-correct' : 'react-wrong');

    /* エフェクト演出 */
    if (result.isCorrect) {
      this.spawnHeartParticles();
      this.pulseAffinity('up');
    } else {
      this.shakeScreen();
      this.pulseAffinity('down');
    }

    this.showFeedback(result.isCorrect, result.comment);
    this.updateAffinity(result.affinity);
  }

  /* 時間切れ結果を表示する */
  showTimeoutResult(result) {
    const buttons = document.querySelectorAll('.choice-btn');
    const charaContainer = document.getElementById('quiz-chara-container');

    buttons.forEach((btn, i) => {
      btn.classList.add('disabled');
      if (i === result.correctIndex) {
        btn.classList.add('correct');
      }
    });

    charaContainer.classList.add('react-wrong');
    this.showFeedback(false, '時間切れ！');
    this.updateAffinity(result.affinity);
  }

  /* フィードバックを表示する */
  showFeedback(isCorrect, comment) {
    const feedback = document.getElementById('quiz-feedback');
    const feedbackText = document.getElementById('feedback-text');
    const feedbackComment = document.getElementById('feedback-comment');

    feedback.classList.remove('hidden', 'correct', 'wrong');
    feedback.classList.add(isCorrect ? 'correct' : 'wrong');

    feedbackText.textContent = isCorrect
      ? `⭕ 正解！ 親密度 +${AFFINITY_CORRECT}`
      : `❌ 不正解… 親密度 ${AFFINITY_WRONG}`;
    feedbackComment.textContent = comment;
  }

  /* フィードバックを非表示にする */
  hideFeedback() {
    const feedback = document.getElementById('quiz-feedback');
    feedback.classList.add('hidden');
  }

  /* ハートパーティクルを生成する */
  spawnHeartParticles() {
    const PARTICLE_COUNT = 6;
    const container = document.getElementById('screen-quiz');
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart-particle';
      heart.textContent = '♥';
      heart.style.left = `${30 + Math.random() * 40}%`;
      heart.style.bottom = `${20 + Math.random() * 20}%`;
      heart.style.animationDelay = `${i * 0.1}s`;
      heart.style.color = `hsl(${340 + Math.random() * 30}, 80%, 65%)`;
      container.appendChild(heart);
      setTimeout(() => heart.remove(), 1600);
    }
  }

  /* 画面シェイクを実行する */
  shakeScreen() {
    const container = document.getElementById('screen-quiz');
    container.classList.add('screen-shake');
    setTimeout(() => container.classList.remove('screen-shake'), 400);
  }

  /* 親密度の脈動エフェクト */
  pulseAffinity(direction) {
    const valueEl = document.getElementById('affinity-value');
    const cls = direction === 'up' ? 'affinity-pulse-up' : 'affinity-pulse-down';
    valueEl.classList.remove('affinity-pulse-up', 'affinity-pulse-down');
    void valueEl.offsetWidth;
    valueEl.classList.add(cls);
    setTimeout(() => valueEl.classList.remove(cls), 600);
  }

  /* エンディング画面にキラキラを追加する */
  spawnSparkles(container, count) {
    for (let i = 0; i < count; i++) {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle';
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.animationDelay = `${Math.random() * 2}s`;
      sparkle.style.width = `${3 + Math.random() * 5}px`;
      sparkle.style.height = sparkle.style.width;
      container.appendChild(sparkle);
    }
  }

  /* 結果画面を描画する（VN風エンディング） */
  renderResult(endingData) {
    /* 背景をエンディング種類別に変更 */
    const resultBg = document.getElementById('result-bg');
    resultBg.className = `result-bg ${endingData.type}`;

    /* バストアップ画像 */
    const charaImg = document.getElementById('result-chara-img');
    charaImg.src = CHARA_IMAGES[endingData.heroine.id];
    charaImg.alt = endingData.heroine.shortName;

    /* エンディング種類 */
    const endingType = document.getElementById('result-ending-type');
    endingType.textContent = endingData.title;
    endingType.className = `ending-type ${endingData.type}`;

    /* ヒロイン名 */
    const heroineNameEl = document.getElementById('result-heroine-name');
    heroineNameEl.textContent = endingData.heroine.name;
    heroineNameEl.style.color = endingData.heroine.color;

    /* メッセージ */
    document.getElementById('result-message').textContent = endingData.message;

    /* スタッツ */
    document.getElementById('result-affinity').textContent = endingData.affinity;
    document.getElementById('result-correct').textContent = endingData.correctCount;
    document.getElementById('result-total-q').textContent = endingData.totalQuestions;

    /* ハッピーエンド時にキラキラ演出 */
    const resultScreen = document.getElementById('screen-result');
    resultScreen.querySelectorAll('.sparkle').forEach(s => s.remove());
    if (endingData.type === 'happy') {
      this.spawnSparkles(resultScreen, 15);
    }

    /* 次のステージボタンの表示制御 */
    const MAX_STAGE = 3;
    const btnNextStage = document.getElementById('btn-next-stage');
    const currentStage = endingData.currentStage || 1;
    if (endingData.type === 'happy' && currentStage < MAX_STAGE) {
      btnNextStage.style.display = '';
      btnNextStage.textContent = `次のステージへ（STAGE ${currentStage + 1}）`;
    } else {
      btnNextStage.style.display = 'none';
    }
  }

  /* ステータス画面のタブを描画する */
  renderStatsTabs(heroines, activeId) {
    const container = document.getElementById('stats-tabs');
    container.innerHTML = heroines.map(h => `
      <button class="stats-tab ${h.id === activeId ? 'active' : ''}"
        data-heroine-id="${h.id}"
        style="${h.id === activeId ? `background: ${h.color}; color: #fff;` : `border-color: ${h.color}; color: ${h.color};`}">
        ${h.emoji} ${h.shortName}
      </button>
    `).join('');
  }

  /* ステータス画面のコンテンツを描画する */
  renderStatsContent(heroine, statsManager) {
    const container = document.getElementById('stats-content');
    const clears = statsManager.getClearsByType(heroine.id);
    const totalClears = statsManager.getTotalClears(heroine.id);

    /* エンディング別クリア回数 */
    const clearsHtml = `
      <div class="stats-section">
        <h3 class="stats-section-title">クリア回数</h3>
        <div class="stats-clears-grid">
          <div class="stats-clear-card">
            <span class="stats-clear-count">${totalClears}</span>
            <span class="stats-clear-label">合計</span>
          </div>
          <div class="stats-clear-card happy">
            <span class="stats-clear-count">${clears.happy}</span>
            <span class="stats-clear-label">💕 ハッピー</span>
          </div>
          <div class="stats-clear-card normal">
            <span class="stats-clear-count">${clears.normal}</span>
            <span class="stats-clear-label">😊 ノーマル</span>
          </div>
          <div class="stats-clear-card bad">
            <span class="stats-clear-count">${clears.bad}</span>
            <span class="stats-clear-label">💔 バッド</span>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = `
      <div class="stats-heroine-header" style="border-color: ${heroine.color};">
        <img src="${CHARA_IMAGES[heroine.id]}" alt="${heroine.shortName}" class="stats-heroine-img">
        <div class="stats-heroine-info">
          <span class="stats-heroine-name" style="color: ${heroine.color};">${heroine.name}</span>
          <span class="stats-heroine-personality">${heroine.personality}</span>
        </div>
      </div>
      ${clearsHtml}
    `;
  }

  /* 全体のカテゴリ別正解率を描画する */
  renderGlobalCategoryStats(statsManager) {
    const container = document.getElementById('stats-global-categories');
    const categories = statsManager.getAllCategoryStats();
    const categoryKeys = Object.keys(categories);

    if (categoryKeys.length === 0) {
      container.innerHTML = `
        <div class="stats-section">
          <h3 class="stats-section-title">カテゴリ別正解率（全体）</h3>
          <p class="stats-empty">まだプレイデータがありません</p>
        </div>
      `;
      return;
    }

    const rows = categoryKeys.map(cat => {
      const data = categories[cat];
      const rate = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      return `
        <div class="stats-category-row">
          <span class="stats-category-name">${cat}</span>
          <div class="stats-category-bar-container">
            <div class="stats-category-bar" style="width: ${rate}%;"></div>
          </div>
          <span class="stats-category-rate">${rate}%</span>
          <span class="stats-category-detail">${data.correct}/${data.total}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="stats-section">
        <h3 class="stats-section-title">カテゴリ別正解率（全体）</h3>
        <div class="stats-category-list">${rows}</div>
      </div>
    `;
  }
}
