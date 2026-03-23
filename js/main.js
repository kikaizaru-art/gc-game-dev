// メインエントリーポイント - ゲームの初期化と起動
'use strict';

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

window.addEventListener('DOMContentLoaded', async () => {
  console.log('ハートクイズ ～3人の想い～ 初期化開始');

  const statsManager = new StatsManager();
  const heroineManager = new HeroineManager();
  const uiManager = new UiManager();
  const audioManager = new AudioManager();
  const gameEngine = new GameEngine(heroineManager, uiManager, audioManager, statsManager);

  await gameEngine.init();
});
