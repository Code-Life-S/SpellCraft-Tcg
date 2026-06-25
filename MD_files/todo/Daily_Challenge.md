# Daily Challenge - TODO

Status: NOT STARTED

## Goal
1 run per day with special rules (modifiers). Unique reward to retain players.

## Concept
- 1 run per day with special modifiers
- Unique reward for participation/win
- Gives players a reason to come back daily

## Possible Modifiers

| Modifier | Effect |
|----------|--------|
| Mana Infini | Each turn, max mana = 10 (no ramping) |
| Ennemis Capacites+ | All enemies have 2 abilities instead of 1 |
| Deck Preconstruit | Play with a fixed random deck |
| Classe Gratuite | All classes available (ignore locks) |
| Vagues Multipliees | 2x more enemies per wave |
| Soin Zero | No healing between rounds (Arena only) |
| Mana Reduit | Spell costs reduced by 1 (minimum 0) |
| Ennemis Geants | All enemies have +50% HP |
| Miroir | Start with a copy of each card in your deck |
| Pauvre | Start with 0 cards in hand (skip mulligan) |
| Elements Aleatoires | Each spell you cast has a random element |

## Proposed Rotation

| Day | Modifier |
|-----|----------|
| Lundi | Mana Infini |
| Mardi | Ennemis Geants |
| Mercredi | Deck Preconstruit |
| Jeudi | Soin Zero |
| Vendredi | Ennemis Capacites+ |
| Samedi | Elements Aleatoires |
| Dimanche | Player chooses modifier |

## Rewards

| Reward | Condition |
|--------|-----------|
| Participation | 50 XP bonus |
| Victory | Ancient Scroll (cosmetic) or exclusive title |
| 7 challenges in week | Weekly badge |

## Implementation Plan

### Phase 1: Challenge Manager
- Create `game/dailyChallengeManager.js`
- Seed based on date (same challenge for all players each day)
- Select modifier based on day of week
- Store completion status in localStorage

### Phase 2: Challenge Screen
- Add "Daily Challenge" button to main menu
- Show today's modifier and rules
- Show best score / completion status
- Navigate to game/adventure with modifier applied

### Phase 3: Modifier Application
- Hook modifiers into game/adventure initialization
- Modify mana, enemy spawning, deck composition based on active modifier
- Display active modifier in game UI

### Phase 4: Rewards
- Grant XP bonus on challenge completion
- Track consecutive days completed
- Weekly badge system

## Dependencies
- `screens/gameScreen.js` - apply modifiers to game logic
- `screens/arena/arenaAdventureScreen.js` - apply modifiers to arena
- `game/playerProgressionManager.js` - XP rewards
