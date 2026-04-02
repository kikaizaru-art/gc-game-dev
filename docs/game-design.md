# 🎮 ゲーム企画書・仕様書

> このファイルがゲームの全仕様を管理する唯一のドキュメントです。

---

## 📋 基本情報
| 項目 | 内容 |
|---|---|
| ゲームタイトル | ときめきクイズ ～素顔のアンサー～ |
| ジャンル | クイズ × 恋愛シミュレーション |
| プラットフォーム | ブラウザ |
| 開発言語 | JavaScript（DOM操作ベース） |
| 対象プレイヤー | カジュアルゲーマー・恋愛シミュレーション好き |

---

## 🎮 ゲームメカニクス
| 項目 | 内容 |
|---|---|
| コアループ | ヒロイン選択 → ストーリー → クイズに答える → 親密度変動 → 結果で分岐エンディング |
| キャラ解放 | 初回は美咲のみ選択可能。美咲のステージ1でハッピーエンドを達成すると凛・ひなたが解放される |
| 操作（キーボード） | 1/2/3キーで選択肢を選ぶ |
| 操作（マウス/タッチ） | クリック/タップで選択肢を選ぶ |
| 勝利条件 | 親密度80以上でハッピーエンド |
| 敗北条件 | 親密度30以下でバッドエンド |
| スコア・報酬 | 親密度（0〜100）・エンディングの種類 |

### クイズルール
- 1回のプレイで10問出題
- 正解: 親密度 +10
- 不正解: 親密度 -5
- 初期親密度: 50
- 制限時間: 1問15秒（時間切れは不正解扱い）

### パワーアップアイテム ✅
クイズ中に使えるお助けアイテム。スタミナを消費して使用する。

| アイテム | アイコン | 効果 |
|---|---|---|
| 二択（50/50） | ✂ | 不正解の選択肢を1つランダムに消す |
| ヒント | 💡 | 正解の選択肢を光らせて教える |
| おしえて | 💬 | ヒロインが正解の頭文字をヒントとして教えてくれる |

- 各アイテムは1ステージにつき1回のみ使用可能
- 同じ問題で同種のアイテムは1回のみ使用可能
- スタミナ0のときはすべてのアイテムが使用不可
- 選択肢の下にパワーアップバーとして表示
- 使用済みアイテムはグレーアウトして無効化
- 使用時にキラキラSEを再生

### スタミナシステム ✅
アイテム使用を制限するスタミナゲージ。

- 最大スタミナ: 3
- アイテム1回使用につきスタミナ1消費
- 30分ごとにスタミナ1回復
- スタミナはlocalStorageに保存され、ゲームを閉じても時間経過で回復する
- クイズ画面のパワーアップバー上部にスタミナゲージを表示
- 回復までの残り時間をカウントダウン表示

### 広告によるスタミナ回復 ✅
ステージクリア後、広告を視聴してスタミナを回復できる。

- 結果画面に「広告を見てスタミナ回復」ボタンを表示
- ボタン表示条件: スタミナが最大未満 かつ 広告が視聴可能
- 広告視聴完了でスタミナ1回復
- 現在はモック実装（3秒のダミー広告）
- 将来的にAdMob等のSDKに差し替え可能な設計（`js/ad.js` の `AdManager` クラス）
- SDK導入時の変更箇所: `AdManager.isRewardedAdReady()` と `AdManager.showRewardedAd()` のみ

### ショップ（アプリ内課金） ✅
タイトル画面からアクセスできるショップ。Google Play Billing / StoreKit に差し替え可能な設計。

#### 商品一覧
| 商品ID | 名前 | 価格 | 種別 | 内容 |
|---|---|---|---|---|
| `ad_free_stamina_recovery` | 広告なしプラン | ¥480 | 買い切り | 広告非表示＋ステージクリア時スタミナ全回復 |

#### 広告なしプランの効果
- 結果画面の「広告を見てスタミナ回復」ボタンが非表示になる
- ステージクリア時（結果画面表示時）にスタミナが自動で全回復する
- 購入状態はlocalStorageに保存（SDK導入時はレシート検証に差し替え）

#### 実装
- `js/shop.js` の `ShopManager` クラスで購入状態を管理
- 現在はモック実装（即座に購入成功）
- SDK導入時の変更箇所: `ShopManager.purchase()` と `ShopManager.restorePurchases()` のみ
- 購入復元機能あり（App Store審査要件対応）

### ポイント交換所 ✅
マイページからアクセスできるポイント交換所。クイズで獲得したポイントで服アイテムと交換できる。

#### ポイント獲得
| アクション | 獲得ポイント |
|---|---|
| クイズ正解 | 1問につき10pt |
| ハッピーエンディング | +100pt |
| ノーマルエンディング | +50pt |
| バッドエンディング | +20pt |
| パーフェクト（全問正解）ボーナス | +200pt |
| タイムアタック完了 | 30pt + 正解数×5pt |
| 耐久クイズ | 連続正解数×5pt |

#### 服アイテム一覧
| ID | 名前 | 価格 | 説明 |
|---|---|---|---|
| `school_uniform` | セーラー服🎒 | 50pt | 清楚なセーラー服 |
| `casual_onepiece` | カジュアルワンピ👗 | 100pt | ふんわり可愛いワンピース |
| `sports_wear` | スポーツウェア🏃 | 120pt | 元気いっぱいスポーティースタイル |
| `gothic_dress` | ゴシックドレス🖤 | 150pt | ダークでクールなゴシックドレス |
| `maid_outfit` | メイド服🫖 | 180pt | フリルたっぷりのメイド服 |
| `kimono` | 着物👘 | 200pt | 華やかな和装スタイル |
| `idol_costume` | アイドル衣装🎤 | 250pt | キラキラ輝くステージ衣装 |
| `princess_dress` | プリンセスドレス👑 | 500pt | 豪華絢爛なお姫様ドレス |

#### 機能
- **交換所**: ポイントで服アイテムと交換するのみ（装備操作なし）
- **着替えページ**: マイページから別途アクセス、所持している服の中から1着を選んで着替え
- 服は1着のみ装備可能（切り替え式、デフォルトに戻すことも可能）
- 装備中の服はマイページ・着替えページのキャラ画像上に表示（絵文字オーバーレイ）
- マイページに現在のポイント数を表示
- ポイントとアイテムデータはlocalStorageに保存（キー: `heartQuizExchange`）

#### 実装
- `js/exchange.js` の `ExchangeManager` クラスで管理
- 服アイテムは絵文字＋CSSで表現
- `equippedItem` は単一ID（null = デフォルト）

### プロローグシステム ✅
初回起動時にプロローグ（転校初日の3人との出会い）を表示し、自然に美咲のステージ1に導入する。

#### プロローグの流れ
1. **場面**: 転校初日の放課後。主人公は一人で帰り支度をしている
2. **美咲との出会い**: 廊下でぶつかる。元気に話しかけてくる
3. **凛との出会い**: 図書室の前で本を落とした凛を手伝う
4. **ひなたとの出会い**: 中庭で花に水やりをしているひなたに道を聞く
5. **美咲の誘い**: 帰り道で美咲がクイズに誘う → そのまま美咲ステージ1へ

