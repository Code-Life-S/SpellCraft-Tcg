class GameOverOverlayComponent {
    constructor(screenElement, options) {
        this.element = screenElement;
        this.options = Object.assign({
            defaultTitle: 'Defeated!',
            defaultMessage: 'Game Over',
            buttonText: 'Back to Menu'
        }, options);
        this.overlayEl = null;
    }

    render() {
        this.overlayEl = document.createElement('div');
        this.overlayEl.className = 'gameover-overlay hidden';
        this.overlayEl.id = 'gameover-overlay';
        this.overlayEl.innerHTML =
            '<div class="gameover-content">' +
                '<div class="gameover-result" id="gameover-result">' +
                    '<h2 class="gameover-title" id="gameover-title">' + this.options.defaultTitle + '</h2>' +
                    '<p class="gameover-message" id="gameover-message">' + this.options.defaultMessage + '</p>' +
                    '<div class="gameover-stats" id="gameover-stats"></div>' +
                    '<button class="gameover-btn" id="gameover-btn">' + this.options.buttonText + '</button>' +
                '</div>' +
            '</div>';

        if (typeof this.options.onButtonClick === 'function') {
            var btn = this.overlayEl.querySelector('#gameover-btn');
            btn.addEventListener('click', this.options.onButtonClick);
        }

        return this.overlayEl;
    }

    show(result) {
        if (!this.overlayEl) return;
        this.overlayEl.classList.remove('hidden');
        var titleEl = this.overlayEl.querySelector('#gameover-title');
        var messageEl = this.overlayEl.querySelector('#gameover-message');
        if (titleEl) {
            titleEl.textContent = result.title || this.options.defaultTitle;
            titleEl.className = 'gameover-title';
            if (result.isVictory) {
                titleEl.classList.add('victory');
            } else {
                titleEl.classList.add('defeat');
            }
        }
        if (messageEl) {
            messageEl.textContent = result.message || this.options.defaultMessage;
        }
    }

    hide() {
        if (this.overlayEl) {
            this.overlayEl.classList.add('hidden');
        }
    }

    setStats(html) {
        var statsEl = this.overlayEl ? this.overlayEl.querySelector('#gameover-stats') : null;
        if (statsEl) {
            statsEl.innerHTML = html;
        }
    }

    destroy() {
        this.overlayEl = null;
    }
}

window.GameOverOverlayComponent = GameOverOverlayComponent;
