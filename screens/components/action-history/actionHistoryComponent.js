class ActionHistoryComponent {
    constructor(rootElement, containerSelector) {
        this.root = rootElement;
        this.container = rootElement.querySelector(containerSelector);
        this.entries = [];
    }

    destroy() {
        this.root = null;
        this.container = null;
        this.entries = null;
    }

    addEntry(action, isPlayerAction, currentTurn) {
        this.entries.unshift({
            turn: currentTurn || 1,
            action: action,
            isPlayerAction: isPlayerAction,
            timestamp: Date.now()
        });
        if (this.entries.length > 25) {
            this.entries = this.entries.slice(0, 25);
        }
        this.update();
    }

    setEntries(entries, currentTurn) {
        this.entries = entries || [];
        this.currentTurn = currentTurn || 1;
        this.update();
    }

    clear() {
        this.entries = [];
        this.update();
    }

    update() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.entries.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item ' + (entry.isPlayerAction ? 'player-action' : 'enemy-action');
            item.textContent = 'T' + entry.turn + ' ' + entry.action;
            this.container.appendChild(item);
        });
    }
}

window.ActionHistoryComponent = ActionHistoryComponent;