#### 初回起動フロー
```
タイトル → スタート → プロローグ → 美咲S1（クイズ） → 結果 → マイページ解放
```

#### 実装仕様
- プロローグは初回のみ表示（`prologueWatched` フラグで制御）
- プロローグ中に選択肢なし（読み進めるだけ）
- プロローグ終了後、自動で美咲のステージ1クイズに遷移
- 2回目以降の起動はタイトル→マイページ（通常フロー）
- プロローグ完了フラグは `localStorage['heartQuizStats']` に保存
- プロローグデータは `assets/data/prologue.json` に格納

### キャラ解放シーン ✅
美咲S1ハッピーエンド後、凛・ひなたが声をかけてくるシーンを表示する。

- 凛: 知的好奇心を刺激されてクイズに興味を持つ
- ひなた: 美咲から楽しかったと聞いてクイズをやりたがる
- 解放シーンは結果画面→マイページ遷移時に1回だけ表示
- 既存のストーリー表示システムを再利用する

### ストーリー分岐 ✅
プレイ状況に応じて異なるストーリーを表示する。

| 条件 | 表示ストーリー | データキー |
|---|---|---|
| 初回プレイ（選択画面から） | 出会いストーリー | `story` |
| リトライ（ステージ1未クリア） | リトライストーリー | `storyRetry` |
| ステージ2（ハッピーエンド達成後） | 再会ストーリー | `story2` |
| ステージ3（ステージ2ハッピーエンド達成後） | 秘密開示ストーリー | `story3` |
| ステージ4（パートナー限定） | 本当の自分ストーリー | `story4` |

- リトライストーリーはステージ1クリアまで毎回表示される短いシーン
- 各ヒロインの性格に合ったセリフで再挑戦を促す
- ステージ進行に応じて「仮面の笑顔」テーマが段階的に開示される

### 練習ステージ＆チャレンジポイント（CP）システム ✅
キャラステージに気軽にトライするのではなく、練習ステージでCPを稼いでからチャレンジする仕組み。

#### 練習ステージ
- マイページの「練習する」ボタンからアクセス
- 全ヒロイン・全難易度のクイズプールからランダム5問出題
- 制限時間: 1問15秒
- ストーリーや親密度の概念なし（純粋なクイズ練習）
- 正解1問につき **1 CP** 獲得（1回最大5CP）
- 何度でも繰り返しプレイ可能

#### チャレンジポイント（CP）
| ステージ | 必要CP |
|---|---|
| STAGE 1（EASY） | 3 CP |
| STAGE 2（NORMAL） | 5 CP |
| STAGE 3（HARD） | 8 CP |
| STAGE 4（MASTER） | 10 CP |

- キャラステージ開始時にCPを消費する
- CPが足りない場合はステージに挑戦できない
- CPはlocalStorageに保存（キー: `heartQuizCP`）
- マイページに現在のCP数を常時表示
- ステージ選択画面で各ステージの必要CPと所持CPを表示

#### ゲームフロー
```
マイページ → 練習する → 5問クイズ → 結果（CP獲得） → マイページ
                                                    ↓（CPが貯まったら）
マイページ → あそぶ → ヒロイン選択 → ステージ選択（CP消費） → ストーリー → クイズ
```

### ステージ構成 ✅
| ステージ | 難易度 | 解放条件 | 必要CP | エンディング |
|---|---|---|---|---|
| STAGE 1 | EASY | 最初から | 3 CP | ハッピー/ノーマル/バッド |
| STAGE 2 | NORMAL | ステージ1ハッピーエンド | 5 CP | トゥルー/ノーマル/バッド |
| STAGE 3 | HARD | ステージ2ハッピーエンド | 8 CP | パーフェクト💎/ノーマル/バッド |
| STAGE 4 | MASTER | パートナー＋ステージ3ハッピーエンド | 10 CP | エターナル💍/ノーマル/バッド |

### パートナーシステム ✅
- ステージ3でハッピーエンドを達成したキャラは、ヒロイン選択画面で「パートナーにする」ボタンが表示される
- ハッピーエンド未達成のキャラはパートナー選択不可
- パートナーは1キャラのみ（一度決めると変更・解消不可）
- パートナーになると、そのキャラのステージ4（MASTER難易度）が解放される
- パートナー済みなら全キャラのパートナー選択ボタンが非表示になる
- パートナーデータは `localStorage` の `heartQuizPartner` キーに保存される

### 段階的機能解放 ✅
マイページのボタンはプレイ進行に応じて段階的に解放される。

| 機能 | 解放条件 | 未解放時の表示 |
|---|---|---|
| あそぶ / ステータス / ショップ / オプション | 最初から利用可能 | — |
| タイムアタック | いずれかのヒロインでステージ2クリア（エンディング種別問わず） | 🔒 グレーアウト + ヒント表示 |
| 耐久クイズ | いずれかのヒロインでステージ2クリア（エンディング種別問わず） | 🔒 グレーアウト + ヒント表示 |
| 交換所 | パートナー選択後 | 🔒 グレーアウト + ヒント表示 |
| 着替え | パートナー選択後 | 🔒 グレーアウト + ヒント表示 |

- ロック中のボタンはグレーアウト＋鍵アイコン＋解放条件のヒントを表示
- ロック中でもタップ可能（alert で解放条件を案内）
- 解放条件を満たすとマイページ再表示時に自動で解除される
- **ポイント加算もパートナー選択後から有効**（それ以前のクイズクリアではポイント非加算）
- マイページのポイント表示もパートナー選択前は非表示

### マイページ表示 ✅
- マイページには最も進行が進んでいるヒロインが自動表示される
- 進行度はステージ×エンディング種別（happy > normal > bad）で比較
- お気に入り選択機能は廃止

---

## 👤 プレイヤー
| 項目 | 内容 |
|---|---|
| 名前 | プレイヤー（入力可能） |
| 役割 | 転校生。クイズに答えてヒロインと仲良くなる |

---

## 💕 ヒロインキャラクター

### ストーリーテーマ：「仮面の笑顔」
ヒロインたちは表の顔の裏に、それぞれ重い事情を抱えている。ステージが進むにつれて「本当の姿」が見えてくる。

- **S1**: 表の顔だけが見える。典型的な恋愛もの。ふとした違和感のヒント
- **S2**: ヒロインの笑顔に亀裂が入る瞬間。意味深な発言、行動の違和感
- **S3**: 秘密が明かされる。ヒロインが初めて本音を打ち明ける
- **S4**: 秘密を知った上で一緒にいることを選ぶ。仮面を外して本当の自分で生きる決意

クイズ正解＝信頼の積み重ね。「この人になら話してもいい」とヒロインが心を開く根拠になる。

