// Static game configuration and catalog data.
export const STORAGE_KEY = "rpg_idle_ashen_keep_v6";
export const LEGACY_STORAGE_KEYS = ["rpg_idle_ashen_keep_v5"];
export const SAVE_INTERVAL_MS = 5000;
export const TOTAL_WORLDS = 100;
export const STAGES_PER_WORLD = 100;
export const MAX_HERO_LEVEL = 100;
export const ATTACK_SPEED_CAP = 2.5;
export const MAX_OFFLINE_SECONDS = 4 * 60 * 60;
export const LOG_LIMIT = 40;
export const INVENTORY_LIMIT = 90;
export const RECENT_DRAW_LIMIT = 8;
export const DRAW_COST_SINGLE = 40;
export const DRAW_COST_MULTI = 360;
export const FURY_DURATION = 10;
export const FURY_COOLDOWN = 40;
export const SYNTHESIS_REQUIREMENT = 3;

export const EQUIPMENT_SLOTS = [
  { id: "helmet", label: "투구" },
  { id: "armor", label: "방어구" },
  { id: "weapon", label: "무기" },
  { id: "ring", label: "반지" },
  { id: "necklace", label: "목걸이" },
  { id: "bracelet", label: "팔찌" },
  { id: "greaves", label: "각반" },
  { id: "gloves", label: "장갑" },
  { id: "shoes", label: "신발" },
];

export const EQUIPMENT_CATEGORIES = [
  { id: "all", label: "전체", slots: EQUIPMENT_SLOTS.map((slot) => slot.id) },
  { id: "weapon", label: "무기", slots: ["weapon"] },
  { id: "armor", label: "방어구", slots: ["helmet", "armor", "greaves", "gloves", "shoes"] },
  { id: "accessory", label: "장신구", slots: ["ring", "necklace", "bracelet"] },
];

export const DRAW_CATEGORIES = [
  { id: "weapon", label: "무기", slots: ["weapon"] },
  { id: "armor", label: "방어구", slots: ["helmet", "armor", "greaves", "gloves", "shoes"] },
  { id: "accessory", label: "장신구", slots: ["ring", "necklace", "bracelet"] },
];

export const RARITIES = [
  { id: "common", label: "일반", weight: 47, multiplier: 1, className: "rarity-common" },
  { id: "advanced", label: "고급", weight: 26, multiplier: 1.24, className: "rarity-advanced" },
  { id: "rare", label: "희귀", weight: 15, multiplier: 1.62, className: "rarity-rare" },
  { id: "heroic", label: "영웅", weight: 7.8, multiplier: 2.15, className: "rarity-heroic" },
  { id: "legendary", label: "전설", weight: 3.1, multiplier: 2.95, className: "rarity-legendary" },
  { id: "mythic", label: "신화", weight: 0.9, multiplier: 4.1, className: "rarity-mythic" },
  { id: "unique", label: "유일", weight: 0.2, multiplier: 5.65, className: "rarity-unique" },
];

export const CREATION_RARITY = {
  id: "creation",
  label: "창조",
  weight: 0,
  multiplier: 7.4,
  className: "rarity-creation",
};

export const LEGACY_SLOT_MAP = {
  sigil: "necklace",
};

export const LEGACY_RARITY_MAP = {
  common: "common",
  rare: "rare",
  epic: "heroic",
  legendary: "legendary",
  mythic: "mythic",
};

