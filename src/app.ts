const STORAGE_KEY = "rpg_idle_ashen_keep_v1";
const SAVE_INTERVAL_MS = 5000;
const BOSS_WAVE_TARGET = 6;
const MAX_OFFLINE_SECONDS = 4 * 60 * 60;
const LOG_LIMIT = 24;

type UpgradeKey = "attack" | "vitality" | "tempo" | "focus";
type BlessingKey = "edge" | "bounty" | "ward";

interface Zone {
  name: string;
  label: string;
  description: string;
  foes: string[];
}

interface ResourcesState {
  gold: number;
  essence: number;
}

interface HeroState {
  level: number;
  exp: number;
  expToNext: number;
  attack: number;
  maxHp: number;
  hp: number;
  attackSpeed: number;
  critChance: number;
  critDamage: number;
  regen: number;
}

type UpgradesState = Record<UpgradeKey, number>;
type BlessingsState = Record<BlessingKey, number>;

interface ProgressState {
  zoneIndex: number;
  highestZone: number;
  killsTowardBoss: number;
  totalKills: number;
  totalBossKills: number;
  totalDeaths: number;
}

interface SettingsState {
  autoAdvance: boolean;
}

interface EnemyState {
  name: string;
  tag: "Enemy" | "Boss";
  hp: number;
  maxHp: number;
  attack: number;
  attackSpeed: number;
  gold: number;
  exp: number;
  boss: boolean;
}

interface CombatState {
  enemy: EnemyState | null;
  heroCooldown: number;
  enemyCooldown: number;
  reviveTimer: number;
  furyRemaining: number;
  furyCooldown: number;
}

interface LogEntry {
  text: string;
  timestamp: string;
}

interface GameState {
  resources: ResourcesState;
  hero: HeroState;
  upgrades: UpgradesState;
  blessings: BlessingsState;
  progress: ProgressState;
  settings: SettingsState;
  combat: CombatState;
  logs: LogEntry[];
  lastSeen: number;
}

interface SavedState {
  resources?: Partial<ResourcesState>;
  hero?: Partial<HeroState>;
  upgrades?: Partial<UpgradesState>;
  blessings?: Partial<BlessingsState>;
  progress?: Partial<ProgressState>;
  settings?: Partial<SettingsState>;
  combat?: Partial<Omit<CombatState, "enemy">>;
  logs?: LogEntry[];
  lastSeen?: number;
}

interface UIRefs {
  offlineBanner: HTMLElement;
  goldValue: HTMLElement;
  essenceValue: HTMLElement;
  zoneValue: HTMLElement;
  heroLevel: HTMLElement;
  heroStatus: HTMLElement;
  expValue: HTMLElement;
  expBar: HTMLElement;
  attackValue: HTMLElement;
  hpValue: HTMLElement;
  speedValue: HTMLElement;
  critValue: HTMLElement;
  regenValue: HTMLElement;
  dpsValue: HTMLElement;
  saveButton: HTMLButtonElement;
  upgradeAttack: HTMLButtonElement;
  upgradeVitality: HTMLButtonElement;
  upgradeTempo: HTMLButtonElement;
  upgradeFocus: HTMLButtonElement;
  upgradeAttackCost: HTMLElement;
  upgradeVitalityCost: HTMLElement;
  upgradeTempoCost: HTMLElement;
  upgradeFocusCost: HTMLElement;
  autoAdvanceToggle: HTMLInputElement;
  heroHpBar: HTMLElement;
  heroHpText: HTMLElement;
  enemyTag: HTMLElement;
  enemyName: HTMLElement;
  enemyHpBar: HTMLElement;
  enemyHpText: HTMLElement;
  enemyPower: HTMLElement;
  furyButton: HTMLButtonElement;
  furyCooldown: HTMLElement;
  furyState: HTMLElement;
  bossProgress: HTMLElement;
  totalKills: HTMLElement;
  totalBossKills: HTMLElement;
  totalDeaths: HTMLElement;
  combatLog: HTMLElement;
  prevZoneButton: HTMLButtonElement;
  nextZoneButton: HTMLButtonElement;
  zoneName: HTMLElement;
  zoneDescription: HTMLElement;
  zoneList: HTMLElement;
  blessingEdge: HTMLButtonElement;
  blessingBounty: HTMLButtonElement;
  blessingWard: HTMLButtonElement;
  blessingEdgeCost: HTMLElement;
  blessingBountyCost: HTMLElement;
  blessingWardCost: HTMLElement;
}

