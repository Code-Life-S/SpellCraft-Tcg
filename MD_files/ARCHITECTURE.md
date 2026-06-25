# Spell Caster - Modular Architecture Guide

Date: 25 Juin 2026

---

## Architecture Overview

Spell Caster uses a modular, template-based architecture with clean separation of concerns:
- **HTML**: Structure and content only
- **CSS**: Presentation and styling only
- **JavaScript**: Logic and behavior only

---

## File Structure

```
/
├── index.html                    # Main HTML file
├── app.js                        # Main application entry point
├── style.css                     # Global game styles
│
├── /screens/                     # Screen management system
│   ├── screenManager.js          # Core screen navigation system
│   ├── baseScreen.js             # Abstract base class for all screens
│   ├── templateLoader.js         # HTML template loading utility
│   ├── stateManager.js           # State management utility
│   │
│   ├── /mainmenu/                # Main menu screen
│   │   ├── mainMenuScreen.js
│   │   ├── mainMenuScreen.html
│   │   └── mainMenuScreen.css
│   │
│   ├── /game/                    # Game screen (Adventure mode)
│   │   ├── gameScreen.js
│   │   ├── gameScreen.html
│   │   ├── gameScreen.css
│   │   └── adventureStateManager.js
│   │
│   ├── /arena/                   # Arena mode screens
│   │   ├── arenaBuilderScreen.js
│   │   ├── arenaBuilderScreen.html
│   │   ├── arenaBuilderScreen.css
│   │   ├── arenaAdventureScreen.js
│   │   ├── arenaAdventureScreen.html
│   │   ├── arenaAdventureScreen.css
│   │   └── arenaStateManager.js
│   │
│   ├── /deckbuilder/             # Deck builder screens
│   │   ├── deckBuilderScreen.js
│   │   ├── deckBuilderScreen.html
│   │   ├── deckBuilderScreen.css
│   │   ├── deckListScreen.js
│   │   ├── deckListScreen.html
│   │   └── deckListScreen.css
│   │
│   ├── classSelectScreen.js      # Class selection screen
│   │
│   ├── /components/              # Reusable UI components
│   │   ├── /visual-effects/
│   │   │   ├── visualEffectsComponent.js
│   │   │   └── visualEffectsComponent.css
│   │   ├── /enemy-board/
│   │   │   ├── enemyBoardComponent.js
│   │   │   └── enemyBoardComponent.css
│   │   ├── /player-hand/
│   │   │   ├── playerHandComponent.js
│   │   │   └── playerHandComponent.css
│   │   ├── /deck-tracker/
│   │   │   ├── deckTrackerComponent.js
│   │   │   └── deckTrackerComponent.css
│   │   └── /action-history/
│   │       ├── actionHistoryComponent.js
│   │       └── actionHistoryComponent.css
│   │
│   └── /shared/                  # Shared CSS
│       └── gameCommon.css
│
├── /cards/                       # Card system
│   ├── cardManager.js
│   ├── decks.json
│   └── spells.json
│
├── /game/                        # Game logic modules
│   ├── bossConfig.js             # Boss definitions
│   ├── classConfig.js            # Class definitions
│   ├── classManager.js           # Class selection management
│   ├── elementalReactionsConfig.js
│   ├── elementalReactionsManager.js
│   ├── enemyAbilitiesConfig.js   # Enemy ability definitions
│   └── playerProgressionManager.js
│
├── /audio/                       # Audio system
│   ├── soundManager.js           # Web Audio API (synthesized)
│   └── .gitkeep
│
└── /MD_files/                    # Documentation
    ├── README.md
    ├── ARCHITECTURE.md
    ├── CODING_STANDARDS.md
    ├── Vision_MVP_Store.md
    ├── Content_Roadmap.md
    ├── Gameplay_Idees.md
    ├── DLC_Plan.md
    ├── done/                     # Completed tasks
    ├── todo/                     # Pending tasks
    └── archive/                  # Historical snapshots
```

