const ELEMENTAL_REACTIONS_ENABLED = true;

const STATUS_EFFECTS = {
    frozen: {
        name: 'Frozen',
        icon: '❄️',
        duration: 1,
        onTurnStart: 'skipAttack',
        description: 'Skips next attack',
        visualClass: 'status-frozen'
    },
    burning: {
        name: 'Burning',
        icon: '🔥',
        duration: 2,
        onTurnStart: { damage: 1 },
        description: 'Takes 1 damage at start of turn',
        visualClass: 'status-burning'
    },
    shocked: {
        name: 'Shocked',
        icon: '⚡',
        duration: null,
        onHit: { bonusDamage: 2 },
        description: 'Takes +2 damage from next hit',
        visualClass: 'status-shocked'
    }
};

const REACTIONS = {
    melt: {
        name: 'Melt',
        icon: '💧',
        trigger: { status: 'frozen', element: 'fire' },
        effect: { damageMultiplier: 2, removeStatus: true },
        description: 'Fire on Frozen: Double damage, removes Frozen'
    },
    overload: {
        name: 'Overload',
        icon: '💥',
        trigger: { status: 'shocked', element: 'fire' },
        effect: { aoeDamage: 2, removeStatus: true },
        description: 'Fire on Shocked: +2 AOE damage to all, removes Shocked'
    },
    shatter: {
        name: 'Shatter',
        icon: '🧊',
        trigger: { status: 'frozen', element: 'lightning' },
        effect: { bonusDamage: 3, removeStatus: true },
        description: 'Lightning on Frozen: +3 bonus damage, removes Frozen'
    }
};

const SPELL_ELEMENT_MAP = {
    fire_bolt: 'fire',
    flame_burst: 'fire',
    meteor: 'fire',
    frost_nova: 'frost',
    thunder_storm: 'lightning',
    divine_wrath: 'lightning',
    arcane_missiles: 'arcane',
    magic_missile: 'arcane',
    healing_light: 'healing',
    minor_heal: 'healing',
    greater_heal: 'healing'
};

const ELEMENT_STATUS_MAP = {
    frost: 'frozen',
    fire: 'burning',
    lightning: 'shocked'
};