const ZONES: ReadonlyArray<Zone> = [
  {
    name: "Cinder Trail",
    label: "잿불 길목",
    description: "무너진 성문 아래에서 잔불 도적과 망령들이 길을 막고 있습니다.",
    foes: ["잔불 도적", "부서진 파수병", "회색 망령", "연기 늑대"],
  },
  {
    name: "Moonlit Cloister",
    label: "월광 회랑",
    description: "달빛이 비추는 폐회랑에서는 사제의 그림자와 변질된 기사들이 출몰합니다.",
    foes: ["타락한 시종", "월광 수도승", "녹슨 창병", "울음 사제"],
  },
  {
    name: "Thorn Hollow",
    label: "가시 협곡",
    description: "검은 덩굴이 길을 집어삼킨 협곡입니다. 움직이는 나무껍질들이 매복합니다.",
    foes: ["가시 짐승", "껍질 수호자", "독안개 정령", "찢긴 추적자"],
  },
  {
    name: "Glass Ridge",
    label: "유리 능선",
    description: "깨진 수정 파편이 폭풍처럼 흩날리는 능선입니다. 적의 공격이 더욱 거세집니다.",
    foes: ["수정 약탈자", "균열 궁수", "빙결 사냥개", "파편 골렘"],
  },
  {
    name: "Ashen Keep",
    label: "잿빛 성채",
    description: "마침내 성채 중심부입니다. 왕좌를 차지한 재의 군주가 기다리고 있습니다.",
    foes: ["재의 기사", "성채 흑마도사", "불씨 심문관", "왕좌 집행자"],
  },
];

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required element: #${id}`);
  }

  return element as T;
}

const refs: UIRefs = {
  offlineBanner: byId("offlineBanner"),
  goldValue: byId("goldValue"),
  essenceValue: byId("essenceValue"),
  zoneValue: byId("zoneValue"),
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
  saveButton: byId("saveButton"),
  upgradeAttack: byId("upgradeAttack"),
  upgradeVitality: byId("upgradeVitality"),
  upgradeTempo: byId("upgradeTempo"),
  upgradeFocus: byId("upgradeFocus"),
  upgradeAttackCost: byId("upgradeAttackCost"),
  upgradeVitalityCost: byId("upgradeVitalityCost"),
  upgradeTempoCost: byId("upgradeTempoCost"),
  upgradeFocusCost: byId("upgradeFocusCost"),
  autoAdvanceToggle: byId("autoAdvanceToggle"),
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
  bossProgress: byId("bossProgress"),
  totalKills: byId("totalKills"),
  totalBossKills: byId("totalBossKills"),
  totalDeaths: byId("totalDeaths"),
  combatLog: byId("combatLog"),
  prevZoneButton: byId("prevZoneButton"),
  nextZoneButton: byId("nextZoneButton"),
  zoneName: byId("zoneName"),
  zoneDescription: byId("zoneDescription"),
  zoneList: byId("zoneList"),
  blessingEdge: byId("blessingEdge"),
  blessingBounty: byId("blessingBounty"),
  blessingWard: byId("blessingWard"),
  blessingEdgeCost: byId("blessingEdgeCost"),
  blessingBountyCost: byId("blessingBountyCost"),
  blessingWardCost: byId("blessingWardCost"),
};

