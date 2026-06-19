# Arena mode task

For this task, you will:
- Replace the "Credits" menu in the mainMenuScreen by a new menu entry "Arena mode"
- Place our new "Arena mode" between "Start adventure" and "Deck builder" entries
- Create a new Arena mode (explanation and rules below)

# Arena mode gameplay
The arena mode will be based on Hearthstone's arena mode.
We will split this arena mode in two screens:
- arenaBuilder screen : the player will create its arena deck
- arenaAdventure screen : The player will play a game, using gamescreen, with his arena deck and with a few special rules for the arena mode.

# Arena mode : Task part 1

For now we will focus on creating the new screen "arenaBuilder"
In the Arena builder screen, we will display cards to the player, that he has to choose between, to create his arena deck.
To init that game mode we will create a new empty "arena" deck.
If the player goes back and forth between mainmenu and arena mode, if he had an unfinished arena, we will ask the player if he prefers to
- New Arena : we can delete a previous arena deck if we had one, and create a fresh new arena deck
- Resume Arena : the player will be able to continue deckbuilding his arena if he was in the deck building phase
And later when building arenaAdventure adventure screen, if in arenaAdventure phase, player can resume arena adventure or start a new arena. But lets firt focus on the arenaBuilder phase again.

We will have iteration in arenaBuilder phase where we :
- Display 3 cards that the player can choose by clicking on
- When a card is chosen between the 3, this card will be added to the arena deck
- We replace the 3 cards by 3 other random cards for the player to choose from again, and so on, until the deck contains 10 cards.

When the arena deck contains 10 cards (make sure we can change this value in code easily, maybe by using a constant) we display a button "Start Arena", instead of displaying the 3 cards.
For now the "Start Arena" button does nothing, but in a next task we will make it launch the arenaAdventure phase.

---

## Arena Adventure Design (Current Task)

### Game Concept
A roguelike-style arena inspired by Hearthstone + Darkest Dungeon:
- 12 rounds to win, 1 loss = run over
- Start with your drafted 10-card deck
- Each round is a combat encounter with escalating enemies
- Between rounds: random heal + pick 1 of 3 upgrades
- Quick, addictive, high variance but winnable

### Stats Progression

| Round | Hand Size | Max HP |
|-------|-----------|--------|
| 1-3 | 3 cards | 30 |
| 4-6 | 4 cards | +10 => 40 |
| 7-9 | 5 cards | +10 => 50 |
| 10-12 | 5 cards | +10 => 60 |

### Enemy Scaling (per round)
- Count: 2 + floor(round / 3) enemies
- HP: starts at ~3, scales to ~18-20 by round 12
- Attack: starts at 1-2, scales to ~8-10
- Random variation within bands for unpredictability

### Between-Round Flow
Round Complete -> Heal (random between min and full) -> Max HP upgrade at milestones -> Pick 1 of 3 upgrade choices

Heal formula: `minHeal = 5 + round*2 + minHealBonus`, actual heal = random(minHeal, maxPossible)

### Upgrade Pool
Each between-round shows 3 card-style upgrade choices:

1. **Add a new card** -- pick a random card from full pool, add to deck
2. **Upgrade a card in deck** -- pick a random card from deck, apply random bonus:
   - +X damage / +X healing / +X shield
   - -1 mana cost (minimum 1)
   - Also draw 1 card on cast
   - Also heal 2 HP on cast
   - Extra hit (random-target cards)
3. **Permanent bonus** -- +3 to minimum between-round heal

### Implementation Phases

| Phase | Description |
|-------|-------------|
| 1 | Expand arena state schema & upgrade system logic |
| 2 | Create ArenaAdventureScreen shell (HTML/CSS/JS) |
| 3 | Implement combat rounds (enemy scaling, turns, mana, hand) |
| 4 | Implement between-round upgrades UI & healing |
| 5 | Wire Start Arena button & handle resume logic |
| 6 | End-of-run screen (victory/defeat) |

