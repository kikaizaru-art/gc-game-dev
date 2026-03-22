// UI管理 - 画面遷移・表示更新
'use strict';

/**
 * 画面描画と遷移を管理するクラス
 */
class UiManager {
  constructor() {
    this.screens = {
      title: document.getElementById('screen-title'),
      select: document.getElementById('screen-select'),
      quiz: document.getElementById('screen-quiz'),
      result: document.getElementById('screen-result')
    };
  }

  /* 画面を切り替える */
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      screen.classList.remove('active');
    });
    this.screens[screenName].classList.add('active');
  }

  /* ヒロイン選択カードを生成する */
  renderHeroineCards(heroines) {
    const container = document.getElementById('heroine-cards');
    container.innerHTML = heroines.map(h => `
      <div class="heroine-card" data-heroine-id="${h.id}" data-color="${h.colorName}">
        <div class="heroine-card-avatar" style="background: ${h.color}20;">
          <span>${h.emoji}</span>
        </div>
        <div class="heroine-card-name" style="color: ${h.color};">${h.shortName}</div>
        <div class="heroine-card-personality">${h.personality}</div>
        <div class="heroine-card-likes">${h.description}</div>
      </div>
    `).join('');
  }

  /* クイズ画面を描画する */
  renderQuiz({ quiz, heroine, questionNumber, totalQuestions, affinity }) {
    /* ヒロイン情報 */
    document.getElementById('quiz-heroine-name').textContent = heroine.shortName;
    document.getElementById('quiz-heroine-name').style.color = heroine.color;

    /* アバター */
    const avatar = document.getElementById('heroine-avatar');
    avatar.style.background = `${heroine.color}20`;
    avatar.textContent = heroine.emoji;

    /* 親密度バー */
    this.updateAffinity(affinity);

    /* 進捗 */
    document.getElementById('quiz-number').textContent = questionNumber;
    document.getElementById('quiz-total').textContent = totalQuestions;

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

  /* 親密度バーを更新する */
  updateAffinity(value) {
    const bar = document.getElementById('affinity-bar');
    const valueEl = document.getElementById('affinity-value');
    bar.style.width = `${value}%`;
    valueEl.textContent = value;

    /* 色を親密度に応じて変える */
    if (value >= THRESHOLD_HAPPY) {
      bar.style.background = 'linear-gradient(90deg, #ec4899, #f472b6)';
    } else if (value < THRESHOLD_BAD) {
      bar.style.background = 'linear-gradient(90deg, #6b7280, #9ca3af)';
    } else {
      bar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    }
  }

  /* タイマーバーを更新する */
  updateTimer(remaining, total) {
    const bar = document.getElementById('timer-bar');
    const percent = Math.max(0, (remaining / total) * 100);
    bar.style.width = `${percent}%`;

    /* 残り時間に応じて色を変える */
    bar.classList.remove('warning', 'danger');
    if (remaining <= 5) {
      bar.classList.add('danger');
    } else if (remaining <= 10) {
      bar.classList.add('warning');
    }
  }

  /* 回答結果を表示する */
  showAnswerResult(result, selectedIndex) {
    const buttons = document.querySelectorAll('.choice-btn');

    buttons.forEach((btn, i) => {
      btn.classList.add('disabled');
      if (i === result.correctIndex) {
        btn.classList.add('correct');
      }
      if (i === selectedIndex && !result.isCorrect) {
        btn.classList.add('wrong');
      }
    });

    this.showFeedback(result.isCorrect, result.comment);
    this.updateAffinity(result.affinity);
  }

  /* 時間切れ結果を表示する */
  showTimeoutResult(result) {
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach((btn, i) => {
      btn.classList.add('disabled');
      if (i === result.correctIndex) {
        btn.classList.add('correct');
      }
    });

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

  /* 結果画面を描画する */
  renderResult(endingData) {
    /* ヒロインアバター */
    const avatar = document.getElementById('result-heroine-avatar');
    avatar.style.background = `${endingData.heroine.color}20`;
    avatar.textContent = endingData.heroine.emoji;

    /* エンディング種類 */
    const endingType = document.getElementById('result-ending-type');
    endingType.textContent = endingData.title;
    endingType.className = `ending-type ${endingData.type}`;

    /* ヒロイン名 */
    document.getElementById('result-heroine-name').textContent = endingData.heroine.name;
    document.getElementById('result-heroine-name').style.color = endingData.heroine.color;

    /* メッセージ */
    document.getElementById('result-message').textContent = endingData.message;

    /* スタッツ */
    document.getElementById('result-affinity').textContent = endingData.affinity;
    document.getElementById('result-correct').textContent = endingData.correctCount;
    document.getElementById('result-total-q').textContent = endingData.totalQuestions;
  }
}