let state = createInitialState();
let zoneButtons: HTMLButtonElement[] = [];
let lastFrame = 0;
let lastSave = 0;

function createInitialState(): GameState {
  return {
    resources: {
      gold: 0,
      essence: 0,
    },
    hero: {
      level: 1,
      exp: 0,
      expToNext: 20,
      attack: 12,
      maxHp: 120,
      hp: 120,
      attackSpeed: 1.12,
      critChance: 0.08,
      critDamage: 1.85,
      regen: 2.8,
    },
    upgrades: {
      attack: 0,
      vitality: 0,
      tempo: 0,
      focus: 0,
    },
    blessings: {
      edge: 0,
      bounty: 0,
      ward: 0,
    },
    progress: {
      zoneIndex: 0,
      highestZone: 0,
      killsTowardBoss: 0,
      totalKills: 0,
      totalBossKills: 0,
      totalDeaths: 0,
    },
    settings: {
      autoAdvance: true,
    },
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

function hydrateState(saved: SavedState | null): GameState {
  const base = createInitialState();

  if (!saved || typeof saved !== "object") {
    return base;
  }

  return {
    ...base,
    resources: { ...base.resources, ...saved.resources },
    hero: { ...base.hero, ...saved.hero },
    upgrades: { ...base.upgrades, ...saved.upgrades },
    blessings: { ...base.blessings, ...saved.blessings },
    progress: { ...base.progress, ...saved.progress },
    settings: { ...base.settings, ...saved.settings },
    combat: { ...base.combat, ...saved.combat, enemy: null },
    logs: Array.isArray(saved.logs)
      ? saved.logs.slice(0, LOG_LIMIT).map((entry) => ({
          text: String(entry.text ?? ""),
          timestamp: String(entry.timestamp ?? ""),
        }))
      : [],
    lastSeen: typeof saved.lastSeen === "number" ? saved.lastSeen : Date.now(),
  };
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createInitialState();
    }

    return hydrateState(JSON.parse(raw) as SavedState);
  } catch (error) {
    console.warn("Failed to load save state.", error);
    return createInitialState();
  }
}

function saveState(): void {
  state.lastSeen = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  lastSave = state.lastSeen;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return Math.floor(value).toLocaleString("ko-KR");
}

function normalizeState(): void {
  state.progress.highestZone = clamp(state.progress.highestZone, 0, ZONES.length - 1);
  state.progress.zoneIndex = clamp(state.progress.zoneIndex, 0, state.progress.highestZone);
  state.progress.killsTowardBoss = clamp(state.progress.killsTowardBoss, 0, BOSS_WAVE_TARGET);
  state.hero.critChance = clamp(state.hero.critChance, 0, 0.65);
  state.hero.hp = clamp(state.hero.hp, 0, getBlessedMaxHp());
}

function getBlessedAttack(): number {
  const furyMultiplier = state.combat.furyRemaining > 0 ? 1.9 : 1;
  return state.hero.attack * (1 + state.blessings.edge * 0.12) * furyMultiplier;
}

function getBlessedAttackSpeed(): number {
  const furyMultiplier = state.combat.furyRemaining > 0 ? 1.55 : 1;
  return state.hero.attackSpeed * furyMultiplier;
}

function getBlessedMaxHp(): number {
  return state.hero.maxHp * (1 + state.blessings.ward * 0.1);
}

function getBlessedRegen(): number {
  return state.hero.regen * (1 + state.blessings.ward * 0.12);
}

function getGoldMultiplier(): number {
  return 1 + state.blessings.bounty * 0.14;
}

function getEstimatedDps(): number {
  const base = getBlessedAttack() * getBlessedAttackSpeed();
  const critBonus = 1 + clamp(state.hero.critChance, 0, 0.65) * (state.hero.critDamage - 1);
  return base * critBonus;
}