### 桜井 美咲（さくらい みさき）— 「空元気の太陽」
| 項目 | 内容 |
|---|---|
| 性格 | 元気で明るい。スポーツ好きで活発 |
| 好きなもの | スポーツ、アウトドア、甘いもの |
| 嫌いなもの | 暗い場所、退屈なこと |
| テーマカラー | ピンク (#FF6B9D) |
| 一人称 | あたし |
| 裏設定 | 両親が離婚調停中。家では毎晩怒鳴り声。明るく振る舞うのは「自分まで暗くなったら壊れる」から |
| 核心 | 甘いものを食べると昔の幸せな家族の記憶を思い出せるから好き |

### 藤原 凛（ふじわら りん）— 「氷の鎧」
| 項目 | 内容 |
|---|---|
| 性格 | クールで知的。読書家で成績優秀 |
| 好きなもの | 読書、紅茶、星空観察 |
| 嫌いなもの | 騒がしい場所、不正確な情報 |
| テーマカラー | 青 (#4A90D9) |
| 一人称 | 私 |
| 裏設定 | 中学時代に親友に裏切られ、信頼した相手に秘密を全校に晒された。以来、誰にも心を開けない |
| 核心 | 星は裏切らないから好き。「人間と違って、星はいつも同じ場所にいてくれる」 |

### 天野 ひなた（あまの ひなた）— 「優しさという檻」
| 項目 | 内容 |
|---|---|
| 性格 | おっとり癒し系。料理上手で優しい |
| 好きなもの | 料理、動物、お花 |
| 嫌いなもの | ケンカ、辛い食べ物 |
| テーマカラー | 緑 (#7BC67E) |
| 一人称 | わたし |
| 裏設定 | 過度に厳しい家庭で育ち「良い子でいなさい」と刷り込まれた。他人に合わせることでしか自分の価値を感じられない |
| 核心 | 料理は唯一「自分で決められること」。レシピ通りではなく自分の味を作れる小さな自由 |

---

## 🔄 ゲームフロー・画面遷移
```
【初回】タイトル → [スタート] → プロローグ → 美咲S1クイズ → 結果 → マイページ解放
                                                                    ↓（ハッピーエンドなら）
                                                              キャラ解放シーン

【2回目以降】タイトル → [スタート] → マイページ → ヒロイン選択 → ストーリー → クイズ → 結果
```

### 各画面のボタン
| 画面 | ボタン |
|---|---|
| タイトル | スタート / ステータス |
| ヒロイン選択 | ヒロイン1〜3 / 戻る |
| ストーリー | クリック/タップで進行（6行程度、約30秒） |
| クイズ | 選択肢1〜3 |
| 結果 | もう一度 / タイトルへ |
| ステータス | キャラタブ切替 / データリセット / 戻る |

---

## 🏆 エンディング分岐
| 親密度 | エンディング | 説明 |
|---|---|---|
| 80〜100 | ハッピーエンド 💕 | ヒロインと両想いに |
| 40〜79 | ノーマルエンド 😊 | 友達としていい関係に |
| 0〜39 | バッドエンド 💔 | ヒロインに嫌われてしまう |

---

## 🎮 サブゲーム ✅
マイページからアクセスできるミニゲームモード。

### タイムアタック
- カテゴリ別に10問のクイズを出題
- 全問回答にかかった時間と正解数を記録
- カテゴリ別にベスト記録を保存（正解数優先、同数ならタイム優先）
- 制限時間なし（できるだけ速く正確に）

### 耐久クイズ
- 全カテゴリ・全ヒロインのクイズからランダム出題
- 不正解で即ゲームオーバー
- 連続正解数を記録、ベスト記録を保存
- クイズプールが尽きたら再シャッフルして継続

---

## 🎨 アート・ビジュアル
| 項目 | 内容 |
|---|---|
| スタイル | アニメ風イラスト / ソフトな色使い |
| カラーパレット | パステル系・キャラごとのテーマカラー |
| 統一プロンプト指示 | anime style, soft pastel colors, dating sim character |

### 🖼️ コンセプトアート（最優先で生成）

> **方針**: 個別素材を生成する前に、まずコンセプトアートでゲーム全体のビジュアル方向性を確立する。
> 以降のすべての素材生成は、このコンセプトアートのスタイル・色味・雰囲気を参照して統一感を保つ。

#### ステップ1: メインビジュアル（コンセプトアート）

ゲーム全体の世界観・キャラクターの関係性・色彩設計を1枚で表現する。

**ファイル名**: `concept-art-main.png`

**プロンプト**:
```
high quality anime illustration concept art for a romantic visual novel quiz game titled "ときめきクイズ ～素顔のアンサー～",

three high school heroines standing together under a cherry blossom tree in a school courtyard:
- left: cheerful energetic short-haired girl (pink-tinted light brown bob, amber eyes, bright smile, pink theme),
- center: cool intellectual long-haired girl (dark blue-black straight hair, sharp sapphire eyes, composed expression, blue theme),
- right: gentle shy girl with braids (honey-brown twin braids, round olive-green eyes, soft smile, green theme),

Japanese high school setting, warm afternoon golden hour lighting,
cherry blossom petals gently falling, soft bokeh light effects,
pastel color palette with pink (#FF6B9D), blue (#4A90D9), green (#7BC67E) as character accent colors,
warm cream and lavender base tones, soft watercolor-like shading,
delicate line art, expressive anime eyes with detailed light reflections,
romantic and inviting atmosphere with a hint of mystery,
each girl wearing the same school blazer uniform but with personal touches showing their personality,
visual novel game key visual style, promotional illustration quality
```

**目的**: この1枚でGemini APIに「このゲームの画風」を定義させる。色味・線のタッチ・光の入り方・キャラの頭身バランスがここで決まる。

| ステータス |
|---|
| ⬜ 未生成 |

---

#### ステップ2: UIスタイルリファレンスシート

ボタン・フレーム・アイコンなどUI要素のデザイン言語を1枚で統一する。

**ファイル名**: `concept-art-ui-sheet.png`

**プロンプト**:
```
anime style game UI design reference sheet for a romantic visual novel quiz game,
organized layout showing multiple UI elements on one sheet:

top row: title logo design with elegant Japanese typography, heart and cherry blossom decorations, pink and gold gradient,
middle row: three button styles (pink primary, lavender secondary, coral accent) with rounded rectangle shape and soft inner glow,
bottom left: text dialogue box frame with semi-transparent dark panel and ornamental pink-gold border,
bottom right: set of small icons (heart, star, hourglass timer, lightning bolt stamina) in matching pastel pink style,

consistent design language throughout: soft pastel color palette,
cherry blossom motif as recurring decoration element,
pink (#FF6B9D) as primary UI color, gold (#FFD700) as accent,
cream and white base with soft shadows,
cute but elegant romantic visual novel aesthetic,
clean organized reference sheet layout with spacing between elements,
transparent-ready designs with clear edges
```

**目的**: UI素材を個別生成する際、このシートを参照してスタイルの一貫性を保つ。ボタンの角丸み・影の付け方・装飾の密度が統一される。

| ステータス |
|---|
| ⬜ 未生成 |

---

#### ステップ3: 背景ムードボード

背景素材の色調・パース・雰囲気を統一するリファレンス。

**ファイル名**: `concept-art-bg-mood.png`

**プロンプト**:
```
anime background art mood board reference sheet for a romantic visual novel set in a Japanese high school,
4-panel layout showing different locations with consistent art style:

top-left: classroom with warm afternoon sunlight, cherry blossoms outside window,
top-right: school rooftop with golden sunset sky and chain-link fence,
bottom-left: quiet library with warm lamp light and tall bookshelves,
bottom-right: courtyard garden with flower beds and gentle sunlight,

all panels sharing the same visual style:
soft pastel color palette with warm undertones,
watercolor-like soft edges and atmospheric perspective,
golden hour lighting as default mood,
no characters, visual novel background style,
consistent level of detail and rendering across all panels,
gentle dreamy atmosphere connecting all scenes
```

**目的**: 背景の彩度・コントラスト・空気遠近法のレベルを統一する。

| ステータス |
|---|
| ⬜ 未生成 |

---

#### 素材生成フロー（コンセプトアート活用手順）

```
1. コンセプトアート3枚を生成（メインビジュアル → UIシート → 背景ムード）
2. 生成結果を確認し、方向性をユーザーと合意
3. 各素材の個別プロンプトに「in the same art style as the concept art,」を追加
4. コンセプトアートを参照画像としてGemini APIに渡しつつ個別素材を生成
5. 生成した素材がコンセプトアートと乖離していないかチェック
```

> **注意**: Gemini API（gemini-2.5-flash-image）はテキストプロンプトのみで参照画像の入力は未対応の場合、
> コンセプトアートのスタイルを言語化した「スタイルアンカー」をプレフィックスとして各プロンプトに付与する。
> スタイルアンカーはコンセプトアート生成後に、その結果の特徴を記述して作成する。

---

### キャラクターデザイン詳細設定

#### 共通スタイル指示（全キャラ共通プレフィックス）
```
high quality anime style visual novel character art, Japanese high school setting,
soft pastel color palette, detailed facial expressions, emotional depth,
full body portrait, white background, dating sim aesthetic,
delicate line art with soft shading, expressive eyes with light reflections
```

---

#### 🌸 桜井 美咲（さくらい みさき）— 「空元気の太陽」

**コンセプト**: 太陽のように明るく振る舞うが、笑顔の奥に影を宿す少女。デザインのポイントは「一見元気いっぱい、よく見ると無理している」ギャップ。

**身体的特徴**:
- 身長: やや低め（155cm程度）、小柄で活発な体型
- 髪: ショートボブ、ピンクがかった明るい栗色、毛先が外ハネでふわっと跳ねている
- 目: 大きな丸い瞳、アンバー（琥珀色）、キラキラしたハイライト多め
- 肌: 健康的な色白、頬にほんのりピンク
- 表情の癖: 口角を上げて笑うとき、目が笑っていない瞬間がある

**服装**:
- 制服: ブレザータイプ、リボン（ピンク）をゆるく結んでいる、スカートは膝上
- 袖をまくっている（活発さの表現）
- 胸元にお守りストラップ（家族の思い出の品 → ストーリーの伏線）
- 靴: スニーカー風のローファー（走り回る性格）

**カラーパレット**:
- メイン: #FF6B9D（ピンク）、サブ: #FFB7D0（淡いピンク）
- アクセント: #FFA040（オレンジ — 太陽のイメージ）
- 影の色: #9E4565（深いローズ — 裏設定を暗示）

**ステージ別表情・雰囲気ガイド**:

| ステージ | 表情 | 雰囲気 | ビジュアルポイント |
|---|---|---|---|
| S1（表の顔） | 満面の笑顔、元気いっぱい | 明るく眩しい、向日葵のよう | 目にハイライトが多く、影がほぼない |
| S2（亀裂） | 笑顔だが目が潤んでいる | 夕暮れの光、暖色だが寂しさ | 笑顔のまま涙が一筋、仮面のヒビのメタファー |
| S3（秘密開示） | 仮面を外した素顔、泣き顔 | 体育館裏の薄暗い光 | 膝を抱えて座る、髪が顔にかかる、お守りを握りしめる |
| S4（本当の自分） | 穏やかな微笑み、自然体 | 朝日のような温かい光 | 無理のない柔らかい笑顔、目にも自然な光 |

**S1用プロンプト（デフォルト立ち絵）**:
```
high quality anime style visual novel character art, full body portrait, white background,
cheerful energetic high school girl, 155cm, small and active build,
short pink-tinted light brown bob haircut with outward-flipping ends, bouncy hair,
large round amber eyes with many sparkle highlights,
bright wide smile showing teeth, rosy cheeks, healthy fair skin,
school blazer uniform with loose pink ribbon tie, sleeves rolled up,
skirt above knee, sneaker-style loafers,
small charm strap on chest pocket (family memento),
pink color theme (#FF6B9D), orange accent,
radiating sunshine energy, soft pastel colors, dating sim aesthetic
```

**S3用プロンプト（素顔）**:
```
high quality anime style visual novel character art, full body portrait,
sad vulnerable high school girl sitting with knees hugged to chest,
short pink-tinted light brown bob hair falling over face, disheveled,
large amber eyes with tears, red-rimmed eyes, no fake smile,
clutching a small charm strap tightly in both hands,
school uniform slightly wrinkled, loose ribbon undone,
behind gymnasium wall, dim warm sunset lighting,
emotional scene, deep rose shadows (#9E4565),
soft pastel colors with melancholic atmosphere, dating sim aesthetic
```

---

#### 💎 藤原 凛（ふじわら りん）— 「氷の鎧」

**コンセプト**: 知的でクールな美少女だが、その冷たさは「二度と傷つかないための防御壁」。デザインのポイントは「完璧に見える外見の中に、微かな脆さが透ける」こと。

**身体的特徴**:
- 身長: やや高め（163cm程度）、すらりとした体型
- 髪: 腰まで届くロングストレート、深い藍色（ダークブルーブラック）、艶やかで整っている
- 目: 切れ長で鋭い瞳、深い青（サファイアブルー）、ハイライトは控えめで冷たい光
- 肌: 透き通るような白、血色が薄い
- 表情の癖: 感情を見せまいとするとき、唇をきゅっと結ぶ。本を握る手に力が入る

**服装**:
- 制服: きっちりと着こなしたブレザー、ボタン全止め、リボン（青）を正しく結んでいる
- スカートは膝丈（規則通り）
- 左手首に細いシルバーのブレスレット（かつての親友とお揃いだった → 捨てられないでいる）
- 常に文庫本を1冊持っている（心のバリケード）
- 靴: 上品なローファー

**カラーパレット**:
- メイン: #4A90D9（青）、サブ: #C8DEFF（淡い水色）
- アクセント: #8B6DBF（紫 — 夜空・星のイメージ）
- 影の色: #2C4A6E（深い紺 — 閉ざされた心を暗示）

**ステージ別表情・雰囲気ガイド**:

| ステージ | 表情 | 雰囲気 | ビジュアルポイント |
|---|---|---|---|
| S1（表の顔） | 無表情、クールな目 | 冷たく透明な空気感 | 完璧な姿勢、隙のない佇まい、本を胸元に抱える |
| S2（亀裂） | わずかに目を伏せる、動揺 | 雨上がりの曇り空 | 本を落としかける手、ブレスレットに無意識に触れる |
| S3（秘密開示） | 泣きそうな顔を必死に堪える | 図書室の薄暗い光 | 本で顔を隠す、涙が本のページに落ちる |
| S4（本当の自分） | はにかんだ微笑み、目が潤む | 星空のような透明感 | 初めて見せる柔らかい表情、本を閉じて胸に当てる |

**S1用プロンプト（デフォルト立ち絵）**:
```
high quality anime style visual novel character art, full body portrait, white background,
cool intellectual high school girl, 163cm, slender elegant build,
very long straight dark blue-black hair reaching waist, silky and well-maintained,
sharp narrow sapphire blue eyes with subtle cold highlights,
calm composed expression with slightly pursed lips, pale translucent skin,
perfectly neat school blazer uniform buttoned up, blue ribbon tie properly tied,
knee-length skirt, elegant loafers,
holding a paperback book against chest like a shield,
thin silver bracelet on left wrist (former friend's matching pair),
blue color theme (#4A90D9), purple accent,
cold elegant atmosphere, soft pastel colors, dating sim aesthetic
```

**S3用プロンプト（素顔）**:
```
high quality anime style visual novel character art, full body portrait,
vulnerable intellectual high school girl in dim library,
very long straight dark blue-black hair slightly disheveled,
sapphire blue eyes glistening with unshed tears, trying not to cry,
hiding face behind an open book, tears dropping onto pages,
school uniform still neat but posture crumbling,
unconsciously touching silver bracelet on left wrist,
surrounded by bookshelves in low warm light,
deep navy shadows (#2C4A6E), emotional vulnerability breaking through ice,
soft pastel colors with bittersweet atmosphere, dating sim aesthetic
```

---

#### 🌿 天野 ひなた（あまの ひなた）— 「優しさという檻」

**コンセプト**: 誰にでも優しい癒し系だが、その優しさは「そうしないと愛されない」という恐怖から来ている。デザインのポイントは「柔らかく見える外見に、窮屈さ・息苦しさが微かに潜む」こと。

**身体的特徴**:
- 身長: 平均的（158cm程度）、柔らかな丸みのある体型
- 髪: ミディアムのゆるウェーブ、明るいハニーブラウン、花のヘアピンで留めている
- 目: 垂れ目気味で穏やかな瞳、ヘーゼルグリーン、温かみのあるハイライト
- 肌: 柔らかい色白、頬にナチュラルな血色
- 表情の癖: 困ったように眉を下げて笑う。「大丈夫です」と言うとき手を胸の前で組む

**服装**:
- 制服: ブレザーをきちんと着ているが少しサイズが大きめ（自分を小さく見せる無意識の癖）
- リボン（緑）を丁寧に結んでいる
- エプロンを鞄に入れている（料理部 → 唯一「自分で決められる」場所）
- 花柄のハンカチをポケットから覗かせている
- 靴: 清潔感のあるストラップシューズ

**カラーパレット**:
- メイン: #7BC67E（緑）、サブ: #D4F0D5（淡いミントグリーン）
- アクセント: #F0D060（イエロー — 花・温もりのイメージ）
- 影の色: #3D6B40（深い緑 — 檻・束縛を暗示）

**ステージ別表情・雰囲気ガイド**:

| ステージ | 表情 | 雰囲気 | ビジュアルポイント |
|---|---|---|---|
| S1（表の顔） | 穏やかな微笑み、控えめ | 花畑のような温かさ | 花のヘアピン、じょうろを持つ、小動物が寄ってくるような雰囲気 |
| S2（亀裂） | 笑顔だが目が泳いでいる | 曇りがちの花壇 | 手を胸の前で強く組む、エプロンの紐を無意識に握る |
| S3（秘密開示） | 笑顔が崩れて泣き出す | 家庭科室、薄暗い | ヘアピンを外して握りしめる、「良い子」の仮面が割れる |
| S4（本当の自分） | 初めて自分から笑う、明るい表情 | 花が咲き誇る中庭の光 | 自作の料理を差し出す、自信のある目 |

**S1用プロンプト（デフォルト立ち絵）**:
```
high quality anime style visual novel character art, full body portrait, white background,
gentle warm-hearted high school girl, 158cm, soft rounded build,
medium length honey brown wavy hair with flower hairpin,
gentle droopy hazel-green eyes with warm highlights,
soft modest smile with slightly lowered eyebrows,
fair skin with natural rosy cheeks,
school blazer uniform slightly oversized, green ribbon tie neatly tied,
floral handkerchief peeking from pocket,
hands gently clasped in front of chest,
green color theme (#7BC67E), yellow accent,
warm gentle atmosphere like a flower garden, soft pastel colors, dating sim aesthetic
```

**S3用プロンプト（素顔）**:
```
high quality anime style visual novel character art, full body portrait,
crying high school girl in dim home economics classroom,
medium honey brown wavy hair with hairpin removed and clutched in hand,
hazel-green eyes overflowing with tears, smile crumbling,
expression of someone who can no longer pretend to be okay,
school uniform with slightly oversized blazer seeming to swallow her,
apron hanging loosely, flour-dusted hands trembling,
dark green shadows (#3D6B40) suggesting feeling trapped,
soft pastel colors with suffocating yet liberating atmosphere, dating sim aesthetic
```

---

#### 🏫 背景素材プロンプト設定

| 場面 | ファイル名 | プロンプト |
|---|---|---|
| 教室（デフォルト） | bg-default.png | `anime background art, Japanese high school classroom, warm afternoon sunlight streaming through windows, cherry blossom trees visible outside, desks and chairs, soft pastel colors, visual novel background, no characters` |
| 屋上（美咲S2） | bg-rooftop.png | `anime background art, Japanese high school rooftop, chain-link fence, golden sunset sky, scattered clouds, melancholic warm atmosphere, visual novel background, no characters` |
| 体育館裏（美咲S3） | bg-gymnasium.png | `anime background art, behind Japanese high school gymnasium, concrete wall, dim warm sunset lighting, long shadows, quiet isolated spot, visual novel background, no characters` |
| 図書室（凛S1-S3） | bg-library.png | `anime background art, Japanese high school library, tall bookshelves, warm lamp light, dust particles in light beams, quiet contemplative atmosphere, visual novel background, no characters` |
| 中庭花壇（ひなたS1） | bg-garden.png | `anime background art, Japanese high school courtyard garden, flower beds in bloom, watering can, warm gentle sunlight, peaceful atmosphere, visual novel background, no characters` |
| 家庭科室（ひなたS3） | bg-cooking-room.png | `anime background art, Japanese high school home economics room, cooking stations, dim interior light, slightly messy counter with ingredients, visual novel background, no characters` |
| 星空（凛S4） | bg-starry-sky.png | `anime background art, rooftop at night, beautiful starry sky, milky way visible, telescope on tripod, clear night atmosphere, romantic visual novel background, no characters` |
| 朝の校門（S4共通） | bg-morning-gate.png | `anime background art, Japanese high school entrance gate, early morning golden sunlight, cherry blossom petals falling, fresh hopeful atmosphere, visual novel background, no characters` |

---

#### 🎨 UI・タイトル素材プロンプト設定

##### 共通スタイル指示（UI素材共通プレフィックス）
```
high quality anime style game UI asset, soft pastel color palette,
delicate ornamental design, romantic visual novel aesthetic,
cherry blossom motif, transparent PNG with alpha channel
```

##### タイトルロゴ
| 素材 | ファイル名 | プロンプト |
|---|---|---|
| タイトルロゴ | title-logo.png | `high quality anime style game title logo, "ときめきクイズ" text design, elegant cursive Japanese typography with heart and cherry blossom decorations, pink and gold gradient colors (#FF6B9D to #FFD700), glowing sparkle effects around letters, soft pastel romantic atmosphere, transparent background PNG, visual novel title screen aesthetic` |
| サブタイトル装飾 | title-subtitle-deco.png | `high quality anime style decorative frame for subtitle text, thin elegant ornamental line with small hearts and cherry blossom petals at ends, pink and white color scheme, horizontal banner shape, transparent background PNG, visual novel title aesthetic` |

##### タイトル画面背景
| 素材 | ファイル名 | プロンプト |
|---|---|---|
| タイトル背景 | bg-title.png | `anime background art, dreamy cherry blossom scene, pink petals gently falling, soft bokeh light effects, pastel gradient sky from warm pink to lavender, school building silhouette in far background, romantic and inviting atmosphere, visual novel title screen background, no characters, 800x600` |

##### ボタン素材
| 素材 | ファイル名 | プロンプト |
|---|---|---|
| メインボタン | btn-primary.png | `anime style game UI button, rounded rectangle shape, pink gradient (#FF6B9D to #ec4899) with subtle inner glow, small heart icon embossed, soft shadow, cherry blossom petal accent on corner, elegant and cute design, transparent background PNG` |
| サブボタン | btn-secondary.png | `anime style game UI button, rounded rectangle shape, soft lavender to light purple gradient with subtle shimmer, small star accent, gentle shadow, elegant understated design, transparent background PNG` |
| アクセントボタン | btn-accent.png | `anime style game UI button, rounded rectangle shape, warm coral to orange gradient (#FFA040 to #FF6B9D), small sparkle effect, energetic but cute design, transparent background PNG` |
| 戻るボタン | btn-back.png | `anime style game UI small circular back button, pastel pink circle with white left arrow, soft shadow, cute minimal design, transparent background PNG` |

##### ダイアログ・フレーム素材
| 素材 | ファイル名 | プロンプト |
|---|---|---|
| テキストボックス | frame-textbox.png | `anime style visual novel text box frame, semi-transparent dark gradient panel with ornamental pink and gold border, cherry blossom corner decorations, elegant rounded rectangle shape, romantic visual novel dialogue box, PNG with transparency` |
| ステータスパネル | frame-panel.png | `anime style game UI panel frame, soft cream and pink gradient background with thin ornamental gold border, small heart decorations at corners, rounded rectangle, elegant romantic design, transparent background PNG` |
| ポップアップフレーム | frame-popup.png | `anime style game UI popup window frame, white panel with pink and gold ornamental border, ribbon decoration at top center, cherry blossom accents, soft shadow, cute romantic design, transparent background PNG` |
| セリフ吹き出し | frame-speech-bubble.png | `anime style speech bubble, soft white with thin pink outline, small heart-shaped tail, subtle gradient, cute romantic visual novel design, transparent background PNG` |

##### アイコン素材
| 素材 | ファイル名 | プロンプト |
|---|---|---|
| ハートアイコン（親密度） | icon-heart.png | `anime style cute heart icon, pink gradient with sparkle highlight, soft glow effect, romantic game UI element, transparent background PNG, 64x64` |
| スターアイコン（CP） | icon-star.png | `anime style cute star icon, golden yellow gradient with sparkle highlight, soft glow effect, game UI element, transparent background PNG, 64x64` |
| タイマーアイコン | icon-timer.png | `anime style cute hourglass icon, pink and gold colors with small heart sand particles, soft glow, romantic game UI element, transparent background PNG, 64x64` |
| スタミナアイコン | icon-stamina.png | `anime style cute lightning bolt icon inside a pink circle, pastel pink and yellow gradient, soft sparkle effect, game UI element, transparent background PNG, 64x64` |
| ロックアイコン | icon-lock.png | `anime style cute padlock icon with heart-shaped keyhole, pastel pink and gray colors, soft shadow, game UI element, transparent background PNG, 64x64` |
| 設定アイコン | icon-settings.png | `anime style cute gear icon with small heart accent, pastel pink and silver colors, soft design, game UI element, transparent background PNG, 64x64` |
| 音楽アイコン | icon-music.png | `anime style cute music note icon, pastel pink with sparkle effects, romantic design, game UI element, transparent background PNG, 64x64` |
| ポイントアイコン | icon-point.png | `anime style cute diamond gem icon, pink and purple gradient with rainbow sparkle highlight, soft glow, game UI element, transparent background PNG, 64x64` |

##### エンディング演出素材
| 素材 | ファイル名 | プロンプト |
|---|---|---|
| ハッピーエンド装飾 | ending-happy.png | `anime style romantic ending screen decoration, shower of pink cherry blossom petals and golden sparkles, hearts floating upward, warm pink and gold atmosphere, dreamy bokeh light effects, transparent overlay PNG` |
| ノーマルエンド装飾 | ending-normal.png | `anime style gentle ending screen decoration, soft floating cherry blossom petals, gentle warm sunlight rays, peaceful pastel orange and pink tones, transparent overlay PNG` |
| バッドエンド装飾 | ending-bad.png | `anime style melancholic ending screen decoration, scattered fading cherry blossom petals falling downward, cool blue and purple tones, rain drops, sad but beautiful atmosphere, transparent overlay PNG` |
| トゥルーエンド装飾 | ending-true.png | `anime style triumphant romantic ending decoration, brilliant golden light burst with cherry blossoms and hearts swirling, rainbow sparkle accents, warm and radiant atmosphere, transparent overlay PNG` |
| パーフェクトエンド装飾 | ending-perfect.png | `anime style dazzling ending screen decoration, crystal diamond sparkles mixed with cherry blossoms, prismatic light reflections, ethereal pink and diamond white glow, luxurious romantic atmosphere, transparent overlay PNG` |
| エターナルエンド装飾 | ending-eternal.png | `anime style ultimate romantic ending decoration, intertwined golden rings surrounded by cherry blossoms, constellation stars connecting like destiny, warm golden and pink aurora, heavenly radiant atmosphere, transparent overlay PNG` |

##### 画面遷移・エフェクト素材
| 素材 | ファイル名 | プロンプト |
|---|---|---|
| 画面遷移オーバーレイ | transition-petals.png | `anime style cherry blossom petal shower overlay, dense pink petals scattered across frame, various petal sizes and rotation angles, soft pink tones, transparent background PNG, for screen transition effect` |
| キラキラエフェクト | effect-sparkle.png | `anime style sparkle effect sprite sheet, 4 frames of twinkling star animation, pink and gold sparkles, soft glow, transparent background PNG, game UI effect` |
| 正解エフェクト | effect-correct.png | `anime style celebration effect, golden stars and pink hearts bursting outward, sparkle trail, joyful energy, transparent background PNG, game UI effect` |
| 不正解エフェクト | effect-wrong.png | `anime style gentle crack effect, soft blue broken glass fragments fading outward, subtle and not scary, transparent background PNG, game UI effect` |

##### ヒロイン別装飾素材
| 素材 | ファイル名 | プロンプト |
|---|---|---|
| 美咲フレーム装飾 | deco-misaki.png | `anime style decorative corner ornament, pink cherry blossom branch with small sun motif, warm pink and orange colors (#FF6B9D, #FFA040), delicate design, transparent background PNG` |
| 凛フレーム装飾 | deco-rin.png | `anime style decorative corner ornament, blue star constellation pattern with open book motif, cool blue and purple colors (#4A90D9, #8B6DBF), elegant design, transparent background PNG` |
| ひなたフレーム装飾 | deco-hinata.png | `anime style decorative corner ornament, green vine with small flowers and cooking whisk motif, warm green and yellow colors (#7BC67E, #F0D060), gentle design, transparent background PNG` |

---

## 🖼️ 素材管理表

### 画像素材（Gemini API生成）
| 素材名 | ファイル名 | サイズ | 生成プロンプト | ステータス |
|---|---|---|---|---|
| 美咲立ち絵 | misaki.png | 400×600 | （上記S1用プロンプト参照） | ✅ 生成・組込済（リニューアル予定） |
| 凛立ち絵 | rin.png | 400×600 | （上記S1用プロンプト参照） | ✅ 生成・組込済（リニューアル予定） |
| ひなた立ち絵 | hinata.png | 400×600 | （上記S1用プロンプト参照） | ✅ 生成・組込済（リニューアル予定） |
| 背景 | bg-default.png | 800×600 | （上記背景プロンプト参照） | ✅ 生成・組込済 |

### コンセプトアート（Gemini API生成）
| 素材名 | ファイル名 | サイズ | 生成プロンプト | ステータス |
|---|---|---|---|---|
| メインビジュアル | concept-art-main.png | 1024×1024 | （上記ステップ1プロンプト参照） | ⬜ 未生成 |
| UIスタイルシート | concept-art-ui-sheet.png | 1024×1024 | （上記ステップ2プロンプト参照） | ⬜ 未生成 |
| 背景ムードボード | concept-art-bg-mood.png | 1024×1024 | （上記ステップ3プロンプト参照） | ⬜ 未生成 |

### UI・タイトル素材（Gemini API生成）
| 素材名 | ファイル名 | サイズ | 生成プロンプト | ステータス |
|---|---|---|---|---|
| タイトルロゴ | title-logo.png | 600×200 | （上記タイトルロゴプロンプト参照） | ⬜ 未生成 |
| サブタイトル装飾 | title-subtitle-deco.png | 400×60 | （上記サブタイトル装飾プロンプト参照） | ⬜ 未生成 |
| タイトル背景 | bg-title.png | 800×600 | （上記タイトル背景プロンプト参照） | ⬜ 未生成 |
| メインボタン | btn-primary.png | 240×60 | （上記ボタン素材プロンプト参照） | ⬜ 未生成 |
| サブボタン | btn-secondary.png | 240×60 | （上記ボタン素材プロンプト参照） | ⬜ 未生成 |
| アクセントボタン | btn-accent.png | 240×60 | （上記ボタン素材プロンプト参照） | ⬜ 未生成 |
| 戻るボタン | btn-back.png | 48×48 | （上記ボタン素材プロンプト参照） | ⬜ 未生成 |
| テキストボックス | frame-textbox.png | 760×180 | （上記ダイアログ素材プロンプト参照） | ⬜ 未生成 |
| ステータスパネル | frame-panel.png | 700×400 | （上記ダイアログ素材プロンプト参照） | ⬜ 未生成 |
| ポップアップフレーム | frame-popup.png | 500×350 | （上記ダイアログ素材プロンプト参照） | ⬜ 未生成 |
| セリフ吹き出し | frame-speech-bubble.png | 300×120 | （上記ダイアログ素材プロンプト参照） | ⬜ 未生成 |
| ハートアイコン | icon-heart.png | 64×64 | （上記アイコン素材プロンプト参照） | ⬜ 未生成 |
| スターアイコン | icon-star.png | 64×64 | （上記アイコン素材プロンプト参照） | ⬜ 未生成 |
| タイマーアイコン | icon-timer.png | 64×64 | （上記アイコン素材プロンプト参照） | ⬜ 未生成 |
| スタミナアイコン | icon-stamina.png | 64×64 | （上記アイコン素材プロンプト参照） | ⬜ 未生成 |
| ロックアイコン | icon-lock.png | 64×64 | （上記アイコン素材プロンプト参照） | ⬜ 未生成 |
| 設定アイコン | icon-settings.png | 64×64 | （上記アイコン素材プロンプト参照） | ⬜ 未生成 |
| 音楽アイコン | icon-music.png | 64×64 | （上記アイコン素材プロンプト参照） | ⬜ 未生成 |
| ポイントアイコン | icon-point.png | 64×64 | （上記アイコン素材プロンプト参照） | ⬜ 未生成 |
| ハッピーエンド装飾 | ending-happy.png | 800×600 | （上記エンディング素材プロンプト参照） | ⬜ 未生成 |
| ノーマルエンド装飾 | ending-normal.png | 800×600 | （上記エンディング素材プロンプト参照） | ⬜ 未生成 |
| バッドエンド装飾 | ending-bad.png | 800×600 | （上記エンディング素材プロンプト参照） | ⬜ 未生成 |
| トゥルーエンド装飾 | ending-true.png | 800×600 | （上記エンディング素材プロンプト参照） | ⬜ 未生成 |
| パーフェクトエンド装飾 | ending-perfect.png | 800×600 | （上記エンディング素材プロンプト参照） | ⬜ 未生成 |
| エターナルエンド装飾 | ending-eternal.png | 800×600 | （上記エンディング素材プロンプト参照） | ⬜ 未生成 |
| 画面遷移オーバーレイ | transition-petals.png | 800×600 | （上記エフェクト素材プロンプト参照） | ⬜ 未生成 |
| キラキラエフェクト | effect-sparkle.png | 256×64 | （上記エフェクト素材プロンプト参照） | ⬜ 未生成 |
| 正解エフェクト | effect-correct.png | 200×200 | （上記エフェクト素材プロンプト参照） | ⬜ 未生成 |
| 不正解エフェクト | effect-wrong.png | 200×200 | （上記エフェクト素材プロンプト参照） | ⬜ 未生成 |
| 美咲フレーム装飾 | deco-misaki.png | 120×120 | （上記ヒロイン別装飾プロンプト参照） | ⬜ 未生成 |
| 凛フレーム装飾 | deco-rin.png | 120×120 | （上記ヒロイン別装飾プロンプト参照） | ⬜ 未生成 |
| ひなたフレーム装飾 | deco-hinata.png | 120×120 | （上記ヒロイン別装飾プロンプト参照） | ⬜ 未生成 |

### 音声素材（Web Audio API生成）
| 素材名 | 実装方式 | 用途 | ステータス |
|---|---|---|---|
| メインBGM | Web Audio API合成 | ゲーム中BGM | ✅ 実装済 |
| 正解SE | Web Audio API合成 | 正解時（上昇音） | ✅ 実装済 |
| 不正解SE | Web Audio API合成 | 不正解時（下降音） | ✅ 実装済 |
| 時間切れSE | Web Audio API合成 | タイムアウト時 | ✅ 実装済 |
| クリックSE | Web Audio API合成 | ボタン押下時 | ✅ 実装済 |
| エンディングSE | Web Audio API合成 | 結果画面（種類別） | ✅ 実装済 |

---

## 📱 UI・画面構成
- [x] タイトル画面
- [x] ヒロイン選択画面
- [x] ストーリー画面（出会い演出・VN風テキスト送り）
- [x] クイズメイン画面
- [x] 結果・エンディング画面
- [x] ステータス画面（キャラ別クリア回数・カテゴリ別正解率）

---

## 🛠️ 技術仕様
| 項目 | 内容 |
|---|---|
| 使用ライブラリ | なし（Vanilla JS） |
| 画面サイズ | 800×600 |
| FPS目標 | N/A（DOM操作ベース、アニメーションはCSS） |
| セーブ機能 | localStorage（プレイ統計の永続化） |
| レンダリング | DOM操作（canvasは使用しない） |

### フォント
| フォント名 | 用途 | ライセンス |
|---|---|---|
| Zen Maru Gothic | ゲーム内テキスト | Google Fonts（OFL） |

---

## ✅ 実装ステータス管理
| 機能 | 企画 | 実装 | テスト | 備考 |
|---|---|---|---|---|
| タイトル画面 | ✅ | ✅ | ⬜ | |
| ヒロイン選択 | ✅ | ✅ | ⬜ | |
| クイズシステム | ✅ | ✅ | ⬜ | |
| 親密度管理 | ✅ | ✅ | ⬜ | |
| 制限時間 | ✅ | ✅ | ⬜ | |
| エンディング分岐 | ✅ | ✅ | ⬜ | |
| 出会いストーリー | ✅ | ✅ | ⬜ | キャラ選択→クイズ間にVN風演出 |
| UI表示 | ✅ | ✅ | ⬜ | |
| BGM・SE | ✅ | ✅ | ⬜ | Web Audio API合成 |
| セーブ/ロード | ❌ | ❌ | ❌ | 1プレイ完結型のため不要 |

---

## 🎯 マイルストーン
| フェーズ | 内容 | 目標日 | ステータス |
|---|---|---|---|
| Phase 1 | 企画・仕様確定 | 2026-03-22 | ✅ |
| Phase 2 | プロトタイプ（コア機能） | 2026-03-22 | ✅ |
| Phase 3 | 素材完成・組み込み | 2026-03-22 | ✅ |
| Phase 4 | 全機能実装 | 2026-03-22 | ✅ |
| Phase 5 | テスト・バグ修正 | | ⬜ |
| Phase 6 | 公開・リリース | | ⬜ |

---

## 📝 変更履歴
| 日付 | 変更内容 | 変更者 |
|---|---|---|
| 2026-03-20 | 初版作成（Googleドキュメントから移行） | Claude |
| 2026-03-22 | ゲーム企画確定（クイズ×恋愛シミュレーション） | Claude |
| 2026-03-22 | Phase 2 プロトタイプ実装完了 | Claude |
| 2026-03-22 | Phase 3 画像素材生成・ゲーム組み込み完了 | Claude |
| 2026-03-22 | Phase 4 音声システム・演出強化・コード品質改善 | Claude |
| 2026-03-23 | キャラ選択後に出会いストーリー画面を追加 | Claude |
| 2026-03-23 | ステージ3（EXPERT難易度）・クイズデータ・ストーリー・エンディング追加 | Claude |
| 2026-03-23 | キャラ解放システム追加（美咲ステージ1ハッピーエンドで他キャラ解放） | Claude |
| 2026-03-24 | サブゲーム追加（タイムアタック・耐久クイズ） | Claude |
| 2026-03-24 | パートナーシステム追加（ステージ3ハッピーエンド→パートナー選択→ステージ4解放） | Claude |
| 2026-03-24 | パートナー選択をキャラ選択画面に移動、マイページを最進行キャラ表示に変更、お気に入り機能廃止 | Claude |
| 2026-03-25 | ポイント交換所＆着替えページ追加（服アイテム8種、ポイント獲得システム） | Claude |
| 2026-03-30 | 段階的機能解放追加（交換所・着替え→パートナー後、サブゲーム→ステージ2クリア後、ポイント加算もパートナー後） | Claude |
| 2026-03-31 | 「仮面の笑顔」ストーリーテーマ追加、プロローグシステム追加、キャラ解放シーン追加、全ストーリーテキスト刷新 | Claude |
| 2026-04-01 | 練習ステージ＆チャレンジポイント（CP）システム追加（キャラステージ挑戦にCP消費が必要） | Claude |
| 2026-04-02 | キャラクターデザイン詳細設定追加（身体的特徴・服装・カラーパレット・ステージ別表情・Gemini APIプロンプト・背景素材プロンプト） | Claude |
| 2026-04-02 | UI・タイトル素材用Gemini APIプロンプト追加（タイトルロゴ・ボタン・フレーム・アイコン・エンディング装飾・エフェクト・ヒロイン別装飾） | Claude |
| 2026-04-02 | コンセプトアート先行アプローチ導入（メインビジュアル・UIスタイルシート・背景ムードボードの3枚を最優先生成し、統一感を確保する方針に変更） | Claude |

---

## ⚠️ 既知の制約・注意事項
- Gemini APIの画像生成は1024×1024が最大（大きな背景は分割orリサイズ）
- BGM/SEは著作権フリー素材を使用するか、AI生成する（ライセンス明記）
- ゲーム内テキストは日本語を基本とし、多言語対応は後回し
- 画像素材はGemini API（gemini-2.5-flash-image）で生成済
