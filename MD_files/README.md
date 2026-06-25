# Spell Caster - Wave Defense TCG

A unique spell-focused wave defense game inspired by TCG mechanics, built with HTML5, CSS3, and JavaScript.

## Features

### Gameplay
- **Spell-Only Gameplay**: Cast powerful spells to defeat enemy waves
- **Endless Wave System**: Face increasingly challenging enemy waves with bosses every 10 waves
- **Mana System**: Strategic mana management (1-10, ramps each turn)
- **Spell Targeting**: Single target, area of effect, random targeting, and self-cast spells
- **Visual Effects**: Beautiful spell card rendering with rarity-based styling

### Classes (6 playable)
- **Pyromancer**: Fire damage focus, +1 fire damage passive
- **Cryomancer**: Frost/control, extended freeze duration passive
- **Necromancer**: Sustain/lifesteal, +1 max HP on enemy death passive
- **Electromancer**: Chain lightning, adjacent damage passive
- **Archimage**: Card cycling, draw every 3 spells passive
- **OmbreLumiere**: Risk/reward, spend HP for mana passive

### Elemental Reactions
- **Melt**: Fire on Frozen = double damage
- **Overload**: Fire on Shocked = +2 AOE damage
- **Shatter**: Lightning on Frozen = +3 bonus damage

### Enemy Abilities (8 types)
- Provocation, Enrage, Healer, Summoner
- Divine Shield, Lifesteal, Sacrifice, Camouflage

### Bosses (every 10 waves)
- **Roi Squelette**: Summons 2 skeletons each turn
- **Mage Noir**: 3 shield/turn, life drain, stun on shield break
- **Dragon**: Breath attack, enrage at <50% HP

### Game Modes
- **Endless Adventure**: Wave defense with bosses every 10 waves, save/resume support
- **Arena Mode**: Draft 10 cards, 12 rounds, upgrades between rounds, boss at round 12
- **Deck Builder**: Create/edit 30-card decks with class filtering

### Progression System
- XP gained from combat (10 per kill, 25 per round, 50/20 victory/defeat)
- Level up to unlock new cards (levels 1-7)
- Unlock new classes by winning arena runs with prerequisites
- Full localStorage persistence

## How to Play

### Adventure Mode
1. Select a deck from the deck list (shows class icon)
2. Click "Start Adventure" to begin endless wave defense
3. Each wave: draw cards, spend mana, cast spells to defeat enemies
4. Survive as many waves as possible! Bosses appear every 10 waves
5. You can quit and resume your adventure later

### Arena Mode
1. Click "Arena Mode" in main menu
2. Choose from 3 random classes
3. Draft 10 cards (pick 1 of 3, repeat until deck complete)
4. Play 12 rounds with escalating difficulty
5. Between rounds: heal + pick upgrade (add card, upgrade card, or bonus heal)
6. Beat round 12 boss to win!

### Deck Builder
1. Click "Deck Builder" in main menu
2. Create new deck (choose class) or edit existing
3. Filter cards by name, mana cost, rarity, or class
4. Build 30-card deck (max 2 copies per card)

## Planned Features

- [ ] Achievement system (24 planned achievements)
- [ ] 15 new spells (conditional damage, traps, echoes, etc.)
- [ ] Daily challenge mode (special rules, unique rewards)
- [ ] Real audio files (replace synthesized sounds)
- [ ] Steam page and demo

## Documentation

See `MD_files/` for detailed documentation:
- `README.md` - This file
- `ARCHITECTURE.md` - Technical architecture
- `CODING_STANDARDS.md` - Coding conventions
- `Vision_MVP_Store.md` - Business vision and MVP roadmap
- `Content_Roadmap.md` - Content planning (cards, achievements, etc.)
- `Gameplay_Idees.md` - Future gameplay ideas
- `DLC_Plan.md` - DLC planning
- `done/` - Completed tasks documentation
- `todo/` - Pending tasks documentation
- `archive/` - Historical snapshots

## Technologies

- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript (ES6+ classes)
- Web Audio API (synthesized sounds)

## License

This project is for educational purposes and game development learning.