function getUpgradeCost(key: UpgradeKey): number {
  const baseCosts: Record<UpgradeKey, number> = {
    attack: 18,
    vitality: 26,
    tempo: 36,
    focus: 52,
  };

  const growthRates: Record<UpgradeKey, number> = {
    attack: 1.48,
    vitality: 1.5,
    tempo: 1.57,
    focus: 1.6,
  };

  return Math.floor(baseCosts[key] * Math.pow(growthRates[key], state.upgrades[key]));
}

function getBlessingCost(key: BlessingKey): number {
  const baseCosts: Record<BlessingKey, number> = {
    edge: 2,
    bounty: 2,
    ward: 3,
  };

  const growthRates: Record<BlessingKey, number> = {
    edge: 1.75,
    bounty: 1.85,
    ward: 1.9,
  };

  return Math.max(1, Math.floor(baseCosts[key] * Math.pow(growthRates[key], state.blessings[key])));
}

function addLog(message: string): void {
  const timestamp = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  state.logs.unshift({ text: message, timestamp });
  state.logs = state.logs.slice(0, LOG_LIMIT);
}

function createEnemy(): void {
  const zone = ZONES[state.progress.zoneIndex];
  const boss = state.progress.killsTowardBoss >= BOSS_WAVE_TARGET;
  const scale = Math.pow(1.34, state.progress.zoneIndex);
  const randomFoe = zone.foes[Math.floor(Math.random() * zone.foes.length)] ?? zone.foes[0];
  const name = boss ? `${zone.label}의 수문장` : randomFoe;
  const hp = Math.round((72 + state.progress.zoneIndex * 18) * scale * (boss ? 4.8 : 1) * randomBetween(0.94, 1.06));
  const attack = Math.round((7 + state.progress.zoneIndex * 3.9) * scale * (boss ? 2.7 : 1) * randomBetween(0.94, 1.08));
  const gold = Math.round((9 + state.progress.zoneIndex * 4.4) * scale * (boss ? 4.4 : 1));
  const exp = Math.round((11 + state.progress.zoneIndex * 5.8) * scale * (boss ? 3.1 : 1));

  state.combat.enemy = {
    name,
    tag: boss ? "Boss" : "Enemy",
    hp,
    maxHp: hp,
    attack,
    attackSpeed: boss ? 0.95 + state.progress.zoneIndex * 0.04 : 0.85 + state.progress.zoneIndex * 0.03,
    gold,
    exp,
    boss,
  };
  state.combat.enemyCooldown = 0;

  addLog(`${name} 출현`);
}

function gainExperience(amount: number): void {
  state.hero.exp += amount;

  while (state.hero.exp >= state.hero.expToNext) {
    state.hero.exp -= state.hero.expToNext;
    state.hero.level += 1;
    state.hero.expToNext = Math.round(state.hero.expToNext * 1.28 + 10);
    state.hero.attack += 3 + Math.floor(state.hero.level * 0.45);
    state.hero.maxHp += 16 + state.hero.level * 2;
    state.hero.regen += 0.28;

    if (state.hero.level % 4 === 0) {
      state.hero.attackSpeed += 0.03;
    }

    if (state.hero.level % 5 === 0) {
      state.hero.critChance = clamp(state.hero.critChance + 0.012, 0, 0.65);
    }

    state.hero.hp = getBlessedMaxHp();
    addLog(`영웅이 Lv.${state.hero.level}에 도달했습니다.`);
  }
}

