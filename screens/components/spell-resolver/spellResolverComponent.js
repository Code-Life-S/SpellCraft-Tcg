/**
 * SpellResolverComponent - Shared logic for applying spell damage with elemental reactions
 * Used by both GameScreen (adventure mode) and ArenaAdventureScreen
 */
class SpellResolverComponent {
    /**
     * Apply damage to an enemy with elemental reaction processing.
     * Compatible with both gameScreen (damageEnemyWithEffects) and arena (damageEnemy).
     *
     * @param {Object} screen - The screen instance (this from caller)
     * @param {number|string} enemyId - Target enemy ID
     * @param {number} baseDamage - Raw damage before bonuses/reactions
     * @param {string} elementType - Element type (fire, frost, lightning, arcane, holy)
     * @param {boolean} [skipDeathHistory=false] - Skip death history entry (used for random multi-hit spells)
     */
    static applyDamageWithElement(screen, enemyId, baseDamage, elementType, skipDeathHistory) {
        // Class passive: Pyromancien +1 fire damage
        if (elementType === 'fire' && ClassManager.getFireDamageBonus() > 0) {
            baseDamage += ClassManager.getFireDamageBonus();
        }

        if (!ElementalReactionsManager.isEnabled()) {
            SpellResolverComponent._callDamageFn(screen, enemyId, baseDamage, skipDeathHistory);
            return;
        }

        const enemy = screen.enemies.find(e => e.id === enemyId);
        if (!enemy) return;

        // Class passive: Electromancien +2 lightning damage vs shocked enemies
        if (elementType === 'lightning' &&
            ElementalReactionsManager.hasStatus(enemy, 'shocked') &&
            ClassManager.getLightningElectrifiedBonus() > 0) {
            baseDamage += ClassManager.getLightningElectrifiedBonus();
        }

        const result = ElementalReactionsManager.processReaction(enemy, elementType, baseDamage);

        if (result.reaction) {
            const reactionEl = screen.element.querySelector(`[data-enemy-id="${enemyId}"]`);
            if (reactionEl) {
                reactionEl.classList.add('reaction-flash');
                setTimeout(() => reactionEl.classList.remove('reaction-flash'), 600);
            }
            if (typeof screen.addToHistory === 'function') {
                screen.addToHistory(result.reaction.icon + ' ' + result.reaction.name + '!', false);
            }

            // Achievement tracking: elemental reaction triggered
            if (window.AchievementManager) {
                AchievementManager.incrementStat('totalReactionsTriggered');
                var combatReactions = (screen._combatReactions || 0) + 1;
                screen._combatReactions = combatReactions;
                var maxReactions = AchievementManager.getCombatStat('maxReactionsInCombat') || 0;
                if (combatReactions > maxReactions) {
                    AchievementManager.setCombatStat('maxReactionsInCombat', combatReactions);
                }
            }
        }

        // Achievement tracking: fire damage
        if (elementType === 'fire' && window.AchievementManager) {
            var currentFireDamage = AchievementManager.getCombatStat('maxFireDamageInCombat') || 0;
            var newFireDamage = currentFireDamage + result.damage;
            AchievementManager.setCombatStat('maxFireDamageInCombat', newFireDamage);
        }

        SpellResolverComponent._callDamageFn(screen, enemyId, result.damage, skipDeathHistory);

        if (result.aoeDamage > 0) {
            screen.enemies.forEach(other => {
                if (other.id !== enemyId && !other.isDying && other.health > 0) {
                    SpellResolverComponent._callDamageFn(screen, other.id, result.aoeDamage, true);
                }
            });
        }

        ElementalReactionsManager.applyElementalStatus(enemy, null, elementType, ClassManager.getFrozenDurationBonus());
        if (screen.enemyBoard && typeof screen.enemyBoard.updateStatusOverlay === 'function') {
            screen.enemyBoard.updateStatusOverlay(enemyId, enemy);
        }
    }

    /**
     * Check and trigger enrage ability on an enemy.
     * @param {Object} enemy - The enemy object
     * @param {Object} screen - Screen instance (for addToHistory)
     * @returns {boolean} true if enrage was triggered
     */
    static checkAndTriggerEnrage(enemy, screen) {
        if (typeof checkAndTriggerEnrage === 'function' && checkAndTriggerEnrage(enemy)) {
            if (typeof screen.addToHistory === 'function') {
                screen.addToHistory(enemy.art + ' ' + enemy.name + ' is ENRAGED! +2 ATK', false);
            }
            return true;
        }
        return false;
    }