export const WORLD_THEMES = [
  {
    title: "Ember",
    prefix: "잿불",
    description: "꺼지지 않는 불씨와 잿가루가 공기를 메운 지역입니다.",
    foes: ["잿불 도적", "재 늑대", "탄화 추적자", "연기 망령"],
    elites: ["재 점술사", "잿불 집행자", "열화 추적자"],
    lord: "재의 군주",
  },
  {
    title: "Moon",
    prefix: "월광",
    description: "차가운 달빛 아래서 그림자와 광신자들이 몰려옵니다.",
    foes: ["월광 수도승", "그림자 도살자", "차가운 사냥개", "기도 망령"],
    elites: ["월광 심문관", "은빛 검객", "흑월 집전자"],
    lord: "흑월 제사장",
  },
  {
    title: "Glass",
    prefix: "유리",
    description: "깨진 수정 파편이 폭풍처럼 떠도는 날카로운 구역입니다.",
    foes: ["파편 약탈자", "유리 사냥개", "균열 창병", "수정 드론"],
    elites: ["유리 집행자", "균열 마도사", "파편 수호자"],
    lord: "수정 군단장",
  },
  {
    title: "Thorn",
    prefix: "가시",
    description: "살아있는 덩굴과 포식 식물들이 길을 잠식합니다.",
    foes: ["가시 짐승", "독안개 정령", "포자 사냥꾼", "덩굴 경비병"],
    elites: ["가시 주술사", "수액 전사", "협곡 포식자"],
    lord: "검은 덩굴왕",
  },
  {
    title: "Storm",
    prefix: "폭풍",
    description: "번개와 돌풍이 쉴 새 없이 내리치는 격전지입니다.",
    foes: ["폭풍 창병", "번개 매", "질풍 도적", "우레 정령"],
    elites: ["천뢰 기사", "폭풍 부관", "질풍 마검사"],
    lord: "천둥 제독",
  },
  {
    title: "Iron",
    prefix: "철혈",
    description: "기계와 병력이 질서정연하게 진군하는 강철 전선입니다.",
    foes: ["기계 창병", "철혈 파수병", "중장 보병", "증기 사수"],
    elites: ["기갑 집행관", "강철 조련사", "증기 공병장"],
    lord: "강철 사령관",
  },
  {
    title: "Frost",
    prefix: "서리",
    description: "숨결마저 얼어붙는 혹한과 결빙 마물이 뒤섞인 지대입니다.",
    foes: ["빙결 늑대", "서리 궁수", "얼음 하피", "백야 망령"],
    elites: ["설원 주술사", "냉기 추적자", "빙벽 파괴자"],
    lord: "설원의 심판자",
  },
  {
    title: "Void",
    prefix: "공허",
    description: "심연의 균열에서 새어나온 왜곡체들이 현실을 찢어냅니다.",
    foes: ["공허 기생체", "왜곡 사도", "심연 촉수체", "파열 감시자"],
    elites: ["공허 관측자", "균열 포식자", "심연 인도자"],
    lord: "공허 추기경",
  },
  {
    title: "Solar",
    prefix: "태양",
    description: "맹렬한 광휘와 성화가 모든 것을 태워버리는 구역입니다.",
    foes: ["광휘 창수", "성화 사도", "태양 군견", "빛 추종자"],
    elites: ["광휘 기사", "성화 집전자", "태양 도살자"],
    lord: "광휘 집정관",
  },
  {
    title: "Crown",
    prefix: "왕관",
    description: "왕좌를 지키는 귀족 기사단과 처형관들이 최후의 길을 막아섭니다.",
    foes: ["왕관 기사", "왕실 추적자", "금장 집행자", "붉은 근위병"],
    elites: ["왕실 심문관", "금관 검성", "대관 추격자"],
    lord: "왕좌 집행왕",
  },
];

export const WORLD_REALMS = [
  { suffix: "Trail", label: "길목", detail: "초입에서부터 적들의 추격이 거셉니다." },
  { suffix: "Cloister", label: "회랑", detail: "무너진 회랑과 제단 사이로 적이 숨어 있습니다." },
  { suffix: "Hollow", label: "협곡", detail: "낭떠러지와 함정이 진격 속도를 늦춥니다." },
  { suffix: "Ridge", label: "능선", detail: "고지대의 바람과 저격이 전선을 흔듭니다." },
  { suffix: "Cathedral", label: "성당", detail: "거대한 제단과 성역 잔해가 길을 가로막습니다." },
  { suffix: "Vault", label: "금고", detail: "폐쇄된 보관구역을 뚫어야 다음 전선이 열립니다." },
  { suffix: "Bastion", label: "보루", detail: "견고한 방벽과 포대가 계속 등장합니다." },
  { suffix: "Labyrinth", label: "미궁", detail: "방향감각을 잃게 만드는 굴곡진 통로가 이어집니다." },
  { suffix: "Citadel", label: "성채", detail: "정예 병력이 총출동하는 요새 구간입니다." },
  { suffix: "Throne", label: "왕좌", detail: "마침내 세계의 지배자들이 기다리는 최심부입니다." },
];