function onEnemyDefeated(): void {
  const enemy = state.combat.enemy;

  if (!enemy) {
    return;
  }

  const goldGain = Math.round(enemy.gold * getGoldMultiplier());

  state.resources.gold += goldGain;
  gainExperience(enemy.exp);
  state.progress.totalKills += 1;

  if (enemy.boss) {
    state.progress.totalBossKills += 1;
    state.resources.essence += 1 + Math.floor(state.progress.zoneIndex / 2);
    state.progress.killsTowardBoss = 0;

    if (state.progress.highestZone < ZONES.length - 1 && state.progress.zoneIndex === state.progress.highestZone) {
      state.progress.highestZone += 1;
      addLog(`${ZONES[state.progress.highestZone].label} 지역이 해금되었습니다.`);
    }

    addLog(`${enemy.name} 토벌 성공. 정수를 회수했습니다.`);

    if (state.settings.autoAdvance && state.progress.zoneIndex < state.progress.highestZone) {
      state.progress.zoneIndex += 1;
      addLog(`${ZONES[state.progress.zoneIndex].label} 지역으로 자동 전진합니다.`);
    }
  } else {
    state.progress.killsTowardBoss += 1;

    if (state.progress.killsTowardBoss === BOSS_WAVE_TARGET) {
      addLog("지역 보스의 기척이 느껴집니다.");
    }
  }

  createEnemy();
}

function onHeroDefeated(): void {
  state.progress.totalDeaths += 1;
  state.resources.gold = Math.floor(state.resources.gold * 0.92);
  state.combat.reviveTimer = 3;
  state.combat.heroCooldown = 0;
  state.combat.enemyCooldown = 0;
  addLog("원정대가 밀려났습니다. 전열을 정비합니다.");
}

function travelToZone(zoneIndex: number): void {
  const target = clamp(zoneIndex, 0, state.progress.highestZone);

  if (target === state.progress.zoneIndex) {
    return;
  }

  state.progress.zoneIndex = target;
  state.progress.killsTowardBoss = 0;
  state.hero.hp = Math.min(state.hero.hp, getBlessedMaxHp());
  addLog(`${ZONES[target].label} 지역으로 이동했습니다.`);
  createEnemy();
}

function purchaseUpgrade(key: UpgradeKey): void {
  const cost = getUpgradeCost(key);

  if (state.resources.gold < cost) {
    return;
  }

  state.resources.gold -= cost;
  state.upgrades[key] += 1;

  if (key === "attack") {
    state.hero.attack += 6 + state.upgrades[key];
    addLog("검술 단련으로 공격력이 상승했습니다.");
  }

  if (key === "vitality") {
    state.hero.maxHp += 28 + state.upgrades[key] * 4;
    state.hero.hp = Math.min(getBlessedMaxHp(), state.hero.hp + 36);
    state.hero.regen += 0.45;
    addLog("생존 훈련으로 체력과 재생력이 강화되었습니다.");
  }

  if (key === "tempo") {
    state.hero.attackSpeed += 0.08;
    addLog("가속 훈련으로 공격 속도가 빨라졌습니다.");
  }

  if (key === "focus") {
    state.hero.critChance = clamp(state.hero.critChance + 0.02, 0, 0.65);
    state.hero.critDamage += 0.08;
    addLog("집중 조율로 치명타 효율이 증가했습니다.");
  }
}

function purchaseBlessing(key: BlessingKey): void {
  const cost = getBlessingCost(key);

  if (state.resources.essence < cost) {
    return;
  }

  state.resources.essence -= cost;
  state.blessings[key] += 1;

  if (key === "edge") {
    addLog("잿불 검인으로 공격력이 영구 상승했습니다.");
  }

  if (key === "bounty") {
    addLog("황금 계약으로 전리품 수익이 영구 상승했습니다.");
  }

  if (key === "ward") {
    state.hero.hp = Math.min(getBlessedMaxHp(), state.hero.hp + 50);
    addLog("수호 맹세로 생존력이 영구 상승했습니다.");
  }
}

function triggerFury(): void {
  if (state.combat.furyCooldown > 0 || state.combat.reviveTimer > 0) {
    return;
  }

  state.combat.furyRemaining = 10;
  state.combat.furyCooldown = 40;
  addLog("광란 발동. 잠시 동안 공격 성능이 폭증합니다.");
}

