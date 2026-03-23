// デバッグモード - 公開時は index.html から <script src="js/debug.js"> を削除するだけで無効化
'use strict';

/**
 * デバッグパネルを管理するクラス
 */
class DebugPanel {
  constructor(statsManager, heroineManager, gameEngine) {
    this.stats = statsManager;
    this.heroineManager = heroineManager;
    this.game = gameEngine;
    this.isOpen = false;
    this.createPanel();
    this.bindEvents();
    console.log('🛠 デバッグモード有効');
  }

  /* デバッグパネルのHTMLを生成する */
  createPanel() {
    /* トグルボタン */
    const toggle = document.createElement('button');
    toggle.id = 'debug-toggle';
    toggle.textContent = '🛠';
    toggle.title = 'デバッグパネル';
    document.body.appendChild(toggle);

    /* パネル本体 */
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.classList.add('hidden');
    panel.innerHTML = `
      <div class="debug-header">
        <span>🛠 デバッグパネル</span>
        <button id="debug-close">✕</button>
      </div>
      <div class="debug-body">
        <div class="debug-section">
          <div class="debug-section-title">クリア状態を設定</div>
          <div class="debug-grid">
            <button class="debug-btn" data-action="happy" data-heroine="misaki" data-stage="1">美咲 S1 Happy</button>
            <button class="debug-btn" data-action="happy" data-heroine="misaki" data-stage="2">美咲 S2 Happy</button>
            <button class="debug-btn" data-action="happy" data-heroine="misaki" data-stage="3">美咲 S3 Happy</button>
            <button class="debug-btn" data-action="happy" data-heroine="rin" data-stage="1">凛 S1 Happy</button>
            <button class="debug-btn" data-action="happy" data-heroine="rin" data-stage="2">凛 S2 Happy</button>
            <button class="debug-btn" data-action="happy" data-heroine="rin" data-stage="3">凛 S3 Happy</button>
            <button class="debug-btn" data-action="happy" data-heroine="hinata" data-stage="1">ひなた S1 Happy</button>
            <button class="debug-btn" data-action="happy" data-heroine="hinata" data-stage="2">ひなた S2 Happy</button>
            <button class="debug-btn" data-action="happy" data-heroine="hinata" data-stage="3">ひなた S3 Happy</button>
          </div>
        </div>
        <div class="debug-section">
          <div class="debug-section-title">全クイズ正解済みにする</div>
          <div class="debug-grid">
            <button class="debug-btn debug-btn-accent" data-action="allquiz" data-heroine="misaki">美咲 全問正解</button>
            <button class="debug-btn debug-btn-accent" data-action="allquiz" data-heroine="rin">凛 全問正解</button>
            <button class="debug-btn debug-btn-accent" data-action="allquiz" data-heroine="hinata">ひなた 全問正解</button>
          </div>
        </div>
        <div class="debug-section">
          <div class="debug-section-title">一括操作</div>
          <div class="debug-grid">
            <button class="debug-btn debug-btn-warn" data-action="unlock-all">全キャラ解放（美咲S1 Happy）</button>
            <button class="debug-btn debug-btn-warn" data-action="complete-all">全キャラ完全クリア</button>
            <button class="debug-btn debug-btn-accent" data-action="stamina-full">スタミナ全回復</button>
            <button class="debug-btn debug-btn-danger" data-action="reset">全データリセット</button>
          </div>
        </div>
        <div class="debug-section">
          <div class="debug-section-title">現在の状態</div>
          <pre id="debug-status" class="debug-status"></pre>
        </div>
      </div>
    `;
    document.body.appendChild(panel);

    /* スタイルを注入 */
    const style = document.createElement('style');
    style.textContent = `
      #debug-toggle {
        position: fixed;
        bottom: 8px;
        left: 8px;
        z-index: 10000;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.3);
        background: rgba(0,0,0,0.6);
        color: #fff;
        font-size: 16px;
        cursor: pointer;
        backdrop-filter: blur(4px);
      }
      #debug-toggle:hover { background: rgba(0,0,0,0.8); }
      #debug-panel {
        position: fixed;
        bottom: 50px;
        left: 8px;
        z-index: 10001;
        width: 340px;
        max-height: 80vh;
        overflow-y: auto;
        background: rgba(15, 10, 25, 0.95);
        border: 1px solid rgba(168, 85, 247, 0.4);
        border-radius: 12px;
        font-family: 'Zen Maru Gothic', sans-serif;
        font-size: 12px;
        color: #e0d0f0;
        backdrop-filter: blur(12px);
      }
      #debug-panel.hidden { display: none; }
      .debug-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid rgba(168, 85, 247, 0.3);
        font-weight: 700;
      }
      #debug-close {
        background: none; border: none; color: #e0d0f0;
        cursor: pointer; font-size: 14px;
      }
      .debug-body { padding: 8px 12px; }
      .debug-section { margin-bottom: 10px; }
      .debug-section-title {
        font-weight: 700;
        font-size: 11px;
        color: rgba(168, 85, 247, 0.8);
        margin-bottom: 4px;
      }
      .debug-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .debug-btn {
        padding: 4px 8px;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 6px;
        background: rgba(255,255,255,0.08);
        color: #e0d0f0;
        font-size: 11px;
        cursor: pointer;
        font-family: inherit;
        transition: background 0.15s;
      }
      .debug-btn:hover { background: rgba(168, 85, 247, 0.3); }
      .debug-btn:active { background: rgba(168, 85, 247, 0.5); }
      .debug-btn-accent { border-color: rgba(59, 130, 246, 0.4); color: #93c5fd; }
      .debug-btn-warn { border-color: rgba(251, 191, 36, 0.4); color: #fbbf24; }
      .debug-btn-danger { border-color: rgba(239, 68, 68, 0.4); color: #f87171; }
      .debug-status {
        background: rgba(0,0,0,0.4);
        padding: 8px;
        border-radius: 6px;
        font-size: 10px;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-all;
        max-height: 200px;
        overflow-y: auto;
        margin: 0;
      }
    `;
    document.head.appendChild(style);
  }

