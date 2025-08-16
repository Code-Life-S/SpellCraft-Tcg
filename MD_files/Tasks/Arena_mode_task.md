# Arena mode task

For this task, you will :
- Replace the "Credits" menu in the mainMenuScreen by a new menu entry "Arena mode"
- Place our new "Arena mode" between "Start adventure" and "Deck builder" entries
- Create a new Arena mode (explanation and rules below)

# Arena mode gameplay
The arena mode will be based on Hearthstone's arena mode.
We will split this arena mode in two screens :
- arenaBuilder screen : the player will create its arena deck
- arenaAdventure screen : The player will play a game (using gamescreen) with his arena deck and with a few special rules for the arena mode.

# Arena mode : Task part 1

For now we will focus on creating the new screen "arenaBuilder"
In the Arena builder screen, we will display cards to the player, that he has to choose between, to create his arena deck.
To init that game mode we will create a new empty "arena" deck.
If the player goes back and forth between mainmenu and arena mode, if he had an unfinished arena, we will ask the player if he prefers to
- New Arena : we can delete a previous arena deck if we had one, and create a fresh new arena deck
- Resume Arena : the player will be able to continue deckbuilding his arena if he was in the deck building phase
(And later when building arenaAdventure adventure screen, if in arenaAdventure phase, player can resume arena adventure or start a new arena. But lets firt focus on the arenaBuilder phase again.)

We will have iteration in arenaBuilder phase where we :
- Display 3 cards that the player can choose by clicking on
- When a card is chosen between the 3, this card will be added to the arena deck
- We replace the 3 cards by 3 other random cards for the player to choose from again, and so on, until the deck contains 10 cards.

When the arena deck contains 10 cards (make sure we can change this value in code easily, maybe by using a constant) we display a button "Start Arena", instead of displaying the 3 cards.
For now the "Start Arena" button does nothing, but in a next task we will make it launch the arenaAdventure phase.

Note that we may later (in another task, no to be done for now) :
- Alternate between arenaBuilder and arenaAdventure phases : Player may choose new cards to add (or maybe remove) to the arena deck after a battle (defeating enemy phase called "arenaAdventure").
- Display "bonus" cards that will give passive bonuses in the arenaAdventure phase, for example : "Fire spell damage * 2", or "Every spell also heals 2 HP".
- and maybe other mechanics to come.

---

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

### Phase 2: Arena Builder Screen Creation (NEXT)
**To be implemented:**
- Create `screens/arena/arenaBuilderScreen.html` - UI structure
- Create `screens/arena/arenaBuilderScreen.css` - Styling  
- Create `screens/arena/arenaBuilderScreen.js` - Logic and functionality
- Arena Builder Features:
  - Display 3 random cards for selection
  - Track arena deck progress (0/10 cards)
  - Add selected cards to arena deck
  - Show "Start Arena" button when deck is complete (10 cards)
  - Handle resume/new arena logic

### Phase 3: Arena Deck Management (PENDING)
**To be implemented:**
- Extend DeckStorageManager to handle arena decks
- Add arena deck constants (ARENA_DECK_SIZE = 10)
- Implement arena state persistence

### Phase 4: Screen Manager Integration (PENDING)
**To be implemented:**
- Register arenaBuilder screen in ScreenManager
- Add navigation logic from main menu to arena builder
- Update `openArenaMode()` method to navigate to arena builder