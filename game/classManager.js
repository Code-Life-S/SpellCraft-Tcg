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

    onEnemyDeath: function(playerHealth, maxHealth) {
        if (this._activeClassId === 'necromancer') {
            return Math.min(maxHealth || 30, playerHealth + 1);
        }
        return playerHealth;
    }
};

window.ClassManager = ClassManager;