function simulateOfflineProgress(): void {
  const secondsAway = Math.min(Math.max(0, Math.floor((Date.now() - state.lastSeen) / 1000)), MAX_OFFLINE_SECONDS);

  if (secondsAway < 15) {
    return;
  }

  const zoneFactor = Math.pow(1.34, state.progress.zoneIndex);
  const averageEnemyHp = (72 + state.progress.zoneIndex * 18) * zoneFactor;
  const kills = Math.floor((getEstimatedDps() * secondsAway * 0.5) / Math.max(averageEnemyHp, 1));

  if (kills <= 0) {
    return;
  }

  const averageGold = Math.round((9 + state.progress.zoneIndex * 4.4) * zoneFactor);
  const averageExp = Math.round((11 + state.progress.zoneIndex * 5.8) * zoneFactor);
  const goldGain = Math.round(kills * averageGold * getGoldMultiplier() * 0.7);
  const expGain = Math.round(kills * averageExp * 0.65);

  state.resources.gold += goldGain;
  gainExperience(expGain);

  refs.offlineBanner.hidden = false;
  refs.offlineBanner.textContent = `${Math.floor(secondsAway / 60)}분 동안 자리를 비운 사이 Gold ${formatNumber(goldGain)}와 EXP ${formatNumber(expGain)}를 회수했습니다.`;
  addLog(`오프라인 보상: Gold ${formatNumber(goldGain)}, EXP ${formatNumber(expGain)}`);
}

function tick(dt: number): void {
  if (!state.combat.enemy) {
    createEnemy();
  }

  state.combat.furyRemaining = Math.max(0, state.combat.furyRemaining - dt);
  state.combat.furyCooldown = Math.max(0, state.combat.furyCooldown - dt);

  if (state.combat.reviveTimer > 0) {
    state.combat.reviveTimer = Math.max(0, state.combat.reviveTimer - dt);

    if (state.combat.reviveTimer === 0) {
      state.hero.hp = getBlessedMaxHp();
      addLog("원정대가 전열을 정비하고 복귀했습니다.");
      createEnemy();
    }

    return;
  }

  state.hero.hp = Math.min(getBlessedMaxHp(), state.hero.hp + getBlessedRegen() * dt);
  state.combat.heroCooldown -= dt;
  state.combat.enemyCooldown -= dt;

  while (state.combat.heroCooldown <= 0 && state.combat.enemy && state.combat.enemy.hp > 0) {
    const isCrit = Math.random() < clamp(state.hero.critChance, 0, 0.65);
    const damage = getBlessedAttack() * randomBetween(0.92, 1.08) * (isCrit ? state.hero.critDamage : 1);

    state.combat.enemy.hp = Math.max(0, state.combat.enemy.hp - damage);
    state.combat.heroCooldown += 1 / Math.max(getBlessedAttackSpeed(), 0.1);

    if (state.combat.enemy.hp <= 0) {
      onEnemyDefeated();
      return;
    }
  }

  while (state.combat.enemyCooldown <= 0 && state.combat.enemy && state.combat.enemy.hp > 0) {
    const damage = state.combat.enemy.attack * randomBetween(0.9, 1.09);

    state.hero.hp = Math.max(0, state.hero.hp - damage);
    state.combat.enemyCooldown += 1 / Math.max(state.combat.enemy.attackSpeed, 0.1);

    if (state.hero.hp <= 0) {
      onHeroDefeated();
      return;
    }
  }
}

function renderLog(): void {
  refs.combatLog.innerHTML = state.logs
    .map((entry) => `<div class="log-entry"><strong>[${entry.timestamp}]</strong> ${entry.text}</div>`)
    .join("");
}

function renderZones(): void {
  zoneButtons.forEach((button, index) => {
    const unlocked = index <= state.progress.highestZone;

    button.disabled = !unlocked;
    button.classList.toggle("locked", !unlocked);
    button.classList.toggle("active", index === state.progress.zoneIndex);
  });
}

