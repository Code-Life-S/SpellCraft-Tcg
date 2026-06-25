class AchievementManager {
    static STORAGE_KEY = 'spellcaster_achievements';
    static _listeners = [];

    static getDefaultState() {
        var achievements = {};
        var ids = getAllAchievementIds();
        for (var i = 0; i < ids.length; i++) {
            achievements[ids[i]] = { unlocked: false, date: null, progress: 0 };
        }
        return {
            achievements: achievements,
            stats: {
                totalGamesWon: 0,
                totalGamesPlayed: 0,
                totalBossDefeated: {},
                totalReactionsTriggered: 0,
                totalDamageDealt: 0,
                totalSpellsCast: 0,
                totalEnemiesKilled: 0,
                totalArenaRunsWon: 0,
                arenaWinsConsecutive: 0,
                arenaWinsByClass: {},
                combatStats: {
                    maxFireDamageInCombat: 0,
                    maxEnemiesFrozenInOneTurn: 0,
                    maxSpellsInOneTurn: 0,
                    maxShieldInCombat: 0,
                    maxHandSize: 0,
                    maxReactionsInCombat: 0,
                    hasWonWithoutDamage: false,
                    hasWonAt1HP: false,
                    hasWonIn2TurnsOrLess: false,
                    hasDraftedAllNeutral: false,
                    hasHad3CopiesOfSameCard: false,
                    hasWonArenaWithoutDamage: false,
                    hasKilledBossIn5TurnsOrLess: false
                }
            },
            version: 1
        };
    }

    static getState() {
        try {
            var raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (!parsed.version) parsed.version = 1;
                var defaultState = this.getDefaultState();
                if (!parsed.stats) parsed.stats = defaultState.stats;
                if (!parsed.stats.combatStats) parsed.stats.combatStats = defaultState.stats.combatStats;
                if (!parsed.achievements) parsed.achievements = defaultState.achievements;
                return parsed;
            }
        } catch (e) {
            console.warn('Failed to load achievements, using defaults', e);
        }
        return this.getDefaultState();
    }

    static saveState(state) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save achievements', e);
        }
    }

    static initialize() {
        var existing = localStorage.getItem(this.STORAGE_KEY);
        if (!existing) {
            this.saveState(this.getDefaultState());
        }

        // Sync level and XP from PlayerProgressionManager (for level-based achievements)
        if (window.PlayerProgressionManager) {
            var progression = PlayerProgressionManager.getProgression();
            if (progression) {
                this.updateStat('level', progression.level);
                this.updateStat('totalXpEarned', progression.totalXpEarned || 0);
            }
        }

        // Re-check all achievements on startup
        this._checkAllAchievements();
    }

    static onUpdate(callback) {
        this._listeners.push(callback);
    }

    static _notify(eventType, data) {
        for (var i = 0; i < this._listeners.length; i++) {
            try {
                this._listeners[i](eventType, data);
            } catch (e) {
                console.warn('Achievement listener error:', e);
            }
        }
    }

    static getAchievement(id) {
        var state = this.getState();
        var achievement = state.achievements[id];
        var def = getAchievementById(id);
        if (!def) return null;
        return {
            id: id,
            def: def,
            unlocked: achievement ? achievement.unlocked : false,
            date: achievement ? achievement.date : null,
            progress: achievement ? (achievement.progress || 0) : 0,
            maxProgress: def.type === 'counter' ? def.maxProgress : 1
        };
    }

    static getAll() {
        var state = this.getState();
        var results = [];
        var ids = getAllAchievementIds();
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var def = getAchievementById(id);
            var achievement = state.achievements[id];
            if (def) {
                results.push({
                    id: id,
                    def: def,
                    unlocked: achievement ? achievement.unlocked : false,
                    date: achievement ? achievement.date : null,
                    progress: achievement ? (achievement.progress || 0) : 0,
                    maxProgress: def.type === 'counter' ? def.maxProgress : 1
                });
            }
        }
        return results;
    }

    static getUnlockedCount() {
        var state = this.getState();
        var count = 0;
        for (var key in state.achievements) {
            if (state.achievements.hasOwnProperty(key) && state.achievements[key].unlocked) {
                count++;
            }
        }
        return count;
    }

    static getUnlockedByCategory(categoryId) {
        var catAchievements = getAchievementsByCategory(categoryId);
        if (!catAchievements || !catAchievements.length) return [];
        var state = this.getState();
        var unlocked = [];
        catAchievements.forEach(function(entry) {
            if (state.achievements[entry.id] && state.achievements[entry.id].unlocked) {
                unlocked.push(entry.id);
            }
        });
        return unlocked;
    }

    static getTotalCount() {
        return getAllAchievementIds().length;
    }

    static unlock(id) {
        var state = this.getState();
        if (!state.achievements[id]) {
            state.achievements[id] = { unlocked: false, date: null, progress: 0 };
        }
        if (state.achievements[id].unlocked) return false;

        state.achievements[id].unlocked = true;
        state.achievements[id].date = new Date().toISOString();
        this.saveState(state);

        var def = getAchievementById(id);
        this._notify('unlocked', { id: id, def: def, date: state.achievements[id].date });
        return true;
    }

    static isUnlocked(id) {
        var state = this.getState();
        return state.achievements[id] && state.achievements[id].unlocked === true;
    }

    static updateStat(key, value) {
        var state = this.getState();
        var keys = key.split('.');
        var target = state.stats;
        for (var i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }
        target[keys[keys.length - 1]] = value;
        this.saveState(state);
        this._checkAllAchievements(state);
    }

    static incrementStat(key, amount) {
        if (!amount) amount = 1;
        var state = this.getState();
        var keys = key.split('.');
        var target = state.stats;
        for (var i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }
        var currentVal = target[keys[keys.length - 1]] || 0;
        target[keys[keys.length - 1]] = currentVal + amount;
        this.saveState(state);
        this._checkAllAchievements(state);
    }

    static getStat(key) {
        var state = this.getState();
        var keys = key.split('.');
        var target = state.stats;
        for (var i = 0; i < keys.length; i++) {
            if (!target || !target[keys[i]]) return undefined;
            target = target[keys[i]];
        }
        return target;
    }

    static setCombatStat(key, value) {
        this.updateStat('combatStats.' + key, value);
    }

    static getCombatStat(key) {
        return this.getStat('combatStats.' + key);
    }

    static resetCombatStats() {
        var state = this.getState();
        state.stats.combatStats = {
            maxFireDamageInCombat: 0,
            maxEnemiesFrozenInOneTurn: 0,
            maxSpellsInOneTurn: 0,
            maxShieldInCombat: 0,
            maxHandSize: 0,
            maxReactionsInCombat: 0,
            hasWonWithoutDamage: false,
            hasWonAt1HP: false,
            hasWonIn2TurnsOrLess: false,
            hasDraftedAllNeutral: false,
            hasHad3CopiesOfSameCard: false,
            hasWonArenaWithoutDamage: false,
            hasKilledBossIn5TurnsOrLess: false
        };
        this.saveState(state);
    }

    static _checkAllAchievements(state) {
        if (!state) state = this.getState();
        var ids = getAllAchievementIds();
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            if (state.achievements[id] && state.achievements[id].unlocked) continue;

            var def = getAchievementById(id);
            if (!def) continue;

            var progress = 0;
            if (def.type === 'counter' && def.getProgress) {
                progress = def.getProgress(state.stats);
                state.achievements[id].progress = progress;
            }

            if (def.checkUnlock && def.checkUnlock(state.stats)) {
                state.achievements[id].unlocked = true;
                state.achievements[id].date = new Date().toISOString();
                this._notify('unlocked', { id: id, def: def, date: state.achievements[id].date });
            }
        }
        this.saveState(state);
    }

    static checkAndUnlock(id) {
        var state = this.getState();
        if (state.achievements[id] && state.achievements[id].unlocked) return false;

        var def = getAchievementById(id);
        if (!def) return false;

        if (def.type === 'counter' && def.getProgress) {
            state.achievements[id].progress = def.getProgress(state.stats);
        }

        if (def.checkUnlock && def.checkUnlock(state.stats)) {
            state.achievements[id].unlocked = true;
            state.achievements[id].date = new Date().toISOString();
            this.saveState(state);
            this._notify('unlocked', { id: id, def: def, date: state.achievements[id].date });
            return true;
        }

        this.saveState(state);
        return false;
    }

    static progress(id) {
        var state = this.getState();
        var achievement = state.achievements[id];
        var def = getAchievementById(id);
        if (!def || !achievement) return { current: 0, max: 1 };

        var current = achievement.progress || 0;
        var max = 1;
        if (def.type === 'counter') {
            max = def.maxProgress || 1;
            if (def.getProgress) {
                current = def.getProgress(state.stats);
                state.achievements[id].progress = current;
                this.saveState(state);
            }
        }
        return { current: current, max: max };
    }
}

window.AchievementManager = AchievementManager;
