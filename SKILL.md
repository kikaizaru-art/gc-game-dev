---
name: gc-game-dev
description: ブラウザ恋愛シミュレーション×クイズゲーム「ときめきクイズ ～素顔のアンサー～」の企画・実装に関する話題のときに発動する。具体的には、このゲームのタイトル名、ヒロイン3人（桜井美咲・藤原凛・天野ひなた）、「仮面の笑顔」ストーリーテーマ、クイズゲーム設計、親密度・エンディング分岐、スタミナ／チャレンジポイント（CP）／練習ステージ／ポイント交換所／着せ替え／ショップ（アプリ内課金）／広告SDK差し替え／サブゲーム（タイムアタック・耐久クイズ）、Gemini API（gemini-2.5-flash-image）での立ち絵・背景・UI素材生成やコンセプトアート先行方針、Vanilla JS + DOM操作 + localStorage構成、Vercel自動プレビュー、game-design.md仕様管理、Claude Code開発運用などの話題が出た場合に参加する。キーワード: ときめきクイズ、素顔のアンサー、恋愛ADV、ギャルゲー、クイズゲーム、ビジュアルノベル、Gemini画像生成、ヒロインルート、親密度、CP、スタミナ、仮面の笑顔。
---

# GC Game Dev —「ときめきクイズ ～素顔のアンサー～」

## プロジェクトの目的
ブラウザで動く「クイズ × 恋愛シミュレーション」ゲーム『ときめきクイズ ～素顔のアンサー～』を個人開発するプロジェクト。プレイヤーは転校生として3人のヒロイン（桜井美咲・藤原凛・天野ひなた）と出会い、クイズに答えて親密度を上げながら、各キャラが抱える「仮面の笑顔」の裏側（家族問題・過去の裏切り・優しさという檻）に触れていく。

Gemini（画像生成）と Claude Code（企画・仕様・実装）の分業で、素材生成から実装まで一貫して AI 駆動で回すワークフローを実験・確立することも目的のひとつ。

## 現在のフェーズ
- Phase 1〜4（企画確定・プロトタイプ・素材生成・全機能実装）まで **完了済**（2026-03-22〜2026-04-02）。
- 現在は **Phase 5: テスト・バグ修正** の最中。直近のコミットは UI/立ち絵素材の調整、プロローグや練習ステージの表示位置修正、コンセプトアート先行方針の導入、タイトル変更など、ポリッシュ作業中心。
- 次のマイルストーンは **Phase 6: 公開・リリース**（日付未定）。
- 最近の関心事：39枚のGemini生成画像の組み込みとリファイン、UIトーンの統一、ステージ進行時のストーリー分岐表示、顔アップの位置ずれなど表示レイアウト周り。

## 技術スタック・使用ツール
- **言語 / ランタイム**: Vanilla JavaScript（ライブラリなし）、HTML、CSS
- **レンダリング**: DOM 操作ベース（Canvas 未使用）、CSS アニメーション
- **画面サイズ**: 800×600
- **永続化**: `localStorage`（統計・パートナー・CP・スタミナ・ショップ購入状態・交換所データなど）
- **音声**: Web Audio API による合成（BGM・SE すべてコード生成）
- **フォント**: Zen Maru Gothic（Google Fonts, OFL）
- **画像生成**: Gemini API（`gemini-2.5-flash-image`）／`tools/generate-images.js` で実行
- **ホスティング / CI**: Vercel 自動プレビュー（ブランチプッシュで URL 生成）、GitHub Actions（`.github/workflows/deploy-pages.yml`）
- **開発アシスタント**: Claude Code（仕様・実装すべて担当）
- **リポジトリ**: https://github.com/kikaizaru-art/gc-game-dev

