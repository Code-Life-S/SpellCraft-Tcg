# Task: Class System Implementation

## Goal
Implement a 3-class system (Pyromancien, Cryomancien, Necromancien) with class-specific passive abilities, cards, and deck/arena filtering.

## Progress

### Phase A - Flow Reorganization
- **deckStorageManager.js**: class field on decks (default 'pyromancer'), migration for existing decks
- **decks.json**: class field on all default decks
- **mainMenuScreen.js**: "Start Adventure" deck selection passes deck.class directly to game (no class-select intermediary), shows class icon in overlay; "Arene" button navigates to class-select with mode:'arena'
- **classSelectScreen.js**: supports mode:'arena' (3 random classes) and mode:'deck_builder' (all classes); fixed BaseScreen.call crash with class extends syntax
- **arenaBuilderScreen.js**: onBeforeShow captures classId, generateNewChoices filtered to neutral + class cards, startArena saves chosenClass in arena state, redirect to arena-adventure uses class from state
- **arenaAdventureScreen.js**: restores class from arena state on resume
- **gameScreen.js**: sets active class from deck.class in onBeforeShow

### Phase B - Deck Builder Class Filtering
- **deckListScreen.js**: shows class icon per deck, "New Deck" button navigates to class-select (mode:deck_builder)
- **deckBuilderScreen.js**: filters available cards to neutral + class-specific, saves class with deck, loads class from existing decks, shows class indicator in UI
- **deckListScreen.css**: added .deck-list-class style
- **mainMenuScreen.js**: added .deck-class-icon CSS for overlay

### Phase C - Class Cards (spells.json)
- **Pyromancien**: Conflagration (3 mana, 3 dmg AOE, fire element), with proper element/emoji
- **Cryomancien**: Blizzard (3 mana, freeze + 2 dmg AOE, frost element), Ice Barrier (8 shield, frost element), Frost Nova (freeze + 1 dmg AOE)
- **Necromancien**: Soul Drain (lifesteal 3, random), Soul Harvest (3 mana, lifesteal 6, single target), Bone Shield (5 shield)
- All class cards have `class` field, proper `element`, `lifesteal` where applicable, and `targetType`

### Phase D - Visual Class Distinction
- **SpellCardComponent.js**: adds `card-class-{class}` or `card-neutral` CSS class to card element
- **spellCardComponent.css**: class-specific `.card-art` gradients (pyromancer=orange, cryomancer=blue, necromancer=purple, neutral=lightgrey)
- Neutral card-art changed from white to lightgrey for better visual distinction

### Phase E - Passives, Lifesteal, Freeze
- **ClassManager.onEnemyDeath()**: returns `{health, maxHealth}` (Necro: +1 each)
- **gameScreen.js**: `this.maxHealth` tracking, lifesteal handling in all targetType cases, healing cap uses `this.maxHealth`, onEnemyDeath call updated, health display shows "X/Y"
- **arenaAdventureScreen.js**: lifesteal handling (single/all/random), `applyLifesteal()` method, onEnemyDeath call updated, health display shows "X/Y"
- **classConfig.js**: updated Necromancer passive description to "+1 PV max"
- Freeze applied automatically by `frost` element via `ELEMENT_STATUS_MAP`

### Phase F - Bug Fixes
- **Element type bug**: `applySpellEffect()` now passes `card.element` (not `spellType`) to `applyDamageWithElement()` in both gameScreen.js and arenaAdventureScreen.js - fixes freeze on Blizzard, burn on Conflagration
- **Arena text generation**: `ArenaStateManager.getCardDisplayText()` now includes `Lifesteal` and `Freeze` keywords so upgraded cards don't lose their keyword text
- **Arena builder class timing**: `onBeforeShow()` always regenerates choices for fresh arena (arenaCards.length === 0) after `chosenClassId` is set, overriding stale choices generated during `setupContent()` with wrong class
- **Arena between-round rewards**: `ArenaStateManager.generateAddCardChoices()` now filters by `classId` (neutral + current class only), same as initial draft

## Flow Summary
- **Start Adventure**: Main Menu -> Deck Select (shows class icon) -> Game (class from deck)
- **Arene**: Main Menu -> Class Select (3 random classes) -> Arena Builder (filtered: neutral + class) -> Arena (12 rounds, upgrades between rounds)
- **Deck Builder**: Deck List -> New Deck -> Class Select -> Deck Builder (filtered: neutral + class)

## Key Decisions
- Existing decks default to Pyromancien class
- Arena class is chosen per run (3 random from available)
- Deck class is stored in deck data, used for both filtering and game
- Arena state stores chosenClass for persistence across sessions
- `card.element` used for elemental damage/status; `spellType` reserved for visual effects only
- Neutral card-art background = lightgrey

## Commit History
- `c941c23` - Class system phases A-E (class select, deck filtering, passives, lifesteal, visuals)
- `fda224f` - Additional class system refinements
- `2b90b45` - Fix neutral card-art bg, element type bug, arena text generation, arena builder class timing
- `8650a25` - Fix arena between-round add card filtering (neutral + current class only)
