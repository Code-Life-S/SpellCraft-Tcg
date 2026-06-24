var CLASSES = [
    {
        id: 'pyromancer',
        name: 'Pyromancien',
        art: '\u{1F525}',
        description: 'Maitre du feu offensif. Tous vos sorts de Feu infligent +1 degat.',
        passive: 'fire_damage_bonus',
        passiveDesc: 'Sorts Feu +1 degat',
        cards: [
            { id: 'pyro_fire_ball', count: 1 },
            { id: 'pyro_flame_shield', count: 1 },
            { id: 'pyro_conflagration', count: 1 }
        ]
    },
    {
        id: 'cryomancer',
        name: 'Cryomancien',
        art: '\u{2744}\uFE0F',
        description: 'Maitre du givre et du controle. Vos gels durent 1 tour de plus.',
        passive: 'cryo_frozen_extension',
        passiveDesc: 'Gele +1 tour',
        cards: [
            { id: 'cryo_ice_barrier', count: 1 },
            { id: 'cryo_blizzard', count: 1 },
            { id: 'cryo_frost_armor', count: 1 }
        ]
    },
    {
        id: 'electromancer',
        name: 'Electromancien',
        art: '\u26A1',
        description: 'Maitre de la foudre en chaine. Vos sorts de Foudre infligent +2 degats aux ennemis Electrises.',
        passive: 'electro_overcharge',
        passiveDesc: 'Foudre +2 sur Electrise',
        cards: [
            { id: 'electro_lightning_bolt', count: 1 },
            { id: 'electro_chain_lightning', count: 1 },
            { id: 'electro_static_draw', count: 1 }
        ]
    },
    {
        id: 'necromancer',
        name: 'Necromancien',
        art: '\u{1F480}',
        description: 'Maitre de la mort et du sustain. Gagnez +1 PV max quand un ennemi meurt.',
        passive: 'necro_heal_on_death',
        passiveDesc: '+1 PV max quand ennemi meurt',
        cards: [
            { id: 'necro_soul_drain', count: 1 },
            { id: 'necro_bone_shield', count: 1 },
            { id: 'necro_soul_harvest', count: 1 }
        ]
    },
    {
        id: 'archimage',
        name: 'Archimage',
        art: '\u{1F52E}',
        description: 'Maitre des combos arcaniques. Tous les 3 sorts, piochez 1 carte.',
        passive: 'archimage_spell_counter',
        passiveDesc: 'Tous les 3 sorts, pioche 1',
        cards: [
            { id: 'mana_orb', count: 1 },
            { id: 'arcane_explosion', count: 1 },
            { id: 'deja_vu', count: 1 }
        ]
    },
    {
        id: 'ombrelumiere',
        name: 'OmbreLumiere',
        art: '\u{1F300}',
        description: 'Maitre du risque et de la recompense. Sacrifiez 2 PV pour 1 mana (1 fois/tour).',
        passive: 'ombrelumiere_hp_to_mana',
        passiveDesc: 'PV -> Mana (1x/tour)',
        cards: [
            { id: 'dark_pact', count: 1 },
            { id: 'life_drain', count: 1 },
            { id: 'shadow_explosion', count: 1 }
        ]
    }
];

var CLASS_ELEMENT_MAP = {
    pyromancer: 'fire',
    cryomancer: 'frost',
    necromancer: 'arcane',
    electromancer: 'lightning',
    archimage: 'arcane',
    ombrelumiere: 'arcane'
};

function getClassById(classId) {
    return CLASSES.find(function(c) { return c.id === classId; }) || null;
}

window.CLASSES = CLASSES;
window.CLASS_ELEMENT_MAP = CLASS_ELEMENT_MAP;
window.getClassById = getClassById;