    /**
     * Call the appropriate damage function on the screen.
     * gameScreen uses damageEnemyWithEffects, arena uses damageEnemy.
     */
    static _callDamageFn(screen, enemyId, damage, skipDeathHistory) {
        const fn = screen.damageEnemyWithEffects || screen.damageEnemy;
        if (typeof fn === 'function') {
            fn.call(screen, enemyId, damage, skipDeathHistory);
        }
    }

    /**
     * Handle spell copy mechanic: add a copy of the card to the player's hand.
     * @param {Object} screen - Screen instance
     * @param {Object} card - The card to copy
     */
    static handleCopy(screen, card) {
        if (!card.copy) return;
        if (typeof screen.playerHand !== 'undefined') {
            var copy = Object.assign({}, card, { instanceId: Date.now() + Math.random() });
            screen.playerHand.push(copy);
            if (typeof screen.renderPlayerHand === 'function') {
                screen.renderPlayerHand();
            }
            if (typeof screen.addToHistory === 'function') {
                screen.addToHistory(card.art + ' ' + card.name + ' copied to hand', true);
            }
        }
    }

    /**
     * Handle spell recall mechanic: return the previous spell to the player's hand.
     * @param {Object} screen - Screen instance
     */
    static handleRecall(screen) {
        var lastSpell = screen._lastSpellCast;
        if (!lastSpell) return false;
        var recallCard = Object.assign({}, lastSpell, { instanceId: Date.now() + Math.random() });
        screen.playerHand.push(recallCard);
        if (typeof screen.renderPlayerHand === 'function') {
            screen.renderPlayerHand();
        }
        if (typeof screen.addToHistory === 'function') {
            screen.addToHistory('\uD83D\uDD04 ' + lastSpell.name + ' recalled to hand', true);
        }
        return true;
    }

    /**
     * Check if recall can be used (a spell was cast before this one).
     * @param {Object} screen - Screen instance
     */
    static canRecall(screen) {
        return !!screen._lastSpellCast;
    }

    /**
     * Handle selfDamage mechanic
     * @param {Object} screen - Screen instance
     * @param {Object} card - The card with selfDamage
     */
    static handleSelfDamage(screen, card) {
        if (!card.selfDamage) return;
        // Deduct health from player
        if (typeof screen.playerHealth !== 'undefined') {
            screen.playerHealth -= card.selfDamage;
            if (typeof screen.updateUI === 'function') {
                screen.updateUI();
            }
            // Handle arena screen differently (uses arenaState.playerHealth)
            if (screen.arenaState && typeof screen.arenaState.playerHealth !== 'undefined') {
                screen.arenaState.playerHealth -= card.selfDamage;
            }
            if (typeof screen.addToHistory === 'function') {
                screen.addToHistory('\uD83D\uDD3A Dark Pact: lose ' + card.selfDamage + ' Health', true);
            }
            // Show damage on player hero
            var heroEl = (screen.element || screen).querySelector('.hero-portrait');
            if (!heroEl && screen.element) heroEl = screen.element.querySelector('.hero-portrait');
            if (heroEl && screen.visualEffects && typeof screen.visualEffects.showDamageNumber === 'function') {
                screen.visualEffects.showDamageNumber(heroEl, card.selfDamage);
            }
        }
    }

    /**
     * Calculate damage for missing HP formula
     * @param {Object} screen - Screen instance
     * @param {Object} card - The card with damageFormula
     * @returns {number} Calculated damage
     */
    static getFormulaDamage(screen, card) {
        if (card.damageFormula !== 'missingHp') return card.damage || 0;

        var currentHealth = screen.arenaState ? screen.arenaState.playerHealth : screen.playerHealth;
        var maxHealth = screen.arenaState ? screen.arenaState.maxHealth : (screen.maxHealth || 30);
        var cap = card.maxDamage || 6;
        var missing = maxHealth - currentHealth;
        return Math.max(0, Math.min(missing, cap));
    }
}