## リポジトリ構成
- `/home/user/gc-game-dev/CLAUDE.md` — Claude Code 向け作業ルール（最初に読むべき）
- `/home/user/gc-game-dev/README.md` — プロジェクト概要（簡素）
- `/home/user/gc-game-dev/docs/game-design.md` — **仕様書の正（Single Source of Truth）**。約900行、全メカニクス・全ヒロイン設定・全Geminiプロンプト・素材管理表・マイルストーンまで集約
- `/home/user/gc-game-dev/index.html` — エントリーポイント
- `/home/user/gc-game-dev/css/style.css` — 全スタイル（約77KB）
- `/home/user/gc-game-dev/js/main.js` — 初期化・ゲームループ
- `/home/user/gc-game-dev/js/game.js` — ゲームエンジン・シーン管理（最大ファイル、約60KB）
- `/home/user/gc-game-dev/js/ui.js` — UI・画面遷移（約59KB）
- `/home/user/gc-game-dev/js/player.js` — プレイヤー管理
- `/home/user/gc-game-dev/js/stamina.js` — スタミナ（時間回復・30分で +1、最大3）
- `/home/user/gc-game-dev/js/shop.js` — ショップ（課金 SDK 差し替え対応、現状モック）
- `/home/user/gc-game-dev/js/exchange.js` — ポイント交換所（服アイテム8種）
- `/home/user/gc-game-dev/js/ad.js` — 広告マネージャ（AdMob 等に差し替え可能な設計、現状モック）
- `/home/user/gc-game-dev/js/stats.js` — クリア回数・カテゴリ別正解率管理
- `/home/user/gc-game-dev/js/audio.js` — Web Audio API 合成
- `/home/user/gc-game-dev/js/debug.js` — デバッグ用（クイズスキップ等）
- `/home/user/gc-game-dev/assets/images/` — Gemini 生成画像（立ち絵・背景・UI・アイコン・エフェクト等、約40枚）
- `/home/user/gc-game-dev/assets/data/heroines.json` — ヒロイン別ストーリー・セリフ（約45KB）
- `/home/user/gc-game-dev/assets/data/prologue.json` — プロローグシナリオ
- `/home/user/gc-game-dev/assets/data/quizzes.json` / `quizzes-hard.json` / `quizzes-expert.json` / `quizzes-master.json` — 難易度別クイズデータ
- `/home/user/gc-game-dev/tools/generate-images.js` — Gemini API 画像生成スクリプト（Node.js v18+、`.env` に `GEMINI_API_KEY`）
- `/home/user/gc-game-dev/.github/workflows/deploy-pages.yml` — GitHub Pages デプロイ設定

## Claudeに期待する役割
- **企画パートナー**: ストーリー・ヒロイン設定・ゲームメカニクス・UI フローの相談相手。仕様の穴・矛盾・プレイヤー体験上の違和感を指摘してほしい。
- **仕様ライター**: 会話で決まったことを `docs/game-design.md` に反映する。仕様書が "正" なので、実装と乖離させない。
- **実装担当**: Vanilla JS + DOM 操作での実装。1ファイル300行以内、マジックナンバー禁止など CLAUDE.md の規約に従う。
- **素材プロンプトエンジニア**: Gemini API 向けの英語プロンプト設計。コンセプトアート先行方針に沿って「スタイルアンカー」を各プロンプトのプレフィックスに付与する。
- **レビュア**: 「このシステム追加は既存フローを壊さないか」「課金・広告 SDK 差し替えを見据えた抽象化が保たれているか」をチェック。
- **判断に迷ったときは勝手に進めず確認する**（CLAUDE.md の基本方針）。