  /* イベントリスナーを登録する */
  bindEvents() {
    document.getElementById('debug-toggle').addEventListener('click', () => {
      this.toggle();
    });

    document.getElementById('debug-close').addEventListener('click', () => {
      this.toggle();
    });

    document.getElementById('debug-panel').addEventListener('click', (e) => {
      const btn = e.target.closest('.debug-btn');
      if (!btn) return;

      const action = btn.dataset.action;
      const heroineId = btn.dataset.heroine;
      const stage = parseInt(btn.dataset.stage, 10);

      switch (action) {
        case 'happy':
          this.setHappyEnd(heroineId, stage);
          break;
        case 'allquiz':
          this.setAllQuizzesCleared(heroineId);
          break;
        case 'unlock-all':
          this.setHappyEnd('misaki', 1);
          break;
        case 'complete-all':
          this.completeAll();
          break;
        case 'stamina-full':
          this.game.stamina.recover(STAMINA_MAX);
          break;
        case 'reset':
          this.stats.reset();
          break;
      }

      this.refreshUI();
      this.updateStatus();
    });
  }

  /* パネルの開閉を切り替える */
  toggle() {
    this.isOpen = !this.isOpen;
    const panel = document.getElementById('debug-panel');
    panel.classList.toggle('hidden', !this.isOpen);
    if (this.isOpen) this.updateStatus();
  }

  /* 指定キャラ・ステージにハッピーエンドを記録する */
  setHappyEnd(heroineId, stage) {
    const h = this.stats.stats.heroines[heroineId];
    if (!h) return;
    /* 前提ステージもクリア済みにする */
    if (stage >= 1 && h.clears.happy < 1) h.clears.happy = 1;
    if (stage >= 2) {
      if (!h.stage2Clears) h.stage2Clears = { happy: 0, normal: 0, bad: 0 };
      if (h.stage2Clears.happy < 1) h.stage2Clears.happy = 1;
    }
    if (stage >= 3) {
      if (!h.stage3Clears) h.stage3Clears = { happy: 0, normal: 0, bad: 0 };
      if (h.stage3Clears.happy < 1) h.stage3Clears.happy = 1;
    }
    this.stats.save();
  }

  /* 指定キャラの全クイズを正解済みにする */
  setAllQuizzesCleared(heroineId) {
    const hm = this.heroineManager;
    const h = this.stats.stats.heroines[heroineId];
    if (!h) return;
    if (!h.categories) h.categories = {};

    /* 全ステージの全問題を正解済みに設定 */
    [hm.quizzes, hm.quizzesHard, hm.quizzesExpert].forEach(source => {
      if (!source || !source[heroineId]) return;
      source[heroineId].forEach(q => {
        const cat = q.category || '不明';
        if (!h.categories[cat]) {
          h.categories[cat] = { clearedQuestions: [] };
        }
        if (!h.categories[cat].clearedQuestions.includes(q.question)) {
          h.categories[cat].clearedQuestions.push(q.question);
        }
      });
    });
    this.stats.save();
  }

  /* 全キャラを完全クリア状態にする */
  completeAll() {
    ['misaki', 'rin', 'hinata'].forEach(id => {
      this.setHappyEnd(id, 3);
      this.setAllQuizzesCleared(id);
    });
  }

  /* UIを再描画する */
  refreshUI() {
    this.game.ui.renderHeroineCards(
      this.heroineManager.heroines,
      this.stats,
      this.game.getQuizCountByHeroine()
    );
  }

  /* 現在の状態をパネルに表示する */
  updateStatus() {
    const el = document.getElementById('debug-status');
    if (!el) return;

    const heroineIds = ['misaki', 'rin', 'hinata'];
    const lines = [];

    heroineIds.forEach(id => {
      const h = this.stats.stats.heroines[id];
      const unlocked = this.stats.isHeroineUnlocked(id);
      const s3Happy = this.stats.hasStage3HappyEnd(id);

      /* クリア済みクイズ数を集計 */
      let clearedQ = 0;
      if (h.categories) {
        Object.values(h.categories).forEach(cat => {
          clearedQ += cat.clearedQuestions ? cat.clearedQuestions.length : 0;
        });
      }

      /* 全クイズ数を集計 */
      const quizCounts = this.game.getQuizCountByHeroine()[id] || {};
      const totalQ = Object.values(quizCounts).reduce((s, n) => s + n, 0);

      lines.push(`[${id}] ${unlocked ? '🔓' : '🔒'}`);
      lines.push(`  S1: H${h.clears.happy} N${h.clears.normal} B${h.clears.bad}`);
      lines.push(`  S2: H${(h.stage2Clears||{}).happy||0} N${(h.stage2Clears||{}).normal||0} B${(h.stage2Clears||{}).bad||0}`);
      lines.push(`  S3: H${(h.stage3Clears||{}).happy||0} N${(h.stage3Clears||{}).normal||0} B${(h.stage3Clears||{}).bad||0}`);
      lines.push(`  クイズ: ${clearedQ}/${totalQ} ${s3Happy ? (clearedQ >= totalQ ? '💎パーフェクト' : '✨クリア') : ''}`);
    });

    lines.push('');
    lines.push(`[スタミナ] ${this.game.stamina.getStamina()} / ${STAMINA_MAX}`);

    el.textContent = lines.join('\n');
  }
}
