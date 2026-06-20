const ENEMY_ABILITIES = {
    provoke: {
        name: 'Provocation',
        icon: '\u{1F6E1}\uFE0F',
        desc: 'Bloque le ciblage des autres ennemis',
        trigger: 'targeting'
    },
    enrage: {
        name: 'Enrage',
        icon: '\u{1F525}',
        desc: 'Gagne +2 attaque sous 50% PV',
        trigger: 'damage',
        bonusAttack: 2
    },
    healer: {
        name: 'Soigneur',
        icon: '\u{1F49A}',
        desc: 'Soigne un allie de 2 en fin de tour',
        trigger: 'endOfTurn',
        healAmount: 2
    },
    summoner: {
        name: 'Invocateur',
        icon: '\u{1F52E}',
        desc: 'Invoque un sbire 1/1 en fin de tour',
        trigger: 'endOfTurn'
    }
};

const SUMMON_TEMPLATES = [
    { name: 'Skeleton', art: '\u{1F480}', health: 1, maxHealth: 1, attack: 1 },
    { name: 'Bat', art: '\u{1F987}', health: 1, maxHealth: 1, attack: 1 },
    { name: 'Slime', art: '\u{1F9A0}', health: 1, maxHealth: 1, attack: 1 },
    { name: 'Rat', art: '\u{1F400}', health: 1, maxHealth: 1, attack: 1 },
    { name: 'Imp', art: '\u{1F47F}', health: 1, maxHealth: 1, attack: 1 }
];

function getRandomAbilityKey() {
    const keys = Object.keys(ENEMY_ABILITIES);
    return keys[Math.floor(Math.random() * keys.length)];
}

function getAbilityForRound(round) {
    if (round <= 3) return null;
    if (round <= 7) {
        const available = ['provoke', 'healer'];
        return available[Math.floor(Math.random() * available.length)];
    }
    return getRandomAbilityKey();
}

function getRandomAbilityChance() {
    if (Math.random() < 0.5) return null;
    return getRandomAbilityKey();
}

function hasActiveProvoker(enemies) {
    return enemies.some(function(e) {
        return e.ability === 'provoke' && !e.isDying && e.health > 0;
    });
}

function checkAndTriggerEnrage(enemy) {
    if (enemy.ability !== 'enrage' || enemy.enraged) return false;
    if (enemy.health <= Math.ceil(enemy.maxHealth / 2)) {
        enemy.enraged = true;
        enemy.attack += ENEMY_ABILITIES.enrage.bonusAttack;
        return true;
    }
    return false;
}

function getBestHealTarget(enemies) {
    let target = null;
    let lowestRatio = 1;
    enemies.forEach(function(e) {
        if (e.isDying || e.health <= 0) return;
        var ratio = e.health / e.maxHealth;
        if (ratio < lowestRatio) {
            lowestRatio = ratio;
            target = e;
        }
    });
    return target;
}

function createSummonMinion(id) {
    var template = SUMMON_TEMPLATES[Math.floor(Math.random() * SUMMON_TEMPLATES.length)];
    return {
        id: id,
        name: template.name,
        art: template.art,
        health: template.health,
        maxHealth: template.maxHealth,
        attack: template.attack,
        isDying: false,
        canAttack: false
    };
}

window.ENEMY_ABILITIES = ENEMY_ABILITIES;
window.getRandomAbilityKey = getRandomAbilityKey;
window.getAbilityForRound = getAbilityForRound;
window.getRandomAbilityChance = getRandomAbilityChance;
window.hasActiveProvoker = hasActiveProvoker;
window.checkAndTriggerEnrage = checkAndTriggerEnrage;
window.getBestHealTarget = getBestHealTarget;
window.createSummonMinion = createSummonMinion;
