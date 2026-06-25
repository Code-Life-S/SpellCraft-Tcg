# New Cards (15 spells) - TODO

Status: NOT STARTED

## Goal
Add 15 new spells to expand gameplay variety and strategic depth.

## Cards to Implement

### A1. Frost Bite (Morsure de Givre)
| Field | Value |
|-------|-------|
| Mana | 2 |
| Rarity | common |
| Effect | 4 damage if enemy is frozen, else 2 damage |
| Element | frost |
| Target | single |
| Mechanic | Conditional - synergizes with Cryomancer |

### A2. Chain Lightning (Eclairs en Chaine)
| Field | Value |
|-------|-------|
| Mana | 3 |
| Rarity | rare |
| Effect | 2 damage to target, 1 damage to each adjacent enemy |
| Element | lightning |
| Target | single (with ricochet) |
| Mechanic | Positioning - hits neighbors |

### A3. Power Surge (Surge de Pouvoir)
| Field | Value |
|-------|-------|
| Mana | 2 |
| Rarity | common |
| Effect | This turn, your spells cost 1 less |
| Element | arcane |
| Target | self |
| Mechanic | Temporary mana reduction |

### A4. Flame Trap (Piege de Flammes)
| Field | Value |
|-------|-------|
| Mana | 2 |
| Rarity | rare |
| Effect | Place invisible trap. 3 damage to first enemy that attacks |
| Element | fire |
| Target | self |
| Mechanic | Trap - triggers automatically |

### A5. Vampiric Drain (Drain Vampirique)
| Field | Value |
|-------|-------|
| Mana | 2 |
| Rarity | common |
| Effect | 4 damage to enemy, heal yourself for half |
| Element | arcane |
| Target | single |
| Mechanic | Partial lifesteal (half of damage) |

### A6. Hail Storm (Tempete de Grele)
| Field | Value |
|-------|-------|
| Mana | 3 |
| Rarity | rare |
| Effect | 1 damage to all enemies + freeze them |
| Element | frost |
| Target | all |
| Mechanic | Multi-effect - damage + freeze combined |

### A7. Arcane Ritual (Rituel Arcanique)
| Field | Value |
|-------|-------|
| Mana | 3 |
| Rarity | rare |
| Effect | Draw 2 cards, gain 5 shield |
| Element | arcane |
| Target | self |
| Mechanic | Multi-effect - draw + shield |

### A8. Weaken (Affaiblissement)
| Field | Value |
|-------|-------|
| Mana | 1 |
| Rarity | common |
| Effect | Target enemy loses 2 attack for this turn |
| Element | arcane |
| Target | single |
| Mechanic | Temporary attack debuff |

### A9. Energy Barrier (Bouclier d'Energie)
| Field | Value |
|-------|-------|
| Mana | 2 |
| Rarity | rare |
| Effect | Summon a shield with 3 HP. Shield absorbs damage for you |
| Element | arcane |
| Target | self |
| Mechanic | Defensive summon - absorbs damage until destroyed |

### A10. Arcane Echo (Echo Arcanique)
| Field | Value |
|-------|-------|
| Mana | 1 |
| Rarity | epic |
| Effect | Recast the last spell you played (cost 0) |
| Element | arcane |
| Target | special |
| Mechanic | Copy last spell - powerful combo |

### A11. Prophecy (Prophecie)
| Field | Value |
|-------|-------|
| Mana | 1 |
| Rarity | rare |
| Effect | Look at next 3 cards in deck, pick 1 |
| Element | arcane |
| Target | self |
| Mechanic | Selection - peek + pick |

### A12. Pyromantic Overload (Surcharge Pyromantique)
| Field | Value |
|-------|-------|
| Mana | 1 |
| Rarity | rare |
| Effect | Next fire spell this turn deals double damage. You take 2 damage |
| Element | fire |
| Target | self |
| Mechanic | Risk/Reward - double damage but self-damage |

### A13. Frost Nova v2 (Nova de Givre)
| Field | Value |
|-------|-------|
| Mana | 2 |
| Rarity | rare |
| Effect | Freeze + 1 damage to all enemies |
| Element | frost |
| Target | all |
| Class | cryomancer |
| Mechanic | Replaces current Frost Nova as Cryomancer card |

Note: cryo_frost_nova already exists but may not be assigned to Cryomancer deck. Verify.

### A14. Ice Barrier Upgraded (Barriere de Glace)
Already implemented: cryo_ice_barrier (8 shield, mana 2)

### A15. Light Hammer (Marteau de Lumiere)
| Field | Value |
|-------|-------|
| Mana | 4 |
| Rarity | epic |
| Effect | 3 damage to enemy. If it dies, deal 2 damage to all other enemies |
| Element | holy |
| Target | single |
| Mechanic | Explosion - conditional AOE on kill |

## Implementation Notes
- Add spells in `cards/spells.json`
- Add to unlock table `CARD_UNLOCK_TABLE` if needed
- Filter by class in deck builder and arena
- Test with elemental reactions system

## Priority
- Court terme (1-2 sessions): A1, A5, A6, A7, A8, A12 (6 cartes faciles)
- Moyen terme (3-5 sessions): A2, A3, A4, A9, A10, A11, A15 (7 cartes complexes)
- A13: already partially done
