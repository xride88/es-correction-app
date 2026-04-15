"use client";

import { useState } from "react";

const CULTURE_OPTIONS = [
  { key: "venture", label: "ベンチャー/スタートアップ", emoji: "🚀" },
  { key: "bigcompany", label: "大手企業", emoji: "🏢" },
  { key: "shinise", label: "老舗企業", emoji: "🏛️" },
  { key: "taiiku", label: "体育会系", emoji: "💪" },
  { key: "kazokuteki", label: "風通しがいい", emoji: "🌿" },
  { key: "creative", label: "個性重視", emoji: "🎨" },
  { key: "kofu", label: "古風な風土", emoji: "🎌" },
];

const CULTURE_PRESETS: Record<string, string> = {
  venture: `【ベンチャー/スタートアップ】スピード感・行動力・変化への対応力を重視。「自ら動く」「仮説検証」「成長志向」が刺さる。失敗経験や挑戦エピソードを積極的に評価。熱量と本音が伝わる文体。`,
  bigcompany: `【大手企業】ブランド力・スケール感・組織力を活かした仕事を重視。安定した組織の中で大きなプロジェクトに携わる志向。チームワークと組織貢献がキーワード。論理的で格式ある文章構成を好む。`,
  shinise: `【老舗企業】伝統・信頼・誠実さを最重視。長期的なコミット感と企業理念への共感が重要。歴史ある企業文化を尊重し、継続力・誠実さ・地道な努力をアピールする。丁寧な文章スタイルを好む。`,
  taiiku: `【体育会系企業】根性・チャレンジ精神・負けず嫌いを評価。数値や成果・目標達成のエピソードが刺さる。熱意・ガッツが伝わる力強い表現を好む。チームの中で自分がどう貢献したかを明確に。`,
  kazokuteki: `【風通しがいい企業】オープンなコミュニケーション・自由な発想・フラットな組織を重視。意見を言いやすい環境で自分らしく働きたい志向。自発性・協調性・相互尊重がキーワード。明るく率直な文体。`,
  creative: `【個性重視企業】独自性・感性・発想力・自己表現を最重視。動機と熱量が重要。個性的な切り口・ユニークな視点を好む。自分だけの強みや世界観を言語化する文章スタイル。`,
  kofu: `【古風な風土の企業】礼儀・上下関係・忠誠心・伝統的な価値観を重視。目上を敬い、組織のルールに従う姿勢が評価される。謙虚さ・礼節・勤勉さをアピールする。改まった丁寧な文体を好む。`,
};

interface Pattern {
  id: number;
  name: string;
  style: string;
  correctedText: string;
  points: string[];
}

async function callPollinations(prompt: string): Promise<string> {
  const seed = Math.floor(Math.random() * 10000);

  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: "You are a JSON-only output assistant. You must respond with valid JSON and nothing else. No explanations, no markdown, no code blocks. Just raw JSON.",
        },
        { role: "user", content: prompt },
      ],
      model: "openai",
      seed,
      stream: false,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) throw new Error(`AIサービスエラー: ${res.status}`);
  const text = await res.text();

  try {
    const obj = JSON.parse(text);
    const content = obj?.choices?.[0]?.message?.content ?? obj?.content ?? null;
    if (content) return content;
    const rc = obj?.choices?.[0]?.message?.reasoning_content ?? obj?.reasoning_content ?? null;
    if (rc) return rc;
  } catch {
    // プレーンテキストならそのまま返す
  }
  return text;
}

