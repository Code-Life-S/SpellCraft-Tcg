var ClassManager = {
    _activeClassId: null,
    STORAGE_KEY: 'spellcaster_last_class',

    init: function() {
        var saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            this._activeClassId = saved;
        } else {
            this._activeClassId = 'pyromancer';
        }
    },

    setActiveClass: function(classId) {
        this._activeClassId = classId;
        localStorage.setItem(this.STORAGE_KEY, classId);
    },

    getActiveClass: function() {
        if (!this._activeClassId) return null;
        return getClassById(this._activeClassId);
    },

    getActiveClassId: function() {
        return this._activeClassId;
    },

    getLastClassId: function() {
        return localStorage.getItem(this.STORAGE_KEY) || 'pyromancer';
    },

    getClassCardIds: function(classId) {
        var cls = getClassById(classId);
        if (!cls) return [];
        var cards = [];
        cls.cards.forEach(function(cardDef) {
            for (var i = 0; i < cardDef.count; i++) {
                cards.push(cardDef.id);
            }
        });
        return cards;
    },

    getFireDamageBonus: function() {
        if (this._activeClassId === 'pyromancer') return 1;
        return 0;
    },

    getFrozenDurationBonus: function() {
        if (this._activeClassId === 'cryomancer') return 1;
        return 0;
    },

    getLightningElectrifiedBonus: function() {
        if (this._activeClassId === 'electromancer') return 2;
        return 0;
    },

    onEnemyDeath: function(playerHealth, maxHealth) {
        if (this._activeClassId === 'necromancer') {
            return { health: playerHealth + 1, maxHealth: maxHealth + 1 };
        }
        return { health: playerHealth, maxHealth: maxHealth };
    },

    /* Archimage: spell counter */
    getSpellCount: function() {
        if (this._activeClassId === 'archimage') {
            return this._spellCount || 0;
        }
        return 0;
    },

    incrementSpellCount: function() {
        if (this._activeClassId === 'archimage') {
            this._spellCount = (this._spellCount || 0) + 1;
        }
    },

    resetSpellCount: function() {
        this._spellCount = 0;
    },

    shouldDrawFromSpellCount: function() {
        if (this._activeClassId !== 'archimage') return false;
        var count = this._spellCount || 0;
        if (count >= 3) {
            this._spellCount = count - 3;
            return true;
        }
        return false;
    },

    getSpellCountProgress: function() {
        if (this._activeClassId !== 'archimage') return 0;
        return this._spellCount || 0;
    },

    /* Ombrelumiere: HP to mana */
    canUseHpToMana: function() {
        if (this._activeClassId !== 'ombrelumiere') return false;
        return !this._hpToManaUsedThisTurn;
    },

    useHpToMana: function() {
        if (this._activeClassId !== 'ombrelumiere') return false;
        if (this._hpToManaUsedThisTurn) return false;
        this._hpToManaUsedThisTurn = true;
        return true;
    },

    resetHpToMana: function() {
        this._hpToManaUsedThisTurn = false;
    },

    /* Ombrelumiere: missing HP damage calculation */
    getMissingHpDamage: function(currentHealth, maxHealth, cap) {
        if (this._activeClassId !== 'ombrelumiere') return 0;
        var missing = maxHealth - currentHealth;
        var capped = Math.min(missing, cap || 6);
        return Math.max(0, capped);
    },

    /* Reset per-turn state */
    resetPerTurnState: function() {
        this.resetHpToMana();
    }
};

window.ClassManager = ClassManager;
