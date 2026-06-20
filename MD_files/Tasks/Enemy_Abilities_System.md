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

## Boss System (Phase 2)

### Done
- Created `game/bossConfig.js` with 3 MVP bosses:
  - **Roi Squelette** (skeleton_king): summons 2 skeletons at start of each enemy turn (skeletons attack same turn)
  - **Mage Noir** (dark_mage): gains 3 shield/turn, drains 2 HP from player and heals self, shield shatter stuns 1 turn
  - **Dragon** (dragon): breath attack (2 AOE damage to player each turn), enrages at <50% HP (+2 ATK via ability system)
- Added `<script src="game/bossConfig.js">` to `index.html`
- Added boss CSS to `enemyBoardComponent.css`:
  - `.enemy-boss`: larger card (190x270), gold border, enhanced glow, unique gradient background
  - `.boss-label`: gold badge at top-right corner
  - `.boss-shield-bar`: blue shield health bar for Mage Noir
  - Enhanced boss stat circles (gold health, red attack)
- Modified `enemyBoardComponent.js`:
  - `createEnemyElement()`: adds `enemy-boss` class, BOSS label, shield bar for bosses
  - `updateBossShieldBar()`: updates shield bar width/visibility
- Modified `arenaAdventureScreen.js`:
  - `spawnEnemies(round)`: boss spawn at round 12 via `getRandomBoss()`, replaces normal enemies
  - `processBossMechanics()`: handles per-boss unique behavior (summon, shield+drain, breath)
  - `enemyAttackPhase()`: calls `processBossMechanics()` before attacks, skips stunned boss
  - `damageEnemy()`: boss shield absorption + stun trigger on shield break
  - `processEnemyAbilities()`: now filters out bosses (`!e.isBoss`)
- Both screens: `processEnemyAbilities()` filters out `!e.isBoss` (future-proof)

### Boss Stats
| Boss | HP | ATK | Ability | Mechanic |
|---|---|---|---|---|
| Roi Squelette | 20 | 4 | Summoner | Summon 2 skeletons at turn start |
| Mage Noir | 15 | 3 | - | 3 shield/turn, life drain 2, stun on shield break |
| Dragon | 30 | 5 | Enrage | Breath 2 AOE, enrage at <50% |

### Next Steps
1. Test and debug ability interactions + boss fights
2. Add more abilities in future iterations
3. Campaign boss system (for non-arena mode)
4. Boss companions (1-2 minions with boss, optional)
