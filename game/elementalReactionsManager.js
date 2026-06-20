class ElementalReactionsManager {
    static isEnabled() {
        return typeof ELEMENTAL_REACTIONS_ENABLED !== 'undefined' && ELEMENTAL_REACTIONS_ENABLED;
    }

    static getElementForSpell(spellId) {
        return SPELL_ELEMENT_MAP[spellId] || null;
    }

    static applyStatus(enemy, statusType, durationModifier) {
        if (!this.isEnabled()) return;
        const effectDef = STATUS_EFFECTS[statusType];
        if (!effectDef || !enemy) return;

        if (!enemy.statusEffects) {
            enemy.statusEffects = {};
        }

        var duration = effectDef.duration;
        if (durationModifier) {
            duration += durationModifier;
        }

        enemy.statusEffects[statusType] = {
            type: statusType,
            duration: duration
        };
    }

    static hasStatus(enemy, statusType) {
        return !!(enemy.statusEffects && enemy.statusEffects[statusType] &&
            (enemy.statusEffects[statusType].duration === null || enemy.statusEffects[statusType].duration > 0));
    }

    static getActiveStatuses(enemy) {
        if (!enemy.statusEffects) return [];
        const active = [];
        for (const type of Object.keys(enemy.statusEffects)) {
            if (this.hasStatus(enemy, type)) {
                active.push(type);
            }
        }
        return active;
    }

    static getActiveStatusesAll(enemies) {
        const result = [];
        for (const enemy of enemies) {
            if (enemy.statusEffects) {
                const active = this.getActiveStatuses(enemy);
                if (active.length > 0) {
                    result.push({ enemy, statuses: active });
                }
            }
        }
        return result;
    }

    static checkReaction(enemy, spellElement) {
        if (!this.isEnabled() || !enemy || !spellElement) return null;
        for (const [key, reaction] of Object.entries(REACTIONS)) {
            const { trigger } = reaction;
            if (this.hasStatus(enemy, trigger.status) && trigger.element === spellElement) {
                return { key, ...reaction };
            }
        }
        return null;
    }

    static processReaction(enemy, spellElement, baseDamage) {
        if (!this.isEnabled()) return { damage: baseDamage, aoeDamage: 0, reaction: null };
        const reaction = this.checkReaction(enemy, spellElement);
        if (!reaction) return { damage: baseDamage, aoeDamage: 0, reaction: null };

        const { effect } = reaction;
        let finalDamage = baseDamage;

        if (effect.damageMultiplier) {
            finalDamage = Math.round(baseDamage * effect.damageMultiplier);
        }
        if (effect.bonusDamage) {
            finalDamage = baseDamage + effect.bonusDamage;
        }
        if (effect.removeStatus) {
            this.removeStatus(enemy, reaction.trigger.status);
        }

        return {
            damage: finalDamage,
            aoeDamage: effect.aoeDamage || 0,
            reaction
        };
    }

    static removeStatus(enemy, statusType) {
        if (!enemy.statusEffects) return;
        delete enemy.statusEffects[statusType];
        if (Object.keys(enemy.statusEffects).length === 0) {
            delete enemy.statusEffects;
        }
    }

    static processTurnStart(enemy) {
        if (!this.isEnabled() || !enemy.statusEffects) return { damage: 0 };

        let damage = 0;

        const types = Object.keys(enemy.statusEffects);
        for (const type of types) {
            const effect = enemy.statusEffects[type];
            if (!effect || (effect.duration === null)) continue;

            const effectDef = STATUS_EFFECTS[type];
            if (!effectDef) continue;

            effect.duration--;

            if (effectDef.onTurnStart === 'skipAttack') {
                continue;
            }

            if (effectDef.onTurnStart && effectDef.onTurnStart.damage && effect.duration > 0) {
                damage += effectDef.onTurnStart.damage;
            }
        }

        this.cleanupExpired(enemy);
        return { damage };
    }

    static cleanupExpired(enemy) {
        if (!enemy.statusEffects) return;
        const types = Object.keys(enemy.statusEffects);
        for (const type of types) {
            const effect = enemy.statusEffects[type];
            if (effect.duration !== null && effect.duration <= 0) {
                delete enemy.statusEffects[type];
            }
        }
        if (Object.keys(enemy.statusEffects).length === 0) {
            delete enemy.statusEffects;
        }
    }

    static shouldSkipAttack(enemy) {
        return this.isEnabled() && this.hasStatus(enemy, 'frozen');
    }

    static applyElementalStatus(enemy, spellId, spellElement, durationModifier) {
        if (!this.isEnabled() || !enemy) return;
        const statusType = ELEMENT_STATUS_MAP[spellElement];
        if (!statusType) return;
        this.applyStatus(enemy, statusType, durationModifier);
    }

    static getStatusVisualClasses(enemy) {
        if (!this.isEnabled() || !enemy.statusEffects) return [];
        const classes = [];
        for (const type of Object.keys(enemy.statusEffects)) {
            const effectDef = STATUS_EFFECTS[type];
            if (effectDef && this.hasStatus(enemy, type)) {
                classes.push(effectDef.visualClass);
            }
        }
        return classes;
    }
}

window.ElementalReactionsManager = ElementalReactionsManager;