function render(): void {
  const zone = ZONES[state.progress.zoneIndex];
  const enemy = state.combat.enemy;
  const maxHp = getBlessedMaxHp();
  const heroHpRatio = clamp(state.hero.hp / Math.max(maxHp, 1), 0, 1);
  const enemyHpRatio = enemy ? clamp(enemy.hp / Math.max(enemy.maxHp, 1), 0, 1) : 0;
  const expRatio = clamp(state.hero.exp / Math.max(state.hero.expToNext, 1), 0, 1);

  refs.goldValue.textContent = formatNumber(state.resources.gold);
  refs.essenceValue.textContent = formatNumber(state.resources.essence);
  refs.zoneValue.textContent = `${state.progress.zoneIndex + 1} / ${ZONES.length}`;
  refs.heroLevel.textContent = `Lv.${state.hero.level}`;
  refs.heroStatus.textContent =
    state.combat.reviveTimer > 0
      ? `부활까지 ${state.combat.reviveTimer.toFixed(1)}초`
      : state.combat.furyRemaining > 0
        ? "광란 상태"
        : "전투 준비 완료";
  refs.expValue.textContent = `${formatNumber(state.hero.exp)} / ${formatNumber(state.hero.expToNext)}`;
  refs.attackValue.textContent = formatNumber(getBlessedAttack());
  refs.hpValue.textContent = `${formatNumber(state.hero.hp)} / ${formatNumber(maxHp)}`;
  refs.speedValue.textContent = `${getBlessedAttackSpeed().toFixed(2)}/s`;
  refs.critValue.textContent = `${Math.round(clamp(state.hero.critChance, 0, 0.65) * 100)}%`;
  refs.regenValue.textContent = `${getBlessedRegen().toFixed(1)}/s`;
  refs.dpsValue.textContent = formatNumber(getEstimatedDps());
  refs.heroHpText.textContent = `${formatNumber(state.hero.hp)} / ${formatNumber(maxHp)}`;
  refs.heroHpBar.style.width = `${heroHpRatio * 100}%`;
  refs.expBar.style.width = `${expRatio * 100}%`;

  refs.enemyName.textContent = enemy ? enemy.name : "적 탐색 중";
  refs.enemyTag.textContent = enemy ? enemy.tag : "Enemy";
  refs.enemyHpText.textContent = enemy ? `${formatNumber(enemy.hp)} / ${formatNumber(enemy.maxHp)}` : "-";
  refs.enemyPower.textContent = enemy ? `ATK ${formatNumber(enemy.attack)}` : "-";
  refs.enemyHpBar.style.width = `${enemyHpRatio * 100}%`;

  refs.zoneName.textContent = zone.label;
  refs.zoneDescription.textContent = zone.description;
  refs.bossProgress.textContent = `${state.progress.killsTowardBoss} / ${BOSS_WAVE_TARGET}`;
  refs.totalKills.textContent = formatNumber(state.progress.totalKills);
  refs.totalBossKills.textContent = formatNumber(state.progress.totalBossKills);
  refs.totalDeaths.textContent = `${formatNumber(state.progress.totalDeaths)} 패배`;
  refs.furyState.textContent = state.combat.furyRemaining > 0 ? `${state.combat.furyRemaining.toFixed(1)}초 남음` : "광란 대기";
  refs.furyCooldown.textContent = state.combat.furyCooldown > 0 ? `${state.combat.furyCooldown.toFixed(1)}초 후 사용` : "준비 완료";

  refs.upgradeAttackCost.textContent = `${formatNumber(getUpgradeCost("attack"))} Gold`;
  refs.upgradeVitalityCost.textContent = `${formatNumber(getUpgradeCost("vitality"))} Gold`;
  refs.upgradeTempoCost.textContent = `${formatNumber(getUpgradeCost("tempo"))} Gold`;
  refs.upgradeFocusCost.textContent = `${formatNumber(getUpgradeCost("focus"))} Gold`;
  refs.blessingEdgeCost.textContent = `${formatNumber(getBlessingCost("edge"))} Essence`;
  refs.blessingBountyCost.textContent = `${formatNumber(getBlessingCost("bounty"))} Essence`;
  refs.blessingWardCost.textContent = `${formatNumber(getBlessingCost("ward"))} Essence`;

  refs.upgradeAttack.disabled = state.resources.gold < getUpgradeCost("attack");
  refs.upgradeVitality.disabled = state.resources.gold < getUpgradeCost("vitality");
  refs.upgradeTempo.disabled = state.resources.gold < getUpgradeCost("tempo");
  refs.upgradeFocus.disabled = state.resources.gold < getUpgradeCost("focus");
  refs.blessingEdge.disabled = state.resources.essence < getBlessingCost("edge");
  refs.blessingBounty.disabled = state.resources.essence < getBlessingCost("bounty");
  refs.blessingWard.disabled = state.resources.essence < getBlessingCost("ward");
  refs.prevZoneButton.disabled = state.progress.zoneIndex <= 0;
  refs.nextZoneButton.disabled = state.progress.zoneIndex >= state.progress.highestZone;
  refs.furyButton.disabled = state.combat.furyCooldown > 0 || state.combat.reviveTimer > 0;
  refs.autoAdvanceToggle.checked = state.settings.autoAdvance;

  renderZones();
  renderLog();
}

