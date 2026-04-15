import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: '次のJSONをそのまま返せ: {"patterns":[{"id":1,"name":"test","correctedText":"abc","points":["x"]}]}' }],
      model: "openai",
      seed: 42,
    }),
  });
  const text = await res.text();
  return NextResponse.json({ status: res.status, length: text.length, body: text.slice(0, 500) });
}
