class PlayerProgressionManager {
    static STORAGE_KEY = 'spellcaster_progression';

    static CARD_UNLOCK_TABLE = {
        1: ['fire_bolt', 'magic_missile', 'minor_heal', 'arcane_shield', 'mana_surge',
            'arcane_study', 'flame_burst', 'healing_light', 'frost_nova', 'quickdraw'],
        2: ['mystical_insight'],
        3: ['greater_heal'],
        4: ['thunder_storm'],
        5: ['arcane_missiles'],
        6: ['meteor'],
        7: ['divine_wrath']
    };

    static CARD_UNLOCK_NAMES = {
        mystical_insight: 'Mystical Insight',
        greater_heal: 'Greater Heal',
        thunder_storm: 'Thunder Storm',
        arcane_missiles: 'Arcane Missiles',
        meteor: 'Meteor',
        divine_wrath: 'Divine Wrath'
    };

    static CLASS_UNLOCK_RULES = {
        pyromancer: null,
        cryomancer: 'pyromancer',
        necromancer: 'cryomancer'
    };

    static getDefaultState() {
        return {
            level: 1,
            xp: 0,
            arenaWins: [],
            totalXpEarned: 0,
            version: 1
        };
    }

    static getProgression() {
        try {
            var raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                // Version migration placeholder
                if (!parsed.version) parsed.version = 1;
                return parsed;
            }
        } catch (e) {
            console.warn('Failed to load progression, using defaults', e);
        }
        return this.getDefaultState();
    }

    static saveProgression(state) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save progression', e);
        }
    }

    static initialize() {
        var existing = localStorage.getItem(this.STORAGE_KEY);
        if (!existing) {
            this.saveProgression(this.getDefaultState());
        }
    }

    static addXP(amount) {
        var state = this.getProgression();
        state.xp += amount;
        state.totalXpEarned += amount;

        var newLevels = 0;
        var newlyUnlockedCards = [];
        var safety = 50;

        while (safety-- > 0) {
            var needed = this.getXPForNextLevel(state.level);
            if (state.xp >= needed) {
                state.xp -= needed;
                state.level++;
                newLevels++;
                var cardsAtLevel = this.CARD_UNLOCK_TABLE[state.level] || [];
                newlyUnlockedCards = newlyUnlockedCards.concat(cardsAtLevel);
            } else {
                break;
            }
        }

        this.saveProgression(state);

        return {
            leveledUp: newLevels > 0,
            newLevel: newLevels > 0 ? state.level : null,
            levelsGained: newLevels,
            newlyUnlockedCards: newlyUnlockedCards
        };
    }

    static getXPForNextLevel(level) {
        return level * 100;
    }

    static getCardUnlockLevel(cardId) {
        for (var levelStr in this.CARD_UNLOCK_TABLE) {
            if (this.CARD_UNLOCK_TABLE.hasOwnProperty(levelStr)) {
                var cards = this.CARD_UNLOCK_TABLE[levelStr];
                if (cards.indexOf(cardId) !== -1) {
                    return parseInt(levelStr);
                }
            }
        }
        return 1;
    }

    static isClassUnlocked(classId, progression) {
        if (!progression) progression = this.getProgression();
        var rule = this.CLASS_UNLOCK_RULES[classId];
        if (rule === null || rule === undefined) return true;
        return progression.arenaWins.indexOf(rule) !== -1;
    }

    static isCardUnlocked(card, progression) {
        if (!card) return false;
        if (!progression) progression = this.getProgression();

        if (card.class) {
            return this.isClassUnlocked(card.class, progression);
        }

        var level = this.getCardUnlockLevel(card.id);
        return progression.level >= level;
    }

    static getUnlockedNeutralCards(allSpells, progression) {
        if (!progression) progression = this.getProgression();
        return allSpells.filter(function(card) {
            if (card.class) return false;
            var level = PlayerProgressionManager.getCardUnlockLevel(card.id);
            return progression.level >= level;
        });
    }

    static getNextLevelUnlocks(progression) {
        if (!progression) progression = this.getProgression();
        var nextLevel = progression.level + 1;
        return this.CARD_UNLOCK_TABLE[nextLevel] || [];
    }

    static getNextClassUnlock(progression) {
        if (!progression) progression = this.getProgression();
        if (progression.arenaWins.indexOf('pyromancer') === -1) {
            return { classId: 'cryomancer', name: 'Cryomancer', requirement: 'Win an arena run with Pyromancer' };
        }
        if (progression.arenaWins.indexOf('cryomancer') === -1) {
            return { classId: 'necromancer', name: 'Necromancer', requirement: 'Win an arena run with Cryomancer' };
        }
        return null;
    }

    static recordArenaWin(classId) {
        var state = this.getProgression();
        if (state.arenaWins.indexOf(classId) >= 0) return null;

        state.arenaWins.push(classId);

        var unlockMap = {
            pyromancer: 'cryomancer',
            cryomancer: 'necromancer'
        };
        var newlyUnlocked = unlockMap[classId] || null;

        this.saveProgression(state);
        return newlyUnlocked;
    }

    static getLockedClasses(progression) {
        if (!progression) progression = this.getProgression();
        var locked = [];
        var classNames = {
            cryomancer: 'Cryomancer',
            necromancer: 'Necromancer'
        };
        var requirements = {
            cryomancer: 'Win an arena run with Pyromancer',
            necromancer: 'Win an arena run with Cryomancer'
        };
        for (var classId in this.CLASS_UNLOCK_RULES) {
            if (this.CLASS_UNLOCK_RULES.hasOwnProperty(classId)) {
                if (!this.isClassUnlocked(classId, progression) && classId !== 'pyromancer') {
                    locked.push({
                        id: classId,
                        name: classNames[classId] || classId,
                        requirement: requirements[classId] || 'Locked'
                    });
                }
            }
        }
        return locked;
    }
}

window.PlayerProgressionManager = PlayerProgressionManager;
