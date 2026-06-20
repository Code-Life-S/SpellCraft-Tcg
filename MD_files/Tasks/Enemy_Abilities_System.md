# Enemy Abilities System

## Goal
Implement 4 enemy abilities (Provocation, Enrage, Soigneur, Invocateur) for both GameScreen and ArenaAdventureScreen.

## Status

### Phase 1 Done
- Created `game/enemyAbilitiesConfig.js` with:
  - `ENEMY_ABILITIES` object (provoke, enrage, healer, summoner)
  - `SUMMON_TEMPLATES` for summoned minions
  - Helper functions: `getRandomAbilityKey()`, `getAbilityForRound()`, `getRandomAbilityChance()`, `hasActiveProvoker()`, `checkAndTriggerEnrage()`, `getBestHealTarget()`, `createSummonMinion()`
- Added `<script src="game/enemyAbilitiesConfig.js">` to `index.html`
- Added `.enemy-ability` CSS to `enemyBoardComponent.css`
- Modified `enemyBoardComponent.js`:
  - Render ability icon on enemy card
  - Added `enableTargetingForEnemy(enemyId)` method for Provocation
- Modified `gameScreen.js`:
  - `spawnInitialEnemies()`: 50% chance to assign random ability
  - `enableEnemyTargeting()`: if provoker exists, only provoker is targetable
  - `handleEnemyClick()`: if provoker exists, block non-provoker clicks
  - `damageEnemyWithEffects()`: triggers enrage at <50% HP
  - `processEnemyAbilities()`: healers heal lowest HP ally, summoners summon 1/1 minion
  - `enemyAttackPhase()`: resets canAttack at start, skips canAttack=false, calls processEnemyAbilities before startNewTurn
- Modified `arenaAdventureScreen.js`:
  - `spawnEnemies(round)`: assigns abilities by round (none 1-3, provoke/healer 4-7, all 8+)
  - `handleCardClick()`: provoker check when enabling targeting
  - `handleEnemyClick()`: provoker check
  - `damageEnemy()`: triggers enrage
  - `processEnemyAbilities()`: same as gameScreen
  - `enemyAttackPhase()`: same changes as gameScreen

### Ability Details
| Ability | Trigger | Effect |
|---|---|---|
| Provocation | Targeting phase | Only the provoker can be targeted while alive |
| Enrage | When HP < 50% | Permanent +2 attack (once) |
| Soigneur | End of enemy turn | Heals lowest-HP ally for 2 |
| Invocateur | End of enemy turn | Summons 1/1 minion (can't attack same turn) |

### Arena Progression
- Rounds 1-3: No abilities
- Rounds 4-7: Provocation, Soigneur
- Rounds 8+: All 4 abilities

### Next Steps
1. Test and debug ability interactions
2. Add more abilities in future iterations
3. Boss system (2 abilities per boss, random boss at round 12)
