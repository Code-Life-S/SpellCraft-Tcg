/**
 * CombatEngineComponent - Shared combat turn logic for GameScreen and ArenaAdventureScreen.
 * Handles enemy attack phase with proper alive-enemy filtering (fixes phantom attack bug),
 * and standardized turn management.
 */
class CombatEngineComponent {
    /**
     * Execute the enemy attack phase.
     * Uses recursive setTimeout for safe iteration with dynamic enemy lists.
     * Properly filters alive enemies at each step to prevent phantom attacks.
     *
     * @param {Object} screen - The screen instance
     * @param {Object} options - Attack phase options
     * @param {number} [options.intervalMs=350] - Delay between attacks
     * @param {Function} [options.onDefeat] - Called when player health reaches 0
     * @param {Function} [options.onPhaseEnd] - Called after all enemies have attacked
     * @param {Function} [options.beforeAttack] - Called before each attack (for boss mechanics, etc.)
     * @param {Function} [options.afterAttack] - Called after all enemies have attacked, before onPhaseEnd (for end-of-turn boss mechanics)
     */
    static executeEnemyAttackPhase(screen, options = {}) {
        const intervalMs = options.intervalMs || 350;
        const onDefeat = options.onDefeat || (() => screen.gameOver(false));
        const onPhaseEnd = options.onPhaseEnd || (() => screen.startNewTurn());
        const beforeAttack = options.beforeAttack || null;
        const afterAttack = options.afterAttack || null;

        // Reset attack flags
        screen.enemies.forEach(e => { delete e.canAttack; });

        // Process status effects (burning damage over time, etc.)
        screen.processEnemyStatusEffects();

        // Run boss mechanics if provided
        if (beforeAttack) {
            beforeAttack(screen);
        }

        // Get alive enemies at this moment
        const aliveEnemies = screen.enemies.filter(e => !e.isDying);

        if (aliveEnemies.length === 0) {
            // No alive enemies - death callbacks from processEnemyStatusEffects
            // will handle game end / next wave via checkGameEnd/checkWinCondition
            return;
        }

        let attackIndex = 0;

        const doNextAttack = () => {
            // Guard: stop if game is over
            if (screen.gameState !== 'playing') return;

            // All enemies have attacked
            if (attackIndex >= aliveEnemies.length) {
                if (afterAttack) {
                    afterAttack(screen);
                }
                screen.processEnemyAbilities();
                onPhaseEnd(screen);
                return;
            }

            const enemy = aliveEnemies[attackIndex];
            attackIndex++;

            // Skip enemies flagged to not attack
            if (enemy.canAttack === false || enemy.skipAttack) {
                setTimeout(doNextAttack, 100);
                return;
            }

            // Skip frozen enemies
            if (ElementalReactionsManager.shouldSkipAttack(enemy)) {
                if (typeof screen.addToHistory === 'function') {
                    screen.addToHistory(
                        STATUS_EFFECTS.frozen.icon + ' ' + enemy.name + ' is frozen and cannot attack!',
                        false
                    );
                }
                screen.enemyBoard.updateStatusOverlay(enemy.id, enemy);
                screen.updateUI();
                setTimeout(doNextAttack, 100);
                return;
            }

            // Enemy attack animation
            if (screen.enemyBoard && typeof screen.enemyBoard.addAttackEffect === 'function') {
                screen.enemyBoard.addAttackEffect(enemy.id);
            } else {
                const enemyEl = screen.element.querySelector(`[data-enemy-id="${enemy.id}"]`);
                if (enemyEl) {
                    enemyEl.classList.add('attacking');
                    setTimeout(() => enemyEl.classList.remove('attacking'), 600);
                }
            }

            // Get player health reference (handles gameScreen vs arena)
            const healthRef = CombatEngineComponent._getHealthRef(screen);

            // Apply shield protection
            let remainingDamage = enemy.attack;
            if (screen.playerShield > 0) {
                const absorbed = Math.min(screen.playerShield, remainingDamage);
                screen.playerShield -= absorbed;
                remainingDamage -= absorbed;
                if (absorbed > 0) {
                    screen.soundManager?.play('shield_block');
                }
            }

            // Apply remaining damage
            if (remainingDamage > 0) {
                healthRef.set(healthRef.get() - remainingDamage);
                screen.soundManager?.play('player_hurt');

                // Visual feedback
                const heroEl = screen.element.querySelector('.player-hero') ||
                               screen.element.querySelector('.hero-portrait');
                if (heroEl && screen.visualEffects) {
                    screen.visualEffects.showDamageNumber(heroEl, remainingDamage);
                }
            }

            screen.updateUI();

            // Lifestrike: enemy heals half the damage it dealt
            if (remainingDamage > 0 && enemy.ability === 'lifestrike' && !enemy.isDying) {
                var healAmount = Math.floor(remainingDamage * (window.ENEMY_ABILITIES ? window.ENEMY_ABILITIES.lifestrike.healRatio : 0.5));
                if (healAmount > 0) {
                    enemy.health = Math.min(enemy.maxHealth, enemy.health + healAmount);
                    if (screen.enemyBoard && typeof screen.enemyBoard.updateEnemyHealth === 'function') {
                        screen.enemyBoard.updateEnemyHealth(enemy.id, enemy.health, enemy.maxHealth);
                    }
                    if (typeof screen.addToHistory === 'function') {
                        screen.addToHistory(enemy.art + ' ' + enemy.name + ' drains ' + healAmount + ' HP', false);
                    }
                }
            }

            // Check if player died
            if (healthRef.get() <= 0) {
                healthRef.set(0);
                screen.updateUI();
                onDefeat(screen);
                return;
            }

            setTimeout(doNextAttack, intervalMs);
        };

        doNextAttack();
    }