export const DUNGEONS = [
  {
    id: "cinder-crypt",
    name: "잿재 지하묘지",
    unlockWorld: 5,
    floors: 8,
    enemyScale: 1.18,
    diamondReward: 45,
    essenceReward: 3,
    guaranteedRarity: "advanced",
    description: "초반 파밍용 던전입니다. 장비 뽑기를 위한 다이아 수급처입니다.",
    modifier: "던전 피해 옵션이 높을수록 빠르게 정리됩니다.",
    enemies: ["묘지 수호골렘", "탄화 망령", "침식 묘지기"],
    boss: "지하묘지 감시자",
  },
  {
    id: "moon-archive",
    name: "월광 서고",
    unlockWorld: 10,
    floors: 10,
    enemyScale: 1.28,
    diamondReward: 65,
    essenceReward: 4,
    guaranteedRarity: "rare",
    description: "광역 피해가 강한 적이 자주 등장합니다.",
    modifier: "보스 층에서 적의 공격 속도가 크게 증가합니다.",
    enemies: ["금서 사제", "월광 기록관", "봉인 파괴자"],
    boss: "흑월 서기관",
  },
  {
    id: "glass-arsenal",
    name: "유리 병기고",
    unlockWorld: 18,
    floors: 10,
    enemyScale: 1.42,
    diamondReward: 90,
    essenceReward: 5,
    guaranteedRarity: "heroic",
    description: "공격 속도와 치명타가 중요해지는 기계 던전입니다.",
    modifier: "장비 보너스가 좋을수록 체감 난도가 크게 낮아집니다.",
    enemies: ["유리 자동병기", "균열 포격수", "수정 수호기"],
    boss: "병기고 총책임자",
  },
  {
    id: "storm-abyss",
    name: "폭풍 심연",
    unlockWorld: 28,
    floors: 12,
    enemyScale: 1.55,
    diamondReward: 120,
    essenceReward: 6,
    guaranteedRarity: "heroic",
    description: "지속 생존력과 체력 재생의 가치가 커지는 중반 던전입니다.",
    modifier: "일부 층에서 번개 폭주로 적 피해가 강화됩니다.",
    enemies: ["천뢰 정령", "폭풍 파수꾼", "심연 조류"],
    boss: "천둥 심연주",
  },
  {
    id: "iron-foundry",
    name: "철혈 주조소",
    unlockWorld: 40,
    floors: 12,
    enemyScale: 1.75,
    diamondReward: 155,
    essenceReward: 7,
    guaranteedRarity: "legendary",
    description: "장비 점수와 공격력의 차이가 확실히 드러나는 던전입니다.",
    modifier: "보스가 단단하지만 전리품이 좋습니다.",
    enemies: ["주조소 감시병", "용광 기수", "강철 파열자"],
    boss: "주조소 감독관",
  },
  {
    id: "frost-sanctum",
    name: "서리 성소",
    unlockWorld: 55,
    floors: 14,
    enemyScale: 1.96,
    diamondReward: 190,
    essenceReward: 9,
    guaranteedRarity: "legendary",
    description: "후반 장비를 파밍하는 첫 핵심 던전입니다.",
    modifier: "정예층 비중이 높아 화력과 재생 둘 다 요구됩니다.",
    enemies: ["서리 성소 수녀", "얼음 파수자", "냉기 수호령"],
    boss: "빙결 대사제",
  },
  {
    id: "void-observatory",
    name: "공허 관측소",
    unlockWorld: 72,
    floors: 15,
    enemyScale: 2.18,
    diamondReward: 240,
    essenceReward: 11,
    guaranteedRarity: "mythic",
    description: "보스 피해와 던전 피해 보너스가 크게 작용합니다.",
    modifier: "공허 왜곡으로 적의 체력이 높은 편입니다.",
    enemies: ["공허 관측자", "왜곡 학자", "심연 포식체"],
    boss: "균열 감시총감",
  },
  {
    id: "crown-throne",
    name: "왕관 심판장",
    unlockWorld: 90,
    floors: 16,
    enemyScale: 2.45,
    diamondReward: 320,
    essenceReward: 14,
    guaranteedRarity: "unique",
    description: "최종 빌드용 장비를 노릴 수 있는 엔드 던전입니다.",
    modifier: "최종층에서 모든 적 능력치가 급격히 상승합니다.",
    enemies: ["심판장 집행관", "왕관 척후병", "왕실 성전사"],
    boss: "왕좌 심판관",
  },
];

