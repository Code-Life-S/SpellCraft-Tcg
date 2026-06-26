var BOSSES = [
    {
        id: 'skeleton_king',
        name: 'Roi Squelette',
        art: '\u{1F451}',
        health: 20,
        attack: 4,
        isBoss: true,
        bossMechanics: {
            type: 'skeleton_king',
            summonCount: 1
        }
    },
    {
        id: 'dark_mage',
        name: 'Mage Noir',
        art: '\u{1F9D9}',
        health: 15,
        attack: 3,
        isBoss: true,
        bossMechanics: {
            type: 'dark_mage',
            healPerTurn: 3
        }
    },
    {
        id: 'dragon',
        name: 'Dragon',
        art: '\u{1F409}',
        health: 30,
        attack: 3,
        ability: 'enrage',
        isBoss: true,
        bossMechanics: {
            type: 'dragon',
            attackRamp: 1
        }
    },
    {
        id: 'ash_phoenix',
        name: 'Phénix de Cendre',
        art: '\u{1F525}',
        health: 20,
        attack: 3,
        isBoss: true,
        bossMechanics: {
            type: 'ash_phoenix',
            resurrectHp: 20,
            atkBonus: 2,
            burnPerTurn: 1
        }
    },
    {
        id: 'crystal_golem',
        name: 'Golem de Cristal',
        art: '\u{1F9F0}',
        health: 22,
        attack: 2,
        isBoss: true,
        bossMechanics: {
            type: 'crystal_golem',
            shieldPerTurn: 2,
            shield: 0,
            reflectMax: 3
        }
    },
    {
        id: 'mind_specter',
        name: 'Spectre de l\'Esprit',
        art: '\u{1F47B}',
        health: 16,
        attack: 3,
        isBoss: true,
        bossMechanics: {
            type: 'mind_specter',
            minHandSize: 3
        }
    },
    {
        id: 'venom_spitter',
        name: 'Cracheur de Venin',
        art: '\u{1F40D}',
        health: 20,
        attack: 4,
        isBoss: true,
        bossMechanics: {
            type: 'venom_spitter',
            stacksPerTurn: 1
        }
    }
];

function getRandomBoss() {
    return BOSSES[Math.floor(Math.random() * BOSSES.length)];
}

window.BOSSES = BOSSES;
window.getRandomBoss = getRandomBoss;