## 注意事項・前提
- **このリポジトリが唯一の情報源**。外部の Google Docs に仕様が散らないよう、決まったことはすべて `docs/game-design.md` に書く。
- **コーディング規約**（CLAUDE.md）: キャメルケース（変数・関数）、大文字スネーク（定数）、ケバブケース（ファイル名）、パスカルケース（クラス）、インデント2スペース、関数ごとに日本語コメントで目的、マジックナンバー禁止、1ファイル300行以内。
- **Git運用**: コミットメッセージは `[カテゴリ] 変更内容` 形式（カテゴリ: `feat` / `fix` / `refactor` / `asset` / `docs`）。
- **Node.js 依存は避ける**（ブラウザゲームなので CDN 利用推奨）。ただし `tools/generate-images.js` は Node で動かすユーティリティなのでOK。
- **Gemini API は画像生成のみ**。企画・仕様・実装ロジックに Gemini を使わない。
- **Gemini 画像生成の制約**: 最大 1024×1024。背景など大きな素材は分割かリサイズで対応。
- **課金・広告はモック実装**。`ShopManager.purchase()` / `AdManager.showRewardedAd()` など差し替えポイントが明確化されており、将来 StoreKit / Google Play Billing / AdMob に置き換える前提で設計されている。ここを崩さないこと。
- **段階的機能解放**: タイムアタック・耐久クイズはステージ2クリア後、交換所・着替えはパートナー選択後に解放。ポイント加算もパートナー選択後から有効（それ以前はゼロ）。UI を変えるときはこの前提を崩さない。
- **ストーリーテーマ「仮面の笑顔」**: 各ヒロインは重い裏設定を持ち、S1→S4 で段階的に開示される。軽い追加シナリオを提案するときも、このトーンを尊重する。
- **キャラ解放フロー**: 初回は美咲のみ選択可能。美咲S1ハッピーエンドで凛・ひなたが解放される。プロローグは初回起動時のみ表示（`prologueWatched` フラグ制御）。
- **CP（チャレンジポイント）システム**: キャラステージ挑戦にはCPが必要（S1=3 / S2=5 / S3=8 / S4=10）。CPは練習ステージで1問正解=1CP獲得。
- **確認フロー**: 実装後は Vercel プレビュー URL で動作確認する（main にマージせずに確認可能）。
- **「現時点では未定」の領域**: リリース日、公開プラットフォーム（Web以外の展開）、BGM/SE を Web Audio 合成から差し替えるか否かは未決定。推測で埋めないこと。

## 調査手順
1. `/home/user/gc-game-dev/README.md` と `/home/user/gc-game-dev/CLAUDE.md` を読み、プロジェクトの方針と作業ルールを把握する。
2. `/home/user/gc-game-dev/docs/game-design.md` を最初から最後まで読む。これが仕様の正。迷ったらここに戻る。
3. `/home/user/gc-game-dev/js/` の各ファイルを俯瞰し、`game.js` / `ui.js` を中心に機能分割を理解する。`shop.js` / `ad.js` / `stamina.js` / `exchange.js` は SDK 差し替え境界なので特に丁寧に。
4. `/home/user/gc-game-dev/assets/data/` の JSON（`heroines.json` / `prologue.json` / `quizzes*.json`）を見て、データ駆動になっている範囲を把握する。
5. `/home/user/gc-game-dev/tools/generate-images.js` を読み、Gemini API 呼び出しの形と既存プロンプトを把握する。
6. `git log --oneline -20` で直近のコミットを見て、今何に取り組んでいるか・何が直近で壊れやすいかを把握する。
7. 不明な点は推測せず「現時点では未定」または「仕様書未記載」と明記し、ユーザーに確認する。

---

## 自己チェック（description のトリガー条件評価）

**良い点**
- 作品名（正式タイトルとサブタイトル）、ヒロイン固有名、固有のシステム名（CP・仮面の笑顔・練習ステージ・ポイント交換所）が入っており、この作品以外では誤発動しにくい。
- 「ときめきクイズ」「素顔のアンサー」「クイズゲーム」「恋愛ADV」「ギャルゲー」など、ユーザーが略称・ジャンル名で言及したときにも拾える。
- Gemini API／画像生成／Vanilla JS／localStorage など技術スタック側のキーワードも含めており、技術議論からも入れる。

**トレードオフ**
- 「クイズゲーム」「ビジュアルノベル」など一般語を含むため、ほかのクイズ/ノベルゲーム開発の文脈でも発動する可能性がある。ただし「ときめきクイズ」「素顔のアンサー」「仮面の笑顔」「CP（チャレンジポイント）」「桜井美咲・藤原凛・天野ひなた」など固有語が前面にあるため、誤発動しても「関連する自分のプロジェクトがあるが当てはまるか？」と確認するレベルで済み、実害は小さい想定。
- 逆に、ユーザーが作品名を出さず「自分のゲームのスタミナ回復どうしよう」等とぼんやり言及したときも拾いたければ、「スタミナ」「広告リワード」など汎用語をもう少し強めてもよい。現状は作品固有語優先の設計。

総じて、**このプロジェクトの話題が出たらほぼ確実に発動し、無関係な場面では滅多に発動しない**バランスになっている想定。