export const RELICS = [
  {
    id: "ember-core",
    name: "잿불핵",
    source: "월드 5 도달",
    description: "초반 자원 수급을 안정화하는 불씨 유물입니다.",
    condition: (state) => state.progress.highestWorld >= 5,
    bonuses: { goldRate: 0.15 },
  },
  {
    id: "moon-lens",
    name: "월광 렌즈",
    source: "월드 12 도달",
    description: "치명타 확률을 크게 끌어올리는 관측 유물입니다.",
    condition: (state) => state.progress.highestWorld >= 12,
    bonuses: { critChance: 0.03 },
  },
  {
    id: "glass-engine",
    name: "유리 기관",
    source: "월드 20 도달",
    description: "공격 속도를 높여 장기 방치 효율을 끌어올립니다.",
    condition: (state) => state.progress.highestWorld >= 20,
    bonuses: { attackSpeed: 0.18 },
  },
  {
    id: "thorn-heart",
    name: "가시 심장",
    source: "월드 30 도달",
    description: "생존력과 재생을 크게 강화하는 심장형 유물입니다.",
    condition: (state) => state.progress.highestWorld >= 30,
    bonuses: { regen: 3.2, maxHp: 160 },
  },
  {
    id: "storm-seal",
    name: "폭풍 봉인",
    source: "폭풍 심연 1회 클리어",
    description: "던전 공략 속도를 크게 높여 주는 중반 핵심 유물입니다.",
    condition: (state) => (state.dungeons.clears["storm-abyss"] || 0) >= 1,
    bonuses: { dungeonDamage: 0.18 },
  },
  {
    id: "iron-standard",
    name: "철혈 군기",
    source: "월드 45 도달",
    description: "최대 체력과 공격력을 균형 있게 올려줍니다.",
    condition: (state) => state.progress.highestWorld >= 45,
    bonuses: { maxHp: 320, attack: 75 },
  },
  {
    id: "frost-crown",
    name: "서리 왕관",
    source: "월드 60 도달",
    description: "치명타 피해를 끌어올려 폭발력을 부여합니다.",
    condition: (state) => state.progress.highestWorld >= 60,
    bonuses: { critDamage: 0.35 },
  },
  {
    id: "void-eye",
    name: "공허안",
    source: "공허 관측소 1회 클리어",
    description: "보스 피해와 다이아 수급량을 함께 보강합니다.",
    condition: (state) => (state.dungeons.clears["void-observatory"] || 0) >= 1,
    bonuses: { bossDamage: 0.22, diamondRate: 0.18 },
  },
  {
    id: "solar-loom",
    name: "태양 직기",
    source: "월드 75 도달",
    description: "공격력과 골드 수급을 동시에 강화하는 후반 유물입니다.",
    condition: (state) => state.progress.highestWorld >= 75,
    bonuses: { attack: 180, goldRate: 0.18 },
  },
  {
    id: "crown-orb",
    name: "왕관 구슬",
    source: "월드 95 도달",
    description: "엔드게임 화력을 위한 최상급 유물입니다.",
    condition: (state) => state.progress.highestWorld >= 95,
    bonuses: { attack: 420, bossDamage: 0.28, dungeonDamage: 0.2 },
  },
];