---

### Phase 7: Component Extraction - Visual Effects & Enemy Board (COMPLETED)
**What was implemented:**
- Created `VisualEffectsComponent` (`screens/components/visual-effects/`): shared spell impacts, floating numbers (damage/heal/shield), screen shake, particle trails, AOE particles. ~320 lines removed from gameScreen.js, ~80 from arenaAdventureScreen.js.
- Created `EnemyBoardComponent` (`screens/components/enemy-board/`): shared enemy rendering, targeting (targetable class), damage/attack effects, 4 death animations for game screen (spin/dissolve/explode/fade), simple death effect for arena, targeting instruction overlay. ~180 lines CSS removed from gameScreen.css, ~60 from arenaAdventureScreen.css.
- Component CSS loaded via `window.templateLoader.loadCSS()` in both screens.
- Both components registered in index.html before gameScreen.js.

**Status:** COMPLETED - Visual effects and enemy board now shared components

### Phase 8: Component Extraction - Player Hand, Deck Tracker, Action History (COMPLETED)
**What was implemented:**
- Created `PlayerHandComponent` (`screens/components/player-hand/`): card element creation with mana gray-out, hand rendering, selection (.selected), casting animation (.casting).
- Created `DeckTrackerComponent` (`screens/components/deck-tracker/`): renders deck count + card list sorted by mana/name, uses data source callbacks (getDeckInfo, getCardCounts, getCardById).
- Created `ActionHistoryComponent` (`screens/components/action-history/`): renders action entries with turn prefix, keeps last 25, uses addEntry/setEntries/clear.
- All 5 components registered in index.html before gameScreen.js.
- Both gameScreen.js (~650 lines removed) and arenaAdventureScreen.js (~200 lines removed) refactored to use all 5 components.
- Removed duplicated CSS from both gameScreen.css and arenaAdventureScreen.css.

**Status:** COMPLETED - All reusable components extracted, both screens refactored

### Phase 9: Arena Layout Integration (COMPLETED)
**What was implemented:**
- Restructured `arenaAdventureScreen.html` to match game screen layout:
  - Top `.game-info` bar with round counter, enemies remaining, game status, concede button
  - Middle `.main-game-area` with left sidebar (action history), center (enemy battlefield), right sidebar (deck tracker)
  - Bottom `.player-area` with hero portrait (health/shield), player hand, mana/end turn
  - Kept arena overlays (round victory, game over) unchanged
- Rewrote `arenaAdventureScreen.css`:
  - Added shared layout styles from gameScreen.css (main-game-area, sidebars, center-battlefield, player-area, deck tracker, history)
  - Kept arena-specific overlays, upgrades, concede button, card sizing (110x140px)
  - Removed old layout styles (adventure-header, adventure-battlefield, adventure-hand-area, etc.)
- Updated `arenaAdventureScreen.js`:
  - Added DeckTrackerComponent and ActionHistoryComponent creation with data source wiring
  - Added `addToHistory()` method for game history
  - Updated `updateUI()` for new selectors (player-health, player-shield, enemies-count, game-status)
  - Screen shake now targets `.game-board` instead of `.adventure-battlefield`
  - History entries added for spell casts, enemy attacks, healing, turn starts
  - Updated getFallbackHTML() to match new HTML structure
  - All old selector references removed

**Status:** COMPLETED - Arena now shares identical layout with game screen + DeckTracker + ActionHistory

## Implementation Progress

### Phase 1: Main Menu Updates (COMPLETED)
**What was implemented:**
- Replaced "Credits" button with "Arena Mode" button in `screens/mainmenu/mainMenuScreen.html`
- Positioned Arena Mode button between "Start Adventure" and "Deck Builder" as requested
- Updated event handlers in `screens/mainMenuScreen.js`:
  - Removed credits event listener and `openCredits()` method
  - Added arena mode event listener and `openArenaMode()` method
  - Added placeholder message "Arena Mode coming soon!" for testing
