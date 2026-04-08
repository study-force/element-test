// 하드코딩 데이터를 Supabase DB로 시드하는 스크립트
// 실행: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-data.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FRAMES = [
  {
    frame_id: 7, theme: "원리 vs 경험", dimension: null, axis_type: "θ1", sort_order: 0,
    stmts: [
      { key: "경험_1", pole: "경험", text: "실제 사례나 경험이 있어야 내용이 머릿속에 들어온다", sort_order: 0 },
      { key: "이론_2", pole: "이론", text: "왜 그런지 이유까지 알아야 받아들여진다", sort_order: 1 },
      { key: "경험_2", pole: "경험", text: "원리를 알지 못해도 수행에 어려움이 없으면 상관없다", sort_order: 2 },
      { key: "이론_1", pole: "이론", text: "어떤 현상을 보면 왜 그렇게 되는 건지 원리가 궁금하다", sort_order: 3 },
    ],
  },
  {
    frame_id: 8, theme: "행동 vs 사고", dimension: null, axis_type: "θ2", sort_order: 1,
    stmts: [
      { key: "사고_2", pole: "사고", text: "결정을 내리기 전에 여러 가능성을 충분히 따져봐야 마음이 편하다", sort_order: 0 },
      { key: "실행_1", pole: "실행", text: "직접 해보거나 말로 설명하면 생각이 더 잘 정리되는 편이다", sort_order: 1 },
      { key: "사고_1", pole: "사고", text: "행동하기 전에 머릿속에서 충분히 정리가 되어야 시작할 수 있다", sort_order: 2 },
      { key: "실행_2", pole: "실행", text: "몸을 움직이거나 뭔가를 하면서 배울 때 집중이 더 잘 된다", sort_order: 3 },
    ],
  },
  {
    frame_id: 1, theme: "뭔가를 이해할 때 나는", dimension: "내면·감정", axis_type: null, sort_order: 2,
    stmts: [
      { key: "경험사고", pole: null, text: "개념이 내 경험이나 감정과 연결돼야 이해된 느낌이 든다", sort_order: 0 },
      { key: "이론실행", pole: null, text: "개념이 이해되면 문제를 풀어 바로 확인해보고 싶어진다", sort_order: 1 },
      { key: "이론사고", pole: null, text: "개념이 충분히 이해된 후 문제까지 모두 풀어야 안심이 된다", sort_order: 2 },
      { key: "경험실행", pole: null, text: "개념 이해가 완벽하지 않아도 일단 문제를 풀면서 익히는 게 편하다", sort_order: 3 },
    ],
  },
  {
    frame_id: 2, theme: "처음 접하는 것들 앞에서", dimension: "외면·행동", axis_type: null, sort_order: 3,
    stmts: [
      { key: "이론사고", pole: null, text: "새로운 게임이나 앱을 접하면, 이용하기 전 매뉴얼을 보고 전체 기능을 세세히 파악한다", sort_order: 0 },
      { key: "경험실행", pole: null, text: "새로운 게임이나 앱을 접하면, 일단 이것저것 눌러보며 익힌다", sort_order: 1 },
      { key: "경험사고", pole: null, text: "새로운 게임이나 앱을 접하면, 체험판을 해보거나 후기들을 살펴본 후 이용한다", sort_order: 2 },
      { key: "이론실행", pole: null, text: "새로운 게임이나 앱을 접하면, 주요 방법만 파악하고 이용한다", sort_order: 3 },
    ],
  },
  {
    frame_id: 3, theme: "가장 몰입되는 순간", dimension: "내면·동기", axis_type: null, sort_order: 4,
    stmts: [
      { key: "경험실행", pole: null, text: "새로운 것을 배우거나 변화가 있을 때 집중력이 강해진다", sort_order: 0 },
      { key: "이론사고", pole: null, text: "하나를 오래 깊이 파고들수록 점점 더 집중된다", sort_order: 1 },
      { key: "이론실행", pole: null, text: "원리가 이해되는 순간 쾌감이 생기면서 집중력이 높아진다", sort_order: 2 },
      { key: "경험사고", pole: null, text: "혼자 천천히 되짚어볼 때 오히려 더 많은 것이 보인다", sort_order: 3 },
    ],
  },
  {
    frame_id: 4, theme: "벽에 부딪혔을 때", dimension: "내면·전략", axis_type: null, sort_order: 5,
    stmts: [
      { key: "경험사고", pole: null, text: "막히면 비슷한 문제나 예시를 찾아보면서 실마리를 얻는 편이다", sort_order: 0 },
      { key: "이론사고", pole: null, text: "막힌 부분이 해결되지 않으면 다음으로 넘어가기가 불편하다", sort_order: 1 },
      { key: "경험실행", pole: null, text: "막히면 일단 다른 문제부터 풀고 나중에 다시 돌아온다", sort_order: 2 },
      { key: "이론실행", pole: null, text: "막힌 부분은 원리부터 다시 확인하면 대부분 해결된다", sort_order: 3 },
    ],
  },
  {
    frame_id: 5, theme: "모둠 활동을 할 때 나는", dimension: "외면·타인(긍정)", axis_type: null, sort_order: 6,
    stmts: [
      { key: "이론사고", pole: null, text: "모둠 활동을 할 때, 내가 잘 해낼 수 있는 역할을 신중하게 선택한다", sort_order: 0 },
      { key: "이론실행", pole: null, text: "모둠 활동을 할 때, 전체 방향을 제시하고 이끄는 편이다", sort_order: 1 },
      { key: "경험사고", pole: null, text: "모둠 활동을 할 때, 조원들에게 어울리는 역할이 무엇인지 생각한다", sort_order: 2 },
      { key: "경험실행", pole: null, text: "모둠 활동을 할 때, 내가 하고 싶은 역할을 빠르게 정하는 편이다", sort_order: 3 },
    ],
  },
  {
    frame_id: 6, theme: "공부할 때 나는", dimension: "외면·타인(부정)", axis_type: null, sort_order: 7,
    stmts: [
      { key: "경험실행", pole: null, text: "공부할 때, 계획을 세우기보다는 생각 나는대로 한다", sort_order: 0 },
      { key: "경험사고", pole: null, text: "공부할 때, 이것저것 신경쓰느라 한 가지 공부를 깊이 하기 어렵다", sort_order: 1 },
      { key: "이론실행", pole: null, text: "공부할 때, 큰 줄기만 이해되면 넘어간다", sort_order: 2 },
      { key: "이론사고", pole: null, text: "공부할 때, 꼼꼼하게 정리하느라 시간이 오래 걸린다", sort_order: 3 },
    ],
  },
];