    /**
     * Start a new player turn.
     * Handles mana ramp, card draw, and UI update.
     *
     * @param {Object} screen - The screen instance
     * @param {Object} [options]
     * @param {number} [options.maxManaCap=10] - Maximum mana cap
     * @param {Function} [options.onTurnStart] - Called after turn setup
     */
    static startTurn(screen, options = {}) {
        const maxManaCap = options.maxManaCap || 10;

        if (screen.gameState !== 'playing') return;

        screen.isPlayerTurn = true;
        screen.currentTurn = (screen.currentTurn || 0) + 1;
        screen.maxMana = Math.min(screen.currentTurn, maxManaCap);
        screen.currentMana = screen.maxMana;

        screen.soundManager?.play('mana_restore');

        if (typeof screen.drawCard === 'function') {
            screen.drawCard();
        } else if (typeof screen.drawCards === 'function') {
            const drawn = screen.drawCards(1);
            if (drawn.length > 0) {
                screen.playerHand = screen.playerHand.concat(drawn);
            }
        }

        // Enable end turn button (handles both #end-turn and #end-turn-btn)
        const endTurnBtn = screen.element.querySelector('#end-turn') ||
                          screen.element.querySelector('#end-turn-btn');
        if (endTurnBtn) {
            endTurnBtn.disabled = false;
        }

        screen.renderPlayerHand();
        screen.updateUI();

        if (typeof options.onTurnStart === 'function') {
            options.onTurnStart(screen);
        }
    }

    /**
     * End the current player turn and start enemy attack phase.
     *
     * @param {Object} screen - The screen instance
     * @param {Object} [options] - Same as executeEnemyAttackPhase options
     */
    static endTurn(screen, options = {}) {
        if (screen.gameState !== 'playing' || !screen.isPlayerTurn) return;

        // If no enemies, check win condition directly
        const alive = screen.enemies.filter(e => !e.isDying);
        if (alive.length === 0) {
            if (typeof screen.checkGameEnd === 'function') {
                screen.checkGameEnd();
            } else if (typeof screen.checkWinCondition === 'function') {
                screen.checkWinCondition();
            }
            return;
        }

        screen.isPlayerTurn = false;

        const endTurnBtn = screen.element.querySelector('#end-turn') ||
                          screen.element.querySelector('#end-turn-btn');
        if (endTurnBtn) {
            endTurnBtn.disabled = true;
        }

        // Deselect any selected card
        if (screen.playerHandComp) {
            screen.playerHandComp.deselectAll();
        }
        screen.selectedCard = null;

        setTimeout(() => {
            CombatEngineComponent.executeEnemyAttackPhase(screen, options);
        }, 400);
    }

    /**
     * Calculate random heal amount between rounds/waves.
     * Same formula used by both Arena and Adventure mode.
     * @param {number} round - Current round/wave number
     * @param {number} currentHealth - Player's current health
     * @param {number} maxHealth - Player's max health
     * @param {number} [minHealBonus=0] - Bonus to minimum heal (arena upgrades)
     * @returns {number} Heal amount (0 if already at max health)
     */
    static calculateHealAmount(round, currentHealth, maxHealth, minHealBonus = 0) {
        const minHeal = 5 + (round * 2) + minHealBonus;
        const maxHeal = maxHealth - currentHealth;
        if (maxHeal <= 0) return 0;
        if (minHeal >= maxHeal) return maxHeal;
        return minHeal + Math.floor(Math.random() * (maxHeal - minHeal + 1));
    }

    /**
     * Get a reference to player health, handling gameScreen vs arena differences.
     */
    static _getHealthRef(screen) {
        if (screen.arenaState) {
            return {
                get: () => screen.arenaState.playerHealth,
                set: (v) => { screen.arenaState.playerHealth = v; }
            };
        }
        return {
            get: () => screen.playerHealth,
            set: (v) => { screen.playerHealth = v; }
        };
    }
}