- Arena Mode button uses arena icon with description "Draft cards and battle in the arena"

**Status:** COMPLETED - Main menu now has Arena Mode button in correct position with proper event handling

### Phase 2: Arena Builder Screen Creation (COMPLETED)
**UI Layout Mockup:**
```
+-------------------------------------------------------------------------------+
| [Back] ARENA BUILDER [New Arena] [Resume Arena]                              | Header
+-------------------------------------------+-----------------------------------+
|                                           |                                   |
|              CARD SELECTION AREA          |           ARENA DECK              |
|                                           |                                   |
|  +-------------------------------------+  | +-------------------------------+ |
|  |          Choose Your Card           |  | |         Arena Progress        | |
|  |                                     |  | |         Cards: 3/10           | |
|  |  +-----+      +-----+      +-----+  |  | +-------------------------------+ |
|  |  |Fire |      |Thun |      |Heal |  |  |                                   |
|  |  |Bolt |      |Storm|      |Light|  |  | +-Current Cards---------------+ |
|  |  | 1M  |      | 3M  |      | 2M  |  |  | | Fire Bolt                   | |
|  |  | 3D  |      | 2D  |      | 5H  |  |  | | Thunder Storm               | |
|  |  +-----+      +-----+      +-----+  |  | | Healing Light               | |
|  |                                     |  | | ...                         | |
|  |  [Click a card to add it to your   |  | | (scroll)                    | |
|  |   arena deck]                       |  | +-----------------------------+ |
|  +-------------------------------------+  |                                   |
|                                           | +-Mana Curve-----------------+ |
|  OR (when deck complete):                 | | ####  ##                   | |
|  +-------------------------------------+  | | ####  ## #                 | |
|  |                                     |  | | ####  ## #                 | |
|  |       Arena Deck Complete!          |  | | 1 2 3 4 5 6+               | |
|  |                                     |  | +-----------------------------+ |
|  |     [START ARENA]                   |  |                                   |
|  |                                     |  |                                   |
|  +-------------------------------------+  |                                   |
+-------------------------------------------+-----------------------------------+
```

**What was implemented:**
- Created `screens/arena/arenaBuilderScreen.html` - Complete UI structure following approved mockup
- Created `screens/arena/arenaBuilderScreen.css` - Full styling with responsive design and animations
- Created `screens/arena/arenaBuilderScreen.js` - Complete logic extending BaseScreen class
- Arena Builder Features implemented:
  - Display 3 random cards for selection with card choice UI
  - Track arena deck progress (0/10 cards) with progress bar and counter
  - Add selected cards to arena deck with visual feedback
  - Show "Start Arena" button when deck is complete (10 cards)
  - Handle resume/new arena logic with localStorage persistence
  - Mana curve visualization and current cards list
  - Configurable ARENA_DECK_SIZE constant (set to 10)
- Registered arena-builder screen in ScreenManager (app.js)
- Updated mainMenuScreen.js to navigate to arena builder

**Status:** COMPLETED - Arena Builder screen fully functional with card drafting, progress tracking, and state persistence

### Phase 3: Arena Deck Management (COMPLETED)
**What was implemented:**
- Arena deck constants added (ARENA_DECK_SIZE = 10, CARDS_PER_CHOICE = 3)
- Arena state persistence implemented using localStorage with ARENA_STATE_KEY
- Arena deck management with arenaCards array and progress tracking
- Save/load arena state functionality for resume/new arena logic

**Status:** COMPLETED - Arena deck management fully implemented with state persistence

### Phase 4: Screen Manager Integration (COMPLETED)
**What was implemented:**
- Registered arenaBuilder screen in ScreenManager (app.js)
- Added navigation logic from main menu to arena builder
- Updated `openArenaMode()` method to navigate to arena-builder screen
- Arena builder properly integrated into screen management system

