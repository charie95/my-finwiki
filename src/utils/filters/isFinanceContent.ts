// 양성(금융/경제) 용어 — 점진적으로 추가/수정하세요
const POS_TERMS = [
  "경제",
  "금융",
  "투자",
  "증권",
  "주식",
  "채권",
  "펀드",
  "옵션",
  "선물",
  "파생",
  "스프레드",
  "베이시스",
  "수익률",
  "금리",
  "물가",
  "인플레이션",
  "환율",
  "코스피",
  "코스닥",
  "나스닥",
  "s&p",
  "etf",
  "밸류에이션",
  "배당",
  "지수",
  "신용",
  "크레딧",
  "부채",
  "디폴트",
  "국채",
  "회사채",
  "cpi",
  "gdp",
  "ppi",
  "pbr",
  "per",
  "roe",
  "eps",
  "yield",
  "basis",
  "credit",
  "은행",
  "예금",
  "대출",
  "보험",
];

// 음성(비금융 잡음) 용어 — 요리/일상/엔터 계열 위주
const NEG_TERMS = [
  "빵",
  "요리",
  "레시피",
  "베이킹",
  "케이크",
  "버터",
  "마가린",
  "크림",
  "샌드위치",
  "디저트",
  "먹방",
  "댄스",
  "뮤비",
  "메이크업",
  "브이로그",
  "asmr",
  "밈",
  "게임",
  "여행",
  "카페",
  "굿즈",
  "패션",
  "아이돌",
];

// 채널 화이트리스트 — 있으면 가점
const WL_CHANNEL = [
  "한국경제",
  "한국경제tv",
  "매일경제",
  "서울경제",
  "연합인포맥스",
  "삼프로",
  "삼프로tv",
  "신사임당",
  "금융위원회",
  "한국은행",
  "kdi",
  "nh투자증권",
  "kb증권",
  "미래에셋",
  "키움증권",
  "매경",
  "한경",
];

export function scoreFinanceContent(text: string, channelTitle = "") {
  const t = (text || "").toLowerCase();
  const ch = (channelTitle || "").toLowerCase();
  let score = 0;

  for (const w of POS_TERMS) if (t.includes(w.toLowerCase())) score += 1;
  for (const w of NEG_TERMS) if (t.includes(w.toLowerCase())) score -= 2;

  if (WL_CHANNEL.some((w) => ch.includes(w.toLowerCase()))) score += 2;

  return score;
}

/** threshold 이상이면 금융 관련으로 간주 */
export function isFinanceContent(text: string, channelTitle = "", threshold = 1) {
  return scoreFinanceContent(text, channelTitle) >= threshold;
}
