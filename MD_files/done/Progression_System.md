# Progression System - COMPLETED

Status: COMPLETED

## Goal
Implement XP, levels, card unlocking, and class unlocking system.

## What Was Implemented

### XP and Levels
- XP gained: 10 per kill, 25 per round/wave, 50 victory / 20 defeat
- Level threshold: `level * 100` XP
- Level-up loop capped at 50 iterations
- Storage: localStorage key `spellcaster_progression`

### Card Unlocking (Neutral Cards)
- 10 cards available at level 1
- 6 cards unlocked at levels 2-7:
  - Level 2: Mystical Insight
  - Level 3: Greater Heal
  - Level 4: Thunder Storm
  - Level 5: Arcane Missiles
  - Level 6: Meteor
  - Level 7: Divine Wrath
- Locked cards shown greyed in deck builder with required level

### Class Unlocking
- Pyromancer: unlocked by default
- Cryomancer: win arena run with Pyromancer
- Necromancer: win arena run with Cryomancer
- Electromancer: win arena run with Necromancer
- Archimage: win arena run with Electromancer
- OmbreLumiere: win arena run with Archimage

### UI Display
- XP bar and level in main menu
- Next unlock indication (card or class)

## File
- `game/playerProgressionManager.js`

## Key Methods
- `addXP(amount)` - Add XP and check level-ups
- `getLevel()` - Get current level
- `getXP()` - Get current XP
- `isCardUnlocked(cardId)` - Check if card is unlocked
- `isClassUnlocked(classId)` - Check if class is unlocked
- `getAvailableClasses()` - Get list of unlocked classes
