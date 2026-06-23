class StateManager {
    static getState(key) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error('Failed to load state:', e);
            return null;
        }
    }

    static saveState(key, state) {
        state.timestamp = Date.now();
        localStorage.setItem(key, JSON.stringify(state));
    }

    static clearState(key) {
        localStorage.removeItem(key);
    }
}

window.StateManager = StateManager;