const TYPES = [
  {
    key: "이론실행", emoji: "🔥", char_name: "불의 정복자", type_name: "이론-실행형",
    slogan: "원리를 꿰뚫어 바로 움직이는 학습자", subtitle: "원리이해 + 추진력",
    body_question: "원리가 이해되면 바로 문제에 적용해보고 싶은 충동이 강한 편인가요?",
    strengths: ["논리력·분석력", "추진력", "문제해결력"],
    weaknesses: ["단순 암기", "반복 학습", "세부 디테일"],
    color: "#4A7A9A", bg: "#EDF5FA", accent: "#2A8AC0",
    description_what: "불의 정복자는 원리를 파악하는 순간 강렬하게 타오르며 실행으로 이어집니다. 이 유형은 '왜 그런지' 논리 구조가 이해되면 즉시 실전에 적용하고 싶어집니다. 개념들 사이의 관계를 빠르게 파악하고 이해된 원리를 새로운 문제에 바로 연결하는 능력이 탁월하며, 추진력이 강해 행동이 빠릅니다. 반면 원리로 연결되지 않는 단순 암기(역사 연도, 영어 단어, 화학식 같이 독립적으로 존재하는 정보)는 '왜 그런지'를 알 수 없어 머릿속에 잘 남지 않고 흥미도 떨어지는 경향이 있습니다.",
    description_how: "'왜 그런가'를 먼저 해결하면 나머지가 빠르게 흡수됩니다. 원리를 파악한 뒤 바로 문제를 풀어보는 사이클이 가장 잘 맞습니다. 암기가 필요한 내용도 원리나 논리적 연결고리를 먼저 만들면 훨씬 수월합니다. 이해한 내용을 타인에게 설명하거나 새로운 상황에 적용하는 연습이 실력을 빠르게 높여줍니다.",
    description_caution: "이해력이 강한 유형일수록 단순 암기를 얕보다 시험에서 발목을 잡히는 경우가 많습니다. 이해 후 반드시 반복 확인 루틴을 만들어두고, 성급하게 결론 내리기 전에 다양한 관점도 살펴보는 습관이 필요합니다.",
    tq_desc: "원리를 꿰뚫는 논리력이 실제 공부 성과로 이어지고 있는지, 아니면 어딘가에서 꺼지고 있는지 — TQ테스트를 보면 정확히 알 수 있습니다.",
    tq_detail: "논리력과 추진력이 강한 이 유형은 원리를 파악하는 속도가 빠릅니다. 하지만 빠른 실행에 집중하다 보면 세부 어휘나 정확한 독해가 뒤처지는 경우가 생깁니다. 추론 능력이 실제로 얼마나 발달했는지, 어휘력과 독해 정확도가 강점을 받쳐주고 있는지 — TQ테스트로 확인해보세요.",
    sort_order: 0,
  },
  {
    key: "경험실행", emoji: "🌪️", char_name: "바람의 전령", type_name: "경험-실행형",
    slogan: "일단 해보며 길을 찾는 학습자", subtitle: "호기심 + 실행력",
    body_question: "일단 해보면서 배우는 방식이 설명 듣는 것보다 더 잘 맞는 편인가요?",
    strengths: ["추진력·도전정신", "높은 적응력", "실행력"],
    weaknesses: ["원리 이해 부족", "지속력·완성도"],
    color: "#C84010", bg: "#FFF2ED", accent: "#E85820",
    description_what: "바람의 전령은 막힘 없이 어디든 파고들며 순식간에 흐름을 바꿉니다. 이 유형은 이론보다 실제 경험이 먼저이고, 직접 해보면서 감을 잡는 방식이 가장 자연스럽습니다. 새로운 것 앞에서 에너지가 확 올라오는 강한 추진력과 도전정신이 진짜 강점입니다. 다만 원리 이해 없이 경험만 쌓으면 심화 단계에서 막히고, 시작 에너지는 강하지만 끝까지 완성하는 지속력이 약해질 수 있습니다.",
    description_how: "핵심 개념을 간략히 파악한 뒤 바로 문제에 도전하는 방식이 잘 맞습니다. 단, 틀린 문제는 반드시 멈추고 '왜 틀렸는지'를 확인한 뒤 넘어가야 합니다. 빠르게 앞으로 나아가는 것보다 하나를 제대로 소화하는 루틴이 실력의 깊이를 만듭니다.",
    description_caution: "앞으로 나아가는 추진력이 강한 만큼, 틀린 문제를 그냥 넘기는 습관이 생기기 쉽습니다. 이렇게 쌓인 지식은 넓어 보여도 깊이가 없어 심화 문제와 시험에서 특히 취약해집니다. '틀린 문제는 반드시 이해하고 넘긴다'는 원칙 하나가 이 유형의 실력을 완전히 바꿔놓을 수 있습니다.",
    tq_desc: "빠르게 치고 나가는 추진력이 실제 학습 성과로 이어지고 있는지, 아니면 속도만 빠르고 정확도에서 발목이 잡히고 있는지 — TQ테스트를 보면 정확히 알 수 있습니다.",
    tq_detail: "추진력과 도전정신이 강점인 이 유형은 일단 뛰어드는 실행력이 탁월합니다. 하지만 원리 이해보다 경험에 의존하다 보면 독해 정확도와 추론 능력이 뒤따르지 못하는 경우가 생깁니다. 지금의 실행력이 실제 역량으로 뒷받침되고 있는지 — TQ테스트로 확인해보세요.",
    sort_order: 1,
  },
  {
    key: "이론사고", emoji: "🪨", char_name: "땅의 수호자", type_name: "이론-사고형",
    slogan: "깊이 생각하고 체계를 완성하는 학습자", subtitle: "계획력 + 지구력",
    body_question: "완전히 이해될 때까지 시간이 걸려도 깊이 파고드는 편인가요?",
    strengths: ["체계력·계획력", "완성도·지구력", "깊은 이해력"],
    weaknesses: ["처리 속도", "유연성·결단력"],
    color: "#6A4A1A", bg: "#FAF5ED", accent: "#9A6A2A",
    description_what: "땅의 수호자는 오랜 시간 켜켜이 쌓여 단단해집니다. 이 유형은 원리를 완전히 이해할 때까지 깊이 파고들며, 계획을 세우고 정해진 순서대로 완성하는 것을 좋아합니다. 체계력과 지구력이 강해 한 번 시작한 것은 끝을 보려 하고, 완성도가 높습니다. 충분히 이해한 뒤 신중하게 판단하는 방식이 자연스럽습니다. 다만 지나치게 깊이 파다 속도가 늦어지고, 계획이 틀어지면 불안해하는 경향이 있습니다.",
    description_how: "공부 전 오늘 할 범위를 순서대로 정리해두면 집중력이 크게 올라갑니다. 개념의 원리를 도식화하고 서로 연결하는 노트 정리가 이 유형에 최고의 학습법입니다. 완전히 이해한 뒤 넘어가는 방식이 잘 맞지만, 모르는 것은 표시해두고 일단 넘어가는 훈련도 병행해야 합니다.",
    description_caution: "땅의 수호자는 시간만 충분하다면 누구보다 완성도 높은 지식을 쌓을 수 있는 성향입니다. 문제는 학습에서 시간이 늘 충분하지 않다는 것입니다. 한 개념에 오래 머무르다 전체를 마치지 못하면, 깊이와 상관없이 결과는 좋지 않습니다. 공부를 시작하기 전 전체 범위를 먼저 훑어보고 시간을 배분하는 습관이 이 유형에게 가장 중요한 과제입니다. 깊이 파고드는 건 그 다음입니다.",
    tq_desc: "깊이 쌓아가는 지구력이 실제 공부 성과로 이어지고 있는지, 아니면 속도나 효율에서 발목이 잡히고 있는지 — TQ테스트를 보면 정확히 알 수 있습니다.",
    tq_detail: "계획력과 지구력이 강한 이 유형은 깊이 이해하고 완성도 높게 마무리하는 능력이 탁월합니다. 다만 처리 속도와 유연성이 약해지면 시험 상황에서 불리해질 수 있습니다. 추론 능력과 독해 효율이 실제로 얼마나 형성되어 있는지 — TQ테스트로 확인해보세요.",
    sort_order: 2,
  },
  {
    key: "경험사고", emoji: "💧", char_name: "물의 정령", type_name: "경험-사고형",
    slogan: "느끼고 관찰하며 의미를 찾는 학습자", subtitle: "상상력 + 섬세함",
    body_question: "배운 것이 나의 경험이나 감정과 연결될 때 비로소 이해가 되는 편인가요?",
    strengths: ["암기력·꼼꼼함", "공감력·다각적 관점", "풍부한 아이디어"],
    weaknesses: ["속도·결단력", "논리 분석"],
    color: "#1A6A8A", bg: "#EDF8FB", accent: "#2A9AC8",
    description_what: "물의 정령은 경험을 통해 느끼고 충분히 소화하면서 의미를 발견합니다. 반복 경험을 감각으로 익히는 방식이라 암기력이 강하고, 다양한 관점과 풍부한 공감 능력이 진짜 강점입니다. 한편으로는 충분히 탐색하고 생각한 뒤에야 결론을 내리는 성향이라, 빠른 판단이 필요하거나 논리적 순서가 엄격한 상황에서는 어려움을 겪을 수 있습니다.",
    description_how: "배운 내용을 자신의 경험과 연결 지어 생각하는 시간이 가장 효과적입니다. 반복 학습과 꼼꼼한 복습이 잘 맞고, 마인드맵이나 감상 노트처럼 느낌을 기록하는 방식이 기억을 강화합니다. 논리 분석이 필요한 과목은 구체적 예시를 먼저 충분히 경험한 뒤 원리를 연결하는 순서로 접근하세요.",
    description_caution: "탐색하고 생각하는 과정이 풍부한 만큼, 결론을 내리거나 행동으로 옮기는 것이 늦어지는 경향이 있습니다. 충분히 이해했다고 느껴질 때까지 기다리다 보면 시간이 부족해지고, 결국 마무리를 못 짓는 상황이 반복될 수 있습니다. '생각은 충분히, 행동은 기한 안에'라는 원칙을 의식적으로 지키는 훈련이 필요합니다.",
    tq_desc: "꼼꼼하게 쌓아가는 암기력과 감수성이 실제 학습 성과로 이어지고 있는지 — TQ테스트를 보면 정확히 알 수 있습니다.",
    tq_detail: "암기력과 섬세함이 강점인 이 유형은 꼼꼼하게 쌓아가는 능력이 탁월합니다. 하지만 논리 분석과 빠른 결단이 필요한 상황에서는 속도가 걸림돌이 될 수 있습니다. 어휘력과 독해 감수성이 실제 역량으로 얼마나 형성되어 있는지 — TQ테스트로 확인해보세요.",
    sort_order: 3,
  },
];

