"use client";

import { useState } from "react";

const CULTURE_OPTIONS = [
  { key: "venture", label: "ベンチャー/スタートアップ", emoji: "🚀" },
  { key: "bigcompany", label: "大手老舗企業", emoji: "🏢" },
  { key: "taiiku", label: "体育会系・営業重視", emoji: "💪" },
  { key: "creative", label: "クリエイティブ・メディア系", emoji: "🎨" },
  { key: "ittech", label: "ITテック・エンジニア系", emoji: "💻" },
  { key: "consulting", label: "コンサルティング", emoji: "📊" },
  { key: "finance", label: "金融・証券・銀行", emoji: "🏦" },
  { key: "maker", label: "メーカー・製造業", emoji: "🔧" },
];

interface Pattern {
  id: number;
  name: string;
  style: string;
  correctedText: string;
  points: string[];
}

export default function Home() {
  const [esText, setEsText] = useState("");
  const [personality, setPersonality] = useState("");
  const [industry, setIndustry] = useState("");
  const [episodes, setEpisodes] = useState("");
  const [cultureKey, setCultureKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [cultureLabel, setCultureLabel] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const handleSubmit = async () => {
    if (!esText.trim()) {
      setError("ES文章を入力してください");
      return;
    }
    if (!cultureKey) {
      setError("企業風土を選択してください");
      return;
    }
    setError("");
    setLoading(true);
    setPatterns([]);

    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ esText, personality, industry, episodes, cultureKey }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPatterns(data.patterns);
        setCultureLabel(data.cultureLabel);
        setActiveTab(0);
      }
    } catch {
      setError("通信エラーが発生しました。再試行してください。");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPatterns([]);
    setError("");
    setActiveTab(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
            ES
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">ES添削AI</h1>
            <p className="text-xs text-slate-500">企業風土に合わせた5パターン自動添削</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {patterns.length === 0 ? (
          <>
            {/* 学生情報 */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                学生の個性を入力
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    性格・強み
                    <span className="text-slate-400 font-normal ml-1">（例：積極的、几帳面、リーダーシップ）</span>
                  </label>
                  <input
                    type="text"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="例：粘り強い、チャレンジ精神旺盛、コミュニケーション力が高い"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    志望業界・職種
                    <span className="text-slate-400 font-normal ml-1">（例：IT・エンジニア、金融・営業）</span>
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="例：ITベンチャー、総合商社の営業職"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    エピソード・体験・信念
                    <span className="text-slate-400 font-normal ml-1">（強みの根拠となるエピソード）</span>
                  </label>
                  <textarea
                    value={episodes}
                    onChange={(e) => setEpisodes(e.target.value)}
                    placeholder="例：大学でサークルの代表を務め、50人をまとめた。ゼミで研究発表をリードし全国大会で入賞した。"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                  />
                </div>
              </div>
            </section>

            {/* ES入力 */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                添削するES文章を入力
                <span className="ml-auto text-xs text-slate-400">{esText.length}文字</span>
              </h2>
              <textarea
                value={esText}
                onChange={(e) => setEsText(e.target.value)}
                placeholder="学生が書いたエントリーシートの文章をここに貼り付けてください..."
                rows={8}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
              />
            </section>

            {/* 企業風土選択 */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                志望企業の風土を選択
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CULTURE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setCultureKey(opt.key)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      cultureKey === opt.key
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className={`text-xs font-medium leading-tight ${cultureKey === opt.key ? "text-blue-700" : "text-slate-700"}`}>
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* エラー */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm whitespace-pre-line">
                {error}
              </div>
            )}

            {/* 送信ボタン */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-2xl text-base transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  AIが5パターン生成中...（約20秒）
                </>
              ) : (
                "✨ 5パターンで添削する"
              )}
            </button>
          </>
        ) : (
          <>
            {/* 結果ヘッダー */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">添削結果</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  企業風土：<span className="font-medium text-blue-600">{cultureLabel}</span>
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                ← 最初に戻る
              </button>
            </div>

            {/* タブ */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {patterns.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(i)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === i
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  パターン{p.id}
                </button>
              ))}
            </div>

            {/* アクティブパターン */}
            {patterns[activeTab] && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      パターン{patterns[activeTab].id}：{patterns[activeTab].name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">{patterns[activeTab].style}</p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(patterns[activeTab].correctedText)}
                    className="flex-shrink-0 px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  >
                    コピー
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-600 mb-2">添削後の文章</h4>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap border border-slate-100">
                    {patterns[activeTab].correctedText}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-600 mb-2">添削ポイント</h4>
                  <ul className="space-y-2">
                    {patterns[activeTab].points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                          {i + 1}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 全パターン一覧 */}
            <details className="group">
              <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 select-none">
                <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                全5パターンを一覧表示
              </summary>
              <div className="mt-4 space-y-4">
                {patterns.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-slate-800">
                        パターン{p.id}：{p.name}
                      </h3>
                      <button
                        onClick={() => navigator.clipboard.writeText(p.correctedText)}
                        className="px-3 py-1 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                      >
                        コピー
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{p.style}</p>
                    <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap border border-slate-100">
                      {p.correctedText}
                    </div>
                    <ul className="mt-3 space-y-1">
                      {p.points.map((point, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-start gap-1.5">
                          <span className="text-blue-400 mt-0.5">•</span>
                          {point}
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

      <footer className="text-center text-xs text-slate-400 py-8">
        ES添削AI — Powered by Claude
      </footer>
    </div>
  );
}
