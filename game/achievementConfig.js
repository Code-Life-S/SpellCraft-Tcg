var ACHIEVEMENT_CATEGORIES = [
    {
        id: 'progression',
        name: 'Progression',
        icon: '⭐',
        achievements: [
            'first_win', 'veteran', 'collector',
            'unlock_cryo', 'unlock_necro', 'unlock_electro', 'unlock_archimage', 'unlock_ombre',
            'class_master'
        ]
    },
    {
        id: 'combat',
        name: 'Combat',
        icon: '⚔️',
        achievements: [
            'pyromaniac', 'frozen_army', 'mana_djuggler', 'untouched',
            'survivor', 'iron_shield', 'speedrun', 'full_hand'
        ]
    },
    {
        id: 'arena',
        name: 'Arena',
        icon: '🏆',
        achievements: [
            'arena_champion', 'legendary_winner', 'boss_hunter',
            'invincible', 'full_draft'
        ]
    },
    {
        id: 'challenge',
        name: 'Challenge',
        icon: '🎯',
        achievements: [
            'triple_copy', 'chain_reaction', 'boss_rush'
        ]
    },
    {
        id: 'farm',
        name: 'Farm',
        icon: '🌾',
        achievements: [
            'level_10', 'level_20', 'xp_farmer'
        ]
    }
];

