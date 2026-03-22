/**
 * Gemini API 画像生成スクリプト
 *
 * ローカルPCで実行してキャラクター画像を生成します。
 *
 * 使い方:
 *   1. Node.js をインストール（v18以上）
 *   2. プロジェクトルートに .env ファイルを作成し GEMINI_API_KEY=YOUR_KEY を記載
 *   3. 以下を実行:
 *      node tools/generate-images.js
 *   4. 個別に生成する場合:
 *      node tools/generate-images.js misaki
 *      node tools/generate-images.js rin
 *      node tools/generate-images.js hinata
 *      node tools/generate-images.js background
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// .envファイルからAPIキーを読み込む
function loadApiKey() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('エラー: .env ファイルが見つかりません。');
    console.error('プロジェクトルートに .env ファイルを作成し、GEMINI_API_KEY=YOUR_KEY を記載してください。');
    process.exit(1);
  }
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/GEMINI_API_KEY=(.+)/);
  if (!match) {
    console.error('エラー: .env に GEMINI_API_KEY が見つかりません。');
    process.exit(1);
  }
  return match[1].trim();
}

// 共通スタイル指示
const STYLE_BASE = 'anime style, soft pastel colors, dating sim character, visual novel style illustration, clean lines, high quality';

// 生成対象の画像定義
const IMAGE_CONFIGS = {
  misaki: {
    fileName: 'misaki.png',
    prompt: `Generate an image of an anime-style dating sim character portrait.
Character: Misaki Sakurai - a cheerful, energetic high school girl.
Appearance: Short bouncy pink-tinted hair, bright sparkling eyes, warm radiant smile, slightly flushed cheeks.
Outfit: Cute school uniform with pink accents and a ribbon.
Color theme: Pink (#FF6B9D), soft warm tones.
Pose: Upper body portrait, facing slightly to the right, looking at the viewer with a friendly expression.
Background: Simple soft gradient, light pink to white.
Style: ${STYLE_BASE}`,
    description: '桜井美咲 立ち絵'
  },
  rin: {
    fileName: 'rin.png',
    prompt: `Generate an image of an anime-style dating sim character portrait.
Character: Rin Fujiwara - a cool, intellectual high school girl.
Appearance: Long straight dark blue-black hair, sharp intelligent eyes, calm composed expression, elegant posture.
Outfit: Neat school uniform with blue accents, glasses optional.
Color theme: Blue (#4A90D9), cool elegant tones.
Pose: Upper body portrait, facing slightly to the left, looking at the viewer with a composed expression.
Background: Simple soft gradient, light blue to white.
Style: ${STYLE_BASE}`,
    description: '藤原凛 立ち絵'
  },
  hinata: {
    fileName: 'hinata.png',
    prompt: `Generate an image of an anime-style dating sim character portrait.
Character: Hinata Amano - a gentle, warm-hearted high school girl.
Appearance: Medium-length soft wavy light brown hair, gentle droopy eyes, warm gentle smile, soft features.
Outfit: Cozy school uniform with green accents, possibly wearing an apron over it.
Color theme: Green (#7BC67E), warm natural tones.
Pose: Upper body portrait, facing slightly to the right, looking at the viewer with a gentle smile, hands clasped together.
Background: Simple soft gradient, light green to white.
Style: ${STYLE_BASE}`,
    description: '天野ひなた 立ち絵'
  },
  background: {
    fileName: 'bg-default.png',
    prompt: `Generate a background image for an anime-style dating sim / visual novel game.
Scene: A beautiful Japanese high school classroom with warm afternoon sunlight streaming through the windows.
Details: Wooden desks and chairs, large windows showing cherry blossom trees outside, clean blackboard, warm lighting.
Style: anime background art, soft pastel colors, warm and inviting atmosphere, no characters, visual novel background.
The image should feel peaceful and romantic, suitable for a dating sim game.`,
    description: '背景（教室）'
  }
};

// Gemini APIで画像を生成する
function generateImage(apiKey, config) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      contents: [{
        parts: [{
          text: config.prompt
        }]
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    });

    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    console.log(`  リクエスト送信中...`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (response.error) {
            reject(new Error(`API エラー: ${response.error.message}`));
            return;
          }

          const parts = response.candidates?.[0]?.content?.parts || [];
          let imageSaved = false;

          for (const part of parts) {
            if (part.inlineData) {
              const imgBuffer = Buffer.from(part.inlineData.data, 'base64');
              const outputPath = path.join(__dirname, '..', 'assets', 'images', config.fileName);

              // ディレクトリが存在しない場合は作成
              const dir = path.dirname(outputPath);
              if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
              }

              fs.writeFileSync(outputPath, imgBuffer);
              console.log(`  ✅ 保存完了: assets/images/${config.fileName} (${(imgBuffer.length / 1024).toFixed(1)} KB)`);
              imageSaved = true;
            }
          }

          if (!imageSaved) {
            reject(new Error('レスポンスに画像データが含まれていませんでした。'));
            return;
          }

          resolve();
        } catch (e) {
          reject(new Error(`レスポンス解析エラー: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`ネットワークエラー: ${e.message}`));
    });

    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error('タイムアウト（120秒）'));
    });

    req.write(requestBody);
    req.end();
  });
}

// メイン処理
async function main() {
  const apiKey = loadApiKey();
  const args = process.argv.slice(2);

  // 生成対象を決定
  let targets;
  if (args.length > 0) {
    targets = args.filter(arg => IMAGE_CONFIGS[arg]);
    if (targets.length === 0) {
      console.error(`エラー: 無効な対象です。使用可能: ${Object.keys(IMAGE_CONFIGS).join(', ')}`);
      process.exit(1);
    }
  } else {
    targets = Object.keys(IMAGE_CONFIGS);
  }

  console.log('🎨 Gemini API 画像生成スクリプト');
  console.log('================================');
  console.log(`生成対象: ${targets.join(', ')}`);
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const target of targets) {
    const config = IMAGE_CONFIGS[target];
    console.log(`📸 ${config.description} (${config.fileName}) を生成中...`);

    try {
      await generateImage(apiKey, config);
      successCount++;
    } catch (error) {
      console.log(`  ❌ エラー: ${error.message}`);
      failCount++;
    }

    // API制限を避けるため少し待機
    if (targets.indexOf(target) < targets.length - 1) {
      console.log('  ⏳ 5秒待機中...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log('');
  }

  console.log('================================');
  console.log(`完了: 成功 ${successCount}件 / 失敗 ${failCount}件`);

  if (successCount > 0) {
    console.log('');
    console.log('💡 生成された画像は assets/images/ に保存されました。');
    console.log('   ゲームに反映するには git add & commit してください。');
  }
}

main().catch(console.error);
