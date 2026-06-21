class GameHeaderComponent {
    constructor(options = {}) {
        this.options = {
            mode: 'adventure',
            onHomeClick: null,
            onToggleHistory: null,
            onToggleDeck: null,
            onToggleSound: null,
            onToggleMusic: null,
            ...options
        };
        this.element = null;
    }

    render() {
        this.element = document.createElement('div');
        this.element.className = 'game-info';

        const total = this.options.mode === 'arena' ? '12' : '\u221E';

        this.element.innerHTML =
            '<div class="turn-counter">' +
                '<span class="turn-label">Round</span>' +
                '<span class="turn-number" id="round-number">1</span>' +
                '<span class="round-sep">/</span>' +
                '<span class="round-total">' + total + '</span>' +
            '</div>' +
            '<div class="enemies-remaining">' +
                '<span class="enemies-label">Enemies:</span>' +
                '<span class="enemies-count" id="enemies-count">0</span>' +
            '</div>' +
            '<div class="game-status">' +
                '<span class="status-text" id="game-status">Your Turn</span>' +
            '</div>' +
            '<div class="ui-controls">' +
                '<button class="ui-btn" id="back-to-menu" title="Back to Main Menu">\uD83C\uDFE0</button>' +
                '<button class="ui-btn" id="toggle-history" title="Toggle Action History">\uD83D\uDCDC</button>' +
                '<button class="ui-btn" id="toggle-deck" title="Toggle Deck Tracker">\uD83C\uDCCF</button>' +
                '<div class="audio-controls">' +
                    '<button class="ui-btn audio-btn" id="toggle-sound" title="Toggle Sound">\uD83D\uDD0A</button>' +
                    '<button class="ui-btn audio-btn" id="toggle-music" title="Toggle Music">\uD83C\uDFB5</button>' +
                '</div>' +
            '</div>';

        this._bindEvents();
        return this.element;
    }

    _bindEvents() {
        if (this.options.onHomeClick) {
            this.element.querySelector('#back-to-menu')
                .addEventListener('click', this.options.onHomeClick);
        }
        if (this.options.onToggleHistory) {
            this.element.querySelector('#toggle-history')
                .addEventListener('click', this.options.onToggleHistory);
        }
        if (this.options.onToggleDeck) {
            this.element.querySelector('#toggle-deck')
                .addEventListener('click', this.options.onToggleDeck);
        }
        if (this.options.onToggleSound) {
            this.element.querySelector('#toggle-sound')
                .addEventListener('click', this.options.onToggleSound);
        }
        if (this.options.onToggleMusic) {
            this.element.querySelector('#toggle-music')
                .addEventListener('click', this.options.onToggleMusic);
        }
    }

    getElement() {
        return this.element;
    }

    update(data) {
        if (!this.element) return;
        if (data && data.round !== undefined) {
            const el = this.element.querySelector('#round-number');
            if (el) el.textContent = data.round;
        }
        if (data && data.enemies !== undefined) {
            const el = this.element.querySelector('#enemies-count');
            if (el) el.textContent = data.enemies;
        }
        if (data && data.status !== undefined) {
            const el = this.element.querySelector('#game-status');
            if (el) el.textContent = data.status;
        }
    }

    updateAudio(soundEnabled, musicEnabled, musicPlaying) {
        if (!this.element) return;
        const soundBtn = this.element.querySelector('#toggle-sound');
        const musicBtn = this.element.querySelector('#toggle-music');
        if (soundBtn) {
            soundBtn.textContent = soundEnabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
            soundBtn.classList.toggle('disabled', !soundEnabled);
        }
        if (musicBtn) {
            musicBtn.textContent = (musicEnabled && musicPlaying) ? '\uD83C\uDFB6' : '\uD83C\uDFB5';
            musicBtn.classList.toggle('disabled', !musicEnabled || !musicPlaying);
        }
    }

    getHistoryButton() {
        return this.element ? this.element.querySelector('#toggle-history') : null;
    }

    getDeckButton() {
        return this.element ? this.element.querySelector('#toggle-deck') : null;
    }

    destroy() {
        this.element = null;
    }
}

window.GameHeaderComponent = GameHeaderComponent;
