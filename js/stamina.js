// スタミナ管理 - アイテム使用制限の時間回復システム
'use strict';

/* スタミナ設定 */
const STAMINA_MAX = 3;
const STAMINA_RECOVERY_MS = 30 * 60 * 1000; // 30分で1回復
const STAMINA_STORAGE_KEY = 'heartQuizStamina';

/**
 * スタミナの管理を行うクラス
 * localStorageに残数と最終消費時刻を保存し、時間経過で自動回復する
 */
class StaminaManager {
  constructor() {
    this.stamina = STAMINA_MAX;
    this.lastUsedAt = null;
    this.recoveryTimerId = null;
    this.onChangeCallback = null;
    this.load();
    this.applyRecovery();
    this.startRecoveryTimer();
  }

  /* localStorageからスタミナデータを読み込む */
  load() {
    try {
      const saved = localStorage.getItem(STAMINA_STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.stamina = typeof data.stamina === 'number' ? data.stamina : STAMINA_MAX;
        this.lastUsedAt = data.lastUsedAt ? new Date(data.lastUsedAt) : null;
      }
    } catch (e) {
      console.warn('スタミナデータの読み込みに失敗:', e);
    }
  }

  /* localStorageにスタミナデータを保存する */
  save() {
    try {
      localStorage.setItem(STAMINA_STORAGE_KEY, JSON.stringify({
        stamina: this.stamina,
        lastUsedAt: this.lastUsedAt ? this.lastUsedAt.toISOString() : null
      }));
    } catch (e) {
      console.warn('スタミナデータの保存に失敗:', e);
    }
  }

  /* 経過時間に応じてスタミナを回復する */
  applyRecovery() {
    if (this.stamina >= STAMINA_MAX || !this.lastUsedAt) return;

    const now = Date.now();
    const elapsed = now - this.lastUsedAt.getTime();
    const recovered = Math.floor(elapsed / STAMINA_RECOVERY_MS);

    if (recovered > 0) {
      const newStamina = Math.min(STAMINA_MAX, this.stamina + recovered);
      /* 回復した分だけ基準時刻を進める */
      const usedMs = recovered * STAMINA_RECOVERY_MS;
      this.lastUsedAt = new Date(this.lastUsedAt.getTime() + usedMs);

      /* 満タンなら基準時刻をクリア */
      if (newStamina >= STAMINA_MAX) {
        this.lastUsedAt = null;
      }
      this.stamina = newStamina;
      this.save();
    }
  }

  /* 定期的に回復チェックを行うタイマーを開始する */
  startRecoveryTimer() {
    if (this.recoveryTimerId) return;
    const CHECK_INTERVAL_MS = 10000; // 10秒ごとにチェック
    this.recoveryTimerId = setInterval(() => {
      const before = this.stamina;
      this.applyRecovery();
      if (this.stamina !== before && this.onChangeCallback) {
        this.onChangeCallback(this.stamina);
      }
    }, CHECK_INTERVAL_MS);
  }

  /* スタミナを1消費する。成功ならtrueを返す */
  consume() {
    if (this.stamina <= 0) return false;
    this.stamina--;
    if (!this.lastUsedAt) {
      this.lastUsedAt = new Date();
    }
    this.save();
    if (this.onChangeCallback) {
      this.onChangeCallback(this.stamina);
    }
    return true;
  }

  /* 現在のスタミナ数を取得する */
  getStamina() {
    return this.stamina;
  }

  /* 次の回復までの残り時間（ミリ秒）を取得する */
  getNextRecoveryMs() {
    if (this.stamina >= STAMINA_MAX || !this.lastUsedAt) return 0;
    const elapsed = Date.now() - this.lastUsedAt.getTime();
    const remainder = STAMINA_RECOVERY_MS - (elapsed % STAMINA_RECOVERY_MS);
    return remainder;
  }

  /* スタミナ変更時のコールバックを登録する */
  onChange(callback) {
    this.onChangeCallback = callback;
  }
}
