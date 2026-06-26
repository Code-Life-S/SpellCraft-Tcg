# Passive Bonuses System (Inter-Wave Upgrades)

Status: PLANIFIED
Priority: HIGH (after new cards)

Inspired by Balatro / Slay the Spire / Hades — pick a passive bonus every 5 waves to build unique synergies.

---

## Concept

Every 5 waves (5, 10, 15, 20...) in Adventure mode, the player is offered **3 random passive bonuses** and picks one. Bonuses stack and last the entire run.

This transforms the linear difficulty climb into a **build-crafting experience** — each run feels different and the player wants "just one more run" to try a new combination.

---

## Bonus pool (~17 bonuses)

### Common (higher probability)

| Name | ID | Effect |
|------|-----|--------|
| Main de Fer | iron_hand | Draw +1 card per turn |
| Font de Mana | mana_font | Start each wave with +1 max mana |
| Armure de Givre | frost_armor | Gain 2 shield at start of each wave |
| Soin Doux | gentle_heal | Heal 1 HP at start of each wave |
| Vitalite | vitality | +2 max HP permanently |
| Ronces | thorns | Deal 1 damage to attacker when hit |

### Rare

| Name | ID | Effect |
|------|-----|--------|
| Afflux | influx | Draw 2 cards per turn instead of 1 |
| Brasier | blaze | All spells deal +1 damage |
| Vampirisme | vampirism | Heal 1 HP for each spell cast |
| Economie | economy | All spells cost 1 less (min 1) |
| Coquille | shell | +1 permanent shield (does not reset between turns) |
| Alchimiste | alchemist | Elemental reactions deal +1 damage |
| Barriere | barrier | +5 max HP |

### Epic (lower probability)

| Name | ID | Effect |
|------|-----|--------|
| Echo Arcanique | arcane_echo | First spell each battle is cast twice |
| Vague de Vie | life_wave | Heal 1 HP per enemy killed |
| Eclipse | eclipse | 20% chance to duplicate a cast spell |

---

## UI Design

### Selection overlay (appears between waves 5, 10, 15...)

```
┌─────────────────────────────────────┐
│          Choose your bonus          │
│                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  │          │  │          │  │          │
│  │  Mana    │  │  Thorns  │  │  Blaze   │
│  │  Font    │  │          │  │          │
│  │          │  │          │  │          │
│  │ Common   │  │ Common   │  │ Rare     │
│  │          │  │          │  │          │
│  └──────────┘  └──────────┘  └──────────┘
└─────────────────────────────────────┘
```

### Active bonus display (in header during combat)

Show small icons next to the hero portrait indicating active passives (like Balatro joker slots but simpler).

---

## Implementation Plan

### Files to create
- `screens/components/passive-bonus/passiveBonusOverlay.js` — Selection UI overlay
- `screens/components/passive-bonus/passiveBonusOverlay.css` — Overlay styles
- `game/passiveBonusConfig.js` — Bonus definitions list

### Files to modify
- `screens/gameScreen.js` — Apply bonuses at turn start / wave start / spell cast
- `screens/gameScreen.html` — Add bonus icons container in header
- `screens/gameScreen.css` — Bonus icon styles
- `game/adventureStateManager.js` — Save active bonuses to run state

### Mechanics implementation details

Each bonus needs to hook into one of these game events:

| Event | Bonuses |
|-------|---------|
| **Turn start** | iron_hand (draw +1), mana_font (max mana), frost_armor (shield), gentle_heal (heal), shell (shield) |
| **Spell cast** | vampirism (heal), eclipse (duplicate), blaze (damage), economy (mana cost) |
| **Enemy death** | life_wave (heal) |
| **Player hit** | thorns (reflect) |
| **Reaction trigger** | alchemist (+1 damage) |
| **Start of run** | vitality (+max HP), barrier (+max HP), influx (draw) |

### Integration points in gameScreen.js

```
startNewTurn():
  → check iron_hand → draw 1 extra card
  → check mana_font → maxMana = Math.max(maxMana, currentTurn + 1)
  → check shell → playerShield += 1

spawnWave():
  → check frost_armor → playerShield += 2
  → check gentle_heal → heal 1 HP

castSpell() / applySpellEffect():
  → check vampirism → heal 1 HP
  → check blaze → damage += 1
  → check economy → mana cost -1
  → check eclipse → 20% duplicate

damagePlayer():
  → check thorns → deal 1 damage to attacker
```

---

## Compatibility

### Arena mode
- Too powerful to give free passives. Alternative: offer **1-time consumable bonuses** between arena rounds instead of permanent passives.
- Or: keep passives but at reduced effect (e.g., +0.5 shield instead of +2).

### Adventure mode (primary target)
- Full system as described above.
- Bonuses reset each run (saved in AdventureStateManager).

---

## Effort estimate

| Task | Sessions |
|------|----------|
| Create passiveBonusConfig.js | 0.5 |
| Create bonus overlay UI (HTML + JS + CSS) | 1.5 |
| Integrate into gameScreen.js turn/wave/spell hooks | 2 |
| Save/load bonus state in AdventureStateManager | 0.5 |
| Add bonus icons to header | 0.5 |
| Testing & balance tuning | 1 |
| **Total** | **~6 sessions** |