function frame(timestamp: number): void {
  if (!lastFrame) {
    lastFrame = timestamp;
    lastSave = Date.now();
  }

  const dt = Math.min((timestamp - lastFrame) / 1000, 0.25);

  lastFrame = timestamp;

  tick(dt);
  render();

  if (Date.now() - lastSave >= SAVE_INTERVAL_MS) {
    saveState();
  }

  window.requestAnimationFrame(frame);
}

function buildZoneButtons(): void {
  refs.zoneList.innerHTML = "";
  zoneButtons = ZONES.map((zone, index) => {
    const button = document.createElement("button");

    button.className = "zone-button";
    button.innerHTML = `<strong>${zone.label}</strong><span>${zone.description}</span>`;
    button.addEventListener("click", () => {
      if (index <= state.progress.highestZone) {
        travelToZone(index);
      }
    });

    refs.zoneList.appendChild(button);
    return button;
  });
}

function bindEvents(): void {
  refs.saveButton.addEventListener("click", () => {
    saveState();
    addLog("수동 저장이 완료되었습니다.");
    render();
  });

  refs.upgradeAttack.addEventListener("click", () => purchaseUpgrade("attack"));
  refs.upgradeVitality.addEventListener("click", () => purchaseUpgrade("vitality"));
  refs.upgradeTempo.addEventListener("click", () => purchaseUpgrade("tempo"));
  refs.upgradeFocus.addEventListener("click", () => purchaseUpgrade("focus"));
  refs.blessingEdge.addEventListener("click", () => purchaseBlessing("edge"));
  refs.blessingBounty.addEventListener("click", () => purchaseBlessing("bounty"));
  refs.blessingWard.addEventListener("click", () => purchaseBlessing("ward"));
  refs.furyButton.addEventListener("click", triggerFury);
  refs.prevZoneButton.addEventListener("click", () => travelToZone(state.progress.zoneIndex - 1));
  refs.nextZoneButton.addEventListener("click", () => travelToZone(state.progress.zoneIndex + 1));
  refs.autoAdvanceToggle.addEventListener("change", (event: Event) => {
    const target = event.currentTarget as HTMLInputElement | null;

    if (target) {
      state.settings.autoAdvance = target.checked;
    }
  });

  window.addEventListener("beforeunload", saveState);
}

function init(): void {
  state = loadState();
  normalizeState();
  buildZoneButtons();
  bindEvents();
  simulateOfflineProgress();

  if (!state.logs.length) {
    addLog("원정대가 잿불 길목에 진입했습니다.");
  }

  if (!state.combat.enemy) {
    createEnemy();
  }

  render();
  window.requestAnimationFrame(frame);
}

init();
