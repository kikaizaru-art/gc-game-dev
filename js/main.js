// メインエントリーポイント - ゲームの初期化と起動
'use strict';

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

window.addEventListener('DOMContentLoaded', async () => {
  console.log('ハートクイズ ～3人の想い～ 初期化開始');

  const statsManager = new StatsManager();
  const staminaManager = new StaminaManager();
  const heroineManager = new HeroineManager();
  const uiManager = new UiManager();
  const audioManager = new AudioManager();
  const shopManager = new ShopManager();
  const adManager = new AdManager();
  const exchangeManager = new ExchangeManager();
  const gameEngine = new GameEngine(heroineManager, uiManager, audioManager, statsManager, staminaManager, adManager, shopManager, exchangeManager);

  await gameEngine.init();

  /* デバッグパネル初期化（debug.js が読み込まれている場合のみ） */
  if (typeof DebugPanel !== 'undefined') {
    new DebugPanel(statsManager, heroineManager, gameEngine);
  }
});
