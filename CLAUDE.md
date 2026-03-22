# GC Game Dev - Claude Code 作業ルール

## 🔑 基本方針
- **このリポジトリが唯一の情報源（Single Source of Truth）**
- **企画・仕様・実装すべてClaude Codeが担当**
- **Gemini API は画像生成のみ利用**
- 仕様は `docs/game-design.md` に記載・更新する
- 不明点・判断に迷う場合はユーザーに確認

## 📋 作業手順
1. `docs/game-design.md` で最新仕様を確認
2. 仕様に従ってコードを実装
3. 仕様変更が必要な場合は `docs/game-design.md` を更新
4. 実装完了後 `docs/game-design.md` のステータスを ✅ に更新
5. gitコミット & プッシュ（ユーザーの指示があれば）

## 📏 コーディング規約
- 変数・関数: キャメルケース (`playerHealth`)
- 定数: 大文字スネークケース (`MAX_HP`)
- ファイル名: 小文字ケバブケース (`game-engine.js`)
- クラス名: パスカルケース (`PlayerCharacter`)
- インデント: スペース2つ
- コメント: 関数ごとに日本語で目的を記述
- マジックナンバー禁止（定数化）
- 1ファイル300行以内（超える場合は分割）

## 📂 プロジェクト構成
```
gc-game-dev/
├── CLAUDE.md              # このファイル（作業ルール）
├── index.html             # エントリーポイント
├── css/style.css          # スタイルシート
├── js/
│   ├── main.js            # 初期化・ゲームループ
│   ├── game.js            # ゲームエンジン・シーン管理
│   ├── player.js          # プレイヤー
│   ├── audio.js           # 音声管理（Web Audio API）
│   └── ui.js              # UI・画面遷移
├── assets/
│   ├── images/            # 画像素材（Gemini API生成）
│   ├── sounds/            # 音声素材
│   └── data/              # JSONデータ等
└── docs/
    └── game-design.md     # ゲーム企画書・仕様書（正）
```

## 🔀 Git運用
- コミットメッセージ: `[カテゴリ] 変更内容`
- カテゴリ: `feat` / `fix` / `refactor` / `asset` / `docs`
- リモート: `https://github.com/kikaizaru-art/gc-game-dev.git`

## 🎨 Gemini API 利用（画像生成のみ）
- キャラクター・背景・UI素材の生成に使用
- 生成した画像は `assets/images/` に保存
- 使用したプロンプトは `docs/game-design.md` の素材管理表に記録
- 統一スタイルを維持するためプロンプトにスタイル指示を含める

## ⚠️ 注意事項
- ブラウザゲームなのでNode.js依存は避ける（CDN利用推奨）
- 素材ファイル名は `docs/game-design.md` の素材管理表と一致させる
- 日本語でコメント・ログを書く