---

## Screen System

### Screen Lifecycle
1. **Constructor**: Set default state
2. **setupContent()**: Load HTML template, CSS, create component instances
3. **onBeforeShow()**: Refresh data, update UI before becoming visible
4. **onShow()**: Post-visibility hooks (animations, etc.)
5. **onBeforeHide()**: Pause/reset before leaving
6. **destroy()**: Clean up listeners and components

### Current Screens

| Screen | Purpose | Features |
|--------|---------|----------|
| Main Menu | Game entry point | Navigation, stats, audio controls |
| Game Screen | Adventure mode | Wave defense, spell casting, mana system |
| Arena Builder | Draft phase | Card selection, deck building |
| Arena Adventure | Arena gameplay | 12 rounds, upgrades, boss |
| Deck Builder | Deck management | Create/edit 30-card decks |
| Deck List | Deck overview | Browse/manage saved decks |
| Class Select | Class choice | Arena (3 random) or deck builder (all) |

---

## Shared Components

| Component | Location | Purpose |
|-----------|----------|---------|
| VisualEffectsComponent | `screens/components/visual-effects/` | Spell impacts, floating numbers, screen shake, particles |
| EnemyBoardComponent | `screens/components/enemy-board/` | Enemy rendering, targeting, damage/attack effects |
| PlayerHandComponent | `screens/components/player-hand/` | Card element creation, hand rendering, selection |
| DeckTrackerComponent | `screens/components/deck-tracker/` | Deck count, card list, mana curve |
| ActionHistoryComponent | `screens/components/action-history/` | Action log (last 25 entries) |

---

## Game Logic Modules

| Module | Purpose |
|--------|---------|
| `bossConfig.js` | 3 boss definitions with unique mechanics |
| `classConfig.js` | 6 class definitions (passives, cards) |
| `classManager.js` | Class selection, persistence, passive activation |
| `elementalReactionsConfig.js` | Status effects and reactions data |
| `elementalReactionsManager.js` | Elemental reaction logic |
| `enemyAbilitiesConfig.js` | 8 enemy ability definitions |
| `playerProgressionManager.js` | XP, levels, card/class unlocking |

---

## Key Design Principles

### Separation of Concerns
- HTML templates in `.html` files
- CSS in dedicated stylesheets
- JavaScript focused on logic

### Template-Based Architecture
- HTML structure defined in template files
- Data binding updates content (not DOM manipulation)
- State changes via CSS class toggles

### Component Reusability
- Shared components used by both Game and Arena screens
- Components accept configuration via constructor options
- Communication via callbacks

### Event Binding
- Use `addEventListenerSafe()` for automatic cleanup
- Event delegation for collections of similar elements
- No raw `onclick` attributes

---

## Adding New Screens

```javascript
// 1. Create screen class extending BaseScreen
class MyNewScreen extends BaseScreen {
    async setupContent() {
        // Load template and CSS
        this.element.innerHTML = await templateLoader.loadTemplate('path/to/template.html');
        await templateLoader.loadCSS('path/to/styles.css');
    }
    
    bindEvents() {
        // Add event listeners via addEventListenerSafe()
    }
}

// 2. Register in app.js
this.screenManager.registerScreen('mynewscreen', MyNewScreen);

// 3. Navigate to it
await screenManager.navigateToScreen('mynewscreen');
```

---

## Debugging

### Console Commands
```javascript
// Get app instance
const app = window.getSpellCasterApp();

// Get current screen
const currentScreen = app.getScreenManager().getCurrentScreen();

// Navigate programmatically
await app.getScreenManager().navigateToScreen('mainmenu');
```

---

## Documentation

- `README.md` - Project overview and features
- `CODING_STANDARDS.md` - Coding conventions
- `Vision_MVP_Store.md` - Business vision and MVP roadmap
- `Content_Roadmap.md` - Content planning
- `done/` - Completed tasks documentation
- `todo/` - Pending tasks documentation
- `archive/` - Historical snapshots