export default function Home() {
  const [esText, setEsText] = useState("");
  const [personality, setPersonality] = useState("");
  const [industry, setIndustry] = useState("");
  const [episodes, setEpisodes] = useState("");
  const [cultureKeys, setCultureKeys] = useState<string[]>([]);
  const [teacherComment, setTeacherComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [resultCultureLabel, setResultCultureLabel] = useState("");
  const [resultTeacherComment, setResultTeacherComment] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const toggleCulture = (key: string) => {
    setCultureKeys((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      if (prev.length < 2) {
        return [...prev, key];
      }
      // 2つ選択済みの場合、最初に選んだものを外して新しいものを追加
      return [prev[1], key];
    });
  };

  const handleSubmit = async () => {
    if (!esText.trim()) { setError("ES文章を入力してください"); return; }
    if (cultureKeys.length === 0) { setError("企業風土を1つ以上選択してください"); return; }
    setError("");
    setLoading(true);
    setPatterns([]);

    try {
      const cultureInfos = cultureKeys.map((k) => CULTURE_PRESETS[k]).join("\n");
      const cultureLabel = cultureKeys
        .map((k) => CULTURE_OPTIONS.find((o) => o.key === k)?.label ?? k)
        .join(" + ");

      const teacherSection = teacherComment.trim()
        ? `\n教員からの指導メモ（この内容を添削に反映させること）：\n${teacherComment.trim()}`
        : "";

      const prompt = `ES correction task. Output ONLY a JSON object, no other text.

Student info: personality="${personality || "未記入"}", target="${industry || "未記入"}", episode="${episodes || "未記入"}"
Company culture: ${cultureInfos}${teacherSection}
Original ES text: ${esText}

Return this exact JSON structure with 5 patterns, each correctedText must be 200+ Japanese characters:
{"patterns":[{"id":1,"name":"論理重視型","style":"PREP法で整理","correctedText":"200字以上の日本語添削文をここに書く","points":["ポイント1","ポイント2","ポイント3"]},{"id":2,"name":"熱量重視型","style":"熱意が伝わる表現","correctedText":"200字以上の日本語添削文をここに書く","points":["ポイント1","ポイント2","ポイント3"]},{"id":3,"name":"具体性重視型","style":"数値・事実を前面に","correctedText":"200字以上の日本語添削文をここに書く","points":["ポイント1","ポイント2","ポイント3"]},{"id":4,"name":"簡潔明瞭型","style":"短くインパクト重視","correctedText":"200字以上の日本語添削文をここに書く","points":["ポイント1","ポイント2","ポイント3"]},{"id":5,"name":"個性発揮型","style":"学生の個性を最大限活かす","correctedText":"200字以上の日本語添削文をここに書く","points":["ポイント1","ポイント2","ポイント3"]}]}`;

      const text = await callPollinations(prompt);
      const stripped = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      const jsonMatch = stripped.match(/\{[\s\S]*"patterns"[\s\S]*\}/);
      if (!jsonMatch) throw new Error(`AIの返答を解析できませんでした。再試行してください。\n(受信内容: ${text.slice(0, 100)})`);

      const result = JSON.parse(jsonMatch[0]);

      setPatterns(result.patterns);
      setResultCultureLabel(cultureLabel);
      setResultTeacherComment(teacherComment.trim());
      setActiveTab(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラーが発生しました。再試行してください。");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setPatterns([]); setError(""); setActiveTab(0); setResultTeacherComment(""); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">ES</div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">ES添削AI</h1>
            <p className="text-xs text-slate-500">企業風土に合わせた5パターン自動添削</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {patterns.length === 0 ? (
          <>
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                学生の個性を入力
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">性格・強み<span className="text-slate-400 font-normal ml-1">（例：積極的、几帳面、リーダーシップ）</span></label>
                  <input type="text" value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="例：粘り強い、チャレンジ精神旺盛、コミュニケーション力が高い" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">志望業界・職種<span className="text-slate-400 font-normal ml-1">（例：IT・エンジニア、金融・営業）</span></label>
                  <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="例：ITベンチャー、総合商社の営業職" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">エピソード・体験・信念<span className="text-slate-400 font-normal ml-1">（強みの根拠となるエピソード）</span></label>
                  <textarea value={episodes} onChange={(e) => setEpisodes(e.target.value)} placeholder="例：大学でサークルの代表を務め、50人をまとめた。ゼミで研究発表をリードし全国大会で入賞した。" rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none" />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                添削するES文章を入力
                <span className="ml-auto text-xs text-slate-400">{esText.length}文字</span>
              </h2>
              <textarea value={esText} onChange={(e) => setEsText(e.target.value)} placeholder="学生が書いたエントリーシートの文章をここに貼り付けてください..." rows={8} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none" />
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                志望企業の風土を選択
              </h2>
              <p className="text-xs text-slate-400 mb-4 ml-9">最大2つまで選択できます（{cultureKeys.length}/2）</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CULTURE_OPTIONS.map((opt) => {
                  const selected = cultureKeys.includes(opt.key);
                  const order = cultureKeys.indexOf(opt.key);
                  return (
                    <button key={opt.key} onClick={() => toggleCulture(opt.key)} className={`p-3 rounded-xl border-2 text-left transition-all relative ${selected ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                      {selected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-bold">{order + 1}</span>
                      )}
                      <div className="text-2xl mb-1">{opt.emoji}</div>
                      <div className={`text-xs font-medium leading-tight ${selected ? "text-blue-700" : "text-slate-700"}`}>{opt.label}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                教員からの指導メモ<span className="text-sm font-normal text-slate-500 ml-1">（任意）</span>
              </h2>
              <p className="text-xs text-amber-700 mb-3 ml-9">添削結果に反映され、学生にそのまま共有できます</p>
              <textarea value={teacherComment} onChange={(e) => setTeacherComment(e.target.value)} placeholder="例：冒頭の箇所はもっと個性を出した表現の方がアピールできると思います。実習のエピソードを入れてみたらいかがでしょうか？" rows={4} className="w-full px-4 py-3 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none bg-white" />
            </section>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm whitespace-pre-line">{error}</div>}

            <button onClick={handleSubmit} disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-2xl text-base transition-all shadow-sm flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>AIが5パターン生成中...（約20〜40秒）</>
              ) : "✨ 5パターンで添削する"}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">添削結果</h2>
                <p className="text-sm text-slate-500 mt-0.5">企業風土：<span className="font-medium text-blue-600">{resultCultureLabel}</span></p>
              </div>
              <button onClick={handleReset} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition">← 最初に戻る</button>
            </div>

            {resultTeacherComment && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-600 font-bold text-sm">教員からの指導メモ</span>
                  <span className="text-xs text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full">この添削に反映済み</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{resultTeacherComment}</p>
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-1">
              {patterns.map((p, i) => (
                <button key={p.id} onClick={() => setActiveTab(i)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === i ? "bg-blue-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
                  パターン{p.id}
                </button>
              ))}
            </div>

            {patterns[activeTab] && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">パターン{patterns[activeTab].id}：{patterns[activeTab].name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{patterns[activeTab].style}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(patterns[activeTab].correctedText)} className="flex-shrink-0 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">コピー</button>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 mb-2">添削後の文章</h4>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap border border-slate-100">{patterns[activeTab].correctedText}</div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 mb-2">添削ポイント</h4>
                  <ul className="space-y-2">
                    {patterns[activeTab].points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <details className="group">
              <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 select-none">
                <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                全5パターンを一覧表示
              </summary>
              <div className="mt-4 space-y-4">
                {patterns.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-800">パターン{p.id}：{p.name}</h3>
                      <button onClick={() => navigator.clipboard.writeText(p.correctedText)} className="px-3 py-1 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition">コピー</button>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{p.style}</p>
                    <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100">{p.correctedText}</div>
                    <ul className="mt-3 space-y-1">
                      {p.points.map((point, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                          <span className="text-blue-400 mt-0.5">•</span>{point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          </>
        )}
      </main>

      <footer className="text-center text-xs text-slate-400 py-8">ES添削AI — Powered by Pollinations.AI</footer>
    </div>
  );
}
