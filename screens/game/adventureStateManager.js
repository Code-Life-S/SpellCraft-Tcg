class AdventureStateManager {
    static STORAGE_KEY = 'adventureState';

    static getState() {
        return StateManager.getState(this.STORAGE_KEY);
    }

    static saveState(state) {
        return StateManager.saveState(this.STORAGE_KEY, state);
    }

    static clearState() {
        return StateManager.clearState(this.STORAGE_KEY);
    }
}

window.AdventureStateManager = AdventureStateManager;
