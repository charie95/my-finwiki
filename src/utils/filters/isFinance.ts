const OPENAI_KEY = process.env.OPENAI_API_KEY!;

function ruleScore(q: string) {
  const s = q.toLowerCase();
  let score = 0;
  const ALLOW = [
    "금리",
    "기준금리",
    "환율",
    "채권",
    "주식",
    "증권",
    "etf",
    "국채",
    "인플레이션",
    "cpi",
    "gdp",
    "kospi",
    "kosdaq",
    "나스닥",
    "s&p",
    "자동이체",
    "자동 납부",
    "자동납부",
    "이체",
    "계좌이체",
    "송금",
    "입금",
    "출금",
    "이자",
    "수수료",
    "예금",
    "적금",
    "대출",
    "신용카드",
    "체크카드",
    "계좌",
    "인터넷뱅킹",
    "모바일뱅킹",
    "오픈뱅킹",
  ];
  const BLOCK = ["브이로그", "먹방", "게임", "연예", "노래", "춤", "asmr", "요리"];
  for (const t of ALLOW) if (s.includes(t)) score += 2;
  for (const t of BLOCK) if (s.includes(t)) score -= 3;
  if (/\b(gdp|cpi|per|pbr|roe|eps|etf|usd|krw|nasdaq|kospi|s&p)\b/i.test(s)) score += 2;
  return score;
}

async function llmNudge(q: string) {
  if (!OPENAI_KEY) return 0;
  try {
    const body = {
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Reply ONLY JSON {label:'finance'|'non'|'unclear'}." },
        { role: "user", content: `Is this query about finance/economics/investing/business? "${q}"` },
      ],
    };
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify(body),
    });
    const txt = (await r.json())?.choices?.[0]?.message?.content ?? "{}";
    const p = JSON.parse(txt) as { label?: string };
    if (p.label === "finance") return +2;
    if (p.label === "non") return -2;
    return 0;
  } catch {
    return 0;
  }
}

export async function isFinanceKeyword(keyword: string) {
  const base = ruleScore(keyword);
  if (base >= 2) return { isFinance: true, score: base };
  if (base <= -2) return { isFinance: false, score: base };
  const n = await llmNudge(keyword);
  return { isFinance: base + n >= 2, score: base + n };
}
