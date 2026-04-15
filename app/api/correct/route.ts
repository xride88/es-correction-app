import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Vercel関数タイムアウトを60秒に設定

const POLLINATIONS_BASE = "https://text.pollinations.ai";

const CULTURE_PRESETS: Record<string, string> = {
  venture: `【ベンチャー/スタートアップ】
- スピード感・行動力・変化への対応力を重視
- 「自ら動く」「仮説検証」「成長志向」などのキーワードが刺さる
- 失敗経験や挑戦エピソードを積極的に評価
- 熱量と本音が伝わる文体`,

  bigcompany: `【大手老舗企業】
- 安定感・誠実さ・長期的なコミット感を重視
- 組織への貢献、チームワーク、継続力がキーワード
- 論理的で丁寧な文章構成を好む
- 企業理念・社会貢献との一致をアピールする`,

  taiiku: `【体育会系・営業重視企業】
- 根性・体力・チャレンジ精神・負けず嫌いを評価
- 数値や成果・目標達成のエピソードが刺さる
- 熱意・ガッツが伝わる力強い表現を好む
- チームの中で自分がどう貢献したかを明確に`,

  creative: `【クリエイティブ・広告・メディア系】
- 独自性・感性・発想力・表現力を重視
- 動機と熱量が重要
- 個性的な切り口を好む
- 自分の視点・感性を言語化する文章スタイル`,

  ittech: `【ITテック・エンジニア系企業】
- 論理思考・問題解決力・技術への好奇心を重視
- 具体的な経験・数値・成果でロジカルに語る
- 「課題→仮説→実行→結果」の構成が評価される
- 自己学習意欲を高く評価`,

  consulting: `【コンサルティング・シンクタンク】
- 論理構成力・課題解決力・知的好奇心を重視
- PREP法など論理的な文章構成が求められる
- 抽象→具体の展開、数値的根拠が重要
- 社会課題への問題意識が評価される`,

  finance: `【金融・証券・銀行】
- 誠実さ・責任感・信頼性・慎重さを最重視
- 正確さ・丁寧さが伝わる文章スタイルを好む
- リスク管理意識・コンプライアンス意識のアピールが有効
- 長期的なキャリアビジョンを明確に`,

  maker: `【メーカー・製造業】
- ものづくりへの情熱・粘り強さ・チームワークを重視
- 改善意識・品質へのこだわり・継続力がキーワード
- 具体的な経験・成果が評価される
- 技術・製品への深い関心と社会貢献意識を示す`,
};

const CULTURE_LABELS: Record<string, string> = {
  venture: "ベンチャー/スタートアップ",
  bigcompany: "大手老舗企業",
  taiiku: "体育会系・営業重視",
  creative: "クリエイティブ・メディア系",
  ittech: "ITテック・エンジニア系",
  consulting: "コンサルティング",
  finance: "金融・証券・銀行",
  maker: "メーカー・製造業",
};

export async function POST(req: NextRequest) {
  try {
    const { esText, personality, industry, episodes, cultureKey } =
      await req.json();

    if (!esText || !cultureKey) {
      return NextResponse.json(
        { error: "ES文章と企業風土は必須です" },
        { status: 400 }
      );
    }

    const cultureInfo = CULTURE_PRESETS[cultureKey];
    const cultureLabel = CULTURE_LABELS[cultureKey];

    if (!cultureInfo) {
      return NextResponse.json(
        { error: "無効な企業風土が選択されました" },
        { status: 400 }
      );
    }

    const prompt = `あなたは就職活動のプロフェッショナルな添削者です。
学生のエントリーシート（ES）を、企業風土に合わせて5パターンで添削してください。

## 学生情報
【性格・強み】${personality || "未記入"}
【志望業界・職種】${industry || "未記入"}
【エピソード・体験】${episodes || "未記入"}

## 志望企業の風土
${cultureInfo}

## 元のES文章
${esText}

## 厳守ルール
- 必ず日本語で出力すること
- 以下のJSON形式のみで返すこと（前後に説明文・コードブロック記号を入れない）
- 5パターンすべて必ず出力すること
- correctedTextは必ず200字以上の完成した文章にすること

{"patterns":[{"id":1,"name":"論理重視型","style":"PREP法で整理し根拠を明確化","correctedText":"ここに添削後の文章","points":["ポイント1","ポイント2","ポイント3"]},{"id":2,"name":"熱量重視型","style":"熱意・想いが伝わる感情豊かな表現","correctedText":"ここに添削後の文章","points":["ポイント1","ポイント2","ポイント3"]},{"id":3,"name":"具体性重視型","style":"数値・事実・エピソードを前面に","correctedText":"ここに添削後の文章","points":["ポイント1","ポイント2","ポイント3"]},{"id":4,"name":"簡潔明瞭型","style":"短く鋭い文章でインパクト重視","correctedText":"ここに添削後の文章","points":["ポイント1","ポイント2","ポイント3"]},{"id":5,"name":"個性発揮型","style":"学生の個性・強みを最大限に活かす","correctedText":"ここに添削後の文章","points":["ポイント1","ポイント2","ポイント3"]}]}`;

    // GETエンドポイントを使用（reasoning modelを回避）
    const seed = Math.floor(Math.random() * 10000);
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `${POLLINATIONS_BASE}/${encodedPrompt}?model=openai&seed=${seed}&nolog=true`;

    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`AIサービスエラー: ${response.status}`);
    }

    const text = await response.text();
    const jsonMatch = text.match(/\{[\s\S]*"patterns"[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`解析失敗 [${text.length}bytes]: ${text.slice(0, 200)}`);
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ ...result, cultureLabel });
  } catch (error) {
    const message = error instanceof Error ? error.message : "不明なエラー";
    return NextResponse.json(
      { error: `添削に失敗しました: ${message}` },
      { status: 500 }
    );
  }
}
