const OPENAI_KEY = process.env.OPENAI_API_KEY!;
export async function openaiExplain(keyword: string) {
  if (!OPENAI_KEY) return "";
  try {
    const sys = "금융/경제 용어만 설명하라. 비금융이면 빈 문자열. 2~4문장, 한국어, 추측 금지.";
    const user = `키워드: "${keyword}"\n금융/경제 용어라면 간단히 정의만 작성하고, 아니라면 빈 문자열을 반환해.`;
    const body = {
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    };
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify(body),
    });
    if (!r.ok) return "";
    const data = await r.json();
    return (data?.choices?.[0]?.message?.content ?? "").trim();
  } catch {
    return "";
  }
}
