// 音声管理 - Web Audio APIでBGM・SEを生成
'use strict';

/* 音量設定（デフォルト値） */
const DEFAULT_BGM_VOLUME = 0.3;
const DEFAULT_SE_VOLUME = 0.5;
const AUDIO_SETTINGS_KEY = 'heartQuizAudioSettings';

/**
 * Web Audio APIを使用した音声管理クラス
 * 外部ファイル不要で、プログラムで音を生成する
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.bgmGain = null;
    this.seGain = null;
    this.bgmNodes = [];
    this.isBgmPlaying = false;
    this.isMuted = false;
    this.bgmVolume = DEFAULT_BGM_VOLUME;
    this.seVolume = DEFAULT_SE_VOLUME;
    this.loadSettings();
  }

  /* AudioContextを初期化する（ユーザー操作後に呼ぶ） */
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    /* BGM用ゲインノード */
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = this.isMuted ? 0 : this.bgmVolume;
    this.bgmGain.connect(this.ctx.destination);

    /* SE用ゲインノード */
    this.seGain = this.ctx.createGain();
    this.seGain.gain.value = this.isMuted ? 0 : this.seVolume;
    this.seGain.connect(this.ctx.destination);
  }

  /* 保存された音量設定を読み込む */
  loadSettings() {
    try {
      const saved = localStorage.getItem(AUDIO_SETTINGS_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        this.bgmVolume = settings.bgm !== undefined ? settings.bgm : DEFAULT_BGM_VOLUME;
        this.seVolume = settings.se !== undefined ? settings.se : DEFAULT_SE_VOLUME;
        this.isMuted = settings.muted || false;
      }
    } catch (e) {
      /* デフォルト値を使用 */
    }
  }

  /* 音量設定を保存する */
  saveSettings() {
    try {
      localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify({
        bgm: this.bgmVolume,
        se: this.seVolume,
        muted: this.isMuted
      }));
    } catch (e) {
      console.warn('音量設定の保存に失敗:', e);
    }
  }

  /* ゲインノードに現在の音量を反映する */
  applyVolume() {
    if (this.bgmGain) {
      this.bgmGain.gain.value = this.isMuted ? 0 : this.bgmVolume;
    }
    if (this.seGain) {
      this.seGain.gain.value = this.isMuted ? 0 : this.seVolume;
    }
  }

  /* ミュート切り替え */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.applyVolume();
    this.saveSettings();
    return this.isMuted;
  }

  /* ミュート状態を設定する */
  setMuted(muted) {
    this.isMuted = muted;
    this.applyVolume();
    this.saveSettings();
  }

  /* BGM音量を設定する（0.0〜1.0） */
  setBgmVolume(value) {
    this.bgmVolume = Math.max(0, Math.min(1, value));
    this.applyVolume();
    this.saveSettings();
  }

  /* SE音量を設定する（0.0〜1.0） */
  setSeVolume(value) {
    this.seVolume = Math.max(0, Math.min(1, value));
    this.applyVolume();
    this.saveSettings();
  }

  /* BGM音量を取得する */
  getBgmVolume() {
    return this.bgmVolume;
  }

  /* SE音量を取得する */
  getSeVolume() {
    return this.seVolume;
  }

  /* 正解SEを再生する */
  playCorrect() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    /* 明るい上昇音（ド→ミ→ソ） */
    this.playTone(523.25, now, 0.12, 'sine');
    this.playTone(659.25, now + 0.1, 0.12, 'sine');
    this.playTone(783.99, now + 0.2, 0.2, 'sine');
  }

  /* 不正解SEを再生する */
  playWrong() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    /* 低い下降音 */
    this.playTone(311.13, now, 0.15, 'square');
    this.playTone(233.08, now + 0.15, 0.3, 'square');
  }

  /* 時間切れSEを再生する */
  playTimeout() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    /* ブザー的な音 */
    this.playTone(200, now, 0.1, 'sawtooth');
    this.playTone(200, now + 0.15, 0.1, 'sawtooth');
    this.playTone(150, now + 0.3, 0.3, 'sawtooth');
  }

  /* パワーアップ使用SEを再生する */
  playPowerup() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    /* キラキラした上昇音 */
    this.playTone(880, now, 0.1, 'sine');
    this.playTone(1108.73, now + 0.08, 0.1, 'sine');
    this.playTone(1318.51, now + 0.16, 0.15, 'sine');
  }

  /* ボタンクリックSEを再生する */
  playClick() {
    if (!this.ctx) return;
    this.playTone(880, this.ctx.currentTime, 0.05, 'sine');
  }

  /* エンディングSEを再生する（種類別） */
  playEnding(type) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (type === 'happy') {
      /* 華やかなファンファーレ */
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        this.playTone(freq, now + i * 0.15, 0.3, 'sine');
      });
    } else if (type === 'normal') {
      /* 穏やかな和音 */
      this.playTone(440, now, 0.5, 'sine');
      this.playTone(554.37, now + 0.05, 0.5, 'sine');
      this.playTone(659.25, now + 0.1, 0.5, 'sine');
    } else {
      /* 悲しい下降音 */
      this.playTone(440, now, 0.3, 'triangle');
      this.playTone(392, now + 0.3, 0.3, 'triangle');
      this.playTone(349.23, now + 0.6, 0.5, 'triangle');
    }
  }

  /* BGMを開始する（シンプルなループメロディ） */
  startBgm() {
    if (!this.ctx || this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.playBgmLoop();
  }

  /* BGMを停止する */
  stopBgm() {
    this.isBgmPlaying = false;
    this.bgmNodes.forEach(node => {
      try { node.stop(); } catch (e) { /* 既に停止済み */ }
    });
    this.bgmNodes = [];
  }

  /* BGMループを再生する */
  playBgmLoop() {
    if (!this.isBgmPlaying || !this.ctx) return;

    const now = this.ctx.currentTime;
    /* ゆったりした恋愛ゲーム風BGM（ペンタトニック） */
    const melody = [
      { freq: 523.25, dur: 0.4 },
      { freq: 587.33, dur: 0.4 },
      { freq: 659.25, dur: 0.8 },
      { freq: 587.33, dur: 0.4 },
      { freq: 523.25, dur: 0.4 },
      { freq: 440.00, dur: 0.8 },
      { freq: 392.00, dur: 0.4 },
      { freq: 440.00, dur: 0.4 },
      { freq: 523.25, dur: 0.8 },
      { freq: 0, dur: 0.4 },
    ];

    let time = now;
    melody.forEach(note => {
      if (note.freq > 0) {
        this.playBgmNote(note.freq, time, note.dur * 0.9);
      }
      time += note.dur;
    });

    /* ループ再生のスケジューリング */
    const loopDuration = melody.reduce((sum, n) => sum + n.dur, 0);
    setTimeout(() => this.playBgmLoop(), loopDuration * 1000);
  }

  /* BGM用の1音を再生する */
  playBgmNote(freq, startTime, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    /* ソフトなアタック・リリース */
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);

    this.bgmNodes.push(osc);
    osc.onended = () => {
      this.bgmNodes = this.bgmNodes.filter(n => n !== osc);
    };
  }

  /* SE用の1音を再生する */
  playTone(freq, startTime, duration, type) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(gain);
    gain.connect(this.seGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }
}
