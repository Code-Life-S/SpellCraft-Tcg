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
    }
];

function getRandomBoss() {
    return BOSSES[Math.floor(Math.random() * BOSSES.length)];
}

window.BOSSES = BOSSES;
window.getRandomBoss = getRandomBoss;