var ACHIEVEMENT_DEFINITIONS = {
    first_win: {
        name: 'Premiere victoire',
        description: 'Gagner votre premiere partie',
        longDescription: 'Remportez votre premiere victoire en mode Adventure ou Arena.',
        icon: '\uD83C\uDFC6',
        category: 'progression',
        type: 'simple',
        reward: { type: 'title', value: 'Novice' },
        checkUnlock: function(stats) { return stats.totalGamesWon >= 1; }
    },
    veteran: {
        name: 'Veteran',
        description: 'Gagner 50 parties',
        longDescription: 'Remportez 50 victoires au total (Adventure + Arena).',
        icon: '\uD83C\uDFC6',
        category: 'progression',
        type: 'counter',
        maxProgress: 50,
        reward: { type: 'title', value: 'Veteran' },
        getProgress: function(stats) { return stats.totalGamesWon; },
        checkUnlock: function(stats) { return stats.totalGamesWon >= 50; }
    },
    collector: {
        name: 'Collectionneur',
        description: 'Debloquer toutes les cartes neutres',
        longDescription: 'Atteignez le niveau 7 pour debloquer toutes les cartes neutres du jeu.',
        icon: '\uD83D\uDCDA',
        category: 'progression',
        type: 'simple',
        reward: { type: 'title', value: 'Collectionneur' },
        checkUnlock: function(stats) { return stats.level >= 7; }
    },
    unlock_cryo: {
        name: 'Cryomancien',
        description: 'Debloquer le Cryomancien',
        longDescription: 'Remportez une run arena avec le Pyromancien pour debloquer le Cryomancien.',
        icon: '\u2744\uFE0F',
        category: 'progression',
        type: 'simple',
        reward: { type: 'class', value: 'cryomancer' },
        checkUnlock: function(stats) {
            return stats.arenaWinsByClass && stats.arenaWinsByClass.pyromancer === true;
        }
    },
    unlock_necro: {
        name: 'Necromancien',
        description: 'Debloquer le Necromancien',
        longDescription: 'Remportez une run arena avec le Cryomancien pour debloquer le Necromancien.',
        icon: '\uD83D\uDC80',
        category: 'progression',
        type: 'simple',
        reward: { type: 'class', value: 'necromancer' },
        checkUnlock: function(stats) {
            return stats.arenaWinsByClass && stats.arenaWinsByClass.cryomancer === true;
        }
    },
    unlock_electro: {
        name: 'Electromancien',
        description: 'Debloquer l\'Electromancien',
        longDescription: 'Remportez une run arena avec le Necromancien pour debloquer l\'Electromancien.',
        icon: '\u26A1',
        category: 'progression',
        type: 'simple',
        reward: { type: 'class', value: 'electromancer' },
        checkUnlock: function(stats) {
            return stats.arenaWinsByClass && stats.arenaWinsByClass.necromancer === true;
        }
    },
    unlock_archimage: {
        name: 'Archimage',
        description: 'Debloquer l\'Archimage',
        longDescription: 'Remportez une run arena avec l\'Electromancien pour debloquer l\'Archimage.',
        icon: '\uD83D\uDD2E',
        category: 'progression',
        type: 'simple',
        reward: { type: 'class', value: 'archimage' },
        checkUnlock: function(stats) {
            return stats.arenaWinsByClass && stats.arenaWinsByClass.electromancer === true;
        }
    },
    unlock_ombre: {
        name: 'OmbreLumiere',
        description: 'Debloquer l\'OmbreLumiere',
        longDescription: 'Remportez une run arena avec l\'Archimage pour debloquer l\'OmbreLumiere.',
        icon: '\uD83C\uDF11',
        category: 'progression',
        type: 'simple',
        reward: { type: 'class', value: 'ombrelumiere' },
        checkUnlock: function(stats) {
            return stats.arenaWinsByClass && stats.arenaWinsByClass.archimage === true;
        }
    },
    class_master: {
        name: 'Maitre des classes',
        description: 'Debloquer toutes les classes',
        longDescription: 'Remportez une run arena avec chaque classe pour toutes les debloquer.',
        icon: '\uD83D\uDC51',
        category: 'progression',
        type: 'simple',
        reward: { type: 'title', value: 'Maitre des Classes' },
        checkUnlock: function(stats) {
            if (!stats.arenaWinsByClass) return false;
            var classes = ['pyromancer', 'cryomancer', 'necromancer', 'electromancer', 'archimage', 'ombrelumiere'];
            for (var i = 0; i < classes.length; i++) {
                if (!stats.arenaWinsByClass[classes[i]]) return false;
            }
            return true;
        }
    },

    pyromaniac: {
        name: 'Pyromane',
        description: 'Infliger 50+ degats de feu en 1 combat',
        longDescription: 'Infligez au total 50 degats de feu ou plus en un seul combat (Adventure ou Arena).',
        icon: '\uD83D\uDD25',
        category: 'combat',
        type: 'counter',
        maxProgress: 50,
        reward: { type: 'icon', value: '\uD83D\uDD25' },
        getProgress: function(stats) { return stats.combatStats.maxFireDamageInCombat || 0; },
        checkUnlock: function(stats) { return (stats.combatStats.maxFireDamageInCombat || 0) >= 50; }
    },
    frozen_army: {
        name: 'Armee de glace',
        description: 'Geler 5 ennemis differents en 1 tour',
        longDescription: 'Ayez 5 ennemis differents avec le statut Gele a la fin d\'un seul tour.',
        icon: '\u2744\uFE0F',
        category: 'combat',
        type: 'counter',
        maxProgress: 5,
        reward: { type: 'icon', value: '\u2744\uFE0F' },
        getProgress: function(stats) { return stats.combatStats.maxEnemiesFrozenInOneTurn || 0; },
        checkUnlock: function(stats) { return (stats.combatStats.maxEnemiesFrozenInOneTurn || 0) >= 5; }
    },
    mana_djuggler: {
        name: 'Brasseur de mana',
        description: 'Lancer 10+ sorts en 1 tour',
        longDescription: 'Lancez 10 sorts ou plus en un seul tour.',
        icon: '\uD83C\uDFAA',
        category: 'combat',
        type: 'counter',
        maxProgress: 10,
        reward: { type: 'title', value: 'Brasseur' },
        getProgress: function(stats) { return stats.combatStats.maxSpellsInOneTurn || 0; },
        checkUnlock: function(stats) { return (stats.combatStats.maxSpellsInOneTurn || 0) >= 10; }
    },
    untouched: {
        name: 'Sans egratignure',
        description: 'Gagner un combat sans perdre de PV',
        longDescription: 'Remportez un combat sans subir le moindre degat (PV max = PV restants).',
        icon: '\uD83D\uDC8E',
        category: 'combat',
        type: 'simple',
        reward: { type: 'title', value: 'Parfait' },
        checkUnlock: function(stats) { return stats.combatStats.hasWonWithoutDamage === true; }
    },
    survivor: {
        name: 'Survivant',
        description: 'Gagner un combat avec 1 PV restant',
        longDescription: 'Remportez un combat avec exactement 1 PV restant.',
        icon: '\uD83D\uDCAA',
        category: 'combat',
        type: 'simple',
        reward: { type: 'title', value: 'Survivant' },
        checkUnlock: function(stats) { return stats.combatStats.hasWonAt1HP === true; }
    },
    iron_shield: {
        name: 'Bouclier de fer',
        description: 'Accumuler 30+ bouclier en 1 combat',
        longDescription: 'Atteignez 30 points de bouclier ou plus en un seul combat.',
        icon: '\uD83D\uDEE1\uFE0F',
        category: 'combat',
        type: 'counter',
        maxProgress: 30,
        reward: { type: 'title', value: 'Forteresse' },
        getProgress: function(stats) { return stats.combatStats.maxShieldInCombat || 0; },
        checkUnlock: function(stats) { return (stats.combatStats.maxShieldInCombat || 0) >= 30; }
    },
    speedrun: {
        name: 'Speedrun',
        description: 'Gagner un combat en 2 tours ou moins',
        longDescription: 'Remportez un combat en 2 tours ou moins.',
        icon: '\u26A1',
        category: 'combat',
        type: 'simple',
        reward: { type: 'title', value: 'Eclair' },
        checkUnlock: function(stats) { return stats.combatStats.hasWonIn2TurnsOrLess === true; }
    },
    full_hand: {
        name: 'Plein aux as',
        description: 'Avoir 10+ cartes en main',
        longDescription: 'Atteignez 10 cartes ou plus dans votre main en un seul tour.',
        icon: '\u270B',
        category: 'combat',
        type: 'counter',
        maxProgress: 10,
        reward: { type: 'none', value: null },
        getProgress: function(stats) { return stats.combatStats.maxHandSize || 0; },
        checkUnlock: function(stats) { return (stats.combatStats.maxHandSize || 0) >= 10; }
    },

    arena_champion: {
        name: 'Champion d\'arene',
        description: 'Gagner 1 run arena',
        longDescription: 'Remportez votre premiere run arena (12 rounds + boss).',
        icon: '\uD83C\uDFDF\uFE0F',
        category: 'arena',
        type: 'simple',
        reward: { type: 'title', value: 'Champion' },
        checkUnlock: function(stats) { return stats.totalArenaRunsWon >= 1; }
    },
    legendary_winner: {
        name: 'Vainqueur legendaire',
        description: 'Gagner 1 run arena sans perdre de PV',
        longDescription: 'Remportez une run arena sans jamais subir de degat (PV max = PV restants au boss inclus).',
        icon: '\u2B50',
        category: 'arena',
        type: 'simple',
        reward: { type: 'title', value: 'Legendaire' },
        checkUnlock: function(stats) { return stats.combatStats.hasWonArenaWithoutDamage === true; }
    },
    boss_hunter: {
        name: 'Chasseur de boss',
        description: 'Battre les 3 boss differents',
        longDescription: 'Vainquez au moins une fois chaque boss : Roi Squelette, Mage Noir et Dragon.',
        icon: '\uD83D\uDC09',
        category: 'arena',
        type: 'counter',
        maxProgress: 3,
        reward: { type: 'icon', value: '\uD83D\uDC09' },
        getProgress: function(stats) {
            if (!stats.totalBossDefeated) return 0;
            var count = 0;
            if (stats.totalBossDefeated.skeleton_king) count++;
            if (stats.totalBossDefeated.dark_mage) count++;
            if (stats.totalBossDefeated.dragon) count++;
            return count;
        },
        checkUnlock: function(stats) {
            return stats.totalBossDefeated &&
                   stats.totalBossDefeated.skeleton_king >= 1 &&
                   stats.totalBossDefeated.dark_mage >= 1 &&
                   stats.totalBossDefeated.dragon >= 1;
        }
    },
    invincible: {
        name: 'Invincible',
        description: 'Gagner 3 runs arena consecutifs',
        longDescription: 'Remportez 3 runs arena d\'affilee sans defaite entre elles.',
        icon: '\uD83D\uDD31',
        category: 'arena',
        type: 'counter',
        maxProgress: 3,
        reward: { type: 'title', value: 'Invincible' },
        getProgress: function(stats) { return stats.arenaWinsConsecutive || 0; },
        checkUnlock: function(stats) { return (stats.arenaWinsConsecutive || 0) >= 3; }
    },
    full_draft: {
        name: 'Full deck',
        description: 'Completer 1 draft sans cartes de classe',
        longDescription: 'Terminez un draft arena en choisissant uniquement des cartes neutres (aucune carte de classe).',
        icon: '\uD83D\uDCCB',
        category: 'arena',
        type: 'simple',
        reward: { type: 'none', value: null },
        checkUnlock: function(stats) { return stats.combatStats.hasDraftedAllNeutral === true; }
    },

    triple_copy: {
        name: 'Le Collectionneur',
        description: 'Avoir 3 copies d\'une meme carte en main',
        longDescription: 'Ayez 3 copies de la meme carte dans votre main en meme temps.',
        icon: '\uD83D\uDCD1',
        category: 'challenge',
        type: 'simple',
        reward: { type: 'none', value: null },
        checkUnlock: function(stats) { return stats.combatStats.hasHad3CopiesOfSameCard === true; }
    },
    chain_reaction: {
        name: 'Reaction en chaine',
        description: '3 reactions elementaires en 1 combat',
        longDescription: 'Declenchez 3 reactions elementaires (Melt, Overload ou Shatter) en un seul combat.',
        icon: '\u2697\uFE0F',
        category: 'challenge',
        type: 'counter',
        maxProgress: 3,
        reward: { type: 'title', value: 'Alchimiste' },
        getProgress: function(stats) { return stats.combatStats.maxReactionsInCombat || 0; },
        checkUnlock: function(stats) { return (stats.combatStats.maxReactionsInCombat || 0) >= 3; }
    },
    boss_rush: {
        name: 'Boss Rush',
        description: 'Battre le boss en 5 tours ou moins',
        longDescription: 'Vainquez un boss en 5 tours ou moins.',
        icon: '\u23F1\uFE0F',
        category: 'challenge',
        type: 'simple',
        reward: { type: 'title', value: 'Boss Slayer' },
        checkUnlock: function(stats) { return stats.combatStats.hasKilledBossIn5TurnsOrLess === true; }
    },

    level_10: {
        name: 'Niveau 10',
        description: 'Atteindre le niveau 10',
        longDescription: 'Atteignez le niveau 10 de progression.',
        icon: '\u2B50',
        category: 'farm',
        type: 'simple',
        reward: { type: 'cardSkin', value: 'level_10_skin' },
        checkUnlock: function(stats) { return stats.level >= 10; }
    },
    level_20: {
        name: 'Niveau 20',
        description: 'Atteindre le niveau 20',
        longDescription: 'Atteignez le niveau 20 de progression.',
        icon: '\u2B50',
        category: 'farm',
        type: 'simple',
        reward: { type: 'heroSkin', value: 'level_20_skin' },
        checkUnlock: function(stats) { return stats.level >= 20; }
    },
    xp_farmer: {
        name: 'XP Farmer',
        description: 'Gagner 10 000 XP total',
        longDescription: 'Cumulez 10 000 points d\'experience au total.',
        icon: '\uD83C\uDF3E',
        category: 'farm',
        type: 'counter',
        maxProgress: 10000,
        reward: { type: 'none', value: null },
        getProgress: function(stats) { return stats.totalXpEarned || 0; },
        checkUnlock: function(stats) { return (stats.totalXpEarned || 0) >= 10000; }
    }
};

