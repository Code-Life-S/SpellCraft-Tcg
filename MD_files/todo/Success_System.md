# Success/Achievement System - TODO

Status: NOT STARTED

## Goal
Implement 15-20 achievements across 5 categories to reward exploration and mastery.

## Planned Achievements

### Category: Progression (5)

| Achievement | Condition | Reward |
|-------------|-----------|--------|
| Premiere victoire | Win your first game | Title "Novice" |
| Veteran | Win 50 games | Title "Veteran" |
| Collectionneur | Unlock all neutral cards | Title "Collectionneur" |
| Maitre des classes | Win an arena run with each class | Title "Maitre des Classes" |
| Unlocked | Unlock Necromancer | -- (already a reward) |

### Category: Combat (8)

| Achievement | Condition | Reward |
|-------------|-----------|--------|
| Pyromane | Deal 50+ fire damage in one combat | Fire icon |
| Givre eternel | Freeze 4 different enemies in one combat | Ice icon |
| Brasseur de mana | Cast 10+ spells in one turn | Title "Brasseur" |
| Sans egratignure | Win a combat without losing any HP | Title "Parfait" |
| Survivant | Win a combat with only 1 HP remaining | Title "Survivant" |
| Bouclier de fer | Accumulate 30+ shield in one combat | Title "Forteresse" |
| Speedrun | Win a combat in 2 turns or less | Title "Eclair" |
| Plein aux as | Have 10+ cards in hand | -- |

### Category: Arena (5)

| Achievement | Condition | Reward |
|-------------|-----------|--------|
| Champion d'arene | Win an arena run (any class) | Title "Champion" |
| Vainqueur legendaire | Win an arena run without losing HP (boss included) | Title "Legendaire" |
| Chasseur de boss | Defeat each boss type (Roi Squelette, Mage Noir, Dragon) | Boss icon |
| Invincible | Win 3 consecutive arena runs | Title "Invincible" |
| Full deck | Complete an arena draft without picking class cards (neutrals only) | -- |

### Category: Challenge (3)

| Achievement | Condition | Reward |
|-------------|-----------|--------|
| Le Collectionneur | Have 3 copies of the same card in hand | -- |
| Reaction en chaine | Trigger an elemental reaction 3 times in one combat | Title "Alchimiste" |
| Boss Rush | Defeat the boss in 5 turns or less | Title "Boss Slayer" |

### Category: Farm (3)

| Achievement | Condition | Reward |
|-------------|-----------|--------|
| Niveau 10 | Reach level 10 | Card skin |
| Niveau 20 | Reach level 20 | Hero skin |
| XP Farmer | Earn 10,000 total XP | -- |

## Implementation Plan

### Phase 1: Achievement Manager
- Create `game/achievementManager.js`
- Define achievement data structure
- localStorage persistence for unlocked achievements
- Methods: `check(achievementId)`, `unlock(achievementId)`, `isUnlocked(achievementId)`, `getAll()`

### Phase 2: Stats Tracking
- Track combat stats during gameplay:
  - Damage dealt per element
  - Enemies frozen in one combat
  - Spells cast per turn
  - Max cards in hand
  - Shield accumulated
  - HP remaining on victory
  - Turns to win
  - Consecutive arena wins
- Store in run state or cumulative localStorage

### Phase 3: Achievement Screen
- Create `screens/achievements/` screen module
- Display all achievements with locked/unlocked state
- Show progress for partially complete achievements
- Wire main menu "Achievements" button (currently placeholder)

### Phase 4: Check Triggers
- Hook achievement checks into game events:
  - `gameOver(true)` - check victory achievements
  - `castSpell()` - check combat achievements
  - `enemyDeath()` - check combat achievements
  - `levelUp()` - check progression achievements

## Dependencies
- `game/playerProgressionManager.js` (XP, levels, unlocks)
- `screens/gameScreen.js` (combat events)
- `screens/arena/arenaAdventureScreen.js` (arena events)
