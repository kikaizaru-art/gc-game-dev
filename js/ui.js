// UI管理 - 画面遷移・表示更新（恋愛シミュレーション風）
'use strict';

/* キャラクター画像パスのマッピング */
const CHARA_IMAGES = {
  misaki: 'assets/images/misaki.png',
  rin: 'assets/images/rin.png',
  hinata: 'assets/images/hinata.png'
};

/* S3（素顔）キャラクター画像パス */
const CHARA_IMAGES_S3 = {
  misaki: 'assets/images/misaki-s3.png',
  rin: 'assets/images/rin-s3.png',
  hinata: 'assets/images/hinata-s3.png'
};

/* ステージ別キャラ画像を取得 */
function getCharaImage(heroineId, stage) {
  if (stage >= 3 && CHARA_IMAGES_S3[heroineId]) {
    return CHARA_IMAGES_S3[heroineId];
  }
  return CHARA_IMAGES[heroineId];
}

/* ステージ別背景画像マッピング */
const STAGE_BG_MAP = {
  misaki: {
    1: 'assets/images/bg-default.png',
    2: 'assets/images/bg-rooftop.png',
    3: 'assets/images/bg-gymnasium.png',
    4: 'assets/images/bg-morning-gate.png'
  },
  rin: {
    1: 'assets/images/bg-library.png',
    2: 'assets/images/bg-library.png',
    3: 'assets/images/bg-library.png',
    4: 'assets/images/bg-starry-sky.png'
  },
  hinata: {
    1: 'assets/images/bg-garden.png',
    2: 'assets/images/bg-default.png',
    3: 'assets/images/bg-cooking-room.png',
    4: 'assets/images/bg-morning-gate.png'
  }
};

/* ステージ別背景画像パスを取得 */
function getStageBg(heroineId, stage) {
  const map = STAGE_BG_MAP[heroineId];
  if (map && map[stage]) return map[stage];
  return 'assets/images/bg-default.png';
}

/* マイページ訪問時のキャラ別セリフ */
const MYPAGE_GREETINGS = {
  misaki: [
    'やっほー！ 会いたかったよ～♪',
    '今日も一緒に遊ぼっ！',
    'ねえねえ、クイズやろうよ！',
    'あたしのこと、もっと知りたくない？',
    'おかえり！ 待ってたんだよ♪',
    '今日もいい天気だね！ テンション上がるー！',
    'チョコ食べる？ あ、ちょっと溶けちゃった…えへへ'
  ],
  rin: [
    '…来たのね。待ってたわ。',
    '今日も勉強、頑張りましょう。',
    'あなた、最近少し成長したわね。',
    '…べ、別に待ってたわけじゃないから。',
    'クイズの準備はできてる？',
    '紅茶、淹れておいたわ。…気が向いただけよ。',
    '静かに本を読みたいの。…隣にいるのは許可するけど。'
  ],
  hinata: [
    'あっ、来てくれたんですね…！ うれしいです♪',
    '今日はどんなお話しましょうか？',
    'えへへ…会えてうれしいです。',
    'お絵描きの続き、見てくれますか？',
    'あの…一緒にいると、落ち着きます。',
    '新しいスケッチ描いたんです。見てください！',
    'ひなたぼっこ日和ですね…ふふ。'
  ]
};

/**
 * 画面描画と遷移を管理するクラス
 */
class UiManager {
  constructor() {
    this.screens = {
      title: document.getElementById('screen-title'),
      mypage: document.getElementById('screen-mypage'),
      select: document.getElementById('screen-select'),
      stageSelect: document.getElementById('screen-stage-select'),
      story: document.getElementById('screen-story'),
      prologue: document.getElementById('screen-prologue'),
      quiz: document.getElementById('screen-quiz'),
      result: document.getElementById('screen-result'),
      options: document.getElementById('screen-options'),
      stats: document.getElementById('screen-stats'),
      shop: document.getElementById('screen-shop'),
      taCategory: document.getElementById('screen-ta-category'),
      taQuiz: document.getElementById('screen-ta-quiz'),
      taResult: document.getElementById('screen-ta-result'),
      enduranceStart: document.getElementById('screen-endurance-start'),
      enduranceQuiz: document.getElementById('screen-endurance-quiz'),
      enduranceResult: document.getElementById('screen-endurance-result'),
      exchange: document.getElementById('screen-exchange'),
      dressup: document.getElementById('screen-dressup'),
      practiceSelect: document.getElementById('screen-practice-select'),
      practiceStageSelect: document.getElementById('screen-practice-stage-select'),
      practiceQuiz: document.getElementById('screen-practice-quiz'),
      practiceResult: document.getElementById('screen-practice-result')
    };
  }