**Status:** COMPLETED - Arena Builder fully integrated into application

### Phase 5: Arena Adventure - Bug Fixes (COMPLETED)

**Issues Found & Fixed:**
- **Root Cause**: Template loading failure (CSS/HTML fetch) left `this.element.innerHTML` empty. `startRound()` then queried non-existent elements (`querySelector` returned null), throwing errors that halted `initialize()`. The screen manager hid the builder but could not show the adventure -- resulting in a blank screen.
- **Fix 1**: Added inline fallback HTML (`getFallbackHTML()`) in `setupContent` catch block with all required element IDs
- **Fix 2**: Wrapped `startRound()` in try-catch; on failure shows error message with reset button
- **Fix 3**: Made `bindEvents()` null-safe -- each `querySelector` result is checked before adding event listeners
- **Fix 4**: Added `getErrorHTML()` method for graceful error display with "Reset and Reload" option

### Phase 6: Arena Adventure State & Upgrade System (COMPLETED)
**What was implemented:**
- Created `screens/arena/arenaStateManager.js` - Arena state management utility with:
  - `getState/saveState/clearState` for localStorage persistence
  - `getHandSize(round)` - returns 3/4/5 cards based on round
  - `getMaxHealth(round)` - returns 30/40/50/60 based on milestones (3/6/9)
  - `getUpgradedCard(card, upgrades)` - applies upgrade bonuses to card instances
  - `generateUpgradeChoices()` - generates 3 random upgrade choices (add card, upgrade card, bonus heal)
  - `applyUpgradeChoice(state, choice)` - applies the selected upgrade to arena state
  - `calculateHealAmount(state)` - calculates random heal between min and full, scaling with round
- Updated `arenaBuilderScreen.js`:
  - Cards now get unique `instanceId` on selection for upgrade tracking
  - Arena state includes `phase` field (builder/adventure)
  - Phase 4 save includes adventure fields (currentRound, playerHealth, deckUpgrades, etc.)
  - If existing arena is in adventure phase, builder redirects to adventure screen
  - "Start Arena" button writes full adventure state and navigates to adventure screen

### Phase 6: Arena Adventure Screen Creation (COMPLETED)
**What was implemented:**
- Created `screens/arena/arenaAdventureScreen.html` - Complete UI structure:
  - Top info bar with round counter, HP, deck count, concede button
  - Battlefield with enemy area, divider, and hero portrait with health bar
  - Hand area with mana display and end turn button
  - Round overlay for between-round healing and upgrades
  - Game over overlay for victory/defeat display
- Created `screens/arena/arenaAdventureScreen.css` - Full styling:
  - Dark fantasy theme matching game aesthetic
  - Enemy styling with targeting pulse animation
  - Card styling matching builder cards
  - Between-round overlay with upgrade card choices
  - Spell impact visual effects (fire, lightning, frost, arcane, healing)
  - Floating damage/heal numbers
  - Responsive design for smaller screens
- Created `screens/arena/arenaAdventureScreen.js` - Complete gameplay logic:
  - Round management: build shuffled deck, draw initial hand, spawn enemies
  - Enemy scaling: count (2 + floor(round/3)), HP (2 + round*1.5), attack (1 + round*0.8)
  - Mana system: ramps each turn (+1 max mana, full refill, capped at round/max 10)
  - Full combat flow: player turn -> cast spells -> end turn -> enemy attacks -> next turn
  - Spell support: single target, all enemies, random target, self (heal/shield/draw/mana boost)
  - Between-round healing: random heal (min 5 + round*2, up to full)
  - Max HP +10 at rounds 3, 6, 9
  - 3 upgrade choices: add new card, upgrade card (damage/heal/mana/etc.), bonus heal
  - Run end: victory at 12 rounds, defeat at 0 HP or concede
  - State persistence via ArenaStateManager
- Registered `arena-adventure` screen in ScreenManager (app.js)
- Included new JS files in index.html