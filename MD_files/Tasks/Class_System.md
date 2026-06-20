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

### Flow Summary
- **Start Adventure**: Main Menu -> Deck Select (shows class icon) -> Game (class from deck)
- **Arene**: Main Menu -> Class Select (3 random classes) -> Arena Builder (filtered: neutral + class) -> Arena
- **Deck Builder**: Deck List -> New Deck -> Class Select -> Deck Builder (filtered: neutral + class)

## Remaining
- Test all flows in browser
- Verify class passives work in both game modes

## Key Decisions
- Existing decks default to Pyromancien class
- Arena class is chosen per run (3 random from available)
- Deck class is stored in deck data, used for both filtering and game
- Arena state stores chosenClass for persistence across sessions