  /* データ読み込みエラーを画面に表示する */
  showLoadError(message) {
    const container = document.getElementById('game-container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'screen active';
    errorDiv.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;';
    errorDiv.innerHTML = `
      <h2 style="color:#e74c3c;margin-bottom:1rem;">読み込みエラー</h2>
      <p style="margin-bottom:1.5rem;">${message}</p>
      <button class="btn btn-primary" onclick="location.reload()">再読み込み</button>
    `;
    /* 全画面を非表示にしてエラーを表示する */
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
    container.appendChild(errorDiv);
  }

  /* 画面を切り替える */
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      screen.classList.remove('active');
    });
    this.screens[screenName].classList.add('active');
    /* 通常クイズ画面・練習ステージでヘッダータイムゲージを表示 */
    this.showHeaderTimerGauge(screenName === 'quiz' || screenName === 'practiceQuiz');
    /* プロローグ・ストーリー画面ではスタミナバーを非表示にする */
    const staminaBar = document.getElementById('stamina-bar');
    const hideStamina = screenName === 'prologue' || screenName === 'story';
    staminaBar.style.display = hideStamina ? 'none' : '';
  }

  /* マイページを描画する */
  renderMyPage(heroine) {
    const charaImg = document.getElementById('mypage-chara-img');
    charaImg.src = CHARA_IMAGES[heroine.id];
    charaImg.alt = heroine.shortName;

    const nameEl = document.getElementById('mypage-chara-name');
    nameEl.textContent = heroine.shortName;
    nameEl.style.color = heroine.color;

    /* キャラのセリフを表示する */
    this.showMypageGreeting(heroine);
  }

  /* マイページでキャラのセリフをランダム表示する */
  showMypageGreeting(heroine) {
    const speechEl = document.getElementById('mypage-chara-speech');
    const greetings = MYPAGE_GREETINGS[heroine.id] || [];
    if (greetings.length === 0) {
      speechEl.classList.add('hidden');
      return;
    }
    const randomIndex = Math.floor(Math.random() * greetings.length);
    speechEl.textContent = greetings[randomIndex];
    speechEl.style.borderColor = heroine.color + '4D';
    speechEl.classList.remove('hidden');
    /* アニメーションをリセットして再生する */
    speechEl.style.animation = 'none';
    speechEl.offsetHeight;
    speechEl.style.animation = '';
  }

  /* ヒロイン選択カードを生成する（バストアップ画像付き） */
  renderHeroineCards(heroines, statsManager, quizCountByHeroine) {
    const container = document.getElementById('heroine-cards');
    container.innerHTML = heroines.map(h => {
      const isUnlocked = statsManager && statsManager.isHeroineUnlocked(h.id);
      const progress = statsManager && statsManager.getBestProgress(h.id);

      /* ロック中のキャラはロック表示 */
      if (!isUnlocked) {
        return `
          <div class="heroine-card locked" data-heroine-id="${h.id}" data-color="${h.colorName}">
            <div class="heroine-card-image">
              <img src="${CHARA_IMAGES[h.id]}" alt="${h.shortName}">
            </div>
            <div class="heroine-card-info">
              <div class="heroine-card-name" style="color: ${h.color};">${h.shortName}</div>
              <div class="heroine-card-personality">${h.personality}</div>
              <div class="heroine-card-lock-label">🔒 美咲のハッピーエンドで解放</div>
            </div>
          </div>
        `;
      }

      /* クリア・パーフェクト判定 */
      const quizCounts = quizCountByHeroine && quizCountByHeroine[h.id] || {};
      const totalQuizCount = Object.values(quizCounts).reduce((sum, n) => sum + n, 0);
      const hasStage3Happy = statsManager && statsManager.hasStage3HappyEnd(h.id);
      const hasAllCleared = statsManager && statsManager.hasAllQuizzesCleared(h.id, totalQuizCount);
      const isPartner = statsManager && statsManager.isPartner(h.id);
      const hasAnyPartner = statsManager && statsManager.hasPartner();

      /* 完了バッジ：パートナー > パーフェクト > クリア > 通常進捗 */
      let completionBadge = '';
      if (isPartner) {
        completionBadge = '<span class="card-completion-badge partner">💍 パートナー</span>';
      } else if (hasStage3Happy && hasAllCleared) {
        completionBadge = '<span class="card-completion-badge perfect"><img src="assets/images/icon-point.png" class="icon-img" alt=""> パーフェクト</span>';
      } else if (hasStage3Happy) {
        completionBadge = '<span class="card-completion-badge clear">✨ クリア</span>';
      }

      let stageBadge;
      if (progress) {
        let badgeClass;
        if (progress.stage === 4) {
          badgeClass = progress.ending === 'happy' ? 'master' : progress.ending === 'normal' ? 'cleared' : 'bad';
        } else if (progress.stage === 3) {
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

      /* パートナー選択ボタン：ステージ3ハッピーエンド済み＆パートナー未設定のキャラに表示 */
      let partnerBtn = '';
      if (hasStage3Happy && !hasAnyPartner) {
        partnerBtn = `<button class="btn btn-partner-select" data-heroine-id="${h.id}">💍 パートナーにする</button>`;
      }

      return `
        <div class="heroine-card" data-heroine-id="${h.id}" data-color="${h.colorName}">
          <div class="heroine-card-image">
            ${completionBadge}
            <img src="${CHARA_IMAGES[h.id]}" alt="${h.shortName}">
          </div>
          <div class="heroine-card-info">
            <div class="heroine-card-name" style="color: ${h.color};">${h.shortName}</div>
            <div class="heroine-card-personality">${h.personality}</div>
            <div class="heroine-card-likes">${h.description}</div>
            ${stageBadge}
            ${partnerBtn}
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
    const hasStage3Happy = statsManager.hasStage3HappyEnd(heroine.id);
    const isPartner = statsManager.isPartner(heroine.id);
    const hasAnyPartner = statsManager.hasPartner();
    const rank = statsManager.getHeroineRank(heroine.id);
    const container = document.getElementById('stage-select-cards');

    /* ステージ4の解放条件：このヒロインがパートナーであること */
    const stage4Unlocked = isPartner && hasStage3Happy;
    /* 他のキャラとパートナーの場合はロック理由を変える */
    const stage4LockReason = !hasStage3Happy
      ? '🔒 STAGE 3 ハッピーエンドで解放'
      : (hasAnyPartner && !isPartner)
        ? '🔒 他のキャラがパートナーです'
        : '🔒 パートナーになると解放';

    container.innerHTML = `
      <div class="stage-select-rank-bar">ランク: <span class="rank-badge" style="color:${rank.color}">${rank.label}</span></div>
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
      <div class="stage-card ${stage4Unlocked ? '' : 'locked'}" data-stage="4">
        <div class="stage-card-badge master">STAGE 4</div>
        <div class="stage-card-difficulty">MASTER</div>
        <div class="stage-card-desc">${stage4Unlocked ? `${heroine.shortName}との永遠の絆` : '???'}</div>
        ${stage4Unlocked ? '' : `<div class="stage-card-lock">${stage4LockReason}</div>`}
      </div>
    `;
  }

  /* ストーリー画面を初期化する */
  renderStoryScene(heroine, stage = 1) {
    const storyBg = document.getElementById('story-bg');
    storyBg.className = `story-bg ${heroine.colorName}`;
    /* ステージ別背景画像を設定 */
    const bgPath = getStageBg(heroine.id, stage);
    storyBg.style.backgroundImage = `url('${bgPath}')`;

    const charaImg = document.getElementById('story-chara-img');
    charaImg.src = getCharaImage(heroine.id, stage);
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

  /* プロローグ中のタイピング判定 */
  isPrologueTyping() {
    const textEl = document.getElementById('prologue-text');
    return textEl.classList.contains('typing');
  }

  /* プロローグのタイピングをスキップする */
  skipPrologueTyping() {
    const textEl = document.getElementById('prologue-text');
    const intervalId = parseInt(textEl.dataset.typeInterval, 10);
    if (intervalId) {
      clearInterval(intervalId);
      textEl.textContent = textEl.dataset.fullText || '';
      textEl.classList.remove('typing');
      textEl.dataset.typeInterval = '';
    }
  }

  /* プロローグのセリフを表示する（複数キャラ対応） */
  showPrologueLine(line) {
    const SPEAKER_MAP = {
      misaki: { name: '美咲', color: '#FF6B9D', image: CHARA_IMAGES.misaki },
      rin: { name: '凛', color: '#4A90D9', image: CHARA_IMAGES.rin },
      hinata: { name: 'ひなた', color: '#7BC67E', image: CHARA_IMAGES.hinata }
    };

    const namePlate = document.getElementById('prologue-name-plate');
    const textEl = document.getElementById('prologue-text');
    const charaContainer = document.getElementById('prologue-chara-container');
    const charaImg = document.getElementById('prologue-chara-img');
    const bg = document.getElementById('prologue-bg');

    if (line.speaker === 'narration') {
      namePlate.classList.add('hidden');
      charaContainer.classList.remove('visible');
    } else {
      const speaker = SPEAKER_MAP[line.speaker];
      if (speaker) {
        namePlate.classList.remove('hidden');
        namePlate.textContent = speaker.name;
        namePlate.style.color = speaker.color;
        charaImg.src = speaker.image;
        charaImg.alt = speaker.name;
        charaContainer.classList.add('visible');
        /* 話者に合わせて背景色を変更する */
        bg.className = `story-bg ${line.speaker}`;
      }
    }

    textEl.textContent = '';
    return this.typeText(textEl, line.text);
  }

  /* クイズ画面を描画する（VN風レイアウト） */
  renderQuiz({ quiz, heroine, questionNumber, totalQuestions, affinity, isSecondPlay, currentStage }) {
    /* 背景をキャラ・ステージ別に変更 */
    const quizBg = document.getElementById('quiz-bg');
    quizBg.className = `quiz-bg ${heroine.colorName}`;
    const bgPath = getStageBg(heroine.id, currentStage || 1);
    quizBg.style.backgroundImage = `url('${bgPath}')`;

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

    /* バストアップ画像（ステージ3以降はS3画像） */
    const charaImg = document.getElementById('quiz-chara-img');
    charaImg.src = getCharaImage(heroine.id, currentStage || 1);
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

  /* パワーアップボタンの有効/無効を更新する */
  updatePowerupButtons(states) {
    const btnMap = {
      fiftyFifty: 'btn-fifty-fifty',
      hint: 'btn-hint',
      ask: 'btn-ask'
    };

    Object.entries(btnMap).forEach(([key, btnId]) => {
      const btn = document.getElementById(btnId);
      if (states[key]) {
        btn.classList.remove('used');
        btn.disabled = false;
      } else {
        btn.classList.add('used');
        btn.disabled = true;
      }
    });
  }

  /* スタミナゲージを更新する */
  updateStaminaGauge(current, nextRecoveryMs) {
    const dots = document.querySelectorAll('.stamina-dot');
    dots.forEach((dot, i) => {
      if (i < current) {
        dot.classList.add('filled');
        dot.classList.remove('empty');
      } else {
        dot.classList.remove('filled');
        dot.classList.add('empty');
      }
    });

    const timerEl = document.getElementById('stamina-timer');
    if (current >= STAMINA_MAX || nextRecoveryMs <= 0) {
      timerEl.textContent = '';
    } else {
      const totalSec = Math.ceil(nextRecoveryMs / 1000);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      timerEl.textContent = `${min}:${String(sec).padStart(2, '0')}`;
    }
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

  /* ヘッダータイムゲージを更新する */
  updateTimer(remaining, total) {
    const headerBar = document.getElementById('header-timer-bar');
    const pct = (remaining / total) * 100;
    headerBar.style.width = `${pct}%`;

    /* 残り時間に応じて色を変える */
    headerBar.classList.remove('warning', 'danger');
    if (remaining <= 5) {
      headerBar.classList.add('danger');
    } else if (remaining <= 10) {
      headerBar.classList.add('warning');
    }
  }

  /* ヘッダータイムゲージの表示/非表示を切り替える */
  showHeaderTimerGauge(visible) {
    const gauge = document.getElementById('header-timer-gauge');
    if (visible) {
      gauge.classList.remove('hidden');
    } else {
      gauge.classList.add('hidden');
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
  renderResult(endingData, statsManager) {
    /* 背景をエンディング種類別に変更 */
    const resultBg = document.getElementById('result-bg');
    resultBg.className = `result-bg ${endingData.type}`;

    /* エンディングオーバーレイ画像を設定 */
    const endingOverlay = document.getElementById('result-ending-overlay');
    if (endingOverlay) {
      const stage = endingData.currentStage || 1;
      let overlayPath;
      if (endingData.type === 'happy' && ENDING_OVERLAY_MAP.happy[stage]) {
        overlayPath = ENDING_OVERLAY_MAP.happy[stage];
      } else if (ENDING_OVERLAY_MAP[endingData.type]) {
        overlayPath = ENDING_OVERLAY_MAP[endingData.type];
      }
      if (overlayPath) {
        endingOverlay.src = overlayPath;
        setTimeout(() => endingOverlay.classList.add('visible'), 300);
      } else {
        endingOverlay.classList.remove('visible');
      }
    }

    /* バストアップ画像（ステージ3以降はS3画像） */
    const charaImg = document.getElementById('result-chara-img');
    charaImg.src = getCharaImage(endingData.heroine.id, endingData.currentStage || 1);
    charaImg.alt = endingData.heroine.shortName;

    /* パーフェクト表示（全問正解時） */
    const perfectLabel = document.getElementById('result-perfect-label');
    const isPerfect = endingData.correctCount === endingData.totalQuestions;
    perfectLabel.style.display = isPerfect ? '' : 'none';

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
    const MAX_STAGE = 4;
    const btnNextStage = document.getElementById('btn-next-stage');
    const currentStage = endingData.currentStage || 1;
    const heroineId = endingData.heroine.id;
    /* ステージ3→4は、パートナーになった場合のみ（パートナー選択後に表示更新される） */
    const canAdvance = endingData.type === 'happy' && currentStage < MAX_STAGE
      && (currentStage < 3 || (statsManager && statsManager.isPartner(heroineId)));
    if (canAdvance) {
      btnNextStage.style.display = '';
      btnNextStage.textContent = `次のステージへ（STAGE ${currentStage + 1}）`;
    } else {
      btnNextStage.style.display = 'none';
    }
  }

  /* ステータス画面のタブを描画する */
  renderStatsTabs(heroines, activeId) {
    const container = document.getElementById('stats-tabs');
    const allColor = '#aaa';
    const isAll = activeId === 'all';
    const allTab = `
      <div class="stats-tabs-row stats-tabs-row-all">
        <button class="stats-tab stats-tab-all ${isAll ? 'active' : ''}"
          data-heroine-id="all"
          style="${isAll ? `background: ${allColor}; color: #fff;` : `border-color: ${allColor}; color: ${allColor};`}">
          📊 全体
        </button>
      </div>
    `;
    const heroineTabs = heroines.map(h => `
      <button class="stats-tab ${h.id === activeId ? 'active' : ''}"
        data-heroine-id="${h.id}"
        style="${h.id === activeId ? `background: ${h.color}; color: #fff;` : `border-color: ${h.color}; color: ${h.color};`}">
        ${h.emoji} ${h.shortName}
      </button>
    `).join('');
    container.innerHTML = allTab + `<div class="stats-tabs-row">${heroineTabs}</div>`;
  }

  /* カテゴリ別クリア状況のHTMLを生成する（カテゴリごとにゲージ表示） */
  buildCategoryClearHtml(clearStatus, title) {
    if (clearStatus.length === 0) {
      return `
        <div class="stats-section">
          <h3 class="stats-section-title">${title}</h3>
          <p class="stats-empty">まだプレイデータがありません</p>
        </div>
      `;
    }
    const rows = clearStatus.map(cat => {
      const rate = cat.total > 0 ? Math.round((cat.cleared / cat.total) * 100) : 0;
      const isComplete = cat.cleared >= cat.total;
      return `
        <div class="stats-category-row ${isComplete ? 'cleared' : ''}">
          <span class="stats-category-name">${cat.name}</span>
          <div class="stats-category-bar-container">
            <div class="stats-category-bar ${isComplete ? 'complete' : ''}" style="width: ${rate}%;"></div>
          </div>
          <span class="stats-category-count">${cat.cleared} / ${cat.total}</span>
        </div>
      `;
    }).join('');
    return `
      <div class="stats-section">
        <h3 class="stats-section-title">${title}</h3>
        <div class="stats-category-list">${rows}</div>
      </div>
    `;
  }

  /* ステータス画面のコンテンツを描画する（キャラ別） */
  renderStatsContent(heroine, statsManager, quizCountByCategory) {
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

    /* キャラ別カテゴリクリア状況 */
    const clearStatus = statsManager.getHeroineCategoryClearStatus(heroine.id, quizCountByCategory);
    const categoryHtml = this.buildCategoryClearHtml(clearStatus, 'カテゴリクリア状況');

    container.innerHTML = `
      <div class="stats-heroine-header" style="border-color: ${heroine.color};">
        <img src="${CHARA_IMAGES[heroine.id]}" alt="${heroine.shortName}" class="stats-heroine-img">
        <div class="stats-heroine-info">
          <span class="stats-heroine-name" style="color: ${heroine.color};">${heroine.name}</span>
          <span class="stats-heroine-personality">${heroine.personality}</span>
        </div>
      </div>
      ${clearsHtml}
      ${categoryHtml}
      <div class="stats-heroine-reset">
        <button class="btn btn-danger-small" data-reset-heroine="${heroine.id}">
          ${heroine.shortName}のデータをリセット
        </button>
      </div>
    `;
  }

  /* 全体ステータス画面を描画する */
  renderStatsAll(heroines, statsManager, quizCountByHeroine) {
    const container = document.getElementById('stats-content');

    /* 全キャラ合計クリア回数 */
    let totalAll = 0;
    let happyAll = 0;
    let normalAll = 0;
    let badAll = 0;
    heroines.forEach(h => {
      const c = statsManager.getClearsByType(h.id);
      happyAll += c.happy;
      normalAll += c.normal;
      badAll += c.bad;
    });
    totalAll = happyAll + normalAll + badAll;

    const clearsHtml = `
      <div class="stats-section">
        <h3 class="stats-section-title">全体クリア回数</h3>
        <div class="stats-clears-grid">
          <div class="stats-clear-card">
            <span class="stats-clear-count">${totalAll}</span>
            <span class="stats-clear-label">合計</span>
          </div>
          <div class="stats-clear-card happy">
            <span class="stats-clear-count">${happyAll}</span>
            <span class="stats-clear-label">💕 ハッピー</span>
          </div>
          <div class="stats-clear-card normal">
            <span class="stats-clear-count">${normalAll}</span>
            <span class="stats-clear-label">😊 ノーマル</span>
          </div>
          <div class="stats-clear-card bad">
            <span class="stats-clear-count">${badAll}</span>
            <span class="stats-clear-label">💔 バッド</span>
          </div>
        </div>
      </div>
    `;

    /* 全キャラのカテゴリクリア状況をまとめて表示 */
    let allCategoryHtml = '';
    heroines.forEach(h => {
      const quizCounts = quizCountByHeroine[h.id] || {};
      const clearStatus = statsManager.getHeroineCategoryClearStatus(h.id, quizCounts);
      allCategoryHtml += this.buildCategoryClearHtml(clearStatus, `${h.emoji} ${h.shortName}`);
    });

    container.innerHTML = `
      <div class="stats-all-header">
        <span class="stats-all-icon">📊</span>
        <span class="stats-all-title">全体ステータス</span>
      </div>
      ${clearsHtml}
      ${allCategoryHtml}
    `;
  }

  /* 全体のカテゴリ別正解率を描画する（非表示制御用） */
  renderGlobalCategoryStats(statsManager, activeId) {
    const container = document.getElementById('stats-global-categories');
    container.innerHTML = '';
  }

  /* オプション画面の状態を反映する */
  renderOptions(audioManager, statsManager) {
    /* 音量スライダー */
    const bgmRange = document.getElementById('range-bgm');
    const seRange = document.getElementById('range-se');
    const bgmValue = document.getElementById('range-bgm-value');
    const seValue = document.getElementById('range-se-value');

    const bgmVol = audioManager.getBgmVolume();
    const seVol = audioManager.getSeVolume();
    bgmRange.value = Math.round(bgmVol * 100);
    seRange.value = Math.round(seVol * 100);
    bgmValue.textContent = Math.round(bgmVol * 100);
    seValue.textContent = Math.round(seVol * 100);

    /* ミュート */
    document.getElementById('chk-mute').checked = audioManager.isMuted;

    /* 未確認クイズ優先 */
    document.getElementById('chk-prioritize-unconfirmed').checked = statsManager.getPrioritizeUnconfirmed();
  }

  /* タイムアタック：カテゴリ選択画面を描画する */
  renderTaCategoryList(categories, records, categoryCounts) {
    const container = document.getElementById('ta-category-list');
    if (categories.length === 0) {
      container.innerHTML = '<p class="subgame-empty">クリア済みの問題がありません</p>';
      return;
    }
    const TA_REQUIRED_COUNT = 10;
    container.innerHTML = categories.map(cat => {
      const record = records[cat];
      const count = (categoryCounts && categoryCounts[cat]) || 0;
      const isPlayable = count >= TA_REQUIRED_COUNT;
      const quizCountText = `${count}問`;
      const recordText = record
        ? `ベスト: ${record.time.toFixed(1)}s / ${record.correct}問正解`
        : isPlayable ? 'まだ記録なし' : `あと${TA_REQUIRED_COUNT - count}問クリアが必要`;
      const disabledClass = isPlayable ? '' : 'disabled';
      return `
        <button class="subgame-category-btn ${disabledClass}" data-category="${cat}" ${isPlayable ? '' : 'disabled'}>
          <span class="subgame-category-name">${cat}<span class="subgame-category-count">${quizCountText}</span></span>
          <span class="subgame-category-record">${recordText}</span>
        </button>
      `;
    }).join('');
  }

  /* タイムアタック：クイズ画面を描画する */
  renderTaQuiz(quiz, categoryName, questionNumber, totalQuestions) {
    const bg = document.getElementById('ta-quiz-bg');
    bg.className = 'quiz-bg pink';

    const namePlate = document.getElementById('ta-name-plate');
    namePlate.textContent = `Q${questionNumber}/${totalQuestions}`;
    namePlate.style.color = '#ec4899';

    document.getElementById('ta-category-label').textContent = categoryName;
    document.getElementById('ta-quiz-question').textContent = quiz.question;

    const choicesContainer = document.getElementById('ta-quiz-choices');
    choicesContainer.innerHTML = quiz.choices.map((choice, i) => `
      <button class="choice-btn animate-fade-in" style="animation-delay: ${i * 0.05}s">
        <span class="choice-number">${i + 1}</span>${choice}
      </button>
    `).join('');
  }

  /* タイムアタック：経過時間を更新する */
  updateTaTimer(elapsedMs) {
    const el = document.getElementById('ta-elapsed-time');
    el.textContent = `${(elapsedMs / 1000).toFixed(1)}s`;
  }

  /* タイムアタック：スコアドットを初期化する */
  renderTaScoreDots(total) {
    const container = document.getElementById('ta-score-dots');
    container.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      dot.className = 'score-dot';
      dot.dataset.index = i;
      container.appendChild(dot);
    }
  }

  /* タイムアタック：スコアドットを更新する */
  updateTaScoreDot(index, isCorrect) {
    const dots = document.getElementById('ta-score-dots').querySelectorAll('.score-dot');
    if (dots[index]) {
      dots[index].classList.remove('current');
      dots[index].classList.add(isCorrect ? 'correct' : 'wrong');
    }
    if (dots[index + 1]) {
      dots[index + 1].classList.add('current');
    }
  }

  /* タイムアタック：フィードバックを表示する */
  showTaFeedback(isCorrect) {
    const feedback = document.getElementById('ta-quiz-feedback');
    const text = document.getElementById('ta-feedback-text');
    feedback.classList.remove('hidden', 'correct', 'wrong');
    feedback.classList.add(isCorrect ? 'correct' : 'wrong');
    text.textContent = isCorrect ? '⭕' : '❌';
  }

  /* タイムアタック：フィードバックを非表示にする */
  hideTaFeedback() {
    document.getElementById('ta-quiz-feedback').classList.add('hidden');
  }

  /* タイムアタック：回答結果を表示する */
  showTaAnswerResult(selectedIndex, correctIndex, isCorrect) {
    const buttons = document.getElementById('ta-quiz-choices').querySelectorAll('.choice-btn');
    buttons.forEach((btn, i) => {
      btn.classList.add('disabled');
      if (i === correctIndex) btn.classList.add('correct');
      if (i === selectedIndex && !isCorrect) btn.classList.add('wrong');
    });
    this.showTaFeedback(isCorrect);
  }

  /* タイムアタック：結果画面を描画する */
  renderTaResult(timeMs, correct, total, categoryName, isNewRecord) {
    document.getElementById('ta-result-time').textContent = `${(timeMs / 1000).toFixed(1)}s`;
    document.getElementById('ta-result-correct').textContent = `${correct} / ${total}`;
    document.getElementById('ta-result-category').textContent = categoryName;
    const recordEl = document.getElementById('ta-result-record');
    recordEl.style.display = isNewRecord ? '' : 'none';
  }

  /* 耐久クイズ：クイズ画面を描画する */
  renderEnduranceQuiz(quiz, streak) {
    const colors = ['pink', 'blue', 'green'];
    const bg = document.getElementById('endurance-quiz-bg');
    bg.className = `quiz-bg ${colors[streak % colors.length]}`;

    const namePlate = document.getElementById('endurance-name-plate');
    namePlate.textContent = `Q${streak + 1}`;
    namePlate.style.color = '#f59e0b';

    document.getElementById('endurance-streak').textContent = streak;
    document.getElementById('endurance-quiz-question').textContent = quiz.question;

    const choicesContainer = document.getElementById('endurance-quiz-choices');
    choicesContainer.innerHTML = quiz.choices.map((choice, i) => `
      <button class="choice-btn animate-fade-in" style="animation-delay: ${i * 0.05}s">
        <span class="choice-number">${i + 1}</span>${choice}
      </button>
    `).join('');
  }

  /* 耐久クイズ：フィードバックを表示する */
  showEnduranceFeedback(isCorrect) {
    const feedback = document.getElementById('endurance-quiz-feedback');
    const text = document.getElementById('endurance-feedback-text');
    feedback.classList.remove('hidden', 'correct', 'wrong');
    feedback.classList.add(isCorrect ? 'correct' : 'wrong');
    text.textContent = isCorrect ? '⭕' : '❌ ゲームオーバー';
  }

  /* 耐久クイズ：フィードバックを非表示にする */
  hideEnduranceFeedback() {
    document.getElementById('endurance-quiz-feedback').classList.add('hidden');
  }

  /* 耐久クイズ：回答結果を表示する */
  showEnduranceAnswerResult(selectedIndex, correctIndex, isCorrect) {
    const buttons = document.getElementById('endurance-quiz-choices').querySelectorAll('.choice-btn');
    buttons.forEach((btn, i) => {
      btn.classList.add('disabled');
      if (i === correctIndex) btn.classList.add('correct');
      if (i === selectedIndex && !isCorrect) btn.classList.add('wrong');
    });
    this.showEnduranceFeedback(isCorrect);
  }

  /* 耐久クイズ：結果画面を描画する */
  renderEnduranceResult(streak, missedQuestion, isNewRecord) {
    document.getElementById('endurance-result-streak').textContent = streak;
    const missEl = document.getElementById('endurance-result-miss');
    missEl.textContent = missedQuestion ? `不正解の問題: ${missedQuestion}` : '';
    const recordEl = document.getElementById('endurance-result-record');
    recordEl.style.display = isNewRecord ? '' : 'none';
  }

  /* パートナー選択プロンプトを表示する */
  showPartnerPrompt(heroine) {
    const overlay = document.getElementById('partner-prompt-overlay');
    const nameEl = document.getElementById('partner-prompt-name');
    const imgEl = document.getElementById('partner-prompt-img');
    nameEl.textContent = heroine.shortName;
    nameEl.style.color = heroine.color;
    imgEl.src = CHARA_IMAGES[heroine.id];
    imgEl.alt = heroine.shortName;
    overlay.classList.remove('hidden');
  }

  /* パートナー選択プロンプトを非表示にする */
  hidePartnerPrompt() {
    document.getElementById('partner-prompt-overlay').classList.add('hidden');
  }

  /* パートナー確定演出を表示する */
  showPartnerConfirmation(heroine) {
    const overlay = document.getElementById('partner-confirm-overlay');
    const nameEl = document.getElementById('partner-confirm-name');
    const imgEl = document.getElementById('partner-confirm-img');
    nameEl.textContent = heroine.shortName;
    nameEl.style.color = heroine.color;
    imgEl.src = CHARA_IMAGES[heroine.id];
    imgEl.alt = heroine.shortName;
    overlay.classList.remove('hidden');
    /* キラキラ演出 */
    overlay.querySelectorAll('.sparkle').forEach(s => s.remove());
    this.spawnSparkles(overlay, 20);
  }

  /* パートナー確定演出を非表示にする */
  hidePartnerConfirmation() {
    document.getElementById('partner-confirm-overlay').classList.add('hidden');
  }

  /* ===========================
     ポイント交換所
     =========================== */

  /* 交換所画面を描画する（交換のみ、装備機能なし） */
  renderExchangeScreen(exchangeManager) {
    const pointsEl = document.getElementById('exchange-points-value');
    pointsEl.textContent = exchangeManager.getPoints().toLocaleString();

    /* アイテム一覧を生成する */
    const listEl = document.getElementById('exchange-items-list');
    const items = exchangeManager.getAllItems();

    listEl.innerHTML = items.map(item => {
      const owned = exchangeManager.ownsItem(item.id);
      const canAfford = exchangeManager.getPoints() >= item.price;
      const stateClass = owned ? ' owned' : '';

      let actionHtml = '';
      if (owned) {
        actionHtml = '<span class="exchange-owned-badge">所持中</span>';
      } else {
        const priceClass = canAfford ? '' : ' not-enough';
        actionHtml = `
          <span class="exchange-item-price${priceClass}">
            <img src="assets/images/icon-point.png" class="icon-img price-icon" alt="">${item.price}
          </span>
          <button class="btn-exchange-buy" data-item-id="${item.id}" ${canAfford ? '' : 'disabled'}>交換する</button>
        `;
      }

      return `
        <div class="exchange-item${stateClass}" data-item-id="${item.id}">
          <div class="exchange-item-icon">${item.icon}</div>
          <div class="exchange-item-info">
            <div class="exchange-item-name">${item.name}</div>
            <div class="exchange-item-desc">${item.description}</div>
          </div>
          <div class="exchange-item-action">
            ${actionHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  /* ===========================
     着替えページ
     =========================== */

  /* 着替え画面を描画する */
  renderDressupScreen(exchangeManager, heroine) {
    /* キャラ画像を設定する */
    const charaImg = document.getElementById('dressup-chara-img');
    charaImg.src = CHARA_IMAGES[heroine.id];
    charaImg.alt = heroine.shortName;

    /* 現在装備中の服名を表示する */
    const labelEl = document.getElementById('dressup-current-label');
    const equippedItem = exchangeManager.getEquippedItem();
    labelEl.textContent = equippedItem
      ? `${equippedItem.icon} ${equippedItem.name}`
      : 'デフォルト';

    /* プレビューオーバーレイを更新する */
    this.updateOutfitOverlay('dressup-outfit-overlay', equippedItem);

    /* 所持アイテム一覧を生成する */
    const listEl = document.getElementById('dressup-items-list');
    const ownedItems = exchangeManager.getOwnedItems();
    const equippedId = exchangeManager.getEquippedItemId();

    let html = '';

    /* デフォルト（服なし）の選択肢 */
    const defaultActive = !equippedId ? ' active' : '';
    html += `
      <div class="dressup-item default-item${defaultActive}" data-item-id="">
        <div class="dressup-item-icon">👕</div>
        <div class="dressup-item-info">
          <div class="dressup-item-name">デフォルト</div>
          <div class="dressup-item-desc">通常の服装に戻す</div>
        </div>
        ${!equippedId ? '<span class="dressup-item-badge">着用中</span>' : ''}
      </div>
    `;

    if (ownedItems.length === 0) {
      html += '<p class="dressup-empty-msg">まだ服を持っていません。<br>交換所でポイントと交換しよう！</p>';
    } else {
      ownedItems.forEach(item => {
        const isActive = item.id === equippedId ? ' active' : '';
        const badge = item.id === equippedId ? '<span class="dressup-item-badge">着用中</span>' : '';
        html += `
          <div class="dressup-item${isActive}" data-item-id="${item.id}">
            <div class="dressup-item-icon">${item.icon}</div>
            <div class="dressup-item-info">
              <div class="dressup-item-name">${item.name}</div>
              <div class="dressup-item-desc">${item.description}</div>
            </div>
            ${badge}
          </div>
        `;
      });
    }

    listEl.innerHTML = html;
  }

  /* 服オーバーレイを更新する（指定IDの要素に適用） */
  updateOutfitOverlay(overlayId, equippedItem) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.innerHTML = '';
    if (equippedItem) {
      const deco = document.createElement('div');
      deco.className = `dressup-decoration ${equippedItem.cssClass}`;
      deco.textContent = equippedItem.icon;
      overlay.appendChild(deco);
    }
  }

  /* マイページにポイント表示を更新する */
  updateMypagePoints(points) {
    let el = document.getElementById('mypage-points-display');
    if (!el) {
      el = document.createElement('div');
      el.id = 'mypage-points-display';
      el.className = 'mypage-points-display';
      const mypage = document.getElementById('screen-mypage');
      const content = mypage.querySelector('.mypage-content');
      content.appendChild(el);
    }
    el.innerHTML = `
      <img src="assets/images/icon-point.png" class="icon-img points-icon" alt="">
      <span class="points-value">${points.toLocaleString()}</span>
    `;
  }

  /* マイページのポイント表示を非表示にする */
  hideMypagePoints() {
    const el = document.getElementById('mypage-points-display');
    if (el) el.remove();
  }

  /* マイページの着せ替えオーバーレイを更新する */
  updateDressupOverlay(equippedItem) {
    this.updateOutfitOverlay('mypage-dressup-overlay', equippedItem);
  }

  /* ポイント獲得ポップアップを表示する */
  showPointsEarnedPopup(points, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const popup = document.createElement('div');
    popup.className = 'points-earned-popup';
    popup.textContent = `+${points} pt`;
    container.style.position = 'relative';
    container.appendChild(popup);
    setTimeout(() => popup.remove(), 1600);
  }

  /* ===========================
     練習ステージ描画
     =========================== */

  /* 練習キャラ選択画面を描画する */
  renderPracticeHeroineSelect(heroines, statsManager) {
    const container = document.getElementById('practice-heroine-cards');
    container.innerHTML = heroines.map(h => {
      const unlocked = statsManager.isHeroineUnlocked(h.id);
      const rank = statsManager.getHeroineRank(h.id);
      const maxStage = statsManager.getMaxPracticeStage(h.id);
      return `
        <div class="practice-heroine-card ${unlocked ? '' : 'locked'}" data-heroine-id="${h.id}">
          <div class="practice-heroine-img-wrap">
            <img class="practice-heroine-img" src="${CHARA_IMAGES[h.id]}" alt="${h.shortName}">
            ${unlocked ? '' : '<div class="practice-heroine-lock">🔒</div>'}
          </div>
          <div class="practice-heroine-info">
            <div class="practice-heroine-name" style="color:${h.color}">${h.shortName}</div>
            ${unlocked ? `
              <div class="practice-heroine-rank" style="color:${rank.color}">${rank.label}</div>
              <div class="practice-heroine-stages">練習S1〜S${maxStage} 解放</div>
            ` : '<div class="practice-heroine-lock-text">美咲S1ハッピーで解放</div>'}
          </div>
        </div>
      `;
    }).join('');
  }

  /* 練習ステージ選択画面を描画する */
  renderPracticeStageSelect(heroine, statsManager) {
    const rank = statsManager.getHeroineRank(heroine.id);
    const infoEl = document.getElementById('practice-stage-info');
    infoEl.innerHTML = `
      <div class="practice-stage-heroine">
        <img class="practice-stage-heroine-img" src="${CHARA_IMAGES[heroine.id]}" alt="${heroine.shortName}">
        <div class="practice-stage-heroine-detail">
          <span class="practice-stage-heroine-name" style="color:${heroine.color}">${heroine.shortName}</span>
          <span class="practice-stage-rank" style="color:${rank.color}">${rank.label}</span>
        </div>
      </div>
    `;

    const stageNames = { 1: 'EASY', 2: 'NORMAL', 3: 'HARD', 4: 'MASTER' };
    const stageBadgeClass = { 1: 'easy', 2: 'normal', 3: 'hard', 4: 'master' };
    const container = document.getElementById('practice-stage-cards');
    container.innerHTML = [1, 2, 3, 4].map(stage => {
      const unlocked = statsManager.isPracticeStageUnlocked(heroine.id, stage);
      const best = statsManager.getPracticeClear(heroine.id, stage);
      const reqRank = statsManager.getRequiredRankForPracticeStage(stage);
      return `
        <div class="practice-stage-card ${unlocked ? '' : 'locked'}" data-stage="${stage}">
          <div class="practice-stage-badge ${stageBadgeClass[stage]}">STAGE ${stage}</div>
          <div class="practice-stage-difficulty">${stageNames[stage]}</div>
          ${unlocked
            ? `<div class="practice-stage-best">ベスト: ${best > 0 ? `${best}/${PRACTICE_QUIZ_COUNT}` : '未挑戦'}</div>`
            : `<div class="practice-stage-lock">🔒 ${reqRank}で解放</div>`
          }
        </div>
      `;
    }).join('');
  }

  /* 練習ステージのスコアドットを描画する */
  renderPracticeScoreDots(count) {
    const container = document.getElementById('practice-score-dots');
    container.innerHTML = Array.from({ length: count }, (_, i) =>
      `<span class="score-dot" data-index="${i}"></span>`
    ).join('');
  }

  /* 練習ステージのスコアドットを更新する */
  updatePracticeScoreDot(index, isCorrect) {
    const dots = document.getElementById('practice-score-dots').querySelectorAll('.score-dot');
    if (dots[index]) {
      dots[index].classList.add(isCorrect ? 'correct' : 'wrong');
    }
  }

  /* 練習ステージのクイズを描画する */
  renderPracticeQuiz(quiz, questionNumber, totalQuestions) {
    document.getElementById('practice-quiz-question').textContent =
      `Q${questionNumber}. ${quiz.question}`;

    const choicesContainer = document.getElementById('practice-quiz-choices');
    choicesContainer.innerHTML = quiz.choices.map((choice, i) =>
      `<button class="choice-btn" data-index="${i}">${choice}</button>`
    ).join('');
  }

  /* 練習ステージのフィードバックを非表示にする */
  hidePracticeFeedback() {
    const fb = document.getElementById('practice-quiz-feedback');
    fb.classList.add('hidden');
  }

  /* 練習ステージの回答結果を表示する */
  showPracticeAnswerResult(selectedIndex, correctIndex, isCorrect) {
    const fb = document.getElementById('practice-quiz-feedback');
    const text = document.getElementById('practice-feedback-text');
    const comment = document.getElementById('practice-feedback-comment');

    fb.classList.remove('hidden');
    fb.className = `quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`;

    if (selectedIndex === -1) {
      text.textContent = '⏰ 時間切れ！';
    } else {
      text.textContent = isCorrect ? '⭕ 正解！' : '❌ 不正解…';
    }

    /* コメントがあれば表示する */
    const quiz = document.getElementById('practice-quiz-question');
    comment.textContent = '';

    /* 選択肢ボタンの色分け */
    const buttons = document.getElementById('practice-quiz-choices').querySelectorAll('.choice-btn');
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === correctIndex) btn.classList.add('correct');
      if (i === selectedIndex && !isCorrect) btn.classList.add('wrong');
    });
  }
}
