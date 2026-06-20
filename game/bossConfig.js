var BOSSES = [
    {
        id: 'skeleton_king',
        name: 'Roi Squelette',
        art: '\u{1F451}',
        health: 20,
        attack: 4,
        ability: 'summoner',
        isBoss: true,
        bossMechanics: {
            type: 'skeleton_king',
            summonCount: 2
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
            shieldPerTurn: 3,
            lifeDrain: 2
        }
    },
    {
        id: 'dragon',
        name: 'Dragon',
        art: '\u{1F409}',
        health: 30,
        attack: 5,
        ability: 'enrage',
        isBoss: true,
        bossMechanics: {
            type: 'dragon',
            breathDamage: 2
        }
    }
];

function getRandomBoss() {
    return BOSSES[Math.floor(Math.random() * BOSSES.length)];
}

window.BOSSES = BOSSES;
window.getRandomBoss = getRandomBoss;