export const UPGRADE_DEFS = {
  attack: {
    label: "검술 단련",
    description: "기본 공격력을 직접 올려 모든 전투 속도를 끌어올립니다.",
    costBase: 24,
    costGrowth: 1.52,
  },
  vitality: {
    label: "생존 체계",
    description: "최대 체력을 키워 오래 버티는 기본 전선을 만듭니다.",
    costBase: 30,
    costGrowth: 1.56,
  },
  recovery: {
    label: "회복 호흡",
    description: "초당 체력 회복량을 올려 방치 생존력을 끌어올립니다.",
    costBase: 34,
    costGrowth: 1.58,
  },
  guard: {
    label: "방패 숙련",
    description: "방어력을 올려 받는 피해를 줄이고 안정적으로 밀어냅니다.",
    costBase: 40,
    costGrowth: 1.6,
  },
  tempo: {
    label: "가속 훈련",
    description: "공격 속도를 높여 방치 시간 동안 더 많은 스테이지를 밀어냅니다.",
    costBase: 44,
    costGrowth: 1.61,
  },
  focus: {
    label: "집중 조율",
    description: "치명타 확률과 치명타 피해를 올려 폭발력을 만듭니다.",
    costBase: 58,
    costGrowth: 1.65,
  },
};

export const BLESSING_DEFS = {
  edge: {
    label: "잿불 검인",
    description: "공격력 계수와 보스 상대 효율이 영구적으로 상승합니다.",
    costBase: 2,
    costGrowth: 1.8,
  },
  bounty: {
    label: "황금 계약",
    description: "골드와 다이아 획득 효율을 영구적으로 끌어올립니다.",
    costBase: 2,
    costGrowth: 1.85,
  },
  ward: {
    label: "수호 맹세",
    description: "최대 체력과 재생 효율을 함께 강화하는 생존 축복입니다.",
    costBase: 3,
    costGrowth: 1.9,
  },
};

export const ITEM_PREFIXES = ["잿불", "월광", "유리", "가시", "폭풍", "철혈", "서리", "공허", "태양", "왕관", "심연", "성흔"];
export const CREATION_PREFIXES = ["창조", "우주", "시원", "태초", "절대", "성좌"];

export const ITEM_NAMES = {
  helmet: ["투구", "면갑", "투헬름", "정수관", "철관"],
  armor: ["갑주", "흉갑", "전투복", "판금", "외투"],
  weapon: ["대검", "장창", "월도", "사슬검", "마도총"],
  ring: ["반지", "결속환", "오브", "결정환", "지배환"],
  necklace: ["목걸이", "성배", "인장", "봉인석", "아뮬렛"],
  bracelet: ["팔찌", "쇄도환", "수호륜", "완갑", "매듭고리"],
  greaves: ["각반", "경갑", "무릎갑", "추적구", "철각"],
  gloves: ["장갑", "건틀릿", "전투장", "추적수", "철수갑"],
  shoes: ["신발", "전투화", "행군화", "질주화", "은신화"],
};

export const CREATION_NAMES = {
  helmet: ["천개 투구", "별무리 관"],
  armor: ["창세 갑주", "절대 흉갑"],
  weapon: ["태초 검", "무한 장창"],
  ring: ["세계환", "시원 반지"],
  necklace: ["개벽 목걸이", "별핵 아뮬렛"],
  bracelet: ["우주 팔찌", "창조 완갑"],
  greaves: ["천공 각반", "개벽 철각"],
  gloves: ["창세 장갑", "운명 건틀릿"],
  shoes: ["성좌 신발", "절대 전투화"],
};
