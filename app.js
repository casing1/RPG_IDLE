const STORAGE_KEY = "rpg_idle_ashen_keep_v6";
const LEGACY_STORAGE_KEYS = ["rpg_idle_ashen_keep_v5"];
const SAVE_INTERVAL_MS = 5000;
const TOTAL_WORLDS = 100;
const STAGES_PER_WORLD = 100;
const MAX_OFFLINE_SECONDS = 4 * 60 * 60;
const LOG_LIMIT = 40;
const INVENTORY_LIMIT = 90;
const RECENT_DRAW_LIMIT = 8;
const DRAW_COST_SINGLE = 40;
const DRAW_COST_MULTI = 360;
const FURY_DURATION = 10;
const FURY_COOLDOWN = 40;
const SYNTHESIS_REQUIREMENT = 3;

const EQUIPMENT_SLOTS = [
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

const EQUIPMENT_CATEGORIES = [
  { id: "all", label: "전체", slots: EQUIPMENT_SLOTS.map((slot) => slot.id) },
  { id: "weapon", label: "무기", slots: ["weapon"] },
  { id: "armor", label: "방어구", slots: ["helmet", "armor", "greaves", "gloves", "shoes"] },
  { id: "accessory", label: "장신구", slots: ["ring", "necklace", "bracelet"] },
];

const RARITIES = [
  { id: "common", label: "일반", weight: 47, multiplier: 1, className: "rarity-common" },
  { id: "advanced", label: "고급", weight: 26, multiplier: 1.24, className: "rarity-advanced" },
  { id: "rare", label: "희귀", weight: 15, multiplier: 1.62, className: "rarity-rare" },
  { id: "heroic", label: "영웅", weight: 7.8, multiplier: 2.15, className: "rarity-heroic" },
  { id: "legendary", label: "전설", weight: 3.1, multiplier: 2.95, className: "rarity-legendary" },
  { id: "mythic", label: "신화", weight: 0.9, multiplier: 4.1, className: "rarity-mythic" },
  { id: "unique", label: "유일", weight: 0.2, multiplier: 5.65, className: "rarity-unique" },
];

const CREATION_RARITY = {
  id: "creation",
  label: "창조",
  weight: 0,
  multiplier: 7.4,
  className: "rarity-creation",
};

const LEGACY_SLOT_MAP = {
  sigil: "necklace",
};

const LEGACY_RARITY_MAP = {
  common: "common",
  rare: "rare",
  epic: "heroic",
  legendary: "legendary",
  mythic: "mythic",
};

const WORLD_THEMES = [
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

const WORLD_REALMS = [
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

const DUNGEONS = [
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

const RELICS = [
  {
    id: "ember-core",
    name: "잿불핵",
    source: "월드 5 도달",
    description: "초반 자원 수급을 안정화하는 불씨 유물입니다.",
    condition: () => state.progress.highestWorld >= 5,
    bonuses: { goldRate: 0.15 },
  },
  {
    id: "moon-lens",
    name: "월광 렌즈",
    source: "월드 12 도달",
    description: "치명타 확률을 크게 끌어올리는 관측 유물입니다.",
    condition: () => state.progress.highestWorld >= 12,
    bonuses: { critChance: 0.03 },
  },
  {
    id: "glass-engine",
    name: "유리 기관",
    source: "월드 20 도달",
    description: "공격 속도를 높여 장기 방치 효율을 끌어올립니다.",
    condition: () => state.progress.highestWorld >= 20,
    bonuses: { attackSpeed: 0.18 },
  },
  {
    id: "thorn-heart",
    name: "가시 심장",
    source: "월드 30 도달",
    description: "생존력과 재생을 크게 강화하는 심장형 유물입니다.",
    condition: () => state.progress.highestWorld >= 30,
    bonuses: { regen: 3.2, maxHp: 160 },
  },
  {
    id: "storm-seal",
    name: "폭풍 봉인",
    source: "폭풍 심연 1회 클리어",
    description: "던전 공략 속도를 크게 높여 주는 중반 핵심 유물입니다.",
    condition: () => (state.dungeons.clears["storm-abyss"] || 0) >= 1,
    bonuses: { dungeonDamage: 0.18 },
  },
  {
    id: "iron-standard",
    name: "철혈 군기",
    source: "월드 45 도달",
    description: "최대 체력과 공격력을 균형 있게 올려줍니다.",
    condition: () => state.progress.highestWorld >= 45,
    bonuses: { maxHp: 320, attack: 75 },
  },
  {
    id: "frost-crown",
    name: "서리 왕관",
    source: "월드 60 도달",
    description: "치명타 피해를 끌어올려 폭발력을 부여합니다.",
    condition: () => state.progress.highestWorld >= 60,
    bonuses: { critDamage: 0.35 },
  },
  {
    id: "void-eye",
    name: "공허안",
    source: "공허 관측소 1회 클리어",
    description: "보스 피해와 다이아 수급량을 함께 보강합니다.",
    condition: () => (state.dungeons.clears["void-observatory"] || 0) >= 1,
    bonuses: { bossDamage: 0.22, diamondRate: 0.18 },
  },
  {
    id: "solar-loom",
    name: "태양 직기",
    source: "월드 75 도달",
    description: "공격력과 골드 수급을 동시에 강화하는 후반 유물입니다.",
    condition: () => state.progress.highestWorld >= 75,
    bonuses: { attack: 180, goldRate: 0.18 },
  },
  {
    id: "crown-orb",
    name: "왕관 구슬",
    source: "월드 95 도달",
    description: "엔드게임 화력을 위한 최상급 유물입니다.",
    condition: () => state.progress.highestWorld >= 95,
    bonuses: { attack: 420, bossDamage: 0.28, dungeonDamage: 0.2 },
  },
];

const UPGRADE_DEFS = {
  attack: {
    label: "검술 단련",
    description: "기본 공격력을 직접 올려 모든 전투 속도를 끌어올립니다.",
    costBase: 24,
    costGrowth: 1.52,
  },
  vitality: {
    label: "생존 훈련",
    description: "최대 체력과 재생을 함께 올려 장기전을 버티게 만듭니다.",
    costBase: 30,
    costGrowth: 1.56,
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

const BLESSING_DEFS = {
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

const ITEM_PREFIXES = ["잿불", "월광", "유리", "가시", "폭풍", "철혈", "서리", "공허", "태양", "왕관", "심연", "성흔"];
const CREATION_PREFIXES = ["창조", "우주", "시원", "태초", "절대", "성좌"];

const ITEM_NAMES = {
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

const CREATION_NAMES = {
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

function byId(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element: #${id}`);
  return element;
}

const refs = {
  offlineBanner: byId("offlineBanner"),
  goldValue: byId("goldValue"),
  diamondValue: byId("diamondValue"),
  essenceValue: byId("essenceValue"),
  progressValue: byId("progressValue"),
  heroLevel: byId("heroLevel"),
  heroStatus: byId("heroStatus"),
  expValue: byId("expValue"),
  expBar: byId("expBar"),
  attackValue: byId("attackValue"),
  hpValue: byId("hpValue"),
  speedValue: byId("speedValue"),
  critValue: byId("critValue"),
  regenValue: byId("regenValue"),
  dpsValue: byId("dpsValue"),
  equipmentSlots: byId("equipmentSlots"),
  saveButton: byId("saveButton"),
  autoAdvanceToggle: byId("autoAdvanceToggle"),
  autoAdvanceWorldToggle: byId("autoAdvanceWorldToggle"),
  heroCardName: byId("heroCardName"),
  heroHpBar: byId("heroHpBar"),
  heroHpText: byId("heroHpText"),
  enemyTag: byId("enemyTag"),
  enemyName: byId("enemyName"),
  enemyHpBar: byId("enemyHpBar"),
  enemyHpText: byId("enemyHpText"),
  enemyPower: byId("enemyPower"),
  furyButton: byId("furyButton"),
  furyCooldown: byId("furyCooldown"),
  furyState: byId("furyState"),
  worldValue: byId("worldValue"),
  stageValue: byId("stageValue"),
  stageTypeValue: byId("stageTypeValue"),
  dungeonStateValue: byId("dungeonStateValue"),
  worldClearValue: byId("worldClearValue"),
  bossKillValue: byId("bossKillValue"),
  drawCountValue: byId("drawCountValue"),
  deathValue: byId("deathValue"),
  worldName: byId("worldName"),
  stageDescriptor: byId("stageDescriptor"),
  worldDescription: byId("worldDescription"),
  campaignBar: byId("campaignBar"),
  nextUnlockValue: byId("nextUnlockValue"),
  menuTabs: byId("menuTabs"),
  leaveDungeonButton: byId("leaveDungeonButton"),
  dungeonList: byId("dungeonList"),
  upgradeList: byId("upgradeList"),
  blessingList: byId("blessingList"),
  relicList: byId("relicList"),
  statusList: byId("statusList"),
  drawOneButton: byId("drawOneButton"),
  drawTenButton: byId("drawTenButton"),
  diamondMetaValue: byId("diamondMetaValue"),
  drawPityValue: byId("drawPityValue"),
  recentDraws: byId("recentDraws"),
  inventoryList: byId("inventoryList"),
  synthesisList: byId("synthesisList"),
  combatLog: byId("combatLog"),
};

let state = createInitialState();
let lastFrame = 0;
let lastSave = 0;

function createEmptyBonuses() {
  return {
    attack: 0,
    maxHp: 0,
    attackSpeed: 0,
    critChance: 0,
    critDamage: 0,
    regen: 0,
    goldRate: 0,
    diamondRate: 0,
    bossDamage: 0,
    dungeonDamage: 0,
  };
}

function createEquippedState() {
  const equipped = {};
  EQUIPMENT_SLOTS.forEach((slot) => {
    equipped[slot.id] = null;
  });
  return equipped;
}

function createDungeonClears() {
  const clears = {};
  DUNGEONS.forEach((dungeon) => {
    clears[dungeon.id] = 0;
  });
  return clears;
}

function createInitialState() {
  return {
    resources: { gold: 80, diamonds: 140, essence: 0 },
    hero: {
      level: 1,
      exp: 0,
      expToNext: 24,
      attack: 14,
      maxHp: 130,
      hp: 130,
      attackSpeed: 1.1,
      critChance: 0.08,
      critDamage: 1.7,
      regen: 2.6,
    },
    upgrades: { attack: 0, vitality: 0, tempo: 0, focus: 0 },
    blessings: { edge: 0, bounty: 0, ward: 0 },
    progress: {
      world: 1,
      stage: 1,
      highestWorld: 1,
      highestStage: 1,
      totalStageClears: 0,
      totalWorldClears: 0,
      totalBossKills: 0,
      totalDeaths: 0,
    },
    dungeons: { active: null, clears: createDungeonClears() },
    equipment: { nextId: 1, inventory: [], equipped: createEquippedState() },
    gacha: { pity: 0, totalDraws: 0, recentResults: [] },
    forge: { totalSynths: 0, totalCreations: 0 },
    settings: { autoAdvance: true, autoAdvanceWorld: true, activeMenu: "upgrades", equipmentFilter: "all" },
    combat: {
      enemy: null,
      heroCooldown: 0,
      enemyCooldown: 0,
      reviveTimer: 0,
      furyRemaining: 0,
      furyCooldown: 0,
    },
    logs: [],
    lastSeen: Date.now(),
  };
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function choose(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function formatNumber(value) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return Math.floor(value).toLocaleString("ko-KR");
}

function formatPercent(value) {
  return `${(value * 100).toFixed(value >= 0.1 ? 0 : 1)}%`;
}

function formatMultiplier(value) {
  return `x${value.toFixed(2)}`;
}

function getSlotById(id) {
  return EQUIPMENT_SLOTS.find((slot) => slot.id === id) || EQUIPMENT_SLOTS[0];
}

function getSlotLabel(id) {
  return getSlotById(id).label;
}

function getRarityData(id, isCreation) {
  if (isCreation || id === CREATION_RARITY.id) return CREATION_RARITY;
  return RARITIES.find((rarity) => rarity.id === id) || RARITIES[0];
}

function getRarityRank(id, isCreation) {
  if (isCreation || id === CREATION_RARITY.id) return RARITIES.length;
  return Math.max(0, RARITIES.findIndex((rarity) => rarity.id === id));
}

function getNextRarity(id) {
  const index = RARITIES.findIndex((rarity) => rarity.id === id);
  if (index === -1) return RARITIES[0];
  if (index === RARITIES.length - 1) return CREATION_RARITY;
  return RARITIES[index + 1];
}

function cloneBonuses(bonuses) {
  return {
    attack: Number(bonuses?.attack || 0),
    maxHp: Number(bonuses?.maxHp || 0),
    attackSpeed: Number(bonuses?.attackSpeed || 0),
    critChance: Number(bonuses?.critChance || 0),
    critDamage: Number(bonuses?.critDamage || 0),
    regen: Number(bonuses?.regen || 0),
    goldRate: Number(bonuses?.goldRate || 0),
    diamondRate: Number(bonuses?.diamondRate || 0),
    bossDamage: Number(bonuses?.bossDamage || 0),
    dungeonDamage: Number(bonuses?.dungeonDamage || 0),
  };
}

function calculateItemScore(item) {
  const bonus = item.bonuses;
  return (
    bonus.attack * 1.3 +
    bonus.maxHp * 0.22 +
    bonus.attackSpeed * 240 +
    bonus.critChance * 950 +
    bonus.critDamage * 240 +
    bonus.regen * 80 +
    bonus.goldRate * 220 +
    bonus.diamondRate * 360 +
    bonus.bossDamage * 520 +
    bonus.dungeonDamage * 560 +
    (item.isCreation ? 480 : 0) +
    getRarityRank(item.rarity, item.isCreation) * 40
  );
}

function normalizeItem(item) {
  if (!item || typeof item !== "object") return null;

  const isCreation = Boolean(item.isCreation || item.rarity === CREATION_RARITY.id);
  const slotId = EQUIPMENT_SLOTS.some((slot) => slot.id === item.slot)
    ? item.slot
    : LEGACY_SLOT_MAP[item.slot] || "weapon";
  const rarityId = isCreation
    ? CREATION_RARITY.id
    : RARITIES.some((rarity) => rarity.id === item.rarity)
      ? item.rarity
      : LEGACY_RARITY_MAP[item.rarity] || "common";
  const rarity = getRarityData(rarityId, isCreation);
  const normalized = {
    id: Number(item.id || 0),
    name: String(item.name || `${choose(ITEM_PREFIXES)} ${choose(ITEM_NAMES[slotId])}`),
    slot: slotId,
    rarity: rarity.id,
    rarityLabel: rarity.label,
    className: rarity.className,
    source: String(item.source || (isCreation ? "창조 합성" : "다이아 뽑기")),
    isCreation,
    bonuses: cloneBonuses(item.bonuses),
  };
  normalized.score = calculateItemScore(normalized);
  return normalized;
}

function hydrateState(saved) {
  const base = createInitialState();
  if (!saved || typeof saved !== "object") return base;

  const inventory = Array.isArray(saved.equipment?.inventory)
    ? saved.equipment.inventory.map((item) => normalizeItem(item)).filter(Boolean)
    : [];

  const equipped = createEquippedState();
  EQUIPMENT_SLOTS.forEach((slot) => {
    const rawEquipped =
      saved.equipment?.equipped?.[slot.id] ||
      (slot.id === "necklace" ? saved.equipment?.equipped?.sigil : null);
    equipped[slot.id] = normalizeItem(rawEquipped);
  });

  const recentResults = Array.isArray(saved.gacha?.recentResults)
    ? saved.gacha.recentResults.map((item) => normalizeItem(item)).filter(Boolean).slice(0, RECENT_DRAW_LIMIT)
    : [];

  return {
    ...base,
    resources: { ...base.resources, ...saved.resources },
    hero: { ...base.hero, ...saved.hero },
    upgrades: { ...base.upgrades, ...saved.upgrades },
    blessings: { ...base.blessings, ...saved.blessings },
    progress: { ...base.progress, ...saved.progress },
    dungeons: {
      active: saved.dungeons?.active ? { ...saved.dungeons.active } : null,
      clears: { ...createDungeonClears(), ...(saved.dungeons?.clears || {}) },
    },
    equipment: {
      nextId: Number(saved.equipment?.nextId || base.equipment.nextId),
      inventory,
      equipped,
    },
    gacha: { ...base.gacha, ...saved.gacha, recentResults },
    forge: { ...base.forge, ...saved.forge },
    settings: { ...base.settings, ...saved.settings },
    combat: { ...base.combat, ...saved.combat, enemy: null },
    logs: Array.isArray(saved.logs) ? saved.logs.slice(0, LOG_LIMIT) : [],
    lastSeen: typeof saved.lastSeen === "number" ? saved.lastSeen : Date.now(),
  };
}

function loadState() {
  try {
    const keys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      return hydrateState(JSON.parse(raw));
    }
    return createInitialState();
  } catch (error) {
    console.warn("Failed to load save state.", error);
    return createInitialState();
  }
}

function saveState() {
  state.lastSeen = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  LEGACY_STORAGE_KEYS.forEach((key) => {
    if (key !== STORAGE_KEY) localStorage.removeItem(key);
  });
  lastSave = state.lastSeen;
}

function getProgressValue(world, stage) {
  return (world - 1) * STAGES_PER_WORLD + stage;
}

function getWorldInfo(world) {
  const theme = WORLD_THEMES[(world - 1) % WORLD_THEMES.length];
  const realm = WORLD_REALMS[Math.floor((world - 1) / WORLD_THEMES.length) % WORLD_REALMS.length];
  return {
    name: `월드 ${world} · ${theme.title} ${realm.suffix}`,
    description: `${theme.description} ${realm.detail}`,
    theme,
    realm,
  };
}

function getStageTier(stage) {
  if (stage === STAGES_PER_WORLD) {
    return {
      label: "월드 로드",
      tag: "Lord",
      hpMultiplier: 6,
      attackMultiplier: 4.4,
      goldMultiplier: 6,
      expMultiplier: 5,
      diamondReward: 10,
      essenceReward: 1,
      isBoss: true,
      isElite: true,
    };
  }
  if (stage % 25 === 0) {
    return {
      label: "엘리트",
      tag: "Elite",
      hpMultiplier: 2.8,
      attackMultiplier: 2.1,
      goldMultiplier: 2.5,
      expMultiplier: 2.1,
      diamondReward: 2,
      essenceReward: 0,
      isBoss: true,
      isElite: true,
    };
  }
  if (stage % 10 === 0) {
    return {
      label: "가디언",
      tag: "Boss",
      hpMultiplier: 1.95,
      attackMultiplier: 1.55,
      goldMultiplier: 1.65,
      expMultiplier: 1.5,
      diamondReward: 1,
      essenceReward: 0,
      isBoss: true,
      isElite: false,
    };
  }
  return {
    label: "일반",
    tag: "Enemy",
    hpMultiplier: 1,
    attackMultiplier: 1,
    goldMultiplier: 1,
    expMultiplier: 1,
    diamondReward: 0,
    essenceReward: 0,
    isBoss: false,
    isElite: false,
  };
}

function getUnlockedDungeons() {
  return DUNGEONS.filter((dungeon) => state.progress.highestWorld >= dungeon.unlockWorld);
}

function getNextDungeonUnlock() {
  return DUNGEONS.find((dungeon) => state.progress.highestWorld < dungeon.unlockWorld) || null;
}

function getDungeonById(id) {
  return DUNGEONS.find((dungeon) => dungeon.id === id) || null;
}

function getUpgradeCost(key) {
  const def = UPGRADE_DEFS[key];
  return Math.floor(def.costBase * Math.pow(def.costGrowth, state.upgrades[key]));
}

function getBlessingCost(key) {
  const def = BLESSING_DEFS[key];
  return Math.max(1, Math.floor(def.costBase * Math.pow(def.costGrowth, state.blessings[key])));
}

function getUpgradeBonuses() {
  return {
    attack: state.upgrades.attack * 10,
    maxHp: state.upgrades.vitality * 45,
    attackSpeed: state.upgrades.tempo * 0.06,
    critChance: state.upgrades.focus * 0.008,
    critDamage: state.upgrades.focus * 0.05,
    regen: state.upgrades.vitality * 0.25,
    goldRate: 0,
    diamondRate: 0,
    bossDamage: Math.floor(state.upgrades.attack / 10) * 0.03,
    dungeonDamage: Math.floor(state.upgrades.vitality / 12) * 0.04,
  };
}

function getEquipmentBonuses() {
  const total = createEmptyBonuses();
  EQUIPMENT_SLOTS.forEach((slot) => {
    const item = state.equipment.equipped[slot.id];
    if (!item) return;
    Object.keys(total).forEach((key) => {
      total[key] += Number(item.bonuses[key] || 0);
    });
  });
  return total;
}

function getUnlockedRelics() {
  return RELICS.filter((relic) => relic.condition());
}

function getRelicBonuses() {
  const total = createEmptyBonuses();
  getUnlockedRelics().forEach((relic) => {
    Object.keys(relic.bonuses).forEach((key) => {
      total[key] += Number(relic.bonuses[key] || 0);
    });
  });
  return total;
}

function getFinalStats() {
  const upgrade = getUpgradeBonuses();
  const gear = getEquipmentBonuses();
  const relic = getRelicBonuses();
  const furyAttack = state.combat.furyRemaining > 0 ? 1.85 : 1;
  const furySpeed = state.combat.furyRemaining > 0 ? 1.45 : 1;

  const attack = (state.hero.attack + upgrade.attack + gear.attack + relic.attack) * (1 + state.blessings.edge * 0.08) * furyAttack;
  const maxHp = (state.hero.maxHp + upgrade.maxHp + gear.maxHp + relic.maxHp) * (1 + state.blessings.ward * 0.08);
  const attackSpeed = (state.hero.attackSpeed + upgrade.attackSpeed + gear.attackSpeed + relic.attackSpeed) * furySpeed;
  const critChance = clamp(state.hero.critChance + upgrade.critChance + gear.critChance + relic.critChance, 0, 0.85);
  const critDamage = state.hero.critDamage + upgrade.critDamage + gear.critDamage + relic.critDamage;
  const regen = (state.hero.regen + upgrade.regen + gear.regen + relic.regen) * (1 + state.blessings.ward * 0.1);
  const goldRate = 1 + state.blessings.bounty * 0.12 + gear.goldRate + relic.goldRate;
  const diamondRate = 1 + state.blessings.bounty * 0.04 + gear.diamondRate + relic.diamondRate;
  const bossDamage = 1 + Math.floor(state.upgrades.attack / 10) * 0.03 + state.blessings.edge * 0.02 + gear.bossDamage + relic.bossDamage;
  const dungeonDamage = 1 + Math.floor(state.upgrades.vitality / 12) * 0.04 + gear.dungeonDamage + relic.dungeonDamage;
  const dps = attack * attackSpeed * (1 + critChance * (critDamage - 1));

  return {
    attack,
    maxHp,
    attackSpeed,
    critChance,
    critDamage,
    regen,
    goldRate,
    diamondRate,
    bossDamage,
    dungeonDamage,
    dps,
    base: {
      attack: state.hero.attack,
      maxHp: state.hero.maxHp,
      attackSpeed: state.hero.attackSpeed,
      critChance: state.hero.critChance,
      critDamage: state.hero.critDamage,
      regen: state.hero.regen,
    },
    upgrade,
    gear,
    relic,
  };
}
function createLog(message) {
  const timestamp = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  state.logs.unshift({ text: message, timestamp });
  state.logs = state.logs.slice(0, LOG_LIMIT);
}

function buildCampaignEncounter(world, stage) {
  const worldInfo = getWorldInfo(world);
  const tier = getStageTier(stage);
  const worldScale = Math.pow(1.11, world - 1);
  const stageScale = 1 + (stage - 1) * 0.028;
  const hp = Math.round((72 + world * 11) * worldScale * stageScale * tier.hpMultiplier);
  const attack = Math.round((8 + world * 2.1) * worldScale * (1 + stage * 0.018) * tier.attackMultiplier);
  const gold = Math.round((16 + world * 4.6) * worldScale * stageScale * tier.goldMultiplier);
  const exp = Math.round((18 + world * 4.9) * worldScale * stageScale * tier.expMultiplier);
  const namePool = tier.isElite ? worldInfo.theme.elites : worldInfo.theme.foes;
  const name =
    stage === STAGES_PER_WORLD
      ? `${worldInfo.theme.prefix} ${worldInfo.realm.label}의 ${worldInfo.theme.lord}`
      : tier.isBoss
        ? `${worldInfo.theme.prefix} ${choose(namePool)}`
        : choose(namePool);

  return {
    name,
    tag: tier.tag,
    label: tier.label,
    hp,
    maxHp: hp,
    attack,
    attackSpeed: tier.isBoss ? 0.95 + world * 0.004 : 0.88 + world * 0.003,
    gold,
    exp,
    diamonds: tier.diamondReward,
    essence: stage === STAGES_PER_WORLD ? tier.essenceReward + Math.floor(world / 10) : 0,
    boss: tier.isBoss,
    dungeon: false,
    world,
    stage,
  };
}

function buildDungeonEncounter(dungeon, floor) {
  const bossFloor = floor === dungeon.floors || floor % 4 === 0;
  const baseWorldScale = Math.pow(1.12, dungeon.unlockWorld - 1) * dungeon.enemyScale;
  const floorScale = 1 + floor * 0.12;
  const hp = Math.round((110 + dungeon.unlockWorld * 16) * baseWorldScale * floorScale * (bossFloor ? 2.8 : 1));
  const attack = Math.round((13 + dungeon.unlockWorld * 2.8) * baseWorldScale * (1 + floor * 0.05) * (bossFloor ? 1.8 : 1));
  const gold = Math.round((26 + dungeon.unlockWorld * 6) * baseWorldScale * (bossFloor ? 2.2 : 1));
  const exp = Math.round((28 + dungeon.unlockWorld * 6.2) * baseWorldScale * (bossFloor ? 2.4 : 1));

  return {
    name: bossFloor ? dungeon.boss : choose(dungeon.enemies),
    tag: bossFloor ? "Dungeon Boss" : "Dungeon",
    label: bossFloor ? "던전 보스" : `던전 ${floor}층`,
    hp,
    maxHp: hp,
    attack,
    attackSpeed: bossFloor ? 1.02 + floor * 0.01 : 0.92 + floor * 0.008,
    gold,
    exp,
    diamonds: bossFloor ? 2 : 0,
    essence: 0,
    boss: bossFloor,
    dungeon: true,
    world: state.progress.world,
    stage: state.progress.stage,
    dungeonId: dungeon.id,
    floor,
  };
}

function createEnemy() {
  if (state.dungeons.active) {
    const dungeon = getDungeonById(state.dungeons.active.id);
    if (dungeon) {
      state.combat.enemy = buildDungeonEncounter(dungeon, state.dungeons.active.floor);
      state.combat.enemyCooldown = 0;
      createLog(`${dungeon.name} ${state.dungeons.active.floor}층 전투 시작`);
      return;
    }
    state.dungeons.active = null;
  }

  state.combat.enemy = buildCampaignEncounter(state.progress.world, state.progress.stage);
  state.combat.enemyCooldown = 0;
}

function updateHighestProgress() {
  const previousUnlocked = getUnlockedDungeons().length;
  const currentProgress = getProgressValue(state.progress.world, state.progress.stage);
  const highestProgress = getProgressValue(state.progress.highestWorld, state.progress.highestStage);

  if (currentProgress > highestProgress) {
    state.progress.highestWorld = state.progress.world;
    state.progress.highestStage = state.progress.stage;
  }

  const nextUnlocked = getUnlockedDungeons().length;
  if (nextUnlocked > previousUnlocked) {
    const unlocked = getUnlockedDungeons()[nextUnlocked - 1];
    if (unlocked) createLog(`${unlocked.name} 던전이 해금되었습니다.`);
  }
}

function gainExperience(amount) {
  state.hero.exp += amount;
  while (state.hero.exp >= state.hero.expToNext) {
    state.hero.exp -= state.hero.expToNext;
    state.hero.level += 1;
    state.hero.expToNext = Math.round(state.hero.expToNext * 1.26 + 12);
    state.hero.attack += 3 + Math.floor(state.hero.level * 0.48);
    state.hero.maxHp += 18 + state.hero.level * 2.2;
    state.hero.regen += 0.22;
    if (state.hero.level % 4 === 0) state.hero.attackSpeed += 0.025;
    if (state.hero.level % 5 === 0) state.hero.critChance = clamp(state.hero.critChance + 0.01, 0, 0.85);
    createLog(`영웅이 Lv.${state.hero.level}에 도달했습니다.`);
  }
}

function rollRarity(minRarity) {
  let picked = null;

  if (!minRarity && state.gacha.pity >= 29) {
    picked = "legendary";
  } else {
    const totalWeight = RARITIES.reduce((sum, rarity) => sum + rarity.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const rarity of RARITIES) {
      roll -= rarity.weight;
      if (roll <= 0) {
        picked = rarity.id;
        break;
      }
    }
  }

  picked = picked || "common";
  if (minRarity && getRarityRank(picked) < getRarityRank(minRarity)) picked = minRarity;

  if (getRarityRank(picked) >= getRarityRank("legendary")) {
    state.gacha.pity = 0;
  } else {
    state.gacha.pity += 1;
  }

  return picked;
}

function getAffixPool(scale, multiplier) {
  return [
    (bonuses) => {
      bonuses.attack += Math.round(scale * 2.2 * multiplier);
    },
    (bonuses) => {
      bonuses.maxHp += Math.round(scale * 12 * multiplier);
    },
    (bonuses) => {
      bonuses.attackSpeed += 0.012 * multiplier;
    },
    (bonuses) => {
      bonuses.critChance += 0.0035 * multiplier;
    },
    (bonuses) => {
      bonuses.critDamage += 0.024 * multiplier;
    },
    (bonuses) => {
      bonuses.regen += 0.28 * multiplier;
    },
    (bonuses) => {
      bonuses.goldRate += 0.016 * multiplier;
    },
    (bonuses) => {
      bonuses.diamondRate += 0.012 * multiplier;
    },
    (bonuses) => {
      bonuses.bossDamage += 0.018 * multiplier;
    },
    (bonuses) => {
      bonuses.dungeonDamage += 0.02 * multiplier;
    },
  ];
}

function applySlotBaseBonuses(slot, bonuses, scale, multiplier) {
  if (slot === "helmet") {
    bonuses.maxHp += Math.round(scale * 24 * multiplier);
    bonuses.regen += 0.42 * multiplier;
    bonuses.bossDamage += 0.012 * multiplier;
  }
  if (slot === "armor") {
    bonuses.maxHp += Math.round(scale * 42 * multiplier);
    bonuses.regen += 0.58 * multiplier;
    bonuses.dungeonDamage += 0.018 * multiplier;
  }
  if (slot === "weapon") {
    bonuses.attack += Math.round(scale * 10 * multiplier);
    bonuses.critDamage += 0.06 * multiplier;
    bonuses.bossDamage += 0.028 * multiplier;
  }
  if (slot === "ring") {
    bonuses.critChance += 0.008 * multiplier;
    bonuses.critDamage += 0.035 * multiplier;
    bonuses.goldRate += 0.035 * multiplier;
  }
  if (slot === "necklace") {
    bonuses.attack += Math.round(scale * 5 * multiplier);
    bonuses.attackSpeed += 0.022 * multiplier;
    bonuses.dungeonDamage += 0.025 * multiplier;
  }
  if (slot === "bracelet") {
    bonuses.diamondRate += 0.028 * multiplier;
    bonuses.critChance += 0.005 * multiplier;
    bonuses.bossDamage += 0.02 * multiplier;
  }
  if (slot === "greaves") {
    bonuses.maxHp += Math.round(scale * 18 * multiplier);
    bonuses.attackSpeed += 0.018 * multiplier;
    bonuses.dungeonDamage += 0.022 * multiplier;
  }
  if (slot === "gloves") {
    bonuses.attack += Math.round(scale * 4.5 * multiplier);
    bonuses.attackSpeed += 0.024 * multiplier;
    bonuses.critChance += 0.004 * multiplier;
  }
  if (slot === "shoes") {
    bonuses.regen += 0.36 * multiplier;
    bonuses.attackSpeed += 0.016 * multiplier;
    bonuses.goldRate += 0.026 * multiplier;
  }
}

function applyRandomAffixes(bonuses, rarity, scale, isCreation) {
  const pool = getAffixPool(scale, rarity.multiplier);
  const extraCount = isCreation
    ? 5
    : rarity.id === "unique"
      ? 4
      : rarity.id === "mythic"
        ? 3
        : getRarityRank(rarity.id) >= getRarityRank("heroic")
          ? 2
          : 1;

  for (let count = 0; count < extraCount && pool.length; count += 1) {
    const index = Math.floor(Math.random() * pool.length);
    const [affix] = pool.splice(index, 1);
    affix(bonuses);
  }
}

function createEquipmentItem(options = {}) {
  const slot = options.slot || choose(EQUIPMENT_SLOTS).id;
  const isCreation = Boolean(options.isCreation);
  const rarity = isCreation
    ? CREATION_RARITY
    : getRarityData(options.rarityId || rollRarity(options.minRarity || null));
  const scale = (1 + state.progress.highestWorld * 0.12 + state.progress.highestStage * 0.015) * (isCreation ? 1.26 : 1);
  const bonuses = createEmptyBonuses();

  applySlotBaseBonuses(slot, bonuses, scale, rarity.multiplier);
  applyRandomAffixes(bonuses, rarity, scale, isCreation);

  const name = isCreation
    ? `${choose(CREATION_PREFIXES)} ${choose(CREATION_NAMES[slot])}`
    : `${choose(ITEM_PREFIXES)} ${choose(ITEM_NAMES[slot])}`;

  const item = {
    id: state.equipment.nextId,
    name,
    slot,
    rarity: rarity.id,
    rarityLabel: rarity.label,
    className: rarity.className,
    source: options.source || (isCreation ? "창조 합성" : "다이아 뽑기"),
    isCreation,
    bonuses,
  };

  item.score = calculateItemScore(item);
  state.equipment.nextId += 1;
  return item;
}

function getEquippedIds() {
  return new Set(
    EQUIPMENT_SLOTS.map((slot) => state.equipment.equipped[slot.id])
      .filter(Boolean)
      .map((item) => item.id),
  );
}

function trimInventory() {
  const equippedIds = getEquippedIds();
  state.equipment.inventory.sort((a, b) => b.score - a.score);
  state.equipment.inventory = state.equipment.inventory.filter((item, index) => index < INVENTORY_LIMIT || equippedIds.has(item.id));
}

function autoEquipItem(item) {
  const current = state.equipment.equipped[item.slot];
  if (!current || item.score > current.score) {
    state.equipment.equipped[item.slot] = item;
    createLog(`${item.name} 장비를 ${getSlotLabel(item.slot)} 슬롯에 장착했습니다.`);
  }
}

function addItemToInventory(item, options = {}) {
  state.equipment.inventory.unshift(item);
  if (options.autoEquip !== false) autoEquipItem(item);
  trimInventory();
}

function drawEquipment(count, options = {}) {
  if (!options.free) {
    const cost = count === 10 ? DRAW_COST_MULTI : DRAW_COST_SINGLE;
    if (state.resources.diamonds < cost) return [];
    state.resources.diamonds -= cost;
  }

  const results = [];
  for (let index = 0; index < count; index += 1) {
    const item = createEquipmentItem(options);
    addItemToInventory(item);
    results.push(item);
  }

  state.gacha.totalDraws += count;
  state.gacha.recentResults = [...results.reverse(), ...state.gacha.recentResults].slice(0, RECENT_DRAW_LIMIT);
  createLog(`${options.source || "장비 뽑기"}로 장비 ${count}개를 획득했습니다.`);
  return results;
}

function equipItemById(id) {
  const item = state.equipment.inventory.find((entry) => entry.id === id);
  if (!item) return;
  state.equipment.equipped[item.slot] = item;
  createLog(`${item.name} 장비를 수동으로 장착했습니다.`);
}

function getSynthesisGroups() {
  const equippedIds = getEquippedIds();
  const grouped = {};

  state.equipment.inventory.forEach((item) => {
    if (item.isCreation) return;
    if (equippedIds.has(item.id)) return;
    const key = `${item.slot}:${item.rarity}`;
    if (!grouped[key]) {
      grouped[key] = {
        key,
        slot: item.slot,
        rarity: item.rarity,
        items: [],
      };
    }
    grouped[key].items.push(item);
  });

  return Object.values(grouped)
    .map((group) => {
      const rarity = getRarityData(group.rarity);
      const target = getNextRarity(group.rarity);
      return {
        ...group,
        slotLabel: getSlotLabel(group.slot),
        rarityLabel: rarity.label,
        target,
        count: group.items.length,
        canSynthesize: group.items.length >= SYNTHESIS_REQUIREMENT,
      };
    })
    .sort((left, right) => {
      if (left.canSynthesize !== right.canSynthesize) return left.canSynthesize ? -1 : 1;
      const rankDiff = getRarityRank(right.rarity) - getRarityRank(left.rarity);
      if (rankDiff !== 0) return rankDiff;
      return left.slotLabel.localeCompare(right.slotLabel, "ko");
    });
}

function synthesizeItems(slot, rarityId) {
  const equippedIds = getEquippedIds();
  const candidates = state.equipment.inventory
    .filter((item) => item.slot === slot && item.rarity === rarityId && !item.isCreation && !equippedIds.has(item.id))
    .sort((left, right) => left.score - right.score);

  if (candidates.length < SYNTHESIS_REQUIREMENT) return;

  const consumed = candidates.slice(0, SYNTHESIS_REQUIREMENT);
  const consumedIds = new Set(consumed.map((item) => item.id));
  state.equipment.inventory = state.equipment.inventory.filter((item) => !consumedIds.has(item.id));

  const resultRarity = getNextRarity(rarityId);
  const result = createEquipmentItem({
    slot,
    rarityId: resultRarity.id === CREATION_RARITY.id ? null : resultRarity.id,
    isCreation: resultRarity.id === CREATION_RARITY.id,
    source: resultRarity.id === CREATION_RARITY.id ? "창조 합성" : `${getRarityData(rarityId).label} 합성`,
  });

  addItemToInventory(result);
  state.forge.totalSynths += 1;
  if (result.isCreation) state.forge.totalCreations += 1;
  state.gacha.recentResults = [result, ...state.gacha.recentResults].slice(0, RECENT_DRAW_LIMIT);

  if (result.isCreation) {
    createLog(`${getSlotLabel(slot)} 유일 장비 3개를 융합해 창조 아이템 ${result.name}을 제작했습니다.`);
  } else {
    createLog(`${getSlotLabel(slot)} ${getRarityData(rarityId).label} 장비 3개를 합성해 ${result.rarityLabel} 등급을 제작했습니다.`);
  }
}
function handleCampaignVictory(enemy) {
  const stats = getFinalStats();
  const goldGain = Math.round(enemy.gold * stats.goldRate);
  const diamondGain = Math.max(0, Math.round(enemy.diamonds * stats.diamondRate));

  state.resources.gold += goldGain;
  state.resources.diamonds += diamondGain;
  state.resources.essence += enemy.essence;
  gainExperience(enemy.exp);
  state.progress.totalStageClears += 1;
  if (enemy.boss) state.progress.totalBossKills += 1;

  if (state.progress.stage === STAGES_PER_WORLD) {
    state.progress.totalWorldClears += 1;
    if (state.progress.world < TOTAL_WORLDS && state.settings.autoAdvanceWorld) {
      state.progress.world += 1;
      state.progress.stage = 1;
      createLog(`월드 ${state.progress.world}로 진입했습니다.`);
    } else if (state.progress.world < TOTAL_WORLDS) {
      state.progress.stage = STAGES_PER_WORLD;
      createLog("월드 보스를 다시 상대할 준비가 되었습니다.");
    } else {
      createLog("최종 월드를 반복 정복 중입니다.");
    }
  } else if (state.settings.autoAdvance) {
    state.progress.stage += 1;
  }

  updateHighestProgress();
}

function handleDungeonVictory(enemy) {
  const dungeon = getDungeonById(state.dungeons.active?.id);
  const stats = getFinalStats();

  state.resources.gold += Math.round(enemy.gold * stats.goldRate);
  gainExperience(enemy.exp);

  if (!dungeon || !state.dungeons.active) return;

  if (state.dungeons.active.floor >= dungeon.floors) {
    state.resources.diamonds += dungeon.diamondReward;
    state.resources.essence += dungeon.essenceReward;
    state.dungeons.clears[dungeon.id] += 1;
    drawEquipment(1, {
      free: true,
      minRarity: dungeon.guaranteedRarity,
      source: `${dungeon.name} 보상 상자`,
    });
    createLog(`${dungeon.name} 공략 성공. 다이아 ${dungeon.diamondReward}개를 획득했습니다.`);
    state.dungeons.active = null;
  } else {
    state.dungeons.active.floor += 1;
    createLog(`${dungeon.name} ${state.dungeons.active.floor}층으로 전진합니다.`);
  }
}

function onEnemyDefeated() {
  const enemy = state.combat.enemy;
  if (!enemy) return;

  if (enemy.dungeon) {
    handleDungeonVictory(enemy);
  } else {
    handleCampaignVictory(enemy);
  }

  createEnemy();
}

function onHeroDefeated() {
  state.progress.totalDeaths += 1;
  state.resources.gold = Math.floor(state.resources.gold * 0.94);
  state.combat.reviveTimer = 3;
  state.combat.heroCooldown = 0;
  state.combat.enemyCooldown = 0;

  if (state.dungeons.active) {
    const dungeon = getDungeonById(state.dungeons.active.id);
    state.dungeons.active = null;
    createLog(`${dungeon ? dungeon.name : "던전"}에서 패배해 캠페인으로 후퇴했습니다.`);
  } else {
    createLog("원정대가 밀려났습니다. 잠시 후 다시 복귀합니다.");
  }
}

function startDungeon(id) {
  const dungeon = getDungeonById(id);
  if (!dungeon) return;
  if (state.progress.highestWorld < dungeon.unlockWorld) return;

  state.dungeons.active = { id, floor: 1 };
  state.combat.heroCooldown = 0;
  state.combat.enemyCooldown = 0;
  createLog(`${dungeon.name}에 입장했습니다.`);
  createEnemy();
}

function leaveDungeon() {
  if (!state.dungeons.active) return;
  const dungeon = getDungeonById(state.dungeons.active.id);
  state.dungeons.active = null;
  createLog(`${dungeon ? dungeon.name : "던전"}에서 철수했습니다.`);
  createEnemy();
}

function purchaseUpgrade(key) {
  const cost = getUpgradeCost(key);
  if (state.resources.gold < cost) return;

  state.resources.gold -= cost;
  state.upgrades[key] += 1;
  createLog(`${UPGRADE_DEFS[key].label} 레벨이 ${state.upgrades[key]}이 되었습니다.`);
}

function purchaseBlessing(key) {
  const cost = getBlessingCost(key);
  if (state.resources.essence < cost) return;

  state.resources.essence -= cost;
  state.blessings[key] += 1;
  createLog(`${BLESSING_DEFS[key].label}이 강화되었습니다.`);
}

function triggerFury() {
  if (state.combat.furyCooldown > 0 || state.combat.reviveTimer > 0) return;
  state.combat.furyRemaining = FURY_DURATION;
  state.combat.furyCooldown = FURY_COOLDOWN;
  createLog("광란을 발동해 잠시 공격 성능이 크게 상승합니다.");
}

function simulateOfflineProgress() {
  const secondsAway = Math.min(Math.max(0, Math.floor((Date.now() - state.lastSeen) / 1000)), MAX_OFFLINE_SECONDS);
  if (secondsAway < 20) return;

  const stats = getFinalStats();
  const previewEnemy = state.dungeons.active
    ? buildDungeonEncounter(getDungeonById(state.dungeons.active.id), state.dungeons.active.floor)
    : buildCampaignEncounter(state.progress.world, state.progress.stage);
  const kills = Math.floor((stats.dps * secondsAway * 0.45) / Math.max(previewEnemy.maxHp, 1));
  if (kills <= 0) return;

  const goldGain = Math.round(kills * previewEnemy.gold * stats.goldRate * 0.55);
  const expGain = Math.round(kills * previewEnemy.exp * 0.52);
  const diamondGain = Math.floor((kills / 32) * stats.diamondRate);

  state.resources.gold += goldGain;
  state.resources.diamonds += diamondGain;
  gainExperience(expGain);
  refs.offlineBanner.hidden = false;
  refs.offlineBanner.textContent = `${Math.floor(secondsAway / 60)}분 동안 자리를 비운 사이 Gold ${formatNumber(goldGain)}, Diamond ${formatNumber(diamondGain)}, EXP ${formatNumber(expGain)}를 회수했습니다.`;
  createLog(`오프라인 보상으로 Gold ${formatNumber(goldGain)}와 Diamond ${formatNumber(diamondGain)}를 획득했습니다.`);
}

function normalizeState() {
  state.progress.world = clamp(Number(state.progress.world || 1), 1, TOTAL_WORLDS);
  state.progress.stage = clamp(Number(state.progress.stage || 1), 1, STAGES_PER_WORLD);
  state.progress.highestWorld = clamp(Number(state.progress.highestWorld || 1), 1, TOTAL_WORLDS);
  state.progress.highestStage = clamp(Number(state.progress.highestStage || 1), 1, STAGES_PER_WORLD);
  state.resources.gold = Math.max(0, Number(state.resources.gold || 0));
  state.resources.diamonds = Math.max(0, Number(state.resources.diamonds || 0));
  state.resources.essence = Math.max(0, Number(state.resources.essence || 0));
  state.gacha.pity = clamp(Number(state.gacha.pity || 0), 0, 29);
  state.gacha.totalDraws = Math.max(0, Number(state.gacha.totalDraws || 0));
  state.forge.totalSynths = Math.max(0, Number(state.forge?.totalSynths || 0));
  state.forge.totalCreations = Math.max(0, Number(state.forge?.totalCreations || 0));
  state.equipment.nextId = Math.max(1, Number(state.equipment.nextId || 1));
  state.equipment.inventory = Array.isArray(state.equipment.inventory) ? state.equipment.inventory.map((item) => normalizeItem(item)).filter(Boolean) : [];
  state.gacha.recentResults = Array.isArray(state.gacha.recentResults)
    ? state.gacha.recentResults.map((item) => normalizeItem(item)).filter(Boolean).slice(0, RECENT_DRAW_LIMIT)
    : [];
  state.settings.activeMenu = ["upgrades", "equipment", "inventory", "synthesis", "relics", "dungeons", "status", "log"].includes(state.settings.activeMenu)
    ? state.settings.activeMenu
    : "upgrades";
  state.settings.equipmentFilter = EQUIPMENT_CATEGORIES.some((category) => category.id === state.settings.equipmentFilter)
    ? state.settings.equipmentFilter
    : "all";

  EQUIPMENT_SLOTS.forEach((slot) => {
    state.equipment.equipped[slot.id] = normalizeItem(state.equipment.equipped?.[slot.id]);
  });

  const maxItemId = state.equipment.inventory.reduce((maxId, item) => Math.max(maxId, Number(item.id || 0)), 0);
  state.equipment.nextId = Math.max(state.equipment.nextId, maxItemId + 1);

  if (getProgressValue(state.progress.highestWorld, state.progress.highestStage) < getProgressValue(state.progress.world, state.progress.stage)) {
    state.progress.highestWorld = state.progress.world;
    state.progress.highestStage = state.progress.stage;
  }

  if (state.dungeons.active && !getDungeonById(state.dungeons.active.id)) {
    state.dungeons.active = null;
  }

  trimInventory();
  state.hero.hp = clamp(Number(state.hero.hp || state.hero.maxHp), 0, getFinalStats().maxHp);
}

function getDamageAgainstEnemy(stats, enemy, isCrit) {
  let damage = stats.attack * randomBetween(0.92, 1.08);
  if (isCrit) damage *= stats.critDamage;
  if (enemy.boss) damage *= stats.bossDamage;
  if (enemy.dungeon) damage *= stats.dungeonDamage;
  return damage;
}

function tick(dt) {
  const stats = getFinalStats();

  if (!state.combat.enemy) createEnemy();

  state.combat.furyRemaining = Math.max(0, state.combat.furyRemaining - dt);
  state.combat.furyCooldown = Math.max(0, state.combat.furyCooldown - dt);

  if (state.combat.reviveTimer > 0) {
    state.combat.reviveTimer = Math.max(0, state.combat.reviveTimer - dt);
    if (state.combat.reviveTimer === 0) {
      state.hero.hp = getFinalStats().maxHp;
      createLog("원정대가 전열을 정비하고 복귀했습니다.");
      createEnemy();
    }
    return;
  }

  state.hero.hp = Math.min(stats.maxHp, state.hero.hp + stats.regen * dt);
  state.combat.heroCooldown -= dt;
  state.combat.enemyCooldown -= dt;

  while (state.combat.heroCooldown <= 0 && state.combat.enemy && state.combat.enemy.hp > 0) {
    const isCrit = Math.random() < stats.critChance;
    const damage = getDamageAgainstEnemy(stats, state.combat.enemy, isCrit);
    state.combat.enemy.hp = Math.max(0, state.combat.enemy.hp - damage);
    state.combat.heroCooldown += 1 / Math.max(stats.attackSpeed, 0.1);

    if (state.combat.enemy.hp <= 0) {
      onEnemyDefeated();
      return;
    }
  }

  while (state.combat.enemyCooldown <= 0 && state.combat.enemy && state.combat.enemy.hp > 0) {
    const damage = state.combat.enemy.attack * randomBetween(0.9, 1.1);
    state.hero.hp = Math.max(0, state.hero.hp - damage);
    state.combat.enemyCooldown += 1 / Math.max(state.combat.enemy.attackSpeed, 0.1);

    if (state.hero.hp <= 0) {
      onHeroDefeated();
      return;
    }
  }
}

function formatBonusChips(bonuses) {
  const chips = [];
  if (bonuses.attack) chips.push(`ATK +${formatNumber(bonuses.attack)}`);
  if (bonuses.maxHp) chips.push(`HP +${formatNumber(bonuses.maxHp)}`);
  if (bonuses.attackSpeed) chips.push(`SPD +${bonuses.attackSpeed.toFixed(2)}`);
  if (bonuses.critChance) chips.push(`CRT +${formatPercent(bonuses.critChance)}`);
  if (bonuses.critDamage) chips.push(`CRT DMG +${formatPercent(bonuses.critDamage)}`);
  if (bonuses.regen) chips.push(`REG +${bonuses.regen.toFixed(1)}`);
  if (bonuses.goldRate) chips.push(`Gold +${formatPercent(bonuses.goldRate)}`);
  if (bonuses.diamondRate) chips.push(`Dia +${formatPercent(bonuses.diamondRate)}`);
  if (bonuses.bossDamage) chips.push(`Boss +${formatPercent(bonuses.bossDamage)}`);
  if (bonuses.dungeonDamage) chips.push(`Dungeon +${formatPercent(bonuses.dungeonDamage)}`);
  return chips.slice(0, 5);
}

function getUpgradeCurrentEffectText(key, level) {
  if (key === "attack") return `공격력 +${level * 10}, 보스 피해 +${Math.floor(level / 10) * 3}%`;
  if (key === "vitality") return `최대 체력 +${level * 45}, 재생 +${(level * 0.25).toFixed(1)}, 던전 피해 +${Math.floor(level / 12) * 4}%`;
  if (key === "tempo") return `공격 속도 +${(level * 0.06).toFixed(2)}/s`;
  return `치명타 +${(level * 0.8).toFixed(1)}%, 치명타 피해 +${Math.round(level * 5)}%`;
}

function getUpgradeNextEffectText(key, level) {
  if (key === "attack") {
    const nextBoss = Math.floor((level + 1) / 10) > Math.floor(level / 10) ? ", 보스 피해 +3%" : "";
    return `다음 레벨: 공격력 +10${nextBoss}`;
  }
  if (key === "vitality") {
    const nextDungeon = Math.floor((level + 1) / 12) > Math.floor(level / 12) ? ", 던전 피해 +4%" : "";
    return `다음 레벨: 최대 체력 +45, 재생 +0.25${nextDungeon}`;
  }
  if (key === "tempo") return "다음 레벨: 공격 속도 +0.06/s";
  return "다음 레벨: 치명타 +0.8%, 치명타 피해 +5%";
}
function renderEquipmentSlots() {
  const filter = EQUIPMENT_CATEGORIES.find((category) => category.id === state.settings.equipmentFilter) || EQUIPMENT_CATEGORIES[0];
  const previewItems = [...state.equipment.inventory]
    .filter((item) => filter.slots.includes(item.slot))
    .sort((left, right) => right.score - left.score)
    .slice(0, 12);

  refs.equipmentSlots.innerHTML = `
    <div class="equipment-layout">
      <section class="loadout-board">
        <div class="loadout-stage">
          <div class="loadout-avatar">
            <div class="avatar-plate">
              <div class="avatar-figure">
                <span>ADVENTURER</span>
              </div>
              <div class="avatar-caption">
                <strong>원정대 장비창</strong>
                <span>이미지 자리는 나중에 캐릭터 일러스트로 교체 가능합니다.</span>
              </div>
            </div>
            <div class="loadout-slots">
              ${EQUIPMENT_SLOTS.map((slot) => {
                const item = state.equipment.equipped[slot.id];
                return `
                  <div class="loadout-slot ${item ? item.className : ""}">
                    <div class="slot-label-row">
                      <strong>${slot.label}</strong>
                      <em>${item ? item.rarityLabel : "빈 슬롯"}</em>
                    </div>
                    <div class="slot-icon-box">${item ? slot.label.slice(0, 1) : "+"}</div>
                    <span class="slot-item-name">${item ? item.name : `${slot.label} 장비 없음`}</span>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      </section>

      <section class="equipment-arsenal">
        <div class="equipment-tabbar">
          ${EQUIPMENT_CATEGORIES.map((category) => `
            <button
              type="button"
              class="equipment-filter-tab ${category.id === filter.id ? "is-active" : ""}"
              data-equip-tab="${category.id}"
            >
              ${category.label}
            </button>
          `).join("")}
        </div>

        <div class="equipment-preview-grid">
          ${previewItems.length
            ? previewItems.map((item) => {
                const equipped = state.equipment.equipped[item.slot]?.id === item.id;
                return `
                  <div class="equipment-preview-card ${item.className}">
                    <div class="equipment-preview-head">
                      <strong>${item.name}</strong>
                      <em class="rarity-label">${item.rarityLabel}</em>
                    </div>
                    <div class="equipment-preview-icon">${getSlotLabel(item.slot)}</div>
                    <span>${getSlotLabel(item.slot)} · 점수 ${formatNumber(item.score)}</span>
                    <div class="equipment-bonuses">
                      ${formatBonusChips(item.bonuses).map((chip) => `<span class="bonus-chip">${chip}</span>`).join("")}
                    </div>
                    <div class="equipment-preview-foot">
                      <span class="source-tag ${item.isCreation ? "creation-tag" : ""}">${item.source}</span>
                      <button type="button" class="inventory-equip" data-equip="${item.id}" ${equipped ? "disabled" : ""}>
                        ${equipped ? "장착 중" : "장착"}
                      </button>
                    </div>
                  </div>
                `;
              }).join("")
            : `
              <div class="equipment-preview-empty">
                <strong>${filter.label} 장비가 아직 없습니다.</strong>
                <span>뽑기나 합성으로 장비를 모으면 이 영역에 표시됩니다.</span>
                <div class="equipment-preview-placeholder-grid">
                  ${Array.from({ length: 9 }, (_, index) => `
                    <div class="equipment-placeholder-cell">
                      <span>EMPTY</span>
                      <strong>#${index + 1}</strong>
                    </div>
                  `).join("")}
                </div>
              </div>
            `}
        </div>
      </section>
    </div>
  `;
}

function renderUpgradeList() {
  refs.upgradeList.innerHTML = Object.keys(UPGRADE_DEFS).map((key) => {
    const def = UPGRADE_DEFS[key];
    const level = state.upgrades[key];
    const cost = getUpgradeCost(key);
    const affordable = state.resources.gold >= cost;

    return `
      <div class="action-card upgrade-card ${affordable ? "is-clickable" : "is-disabled"}" data-upgrade-card="${key}">
        <div class="action-title">
          <div>
            <strong>${def.label} Lv.${level}</strong>
            <small>${formatNumber(cost)} Gold</small>
          </div>
        </div>
        <p class="action-description">${def.description}</p>
        <div class="action-effect">
          <span>현재 효과: ${getUpgradeCurrentEffectText(key, level)}</span>
          <span>${getUpgradeNextEffectText(key, level)}</span>
        </div>
        <div class="action-footer">
          <span class="action-price ${affordable ? "" : "is-blocked"}">보유 Gold ${formatNumber(state.resources.gold)}</span>
          <button type="button" class="action-button" data-upgrade="${key}" ${affordable ? "" : "disabled"}>강화</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderBlessingList() {
  refs.blessingList.innerHTML = Object.keys(BLESSING_DEFS).map((key) => {
    const def = BLESSING_DEFS[key];
    const level = state.blessings[key];
    const cost = getBlessingCost(key);
    const affordable = state.resources.essence >= cost;
    let currentText = "";
    let nextText = "";

    if (key === "edge") {
      currentText = `공격 계수 +${level * 8}%, 보스 피해 +${level * 2}%`;
      nextText = "다음 레벨: 공격 계수 +8%, 보스 피해 +2%";
    }
    if (key === "bounty") {
      currentText = `Gold +${level * 12}%, Diamond +${level * 4}%`;
      nextText = "다음 레벨: Gold +12%, Diamond +4%";
    }
    if (key === "ward") {
      currentText = `최대 체력 +${level * 8}%, 재생 계수 +${level * 10}%`;
      nextText = "다음 레벨: 최대 체력 +8%, 재생 계수 +10%";
    }

    return `
      <div class="action-card blessing ${affordable ? "is-clickable" : "is-disabled"}" data-blessing-card="${key}">
        <div class="action-title">
          <div>
            <strong>${def.label} Lv.${level}</strong>
            <small>${formatNumber(cost)} Essence</small>
          </div>
        </div>
        <p class="action-description">${def.description}</p>
        <div class="action-effect">
          <span>현재 효과: ${currentText}</span>
          <span>${nextText}</span>
        </div>
        <div class="action-footer">
          <span class="action-price ${affordable ? "" : "is-blocked"}">보유 Essence ${formatNumber(state.resources.essence)}</span>
          <button type="button" class="action-button" data-blessing="${key}" ${affordable ? "" : "disabled"}>축복</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderStatusList(stats) {
  const equippedCount = EQUIPMENT_SLOTS.filter((slot) => state.equipment.equipped[slot.id]).length;
  const creationCount = state.equipment.inventory.filter((item) => item.isCreation).length;
  const rows = [
    {
      label: "최종 공격력",
      value: formatNumber(stats.attack),
      detail: `기본 ${formatNumber(stats.base.attack)} / 업그레이드 +${formatNumber(stats.upgrade.attack)} / 장비 +${formatNumber(stats.gear.attack)}`,
    },
    {
      label: "최대 체력",
      value: formatNumber(stats.maxHp),
      detail: `기본 ${formatNumber(stats.base.maxHp)} / 장비 +${formatNumber(stats.gear.maxHp)}`,
    },
    {
      label: "공격 속도",
      value: `${stats.attackSpeed.toFixed(2)}/s`,
      detail: `기본 ${stats.base.attackSpeed.toFixed(2)} / 장비 +${stats.gear.attackSpeed.toFixed(2)}`,
    },
    {
      label: "치명타 확률",
      value: formatPercent(stats.critChance),
      detail: `기본 ${formatPercent(stats.base.critChance)} / 장비 +${formatPercent(stats.gear.critChance)}`,
    },
    {
      label: "치명타 피해",
      value: formatPercent(stats.critDamage - 1),
      detail: `최종 배율 ${stats.critDamage.toFixed(2)}x`,
    },
    {
      label: "재생",
      value: `${stats.regen.toFixed(1)}/s`,
      detail: `기본 ${stats.base.regen.toFixed(1)} / 장비 +${stats.gear.regen.toFixed(1)}`,
    },
    {
      label: "Gold 획득",
      value: formatMultiplier(stats.goldRate),
      detail: "축복과 장비 보너스를 포함한 최종 계수",
    },
    {
      label: "Diamond 획득",
      value: formatMultiplier(stats.diamondRate),
      detail: "장비와 축복 기반 획득 배율",
    },
    {
      label: "보스 피해",
      value: formatMultiplier(stats.bossDamage),
      detail: "월드 보스, 가디언, 엘리트 상대로 적용",
    },
    {
      label: "던전 피해",
      value: formatMultiplier(stats.dungeonDamage),
      detail: "던전 내부 적에게만 적용",
    },
    {
      label: "장착 슬롯",
      value: `${equippedCount} / ${EQUIPMENT_SLOTS.length}`,
      detail: "9개 부위 장비가 모두 장착되면 전투 효율이 크게 올라갑니다.",
    },
    {
      label: "장비 합성",
      value: `${formatNumber(state.forge.totalSynths)}회`,
      detail: `창조 아이템 제작 ${formatNumber(state.forge.totalCreations)}회`,
    },
    {
      label: "창조 아이템",
      value: `${creationCount}개`,
      detail: "창조 아이템은 뽑기에서 나오지 않고 합성으로만 제작됩니다.",
    },
    {
      label: "활성 유물",
      value: `${getUnlockedRelics().length} / ${RELICS.length}`,
      detail: "월드 도달과 던전 클리어로 유물이 활성화됩니다.",
    },
    {
      label: "예상 DPS",
      value: formatNumber(stats.dps),
      detail: state.combat.furyRemaining > 0 ? "광란 버프 적용 중" : "평상시 기준 예상 수치",
    },
  ];

  refs.statusList.innerHTML = rows.map((row) => `
    <div class="status-card">
      <div><span>${row.label}</span></div>
      <div>
        <strong>${row.value}</strong>
        <small>${row.detail}</small>
      </div>
    </div>
  `).join("");
}

function renderDungeonList() {
  refs.dungeonList.innerHTML = DUNGEONS.map((dungeon) => {
    const unlocked = state.progress.highestWorld >= dungeon.unlockWorld;
    const active = state.dungeons.active?.id === dungeon.id;
    const clears = state.dungeons.clears[dungeon.id] || 0;

    return `
      <div class="dungeon-card ${active ? "active" : ""} ${unlocked ? "" : "locked"}">
        <div class="dungeon-header">
          <div>
            <strong>${dungeon.name}</strong>
            <span>해금 월드 ${dungeon.unlockWorld} · 클리어 ${clears}회</span>
          </div>
          <button class="ghost-button" data-dungeon="${dungeon.id}" ${!unlocked || active ? "disabled" : ""}>
            ${active ? "진행 중" : "도전"}
          </button>
        </div>
        <p class="action-description">${dungeon.description}</p>
        <div class="dungeon-rewards">
          <span class="bonus-chip">Floor ${dungeon.floors}</span>
          <span class="bonus-chip">Diamond ${dungeon.diamondReward}</span>
          <span class="bonus-chip">Essence ${dungeon.essenceReward}</span>
          <span class="bonus-chip">보장 ${getRarityData(dungeon.guaranteedRarity).label}</span>
        </div>
        <span>${dungeon.modifier}</span>
      </div>
    `;
  }).join("");
}

function renderRecentDraws() {
  if (!state.gacha.recentResults.length) {
    refs.recentDraws.innerHTML = `
      <div class="draw-card">
        <strong>최근 장비 없음</strong>
        <span>다이아를 사용해 장비를 뽑거나 합성을 진행하면 이곳에 표시됩니다.</span>
      </div>
    `;
    return;
  }

  refs.recentDraws.innerHTML = state.gacha.recentResults.map((item) => `
    <div class="draw-card ${item.className}">
      <div class="draw-top">
        <strong>${item.name}</strong>
        <span class="rarity-label">${item.rarityLabel}</span>
      </div>
      <span>${getSlotLabel(item.slot)} · ${item.source}</span>
      <div class="draw-bonuses">
        ${formatBonusChips(item.bonuses).map((chip) => `<span class="bonus-chip">${chip}</span>`).join("")}
      </div>
    </div>
  `).join("");
}

function renderInventoryList() {
  const sorted = [...state.equipment.inventory].sort((left, right) => right.score - left.score).slice(0, 18);
  if (!sorted.length) {
    refs.inventoryList.innerHTML = `
      <div class="inventory-card">
        <strong>보관 장비 없음</strong>
        <span>장비를 획득하면 이곳에서 수동 장착할 수 있습니다.</span>
      </div>
    `;
    return;
  }

  refs.inventoryList.innerHTML = sorted.map((item) => {
    const equipped = state.equipment.equipped[item.slot]?.id === item.id;
    return `
      <div class="inventory-card ${item.className}">
        <div class="inventory-top">
          <div>
            <strong>${item.name}</strong>
            <span>${getSlotLabel(item.slot)} · 점수 ${formatNumber(item.score)}</span>
          </div>
          <em class="rarity-label">${item.rarityLabel}</em>
        </div>
        <div class="inventory-meta">
          <span class="slot-badge">${getSlotLabel(item.slot)}</span>
          <span class="source-tag ${item.isCreation ? "creation-tag" : ""}">${item.source}</span>
        </div>
        <div class="inventory-bonuses">
          ${formatBonusChips(item.bonuses).map((chip) => `<span class="bonus-chip">${chip}</span>`).join("")}
        </div>
        <div class="inventory-actions">
          <span>${equipped ? "현재 장착 중" : "수동 장착 가능"}</span>
          <button class="inventory-equip" data-equip="${item.id}" ${equipped ? "disabled" : ""}>
            ${equipped ? "장착 중" : "장착"}
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function renderSynthesisList() {
  const groups = getSynthesisGroups();
  if (!groups.length) {
    refs.synthesisList.innerHTML = `
      <div class="synthesis-card">
        <strong>합성 가능한 장비 없음</strong>
        <span>같은 부위, 같은 등급의 미장착 장비 3개가 모이면 합성을 진행할 수 있습니다.</span>
      </div>
    `;
    return;
  }

  refs.synthesisList.innerHTML = groups.map((group) => `
    <div class="synthesis-card ${group.canSynthesize ? "is-ready" : ""}">
      <div class="synthesis-header">
        <div>
          <strong>${group.slotLabel} · ${group.rarityLabel}</strong>
          <span>${group.count} / ${SYNTHESIS_REQUIREMENT} 보유</span>
        </div>
        <em class="rarity-label">${group.target.label}</em>
      </div>
      <p class="action-description">
        ${group.target.id === CREATION_RARITY.id
          ? "유일 장비 3개를 승화시켜 뽑기로는 얻을 수 없는 창조 아이템을 제작합니다."
          : `${group.rarityLabel} 장비 3개를 소모해 ${group.target.label} 등급 장비 1개를 제작합니다.`}
      </p>
      <div class="dungeon-rewards">
        <span class="bonus-chip">부위 ${group.slotLabel}</span>
        <span class="bonus-chip">소모 ${SYNTHESIS_REQUIREMENT}개</span>
        <span class="bonus-chip">결과 ${group.target.label}</span>
      </div>
      <button class="action-button synthesis-button" data-synth="${group.slot}|${group.rarity}" ${group.canSynthesize ? "" : "disabled"}>
        ${group.target.id === CREATION_RARITY.id ? "창조 합성" : `${group.target.label} 제작`}
      </button>
    </div>
  `).join("");
}

function renderRelicList() {
  refs.relicList.innerHTML = RELICS.map((relic) => {
    const unlocked = relic.condition();
    const chips = formatBonusChips(relic.bonuses);

    return `
      <div class="action-card relic-card ${unlocked ? "is-unlocked" : "is-locked"}">
        <div class="action-title">
          <div>
            <strong>${relic.name}</strong>
            <small>${unlocked ? "활성화" : "잠금"}</small>
          </div>
        </div>
        <p class="action-description">${relic.description}</p>
        <div class="action-effect">
          <span>해금 조건: ${relic.source}</span>
        </div>
        <div class="equipment-bonuses">
          ${chips.map((chip) => `<span class="bonus-chip">${chip}</span>`).join("")}
        </div>
      </div>
    `;
  }).join("");
}

function renderMenuViews() {
  refs.menuTabs.querySelectorAll("[data-menu]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.menu === state.settings.activeMenu);
  });

  document.querySelectorAll("[data-view]").forEach((view) => {
    view.classList.toggle("is-active", view.dataset.view === state.settings.activeMenu);
  });
}

function getActionButton(event, selector) {
  const target = event.target;
  return target instanceof Element ? target.closest(selector) : null;
}

function renderLog() {
  refs.combatLog.innerHTML = state.logs
    .map((entry) => `<div class="log-entry"><strong>[${entry.timestamp}]</strong> ${entry.text}</div>`)
    .join("");
}
function render() {
  const stats = getFinalStats();
  const worldInfo = getWorldInfo(state.progress.world);
  const enemy = state.combat.enemy;
  const heroHpRatio = clamp(state.hero.hp / Math.max(stats.maxHp, 1), 0, 1);
  const enemyHpRatio = enemy ? clamp(enemy.hp / Math.max(enemy.maxHp, 1), 0, 1) : 0;
  const expRatio = clamp(state.hero.exp / Math.max(state.hero.expToNext, 1), 0, 1);
  const nextDungeon = getNextDungeonUnlock();

  refs.goldValue.textContent = formatNumber(state.resources.gold);
  refs.diamondValue.textContent = formatNumber(state.resources.diamonds);
  refs.essenceValue.textContent = formatNumber(state.resources.essence);
  refs.progressValue.textContent = `${state.progress.world}-${state.progress.stage}`;

  refs.heroLevel.textContent = `Lv.${state.hero.level}`;
  refs.heroStatus.textContent =
    state.combat.reviveTimer > 0
      ? `부활까지 ${state.combat.reviveTimer.toFixed(1)}초`
      : state.dungeons.active
        ? `${getDungeonById(state.dungeons.active.id)?.name || "던전"} 공략 중`
        : "캠페인 진행 중";
  refs.expValue.textContent = `${formatNumber(state.hero.exp)} / ${formatNumber(state.hero.expToNext)}`;
  refs.expBar.style.width = `${expRatio * 100}%`;
  refs.attackValue.textContent = formatNumber(stats.attack);
  refs.hpValue.textContent = `${formatNumber(state.hero.hp)} / ${formatNumber(stats.maxHp)}`;
  refs.speedValue.textContent = `${stats.attackSpeed.toFixed(2)}/s`;
  refs.critValue.textContent = formatPercent(stats.critChance);
  refs.regenValue.textContent = `${stats.regen.toFixed(1)}/s`;
  refs.dpsValue.textContent = formatNumber(stats.dps);
  refs.heroHpText.textContent = `${formatNumber(state.hero.hp)} / ${formatNumber(stats.maxHp)}`;
  refs.heroHpBar.style.width = `${heroHpRatio * 100}%`;
  refs.heroCardName.textContent = state.dungeons.active ? "던전 원정대" : "잿빛 기사단";

  refs.enemyName.textContent = enemy ? enemy.name : "적 탐색 중";
  refs.enemyTag.textContent = enemy ? enemy.tag : "Enemy";
  refs.enemyHpText.textContent = enemy ? `${formatNumber(enemy.hp)} / ${formatNumber(enemy.maxHp)}` : "-";
  refs.enemyPower.textContent = enemy ? `ATK ${formatNumber(enemy.attack)}` : "-";
  refs.enemyHpBar.style.width = `${enemyHpRatio * 100}%`;

  refs.furyState.textContent = state.combat.furyRemaining > 0 ? `${state.combat.furyRemaining.toFixed(1)}초 남음` : "광란 대기";
  refs.furyCooldown.textContent = state.combat.furyCooldown > 0 ? `${state.combat.furyCooldown.toFixed(1)}초 후 사용` : "준비 완료";
  refs.furyButton.disabled = state.combat.furyCooldown > 0 || state.combat.reviveTimer > 0;

  refs.worldValue.textContent = `${state.progress.world} / ${TOTAL_WORLDS}`;
  refs.stageValue.textContent = `${state.progress.stage} / ${STAGES_PER_WORLD}`;
  refs.stageTypeValue.textContent = state.dungeons.active ? `던전 ${state.dungeons.active.floor}층` : getStageTier(state.progress.stage).label;
  refs.dungeonStateValue.textContent = state.dungeons.active ? getDungeonById(state.dungeons.active.id)?.name || "던전" : "캠페인";
  refs.worldClearValue.textContent = formatNumber(state.progress.totalWorldClears);
  refs.bossKillValue.textContent = formatNumber(state.progress.totalBossKills);
  refs.drawCountValue.textContent = formatNumber(state.gacha.totalDraws);
  refs.deathValue.textContent = formatNumber(state.progress.totalDeaths);

  refs.worldName.textContent = worldInfo.name;
  refs.stageDescriptor.textContent = state.dungeons.active
    ? `${getDungeonById(state.dungeons.active.id)?.name || "던전"} ${state.dungeons.active.floor} / ${getDungeonById(state.dungeons.active.id)?.floors || 0}`
    : `세부 스테이지 ${state.progress.stage} / ${STAGES_PER_WORLD}`;
  refs.worldDescription.textContent = state.dungeons.active ? getDungeonById(state.dungeons.active.id)?.modifier || "" : worldInfo.description;
  refs.campaignBar.style.width = `${(state.progress.stage / STAGES_PER_WORLD) * 100}%`;
  refs.nextUnlockValue.textContent = nextDungeon
    ? `다음 던전: 월드 ${nextDungeon.unlockWorld} 도달 시 ${nextDungeon.name} 해금`
    : "모든 던전이 해금되었습니다.";

  refs.autoAdvanceToggle.checked = state.settings.autoAdvance;
  refs.autoAdvanceWorldToggle.checked = state.settings.autoAdvanceWorld;
  refs.leaveDungeonButton.disabled = !state.dungeons.active;

  refs.diamondMetaValue.textContent = formatNumber(state.resources.diamonds);
  refs.drawPityValue.textContent = `${state.gacha.pity} / 30`;
  refs.drawOneButton.textContent = `1회 뽑기 (${DRAW_COST_SINGLE})`;
  refs.drawTenButton.textContent = `10회 뽑기 (${DRAW_COST_MULTI})`;
  refs.drawOneButton.disabled = state.resources.diamonds < DRAW_COST_SINGLE;
  refs.drawTenButton.disabled = state.resources.diamonds < DRAW_COST_MULTI;

  renderEquipmentSlots();
  renderUpgradeList();
  renderBlessingList();
  renderStatusList(stats);
  renderDungeonList();
  renderRecentDraws();
  renderInventoryList();
  renderSynthesisList();
  renderRelicList();
  renderMenuViews();
  renderLog();
}

function frame(timestamp) {
  if (!lastFrame) {
    lastFrame = timestamp;
    lastSave = Date.now();
  }

  const dt = Math.min((timestamp - lastFrame) / 1000, 0.25);
  lastFrame = timestamp;

  tick(dt);
  render();

  if (Date.now() - lastSave >= SAVE_INTERVAL_MS) saveState();
  window.requestAnimationFrame(frame);
}

function bindEvents() {
  refs.saveButton.addEventListener("click", () => {
    saveState();
    createLog("수동 저장이 완료되었습니다.");
    render();
  });

  refs.furyButton.addEventListener("click", triggerFury);
  refs.leaveDungeonButton.addEventListener("click", leaveDungeon);
  refs.drawOneButton.addEventListener("click", () => {
    drawEquipment(1);
    render();
  });
  refs.drawTenButton.addEventListener("click", () => {
    drawEquipment(10);
    render();
  });

  refs.autoAdvanceToggle.addEventListener("change", (event) => {
    state.settings.autoAdvance = event.currentTarget.checked;
  });
  refs.autoAdvanceWorldToggle.addEventListener("change", (event) => {
    state.settings.autoAdvanceWorld = event.currentTarget.checked;
  });

  refs.menuTabs.addEventListener("click", (event) => {
    const button = getActionButton(event, "[data-menu]");
    if (!button) return;
    state.settings.activeMenu = button.dataset.menu;
    render();
  });

  refs.upgradeList.addEventListener("click", (event) => {
    const button = getActionButton(event, "[data-upgrade], [data-upgrade-card]");
    if (!button) return;
    purchaseUpgrade(button.dataset.upgrade || button.dataset.upgradeCard);
    render();
  });

  refs.blessingList.addEventListener("click", (event) => {
    const button = getActionButton(event, "[data-blessing], [data-blessing-card]");
    if (!button) return;
    purchaseBlessing(button.dataset.blessing || button.dataset.blessingCard);
    render();
  });

  refs.equipmentSlots.addEventListener("click", (event) => {
    const filterButton = getActionButton(event, "[data-equip-tab]");
    if (filterButton) {
      state.settings.equipmentFilter = filterButton.dataset.equipTab;
      render();
      return;
    }

    const equipButton = getActionButton(event, "[data-equip]");
    if (!equipButton) return;
    equipItemById(Number(equipButton.dataset.equip));
    render();
  });

  refs.dungeonList.addEventListener("click", (event) => {
    const button = getActionButton(event, "[data-dungeon]");
    if (!button) return;
    startDungeon(button.dataset.dungeon);
    render();
  });

  refs.inventoryList.addEventListener("click", (event) => {
    const button = getActionButton(event, "[data-equip]");
    if (!button) return;
    equipItemById(Number(button.dataset.equip));
    render();
  });

  refs.synthesisList.addEventListener("click", (event) => {
    const button = getActionButton(event, "[data-synth]");
    if (!button) return;
    const [slot, rarity] = button.dataset.synth.split("|");
    synthesizeItems(slot, rarity);
    render();
  });

  window.addEventListener("beforeunload", saveState);
}

function init() {
  state = loadState();
  normalizeState();
  bindEvents();
  simulateOfflineProgress();

  if (!state.logs.length) {
    createLog("원정대가 첫 월드에 진입했습니다. 다이아로 장비를 뽑고, 같은 장비 3개는 합성해 더 높은 등급을 노려 보세요.");
  }

  if (!state.combat.enemy) createEnemy();
  render();
  window.requestAnimationFrame(frame);
}

init();
