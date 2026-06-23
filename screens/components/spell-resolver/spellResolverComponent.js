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
}
