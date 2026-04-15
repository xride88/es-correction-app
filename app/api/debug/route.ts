import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: '{"test":true}というJSONをそのまま返してください' }],
      model: "openai",
      seed: 42,
    }),
  });
  const text = await res.text();
  return NextResponse.json({ status: res.status, body: text.slice(0, 1000) });
}