async function seed() {
  console.log("🌱 시드 데이터 삽입 시작...\n");

  // 1. 프레임 삽입
  for (const f of FRAMES) {
    const { stmts, ...frameData } = f;
    const { error } = await supabase.from("element_frames").upsert(frameData, { onConflict: "frame_id" });
    if (error) { console.error(`❌ 프레임 ${f.frame_id} 삽입 실패:`, error.message); continue; }
    console.log(`✅ 프레임 ${f.frame_id}: ${f.theme}`);

    // 2. 문항 삽입
    for (const stmt of stmts) {
      const stmtData = { ...stmt, frame_id: f.frame_id };
      const { error: sErr } = await supabase.from("element_statements").upsert(stmtData, { onConflict: "id" });
      if (sErr) { console.error(`  ❌ 문항 "${stmt.text.slice(0, 20)}..." 삽입 실패:`, sErr.message); continue; }
      console.log(`  ✅ [${stmt.key}] ${stmt.text.slice(0, 30)}...`);
    }
  }

  // 3. 유형 삽입
  console.log("\n📋 유형 데이터 삽입...");
  for (const t of TYPES) {
    const { error } = await supabase.from("element_types").upsert(t, { onConflict: "key" });
    if (error) { console.error(`❌ 유형 ${t.key} 삽입 실패:`, error.message); continue; }
    console.log(`✅ ${t.emoji} ${t.char_name} (${t.key})`);
  }

  console.log("\n🎉 시드 완료!");
}

seed().catch(console.error);
