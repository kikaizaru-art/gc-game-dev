/**
 * Gemini API キャラクターデザイン別案生成スクリプト
 *
 * GitHub Actions から実行される想定。
 * 環境変数 GEMINI_API_KEY が必要。
 *
 * 使い方:
 *   node tools/generate-character-designs.js <style> <character>
 *
 *   style: all / pop / watercolor / deformed
 *   character: all / misaki / rin / hinata
 *
 * 例:
 *   node tools/generate-character-designs.js all all       # 全スタイル×全キャラ
 *   node tools/generate-character-designs.js pop misaki    # ポップ案の美咲のみ
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// APIキーを取得
function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    // .envファイルからフォールバック
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/GEMINI_API_KEY=(.+)/);
      if (match) return match[1].trim();
    }
    console.error('エラー: GEMINI_API_KEY が設定されていません。');
    console.error('環境変数または .env ファイルで設定してください。');
    process.exit(1);
  }
  return key;
}

// キャラクター基本情報
const CHARACTERS = {
  misaki: {
    name: '桜井美咲',
    personality: 'cheerful, energetic, sporty high school girl',
    themeColor: '#FF6B9D',
    colorName: 'pink'
  },
  rin: {
    name: '藤原凛',
    personality: 'cool, intellectual, elegant high school girl with glasses',
    themeColor: '#4A90D9',
    colorName: 'blue'
  },
  hinata: {
    name: '天野ひなた',
    personality: 'gentle, warm-hearted, soft-spoken high school girl',
    themeColor: '#7BC67E',
    colorName: 'green'
  }
};

// スタイル別プロンプト定義
const STYLES = {
  pop: {
    name: 'ポップ＆カラフル',
    suffix: '-pop',
    buildPrompt: (char) => ({
      misaki: `Generate an anime character portrait for a dating sim game.
Character: Misaki - a super energetic high school girl bursting with energy.
Appearance: Bright vivid pink hair in a high twin-tail style with star-shaped hair clips, large sparkling magenta eyes with star reflections, big cheerful grin showing teeth, rosy cheeks.
Outfit: Trendy colorful school uniform - pink plaid skirt, white blouse with a bold pink bow, pink sneakers, multiple colorful bracelets and accessories.
Color theme: Vibrant pink (#FF6B9D) with pops of yellow and orange.
Pose: Upper body, energetic pose with one hand making a peace sign, winking.
Background: Bright gradient with sparkle effects, pink to yellow.
Style: modern anime, vivid colors, bold lines, pop art influence, high energy, dating sim character portrait, clean illustration`,

      rin: `Generate an anime character portrait for a dating sim game.
Character: Rin - a stylish intellectual high school girl with sharp wit.
Appearance: Sleek dark blue hair in a long side ponytail with a crystal hair pin, piercing ice-blue eyes behind fashionable rectangular glasses, confident slight smirk, sharp features.
Outfit: Chic modern school uniform - dark blue blazer with silver buttons, blue plaid tie, silver chain accessory on the blazer pocket, geometric earrings.
Color theme: Electric blue (#4A90D9) with silver and white accents.
Pose: Upper body, arms crossed, looking at the viewer with a cool confident expression.
Background: Bright gradient with geometric sparkle effects, blue to silver.
Style: modern anime, vivid colors, bold lines, pop art influence, cool aesthetic, dating sim character portrait, clean illustration`,

      hinata: `Generate an anime character portrait for a dating sim game.
Character: Hinata - an adorable gentle high school girl with a warm aura.
Appearance: Fluffy light brown hair in a low side braid decorated with small flower pins, large warm amber eyes with soft sparkles, sweet gentle smile, soft round features.
Outfit: Cute layered school look - cream knit vest over white blouse with a green ribbon, floral pattern skirt, small flower brooch, lace-trimmed socks.
Color theme: Fresh green (#7BC67E) with cream and floral accents.
Pose: Upper body, both hands holding a small potted flower, tilting head slightly with a warm smile.
Background: Bright gradient with flower petal effects, green to cream.
Style: modern anime, vivid colors, bold lines, pop art influence, warm cute aesthetic, dating sim character portrait, clean illustration`
    })[char]
  },

  watercolor: {
    name: 'リアル寄り水彩タッチ',
    suffix: '-watercolor',
    buildPrompt: (char) => ({
      misaki: `Generate a character portrait in watercolor anime style for a visual novel.
Character: Misaki - a naturally cheerful high school girl with an athletic build.
Appearance: Natural reddish-brown short hair with a slight wave, warm brown eyes, natural healthy complexion, bright genuine smile, a small bandaid on her cheek from sports.
Outfit: Standard Japanese school uniform - white sailor-style top with a pink neckerchief, navy pleated skirt, simple and realistic.
Color theme: Warm pink tones (#FF6B9D) blended softly.
Pose: Upper body portrait, relaxed natural stance, looking at the viewer with a warm smile.
Background: Soft watercolor wash, pale pink bleeding into white, with subtle cherry blossom impressions.
Style: watercolor illustration, soft edges, delicate color bleeding, realistic anime proportions, gentle brush strokes, dating sim character, Japanese visual novel art`,

      rin: `Generate a character portrait in watercolor anime style for a visual novel.
Character: Rin - a quietly beautiful intellectual high school girl.
Appearance: Straight black hair past her shoulders with a subtle blue sheen, dark blue eyes behind thin-rimmed oval glasses, composed neutral expression with a hint of melancholy, delicate features.
Outfit: Standard Japanese school uniform - navy blazer with gold buttons, white blouse, blue striped tie, neat and proper.
Color theme: Deep blue tones (#4A90D9) with indigo accents.
Pose: Upper body portrait, holding a closed book against her chest, gazing at the viewer with quiet intelligence.
Background: Soft watercolor wash, pale blue bleeding into white, with subtle star-like light spots.
Style: watercolor illustration, soft edges, delicate color bleeding, realistic anime proportions, gentle brush strokes, dating sim character, Japanese visual novel art`,

      hinata: `Generate a character portrait in watercolor anime style for a visual novel.
Character: Hinata - a softly beautiful gentle high school girl.
Appearance: Wavy honey-brown shoulder-length hair, gentle hazel eyes, soft warm smile, delicate features with a slightly shy expression.
Outfit: Standard Japanese school uniform - cream cardigan over white blouse with a green ribbon tie, plaid skirt, simple and natural looking.
Color theme: Soft green tones (#7BC67E) with warm earth colors.
Pose: Upper body portrait, hands gently clasped in front, looking at the viewer with a tender shy smile.
Background: Soft watercolor wash, pale green bleeding into cream, with subtle leaf and flower impressions.
Style: watercolor illustration, soft edges, delicate color bleeding, realistic anime proportions, gentle brush strokes, dating sim character, Japanese visual novel art`
    })[char]
  },

  deformed: {
    name: 'デフォルメ可愛い系',
    suffix: '-deformed',
    buildPrompt: (char) => ({
      misaki: `Generate a cute chibi-style anime character portrait for a dating sim game.
Character: Misaki - an ultra-cute energetic girl in chibi/deformed style.
Appearance: Big fluffy pink hair in a bouncy bob with a large star-shaped hair accessory, oversized sparkling pink eyes taking up 1/3 of the face, huge happy smile, tiny nose, blushing cheeks with pink circles.
Outfit: Cute idol-like school outfit - puffy-sleeved white blouse with a big pink ribbon, frilly pink skirt with heart patterns, thigh-high white stockings, cute pink boots.
Color theme: Sweet pink (#FF6B9D) with white and gold sparkles.
Pose: Upper body, both hands up in a cute cheer pose, sparkles and hearts floating around.
Background: Pastel pink with floating hearts, stars, and sparkle effects.
Style: chibi anime, super deformed proportions, large head, small body, kawaii aesthetic, round soft shapes, sparkling effects, dating sim character, clean cute illustration`,

      rin: `Generate a cute chibi-style anime character portrait for a dating sim game.
Character: Rin - a cool-cute girl in chibi/deformed style.
Appearance: Long flowing dark blue-black hair with a crescent moon hair clip, oversized deep blue eyes with star reflections behind cute small glasses, small composed smile, tiny features, light blush.
Outfit: Elegant school outfit with cute twist - fitted blue blazer with gold star buttons, ruffled white blouse, blue plaid bow tie, pleated skirt, knee-high navy socks.
Color theme: Cool blue (#4A90D9) with silver and starlight accents.
Pose: Upper body, one hand adjusting glasses, looking at viewer with a cool but cute expression, sparkles around.
Background: Pastel blue with floating stars, moons, and sparkle effects.
Style: chibi anime, super deformed proportions, large head, small body, kawaii aesthetic, round soft shapes, sparkling effects, dating sim character, clean cute illustration`,

      hinata: `Generate a cute chibi-style anime character portrait for a dating sim game.
Character: Hinata - a gentle adorable girl in chibi/deformed style.
Appearance: Soft wavy light brown hair in low twin tails tied with green flower ribbons, oversized warm amber eyes with flower reflections, sweet gentle smile, tiny features, soft pink blush.
Outfit: Cozy cute school outfit - oversized cream knit sweater with a small embroidered flower, green plaid skirt, white apron with lace trim, Mary Jane shoes.
Color theme: Warm green (#7BC67E) with cream and flower accents.
Pose: Upper body, hugging a small stuffed bunny, tilting head with a warm gentle smile, flowers floating around.
Background: Pastel green with floating flowers, leaves, and sparkle effects.
Style: chibi anime, super deformed proportions, large head, small body, kawaii aesthetic, round soft shapes, sparkling effects, dating sim character, clean cute illustration`
    })[char]
  }
};

// Gemini APIで画像を生成する
function generateImage(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE']
      }
    });

    const url = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`
    );

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
          for (const part of parts) {
            if (part.inlineData) {
              resolve(Buffer.from(part.inlineData.data, 'base64'));
              return;
            }
          }
          reject(new Error('レスポンスに画像データが含まれていません'));
        } catch (e) {
          reject(new Error(`レスポンス解析エラー: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(new Error(`ネットワークエラー: ${e.message}`)));
    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error('タイムアウト（120秒）'));
    });

    req.write(requestBody);
    req.end();
  });
}

// 画像を保存する
function saveImage(buffer, fileName) {
  const outputDir = path.join(__dirname, '..', 'assets', 'images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, fileName);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

// メイン処理
async function main() {
  const apiKey = getApiKey();
  const [styleArg = 'all', charArg = 'all'] = process.argv.slice(2);

  // 対象スタイルを決定
  const targetStyles = styleArg === 'all'
    ? Object.keys(STYLES)
    : [styleArg];

  // 対象キャラを決定
  const targetChars = charArg === 'all'
    ? Object.keys(CHARACTERS)
    : [charArg];

  // バリデーション
  for (const s of targetStyles) {
    if (!STYLES[s]) {
      console.error(`エラー: 無効なスタイル "${s}"。使用可能: ${Object.keys(STYLES).join(', ')}, all`);
      process.exit(1);
    }
  }
  for (const c of targetChars) {
    if (!CHARACTERS[c]) {
      console.error(`エラー: 無効なキャラ "${c}"。使用可能: ${Object.keys(CHARACTERS).join(', ')}, all`);
      process.exit(1);
    }
  }

  const totalTasks = targetStyles.length * targetChars.length;
  console.log('🎨 キャラクターデザイン別案生成');
  console.log('================================');
  console.log(`スタイル: ${targetStyles.map(s => STYLES[s].name).join(', ')}`);
  console.log(`キャラ: ${targetChars.map(c => CHARACTERS[c].name).join(', ')}`);
  console.log(`合計: ${totalTasks}枚`);
  console.log('');

  let success = 0;
  let fail = 0;
  let taskIndex = 0;

  for (const styleName of targetStyles) {
    const style = STYLES[styleName];
    for (const charName of targetChars) {
      taskIndex++;
      const char = CHARACTERS[charName];
      const fileName = `${charName}${style.suffix}.png`;
      console.log(`[${taskIndex}/${totalTasks}] ${style.name} × ${char.name} → ${fileName}`);

      try {
        const prompt = style.buildPrompt(charName);
        if (!prompt) {
          console.log('  ⚠️ プロンプト未定義、スキップ');
          continue;
        }

        console.log('  リクエスト送信中...');
        const buffer = await generateImage(apiKey, prompt);
        const outputPath = saveImage(buffer, fileName);
        console.log(`  ✅ 保存完了: ${fileName} (${(buffer.length / 1024).toFixed(1)} KB)`);
        success++;
      } catch (error) {
        console.log(`  ❌ エラー: ${error.message}`);
        fail++;
      }

      // API制限回避の待機
      if (taskIndex < totalTasks) {
        console.log('  ⏳ 5秒待機...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      console.log('');
    }
  }

  console.log('================================');
  console.log(`完了: 成功 ${success}枚 / 失敗 ${fail}枚`);

  if (success > 0) {
    console.log('');
    console.log('生成されたファイル:');
    for (const styleName of targetStyles) {
      for (const charName of targetChars) {
        const fileName = `${charName}${STYLES[styleName].suffix}.png`;
        const filePath = path.join(__dirname, '..', 'assets', 'images', fileName);
        if (fs.existsSync(filePath)) {
          console.log(`  📸 assets/images/${fileName}`);
        }
      }
    }
  }
}

main().catch(console.error);
