import { STORAGE_KEY, LEGACY_STORAGE_KEYS, SAVE_INTERVAL_MS, TOTAL_WORLDS, STAGES_PER_WORLD, MAX_HERO_LEVEL, ATTACK_SPEED_CAP, MAX_OFFLINE_SECONDS, LOG_LIMIT, INVENTORY_LIMIT, RECENT_DRAW_LIMIT, DRAW_COST_SINGLE, DRAW_COST_MULTI, FURY_DURATION, FURY_COOLDOWN, SYNTHESIS_REQUIREMENT, EQUIPMENT_SLOTS, EQUIPMENT_CATEGORIES, DRAW_CATEGORIES, RARITIES, CREATION_RARITY, LEGACY_SLOT_MAP, LEGACY_RARITY_MAP, WORLD_THEMES, WORLD_REALMS, DUNGEONS, RELICS, UPGRADE_DEFS, BLESSING_DEFS, ITEM_PREFIXES, CREATION_PREFIXES, ITEM_NAMES, CREATION_NAMES } from "./catalog.js";
import { refs } from "./dom.js";
import { choose, clamp, formatMultiplier, formatNumber, formatPercent, randomBetween } from "./utils.js";
const MANAGEMENT_VIEWS = ["upgrades", "equipment", "inventory", "synthesis", "relics", "dungeons", "status", "log"];
const HERO_START_ATTACK = 32;
const HERO_START_ATTACK_SPEED = 0.5;
const HERO_LEVEL_100_ATTACK_SPEED = 1.45;
const HERO_ATTACK_SPEED_PER_LEVEL = (HERO_LEVEL_100_ATTACK_SPEED - HERO_START_ATTACK_SPEED) / Math.max(MAX_HERO_LEVEL - 1, 1);
const UPGRADE_ATTACK_GAIN = 8;
const UPGRADE_TEMPO_GAIN = 0.025;
let state = createInitialState();
let lastFrame = 0;
let lastSave = 0;
let rateModalOpen = false;
let listPages = {
    dungeons: 1,
    equipmentPreview: 1,
    recentDraws: 1,
    inventory: 1,
    synthesis: 1,
    relics: 1,
    log: 1,
};
let dirtyViews = new Set(MANAGEMENT_VIEWS);
function markViewsDirty(...views) {
    const targets = views.length ? views : MANAGEMENT_VIEWS;
    targets.forEach((view) => dirtyViews.add(view));
}
function markCollectionViewDirty(key) {
    if (key === "recentDraws") {
        markViewsDirty("inventory");
        return;
    }
    if (key === "equipmentPreview") {
        markViewsDirty("equipment");
        return;
    }
    markViewsDirty(key);
}
function createEmptyBonuses() {
    return {
        attack: 0,
        defense: 0,
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
function createHeroState() {
    return {
        level: 1,
        exp: 0,
        expToNext: 24,
        attack: HERO_START_ATTACK,
        defense: 8,
        maxHp: 130,
        hp: 130,
        attackSpeed: HERO_START_ATTACK_SPEED,
        critChance: 0.08,
        critDamage: 1.7,
        regen: 2.6,
    };
}
function applyHeroLevelGrowth(hero) {
    hero.level += 1;
    hero.expToNext = Math.round(hero.expToNext * 1.15 + 22);
    hero.attack += 3 + Math.floor(hero.level * 0.45);
    hero.defense += 1.2;
    hero.maxHp += 18 + hero.level * 2.2;
    hero.regen += 0.22;
    hero.attackSpeed = clamp(HERO_START_ATTACK_SPEED + (hero.level - 1) * HERO_ATTACK_SPEED_PER_LEVEL, HERO_START_ATTACK_SPEED, HERO_LEVEL_100_ATTACK_SPEED);
    if (hero.level % 5 === 0)
        hero.critChance = clamp(hero.critChance + 0.01, 0, 0.85);
}
function createHeroStateForLevel(level) {
    const hero = createHeroState();
    const targetLevel = clamp(Number(level || 1), 1, MAX_HERO_LEVEL);
    while (hero.level < targetLevel)
        applyHeroLevelGrowth(hero);
    hero.hp = hero.maxHp;
    return hero;
}
function createInitialState() {
    return {
        resources: { gold: 80, diamonds: 140, essence: 0 },
        hero: createHeroState(),
        upgrades: { attack: 0, vitality: 0, recovery: 0, guard: 0, tempo: 0, focus: 0 },
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
        settings: { autoAdvance: true, autoAdvanceWorld: true, activeMenu: "upgrades", equipmentFilter: "all", drawCategory: "weapon" },
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
function getSlotById(id) {
    return EQUIPMENT_SLOTS.find((slot) => slot.id === id) || EQUIPMENT_SLOTS[0];
}
function getSlotLabel(id) {
    return getSlotById(id).label;
}
function getDrawCategory(id) {
    return DRAW_CATEGORIES.find((category) => category.id === id) || DRAW_CATEGORIES[0];
}
function getRarityData(id, isCreation = false) {
    if (isCreation || id === CREATION_RARITY.id)
        return CREATION_RARITY;
    return RARITIES.find((rarity) => rarity.id === id) || RARITIES[0];
}
function getRarityRank(id, isCreation = false) {
    if (isCreation || id === CREATION_RARITY.id)
        return RARITIES.length;
    return Math.max(0, RARITIES.findIndex((rarity) => rarity.id === id));
}
function getNextRarity(id) {
    const index = RARITIES.findIndex((rarity) => rarity.id === id);
    if (index === -1)
        return RARITIES[0];
    if (index === RARITIES.length - 1)
        return CREATION_RARITY;
    return RARITIES[index + 1];
}
function cloneBonuses(bonuses) {
    return {
        attack: Number(bonuses?.attack || 0),
        defense: Number(bonuses?.defense || 0),
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
    return (bonus.attack * 1.3 +
        bonus.defense * 7.5 +
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
        getRarityRank(item.rarity, item.isCreation) * 40);
}
function normalizeItem(item) {
    if (!item || typeof item !== "object")
        return null;
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
    if (!saved || typeof saved !== "object")
        return base;
    const savedLevel = clamp(Number(saved.hero?.level || base.hero.level), 1, MAX_HERO_LEVEL);
    const hero = {
        ...createHeroStateForLevel(savedLevel),
        exp: savedLevel >= MAX_HERO_LEVEL ? 0 : Math.max(0, Number(saved.hero?.exp || 0)),
    };
    hero.hp = clamp(Number(saved.hero?.hp || hero.maxHp), 0, hero.maxHp);
    const inventory = Array.isArray(saved.equipment?.inventory)
        ? saved.equipment.inventory.map((item) => normalizeItem(item)).filter(Boolean)
        : [];
    const equipped = createEquippedState();
    EQUIPMENT_SLOTS.forEach((slot) => {
        const rawEquipped = saved.equipment?.equipped?.[slot.id] ||
            (slot.id === "necklace" ? saved.equipment?.equipped?.sigil : null);
        equipped[slot.id] = normalizeItem(rawEquipped);
    });
    const recentResults = Array.isArray(saved.gacha?.recentResults)
        ? saved.gacha.recentResults.map((item) => normalizeItem(item)).filter(Boolean).slice(0, RECENT_DRAW_LIMIT)
        : [];
    return {
        ...base,
        resources: { ...base.resources, ...saved.resources },
        hero,
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
            if (!raw)
                continue;
            return hydrateState(JSON.parse(raw));
        }
        return createInitialState();
    }
    catch (error) {
        console.warn("Failed to load save state.", error);
        return createInitialState();
    }
}
function saveState() {
    state.lastSeen = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    LEGACY_STORAGE_KEYS.forEach((key) => {
        if (key !== STORAGE_KEY)
            localStorage.removeItem(key);
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
        attack: state.upgrades.attack * UPGRADE_ATTACK_GAIN,
        defense: state.upgrades.guard * 4,
        maxHp: state.upgrades.vitality * 55,
        attackSpeed: state.upgrades.tempo * UPGRADE_TEMPO_GAIN,
        critChance: state.upgrades.focus * 0.008,
        critDamage: state.upgrades.focus * 0.05,
        regen: state.upgrades.recovery * 0.38,
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
        if (!item)
            return;
        Object.keys(total).forEach((key) => {
            total[key] += Number(item.bonuses[key] || 0);
        });
    });
    return total;
}
function getUnlockedRelics() {
    return RELICS.filter((relic) => relic.condition(state));
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
    const defense = state.hero.defense + upgrade.defense + gear.defense + relic.defense;
    const maxHp = (state.hero.maxHp + upgrade.maxHp + gear.maxHp + relic.maxHp) * (1 + state.blessings.ward * 0.08);
    const attackSpeed = clamp((state.hero.attackSpeed + upgrade.attackSpeed + gear.attackSpeed + relic.attackSpeed) * furySpeed, 0.1, ATTACK_SPEED_CAP);
    const critChance = clamp(state.hero.critChance + upgrade.critChance + gear.critChance + relic.critChance, 0, 0.85);
    const critDamage = state.hero.critDamage + upgrade.critDamage + gear.critDamage + relic.critDamage;
    const regen = (state.hero.regen + upgrade.regen + gear.regen + relic.regen) * (1 + state.blessings.ward * 0.1);
    const goldRate = 1 + state.blessings.bounty * 0.12 + gear.goldRate + relic.goldRate;
    const diamondRate = 1 + state.blessings.bounty * 0.04 + gear.diamondRate + relic.diamondRate;
    const bossDamage = 1 + Math.floor(state.upgrades.attack / 10) * 0.03 + state.blessings.edge * 0.02 + gear.bossDamage + relic.bossDamage;
    const dungeonDamage = 1 + Math.floor(state.upgrades.vitality / 12) * 0.04 + gear.dungeonDamage + relic.dungeonDamage;
    const damageReduction = clamp(defense / (defense + 160), 0, 0.78);
    const dps = attack * attackSpeed * (1 + critChance * (critDamage - 1));
    return {
        attack,
        defense,
        maxHp,
        attackSpeed,
        critChance,
        critDamage,
        regen,
        goldRate,
        diamondRate,
        bossDamage,
        dungeonDamage,
        damageReduction,
        dps,
        base: {
            attack: state.hero.attack,
            defense: state.hero.defense,
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
    markViewsDirty("log");
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
    const name = stage === STAGES_PER_WORLD
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
    let advancedHighestProgress = false;
    if (currentProgress > highestProgress) {
        state.progress.highestWorld = state.progress.world;
        state.progress.highestStage = state.progress.stage;
        advancedHighestProgress = true;
    }
    const nextUnlocked = getUnlockedDungeons().length;
    if (nextUnlocked > previousUnlocked) {
        const unlocked = getUnlockedDungeons()[nextUnlocked - 1];
        if (unlocked)
            createLog(`${unlocked.name} 던전이 해금되었습니다.`);
        markViewsDirty("dungeons", "relics", "status");
    }
    if (advancedHighestProgress)
        markViewsDirty("relics", "status");
}
function gainExperience(amount) {
    if (state.hero.level >= MAX_HERO_LEVEL) {
        state.hero.level = MAX_HERO_LEVEL;
        state.hero.exp = 0;
        return;
    }
    state.hero.exp += amount;
    while (state.hero.exp >= state.hero.expToNext && state.hero.level < MAX_HERO_LEVEL) {
        state.hero.exp -= state.hero.expToNext;
        applyHeroLevelGrowth(state.hero);
        createLog(`영웅이 Lv.${state.hero.level}에 도달했습니다.`);
        markViewsDirty("status");
    }
    if (state.hero.level >= MAX_HERO_LEVEL) {
        state.hero.level = MAX_HERO_LEVEL;
        state.hero.exp = 0;
        createLog(`영웅이 최대 레벨 ${MAX_HERO_LEVEL}에 도달했습니다.`);
        markViewsDirty("status");
    }
}
function rollRarity(minRarity) {
    let picked = null;
    if (!minRarity && state.gacha.pity >= 29) {
        picked = "legendary";
    }
    else {
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
    if (minRarity && getRarityRank(picked) < getRarityRank(minRarity))
        picked = minRarity;
    if (getRarityRank(picked) >= getRarityRank("legendary")) {
        state.gacha.pity = 0;
    }
    else {
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
            bonuses.defense += Math.round(scale * 1.4 * multiplier);
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
        bonuses.defense += Math.round(scale * 3.2 * multiplier);
        bonuses.maxHp += Math.round(scale * 24 * multiplier);
        bonuses.regen += 0.42 * multiplier;
        bonuses.bossDamage += 0.012 * multiplier;
    }
    if (slot === "armor") {
        bonuses.defense += Math.round(scale * 7.4 * multiplier);
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
        bonuses.defense += Math.round(scale * 4.2 * multiplier);
        bonuses.maxHp += Math.round(scale * 18 * multiplier);
        bonuses.attackSpeed += 0.018 * multiplier;
        bonuses.dungeonDamage += 0.022 * multiplier;
    }
    if (slot === "gloves") {
        bonuses.defense += Math.round(scale * 2.8 * multiplier);
        bonuses.attack += Math.round(scale * 4.5 * multiplier);
        bonuses.attackSpeed += 0.024 * multiplier;
        bonuses.critChance += 0.004 * multiplier;
    }
    if (slot === "shoes") {
        bonuses.defense += Math.round(scale * 2.4 * multiplier);
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
    return new Set(EQUIPMENT_SLOTS.map((slot) => state.equipment.equipped[slot.id])
        .filter(Boolean)
        .map((item) => item.id));
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
    if (options.autoEquip !== false)
        autoEquipItem(item);
    trimInventory();
    markViewsDirty("equipment", "inventory", "synthesis", "status");
}
function drawEquipment(count, options = {}) {
    const category = options.categoryId ? getDrawCategory(options.categoryId) : null;
    if (!options.free) {
        const cost = count === 10 ? DRAW_COST_MULTI : DRAW_COST_SINGLE;
        if (state.resources.diamonds < cost)
            return [];
        state.resources.diamonds -= cost;
    }
    const results = [];
    for (let index = 0; index < count; index += 1) {
        const item = createEquipmentItem({
            ...options,
            slot: options.slot || (category ? choose(category.slots) : undefined),
        });
        addItemToInventory(item);
        results.push(item);
    }
    state.gacha.totalDraws += count;
    state.gacha.recentResults = [...results.reverse(), ...state.gacha.recentResults].slice(0, RECENT_DRAW_LIMIT);
    createLog(`${options.source || "장비 뽑기"}로 장비 ${count}개를 획득했습니다.`);
    markViewsDirty("equipment", "inventory", "synthesis", "status");
    return results;
}
function equipItemById(id) {
    const item = state.equipment.inventory.find((entry) => entry.id === id);
    if (!item)
        return;
    state.equipment.equipped[item.slot] = item;
    createLog(`${item.name} 장비를 수동으로 장착했습니다.`);
    markViewsDirty("equipment", "inventory", "status");
}
function getSynthesisGroups() {
    const equippedIds = getEquippedIds();
    const grouped = {};
    state.equipment.inventory.forEach((item) => {
        if (item.isCreation)
            return;
        if (equippedIds.has(item.id))
            return;
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
        if (left.canSynthesize !== right.canSynthesize)
            return left.canSynthesize ? -1 : 1;
        const rankDiff = getRarityRank(right.rarity) - getRarityRank(left.rarity);
        if (rankDiff !== 0)
            return rankDiff;
        return left.slotLabel.localeCompare(right.slotLabel, "ko");
    });
}
function synthesizeItems(slot, rarityId) {
    const equippedIds = getEquippedIds();
    const candidates = state.equipment.inventory
        .filter((item) => item.slot === slot && item.rarity === rarityId && !item.isCreation && !equippedIds.has(item.id))
        .sort((left, right) => left.score - right.score);
    if (candidates.length < SYNTHESIS_REQUIREMENT)
        return;
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
    if (result.isCreation)
        state.forge.totalCreations += 1;
    state.gacha.recentResults = [result, ...state.gacha.recentResults].slice(0, RECENT_DRAW_LIMIT);
    if (result.isCreation) {
        createLog(`${getSlotLabel(slot)} 유일 장비 3개를 융합해 창조 아이템 ${result.name}을 제작했습니다.`);
    }
    else {
        createLog(`${getSlotLabel(slot)} ${getRarityData(rarityId).label} 장비 3개를 합성해 ${result.rarityLabel} 등급을 제작했습니다.`);
    }
    markViewsDirty("equipment", "inventory", "synthesis", "status");
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
    if (enemy.boss)
        state.progress.totalBossKills += 1;
    if (state.progress.stage === STAGES_PER_WORLD) {
        state.progress.totalWorldClears += 1;
        if (state.progress.world < TOTAL_WORLDS && state.settings.autoAdvanceWorld) {
            state.progress.world += 1;
            state.progress.stage = 1;
            createLog(`월드 ${state.progress.world}로 진입했습니다.`);
        }
        else if (state.progress.world < TOTAL_WORLDS) {
            state.progress.stage = STAGES_PER_WORLD;
            createLog("월드 보스를 다시 상대할 준비가 되었습니다.");
        }
        else {
            createLog("최종 월드를 반복 정복 중입니다.");
        }
    }
    else if (state.settings.autoAdvance) {
        state.progress.stage += 1;
    }
    updateHighestProgress();
    markViewsDirty("upgrades", "status");
}
function handleDungeonVictory(enemy) {
    const dungeon = getDungeonById(state.dungeons.active?.id);
    const stats = getFinalStats();
    state.resources.gold += Math.round(enemy.gold * stats.goldRate);
    gainExperience(enemy.exp);
    if (!dungeon || !state.dungeons.active)
        return;
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
    }
    else {
        state.dungeons.active.floor += 1;
        createLog(`${dungeon.name} ${state.dungeons.active.floor}층으로 전진합니다.`);
    }
    markViewsDirty("upgrades", "dungeons", "relics", "status");
}
function onEnemyDefeated() {
    const enemy = state.combat.enemy;
    if (!enemy)
        return;
    if (enemy.dungeon) {
        handleDungeonVictory(enemy);
    }
    else {
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
    }
    else {
        createLog("원정대가 밀려났습니다. 잠시 후 다시 복귀합니다.");
    }
    markViewsDirty("upgrades", "dungeons", "status");
}
function startDungeon(id) {
    const dungeon = getDungeonById(id);
    if (!dungeon)
        return;
    if (state.progress.highestWorld < dungeon.unlockWorld)
        return;
    state.dungeons.active = { id, floor: 1 };
    state.combat.heroCooldown = 0;
    state.combat.enemyCooldown = 0;
    createLog(`${dungeon.name}에 입장했습니다.`);
    createEnemy();
    markViewsDirty("dungeons", "status");
}
function leaveDungeon() {
    if (!state.dungeons.active)
        return;
    const dungeon = getDungeonById(state.dungeons.active.id);
    state.dungeons.active = null;
    createLog(`${dungeon ? dungeon.name : "던전"}에서 철수했습니다.`);
    createEnemy();
    markViewsDirty("dungeons", "status");
}
function purchaseUpgrade(key) {
    const cost = getUpgradeCost(key);
    if (state.resources.gold < cost)
        return;
    state.resources.gold -= cost;
    state.upgrades[key] += 1;
    createLog(`${UPGRADE_DEFS[key].label} 레벨이 ${state.upgrades[key]}이 되었습니다.`);
    markViewsDirty("upgrades", "status");
}
function purchaseBlessing(key) {
    const cost = getBlessingCost(key);
    if (state.resources.essence < cost)
        return;
    state.resources.essence -= cost;
    state.blessings[key] += 1;
    createLog(`${BLESSING_DEFS[key].label}이 강화되었습니다.`);
    markViewsDirty("upgrades", "status");
}
function triggerFury() {
    if (state.combat.furyCooldown > 0 || state.combat.reviveTimer > 0)
        return;
    state.combat.furyRemaining = FURY_DURATION;
    state.combat.furyCooldown = FURY_COOLDOWN;
    createLog("광란을 발동해 잠시 공격 성능이 크게 상승합니다.");
    markViewsDirty("status");
}
function simulateOfflineProgress() {
    const secondsAway = Math.min(Math.max(0, Math.floor((Date.now() - state.lastSeen) / 1000)), MAX_OFFLINE_SECONDS);
    if (secondsAway < 20)
        return;
    const stats = getFinalStats();
    const previewEnemy = state.dungeons.active
        ? buildDungeonEncounter(getDungeonById(state.dungeons.active.id), state.dungeons.active.floor)
        : buildCampaignEncounter(state.progress.world, state.progress.stage);
    const kills = Math.floor((stats.dps * secondsAway * 0.45) / Math.max(previewEnemy.maxHp, 1));
    if (kills <= 0)
        return;
    const goldGain = Math.round(kills * previewEnemy.gold * stats.goldRate * 0.55);
    const expGain = Math.round(kills * previewEnemy.exp * 0.52);
    const diamondGain = Math.floor((kills / 32) * stats.diamondRate);
    state.resources.gold += goldGain;
    state.resources.diamonds += diamondGain;
    gainExperience(expGain);
    refs.offlineBanner.hidden = false;
    refs.offlineBanner.textContent = `${Math.floor(secondsAway / 60)}분 동안 자리를 비운 사이 Gold ${formatNumber(goldGain)}, Diamond ${formatNumber(diamondGain)}, EXP ${formatNumber(expGain)}를 회수했습니다.`;
    createLog(`오프라인 보상으로 Gold ${formatNumber(goldGain)}와 Diamond ${formatNumber(diamondGain)}를 획득했습니다.`);
    markViewsDirty("upgrades", "status");
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
    state.settings.drawCategory = DRAW_CATEGORIES.some((category) => category.id === state.settings.drawCategory)
        ? state.settings.drawCategory
        : "weapon";
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
    if (isCrit)
        damage *= stats.critDamage;
    if (enemy.boss)
        damage *= stats.bossDamage;
    if (enemy.dungeon)
        damage *= stats.dungeonDamage;
    return damage;
}
function getDamageAgainstHero(stats, enemy) {
    const rawDamage = enemy.attack * randomBetween(0.9, 1.1);
    return Math.max(1, rawDamage * (1 - stats.damageReduction));
}
function getEnemyHitPreview(stats, enemy) {
    return Math.max(1, enemy.attack * (1 - stats.damageReduction));
}
function tick(dt) {
    const stats = getFinalStats();
    if (!state.combat.enemy)
        createEnemy();
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
        const damage = getDamageAgainstHero(stats, state.combat.enemy);
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
    if (bonuses.attack)
        chips.push(`ATK +${formatNumber(bonuses.attack)}`);
    if (bonuses.defense)
        chips.push(`DEF +${formatNumber(bonuses.defense)}`);
    if (bonuses.maxHp)
        chips.push(`HP +${formatNumber(bonuses.maxHp)}`);
    if (bonuses.attackSpeed)
        chips.push(`SPD +${bonuses.attackSpeed.toFixed(2)}`);
    if (bonuses.critChance)
        chips.push(`CRT +${formatPercent(bonuses.critChance)}`);
    if (bonuses.critDamage)
        chips.push(`CRT DMG +${formatPercent(bonuses.critDamage)}`);
    if (bonuses.regen)
        chips.push(`REG +${bonuses.regen.toFixed(1)}`);
    if (bonuses.goldRate)
        chips.push(`Gold +${formatPercent(bonuses.goldRate)}`);
    if (bonuses.diamondRate)
        chips.push(`Dia +${formatPercent(bonuses.diamondRate)}`);
    if (bonuses.bossDamage)
        chips.push(`Boss +${formatPercent(bonuses.bossDamage)}`);
    if (bonuses.dungeonDamage)
        chips.push(`Dungeon +${formatPercent(bonuses.dungeonDamage)}`);
    return chips.slice(0, 5);
}
function getUpgradeCurrentEffectText(key, level) {
    if (key === "attack")
        return `공격력 +${level * UPGRADE_ATTACK_GAIN}, 보스 피해 +${Math.floor(level / 10) * 3}%`;
    if (key === "vitality")
        return `최대 체력 +${level * 55}, 던전 피해 +${Math.floor(level / 12) * 4}%`;
    if (key === "recovery")
        return `초당 회복 +${(level * 0.38).toFixed(1)}`;
    if (key === "guard")
        return `방어력 +${level * 4}, 피해 경감 ${formatPercent(clamp((level * 4) / (level * 4 + 160), 0, 0.78))}`;
    if (key === "tempo")
        return `공격 속도 +${(level * UPGRADE_TEMPO_GAIN).toFixed(3)}/s`;
    return `치명타 +${(level * 0.8).toFixed(1)}%, 치명타 피해 +${Math.round(level * 5)}%`;
}
function getUpgradeNextEffectText(key, level) {
    if (key === "attack") {
        const nextBoss = Math.floor((level + 1) / 10) > Math.floor(level / 10) ? ", 보스 피해 +3%" : "";
        return `다음 레벨: 공격력 +${UPGRADE_ATTACK_GAIN}${nextBoss}`;
    }
    if (key === "vitality") {
        const nextDungeon = Math.floor((level + 1) / 12) > Math.floor(level / 12) ? ", 던전 피해 +4%" : "";
        return `다음 레벨: 최대 체력 +55${nextDungeon}`;
    }
    if (key === "recovery")
        return "다음 레벨: 초당 회복 +0.38";
    if (key === "guard")
        return "다음 레벨: 방어력 +4";
    if (key === "tempo")
        return `다음 레벨: 공격 속도 +${UPGRADE_TEMPO_GAIN.toFixed(3)}/s`;
    return "다음 레벨: 치명타 +0.8%, 치명타 피해 +5%";
}
function getDrawRateRows() {
    const totalWeight = RARITIES.reduce((sum, rarity) => sum + rarity.weight, 0);
    return RARITIES.map((rarity) => ({
        ...rarity,
        rate: (rarity.weight / totalWeight) * 100,
    }));
}
function renderDrawInfoPanel() {
    const category = getDrawCategory(state.settings.drawCategory);
    refs.drawCategoryTabs.querySelectorAll("[data-draw-category]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.drawCategory === category.id);
    });
    const slotRate = 100 / category.slots.length;
    refs.rateInfoButton.setAttribute("aria-expanded", String(rateModalOpen));
    refs.rateModal.hidden = !rateModalOpen;
    refs.rateModalTitle.textContent = `${category.label} 뽑기 확률표`;
    refs.rateModalBody.innerHTML = `
    <div class="rate-section">
      <div class="rate-list">
        ${getDrawRateRows().map((rarity) => `
          <div class="rate-row ${rarity.className}">
            <span>${rarity.label}</span>
            <strong>${rarity.rate.toFixed(rarity.rate < 1 ? 1 : 0)}%</strong>
          </div>
        `).join("")}
      </div>
    </div>
    <div class="rate-section">
      <strong class="rate-section-title">현재 카테고리 부위 분배</strong>
      <div class="rate-slot-grid">
        ${category.slots.map((slot) => `
          <div class="rate-slot-card">
            <span>${getSlotLabel(slot)}</span>
            <strong>${slotRate.toFixed(slotRate % 1 ? 1 : 0)}%</strong>
          </div>
        `).join("")}
      </div>
    </div>
    <div class="rate-note-list">
      <div class="rate-note">30회째 일반 뽑기에서는 전설 이상이 확정됩니다.</div>
      <div class="rate-note">창조 등급은 뽑기에서 등장하지 않고 유일 장비 3개 합성으로만 제작됩니다.</div>
      <div class="rate-note">${category.label} 뽑기에서는 해당 카테고리 부위만 균등하게 등장합니다.</div>
    </div>
  `;
}
function renderEquipmentSlots() {
    const filter = EQUIPMENT_CATEGORIES.find((category) => category.id === state.settings.equipmentFilter) || EQUIPMENT_CATEGORIES[0];
    const equippedCount = EQUIPMENT_SLOTS.filter((slot) => state.equipment.equipped[slot.id]).length;
    const previewItems = [...state.equipment.inventory]
        .filter((item) => filter.slots.includes(item.slot))
        .sort((left, right) => right.score - left.score);
    const previewPageSize = 6;
    const previewPages = Math.max(1, Math.ceil(previewItems.length / previewPageSize));
    const previewPage = clamp(Number(listPages.equipmentPreview || 1), 1, previewPages);
    listPages.equipmentPreview = previewPage;
    const visiblePreviewItems = previewItems.slice((previewPage - 1) * previewPageSize, previewPage * previewPageSize);
    const previewPagination = previewPages > 1
        ? `
      <div class="pagination-bar">
        <button type="button" class="page-button" data-page-target="equipmentPreview" data-page="${previewPage - 1}" ${previewPage === 1 ? "disabled" : ""}>이전</button>
        <span class="page-indicator">${previewPage} / ${previewPages}</span>
        <button type="button" class="page-button" data-page-target="equipmentPreview" data-page="${previewPage + 1}" ${previewPage === previewPages ? "disabled" : ""}>다음</button>
      </div>
    `
        : "";
    refs.equipmentSlots.innerHTML = `
    <div class="equipment-layout">
      <section class="loadout-board">
        <div class="loadout-stage">
          <div class="body-loadout">
            <div class="body-loadout-head">
              <div>
                <strong>원정대 장비창</strong>
                <span>${equippedCount} / ${EQUIPMENT_SLOTS.length} 장착</span>
              </div>
              <span class="loadout-score">전투 장비</span>
            </div>
            <div class="loadout-slots">
              <div class="avatar-figure" aria-hidden="true">
                <div class="body-aura"></div>
                <div class="body-part anatomy-head"></div>
                <div class="body-part anatomy-neck"></div>
                <div class="body-part anatomy-torso"></div>
                <div class="body-part anatomy-pelvis"></div>
                <div class="body-part anatomy-arm anatomy-arm-left"></div>
                <div class="body-part anatomy-arm anatomy-arm-right"></div>
                <div class="body-part anatomy-forearm anatomy-forearm-left"></div>
                <div class="body-part anatomy-forearm anatomy-forearm-right"></div>
                <div class="body-part anatomy-leg anatomy-leg-left"></div>
                <div class="body-part anatomy-leg anatomy-leg-right"></div>
                <div class="body-part anatomy-boot anatomy-boot-left"></div>
                <div class="body-part anatomy-boot anatomy-boot-right"></div>
              </div>
              ${EQUIPMENT_SLOTS.map((slot) => {
        const item = state.equipment.equipped[slot.id];
        return `
                    <div class="loadout-slot slot-${slot.id} ${item ? item.className : ""}">
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
        <div class="equipment-page-summary">
          <span>${filter.label} 보유 장비 ${previewItems.length}개</span>
          <strong>${previewPage} / ${previewPages}</strong>
        </div>

        <div class="equipment-preview-page">
          <div class="equipment-preview-grid">
            ${visiblePreviewItems.length
        ? visiblePreviewItems.map((item) => {
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
                    ${Array.from({ length: previewPageSize }, (_, index) => `
                      <div class="equipment-placeholder-cell">
                        <span>EMPTY</span>
                        <strong>#${index + 1}</strong>
                      </div>
                    `).join("")}
                  </div>
                </div>
              `}
          </div>
        </div>
        ${previewPagination}
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
            label: "방어력",
            value: formatNumber(stats.defense),
            detail: `기본 ${formatNumber(stats.base.defense)} / 업그레이드 +${formatNumber(stats.upgrade.defense)} / 장비 +${formatNumber(stats.gear.defense)}`,
        },
        {
            label: "최대 체력",
            value: formatNumber(stats.maxHp),
            detail: `기본 ${formatNumber(stats.base.maxHp)} / 업그레이드 +${formatNumber(stats.upgrade.maxHp)} / 장비 +${formatNumber(stats.gear.maxHp)}`,
        },
        {
            label: "공격 속도",
            value: `${stats.attackSpeed.toFixed(2)}/s`,
            detail: `기본 ${stats.base.attackSpeed.toFixed(2)} / 업그레이드 +${stats.upgrade.attackSpeed.toFixed(2)} / 장비 +${stats.gear.attackSpeed.toFixed(2)} / 상한 ${ATTACK_SPEED_CAP.toFixed(2)}`,
        },
        {
            label: "치명타 확률",
            value: formatPercent(stats.critChance),
            detail: `기본 ${formatPercent(stats.base.critChance)} / 업그레이드 +${formatPercent(stats.upgrade.critChance)} / 장비 +${formatPercent(stats.gear.critChance)}`,
        },
        {
            label: "치명타 피해",
            value: formatPercent(stats.critDamage - 1),
            detail: `업그레이드 +${formatPercent(stats.upgrade.critDamage)} / 장비 +${formatPercent(stats.gear.critDamage)} / 최종 ${stats.critDamage.toFixed(2)}x`,
        },
        {
            label: "체력 회복",
            value: `${stats.regen.toFixed(1)}/s`,
            detail: `기본 ${stats.base.regen.toFixed(1)} / 업그레이드 +${stats.upgrade.regen.toFixed(1)} / 장비 +${stats.gear.regen.toFixed(1)}`,
        },
        {
            label: "피해 경감",
            value: formatPercent(stats.damageReduction),
            detail: "방어력 기반으로 적의 공격 피해를 줄입니다.",
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
function renderPaginatedCollection(ref, key, entries, emptyMarkup, pageSize = 6) {
    const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
    const currentPage = clamp(Number(listPages[key] || 1), 1, totalPages);
    listPages[key] = currentPage;
    const startIndex = (currentPage - 1) * pageSize;
    const visibleEntries = entries.slice(startIndex, startIndex + pageSize);
    const itemsMarkup = visibleEntries.length ? visibleEntries.join("") : emptyMarkup;
    const paginationMarkup = totalPages > 1
        ? `
      <div class="pagination-bar">
        <button type="button" class="page-button" data-page-target="${key}" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""}>이전</button>
        <span class="page-indicator">${currentPage} / ${totalPages}</span>
        <button type="button" class="page-button" data-page-target="${key}" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""}>다음</button>
      </div>
    `
        : "";
    ref.innerHTML = `
    <div class="paged-panel">
      <div class="paged-page">
        <div class="paged-items">
          ${itemsMarkup}
        </div>
      </div>
      ${paginationMarkup}
    </div>
  `;
}
function renderDungeonList() {
    const entries = DUNGEONS.map((dungeon) => {
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
    });
    renderPaginatedCollection(refs.dungeonList, "dungeons", entries, "", 4);
}
function renderRecentDraws() {
    const emptyMarkup = `
      <div class="draw-card">
        <strong>최근 장비 없음</strong>
        <span>다이아를 사용해 장비를 뽑거나 합성을 진행하면 이곳에 표시됩니다.</span>
      </div>
    `;
    const entries = state.gacha.recentResults.map((item) => `
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
  `);
    renderPaginatedCollection(refs.recentDraws, "recentDraws", entries, emptyMarkup, 4);
}
function renderInventoryList() {
    const sorted = [...state.equipment.inventory].sort((left, right) => right.score - left.score);
    const emptyMarkup = `
      <div class="inventory-card">
        <strong>보관 장비 없음</strong>
        <span>장비를 획득하면 이곳에서 수동 장착할 수 있습니다.</span>
      </div>
    `;
    const entries = sorted.map((item) => {
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
    });
    renderPaginatedCollection(refs.inventoryList, "inventory", entries, emptyMarkup, 6);
}
function renderSynthesisList() {
    const groups = getSynthesisGroups();
    const emptyMarkup = `
      <div class="synthesis-card">
        <strong>합성 가능한 장비 없음</strong>
        <span>같은 부위, 같은 등급의 미장착 장비 3개가 모이면 합성을 진행할 수 있습니다.</span>
      </div>
    `;
    const entries = groups.map((group) => `
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
  `);
    renderPaginatedCollection(refs.synthesisList, "synthesis", entries, emptyMarkup, 4);
}
function renderRelicList() {
    const entries = RELICS.map((relic) => {
        const unlocked = relic.condition(state);
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
    });
    renderPaginatedCollection(refs.relicList, "relics", entries, "", 4);
}
function renderLog() {
    const entries = state.logs
        .map((entry) => `<div class="log-entry"><strong>[${entry.timestamp}]</strong> ${entry.text}</div>`);
    renderPaginatedCollection(refs.combatLog, "log", entries, `<div class="log-entry">전투 로그가 아직 없습니다.</div>`, 10);
}
function renderMenuViews() {
    refs.menuTabs.querySelectorAll("[data-menu]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.menu === state.settings.activeMenu);
    });
    document.querySelectorAll("[data-view]").forEach((view) => {
        view.classList.toggle("is-active", view.dataset.view === state.settings.activeMenu);
    });
}
function renderActiveManagement(stats) {
    renderMenuViews();
    const activeView = state.settings.activeMenu;
    if (!dirtyViews.has(activeView))
        return;
    if (activeView === "upgrades") {
        renderUpgradeList();
        renderBlessingList();
    }
    if (activeView === "equipment")
        renderEquipmentSlots();
    if (activeView === "inventory") {
        renderDrawInfoPanel();
        renderRecentDraws();
        renderInventoryList();
    }
    if (activeView === "synthesis")
        renderSynthesisList();
    if (activeView === "relics")
        renderRelicList();
    if (activeView === "dungeons")
        renderDungeonList();
    if (activeView === "status")
        renderStatusList(stats);
    if (activeView === "log")
        renderLog();
    dirtyViews.delete(activeView);
}
function getActionButton(event, selector) {
    const target = event.target;
    return target instanceof Element ? target.closest(selector) : null;
}
function bindPressAction(container, selector, handler) {
    let lastPointerDownAt = -Infinity;
    // The management lists are re-rendered every frame, so regular click events
    // can be lost before mouseup. Handle pointerdown first and keep click as a
    // keyboard/accessibility fallback.
    container.addEventListener("pointerdown", (event) => {
        if (typeof event.button === "number" && event.button !== 0)
            return;
        const button = getActionButton(event, selector);
        if (!button)
            return;
        lastPointerDownAt = event.timeStamp;
        handler(button);
        event.preventDefault();
    });
    container.addEventListener("click", (event) => {
        const button = getActionButton(event, selector);
        if (!button)
            return;
        if (event.timeStamp - lastPointerDownAt < 700) {
            event.preventDefault();
            return;
        }
        handler(button);
    });
}
function changeListPage(button) {
    listPages[button.dataset.pageTarget] = Math.max(1, Number(button.dataset.page || 1));
    markCollectionViewDirty(button.dataset.pageTarget);
}
function render() {
    const stats = getFinalStats();
    const worldInfo = getWorldInfo(state.progress.world);
    const enemy = state.combat.enemy;
    const heroHpRatio = clamp(state.hero.hp / Math.max(stats.maxHp, 1), 0, 1);
    const enemyHpRatio = enemy ? clamp(enemy.hp / Math.max(enemy.maxHp, 1), 0, 1) : 0;
    const isMaxHeroLevel = state.hero.level >= MAX_HERO_LEVEL;
    const expRatio = isMaxHeroLevel ? 1 : clamp(state.hero.exp / Math.max(state.hero.expToNext, 1), 0, 1);
    const nextDungeon = getNextDungeonUnlock();
    refs.goldValue.textContent = formatNumber(state.resources.gold);
    refs.diamondValue.textContent = formatNumber(state.resources.diamonds);
    refs.essenceValue.textContent = formatNumber(state.resources.essence);
    refs.progressValue.textContent = `${state.progress.world}-${state.progress.stage}`;
    refs.heroLevel.textContent = isMaxHeroLevel ? `Lv.${MAX_HERO_LEVEL} MAX` : `Lv.${state.hero.level}`;
    refs.heroStatus.textContent =
        state.combat.reviveTimer > 0
            ? `부활까지 ${state.combat.reviveTimer.toFixed(1)}초`
            : state.dungeons.active
                ? `${getDungeonById(state.dungeons.active.id)?.name || "던전"} 공략 중`
                : "캠페인 진행 중";
    refs.expValue.textContent = isMaxHeroLevel ? "MAX" : `${formatNumber(state.hero.exp)} / ${formatNumber(state.hero.expToNext)}`;
    refs.expBar.style.width = `${expRatio * 100}%`;
    refs.attackValue.textContent = formatNumber(stats.attack);
    refs.defenseValue.textContent = formatNumber(stats.defense);
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
    refs.enemyPower.textContent = enemy ? `ATK ${formatNumber(enemy.attack)} · 예상 ${formatNumber(getEnemyHitPreview(stats, enemy))}` : "-";
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
    const drawCategory = getDrawCategory(state.settings.drawCategory);
    refs.drawOneButton.textContent = `1회 ${drawCategory.label} 뽑기 (${DRAW_COST_SINGLE})`;
    refs.drawTenButton.textContent = `10회 ${drawCategory.label} 뽑기 (${DRAW_COST_MULTI})`;
    refs.drawOneButton.disabled = state.resources.diamonds < DRAW_COST_SINGLE;
    refs.drawTenButton.disabled = state.resources.diamonds < DRAW_COST_MULTI;
    refs.rateInfoButton.setAttribute("aria-expanded", String(rateModalOpen));
    refs.rateModal.hidden = !rateModalOpen;
    renderActiveManagement(stats);
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
    if (Date.now() - lastSave >= SAVE_INTERVAL_MS)
        saveState();
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
        const category = getDrawCategory(state.settings.drawCategory);
        drawEquipment(1, { categoryId: category.id, source: `${category.label} 뽑기` });
        render();
    });
    refs.drawTenButton.addEventListener("click", () => {
        const category = getDrawCategory(state.settings.drawCategory);
        drawEquipment(10, { categoryId: category.id, source: `${category.label} 10회 뽑기` });
        render();
    });
    refs.drawCategoryTabs.addEventListener("click", (event) => {
        const button = getActionButton(event, "[data-draw-category]");
        if (!button)
            return;
        state.settings.drawCategory = button.dataset.drawCategory;
        markViewsDirty("inventory");
        render();
    });
    refs.rateInfoButton.addEventListener("click", () => {
        rateModalOpen = true;
        markViewsDirty("inventory");
        render();
    });
    refs.rateModalClose.addEventListener("click", () => {
        rateModalOpen = false;
        markViewsDirty("inventory");
        render();
    });
    refs.rateModal.addEventListener("click", (event) => {
        if (event.target !== refs.rateModal)
            return;
        rateModalOpen = false;
        markViewsDirty("inventory");
        render();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !rateModalOpen)
            return;
        rateModalOpen = false;
        markViewsDirty("inventory");
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
        if (!button)
            return;
        rateModalOpen = false;
        state.settings.activeMenu = button.dataset.menu;
        markViewsDirty(state.settings.activeMenu);
        render();
    });
    bindPressAction(refs.upgradeList, "[data-upgrade], [data-upgrade-card]", (button) => {
        purchaseUpgrade(button.dataset.upgrade || button.dataset.upgradeCard);
        render();
    });
    bindPressAction(refs.blessingList, "[data-blessing], [data-blessing-card]", (button) => {
        purchaseBlessing(button.dataset.blessing || button.dataset.blessingCard);
        render();
    });
    bindPressAction(refs.equipmentSlots, "[data-equip-tab]", (filterButton) => {
        state.settings.equipmentFilter = filterButton.dataset.equipTab;
        listPages.equipmentPreview = 1;
        markViewsDirty("equipment");
        render();
    });
    bindPressAction(refs.equipmentSlots, "[data-equip]", (equipButton) => {
        equipItemById(Number(equipButton.dataset.equip));
        render();
    });
    bindPressAction(refs.equipmentSlots, "[data-page-target]", (button) => {
        changeListPage(button);
        render();
    });
    bindPressAction(refs.recentDraws, "[data-page-target]", (button) => {
        changeListPage(button);
        render();
    });
    bindPressAction(refs.dungeonList, "[data-dungeon]", (button) => {
        startDungeon(button.dataset.dungeon);
        render();
    });
    bindPressAction(refs.dungeonList, "[data-page-target]", (button) => {
        changeListPage(button);
        render();
    });
    bindPressAction(refs.inventoryList, "[data-equip]", (button) => {
        equipItemById(Number(button.dataset.equip));
        render();
    });
    bindPressAction(refs.inventoryList, "[data-page-target]", (button) => {
        changeListPage(button);
        render();
    });
    bindPressAction(refs.synthesisList, "[data-synth]", (button) => {
        const [slot, rarity] = button.dataset.synth.split("|");
        synthesizeItems(slot, rarity);
        render();
    });
    bindPressAction(refs.synthesisList, "[data-page-target]", (button) => {
        changeListPage(button);
        render();
    });
    bindPressAction(refs.relicList, "[data-page-target]", (button) => {
        changeListPage(button);
        render();
    });
    bindPressAction(refs.combatLog, "[data-page-target]", (button) => {
        changeListPage(button);
        render();
    });
    refs.equipmentSlots.addEventListener("click", (event) => {
        const filterButton = getActionButton(event, "[data-equip-tab]");
        if (filterButton) {
            return;
        }
        const equipButton = getActionButton(event, "[data-equip]");
        if (equipButton) {
            return;
        }
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
    if (!state.combat.enemy)
        createEnemy();
    render();
    window.requestAnimationFrame(frame);
}
init();