function getAchievementById(id) {
    return ACHIEVEMENT_DEFINITIONS[id] || null;
}

function getAchievementsByCategory(categoryId) {
    var cat = null;
    for (var i = 0; i < ACHIEVEMENT_CATEGORIES.length; i++) {
        if (ACHIEVEMENT_CATEGORIES[i].id === categoryId) {
            cat = ACHIEVEMENT_CATEGORIES[i];
            break;
        }
    }
    if (!cat) return [];
    var results = [];
    for (var j = 0; j < cat.achievements.length; j++) {
        var def = ACHIEVEMENT_DEFINITIONS[cat.achievements[j]];
        if (def) results.push({ id: cat.achievements[j], def: def });
    }
    return results;
}

function getAllAchievementIds() {
    var ids = [];
    for (var key in ACHIEVEMENT_DEFINITIONS) {
        if (ACHIEVEMENT_DEFINITIONS.hasOwnProperty(key)) {
            ids.push(key);
        }
    }
    return ids;
}

window.ACHIEVEMENT_CATEGORIES = ACHIEVEMENT_CATEGORIES;
window.ACHIEVEMENT_DEFINITIONS = ACHIEVEMENT_DEFINITIONS;
window.getAchievementById = getAchievementById;
window.getAchievementsByCategory = getAchievementsByCategory;
window.getAllAchievementIds = getAllAchievementIds;
