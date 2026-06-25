class MulliganComponent {
    constructor(rootElement) {
        this.root = rootElement;
        this.selectedIndices = null;
        this.hand = [];
        this.deckAccessor = null;
        this.onComplete = null;
        this.maxReplace = 3;
    }

    start(playerHand, deckAccessor, options) {
        if (this.root.querySelector('#mulligan-overlay')) return;

        this.hand = playerHand.slice();
        this.deckAccessor = deckAccessor;
        this.onComplete = options.onComplete || null;
        this.maxReplace = options.maxReplace || 3;
        this.selectedIndices = new Set();

        this._render();
    }

    destroy() {
        this.root = null;
        this.selectedIndices = null;
        this.hand = null;
        this.deckAccessor = null;
        this.onComplete = null;
    }

    _render() {
        var overlay = document.createElement('div');
        overlay.id = 'mulligan-overlay';
        overlay.className = 'mulligan-overlay';
        overlay.innerHTML =
            '<div class="mulligan-panel">' +
                '<div class="mulligan-hand" id="mulligan-hand"></div>' +
                '<div class="mulligan-bottom">' +
                    '<h2 class="mulligan-title">Choose cards to replace (click to toggle)</h2>' +
                    '<button class="mulligan-confirm-btn" id="confirm-mulligan">Confirm</button>' +
                '</div>' +
            '</div>';

        var gameBoard = this.root.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.appendChild(overlay);
        } else {
            this.root.appendChild(overlay);
        }

        this._renderCards();
        this._bindEvents();
    }

    _renderCards() {
        var container = this.root.querySelector('#mulligan-hand');
        if (!container) return;
        container.innerHTML = '';

        this.hand.forEach(function(card, index) {
            var el = SpellCardComponent.createCardElement(card, {
                baseClass: 'mulligan-card'
            });
            el.dataset.handIndex = index;
            container.appendChild(el);
        });
    }

    _bindEvents() {
        var _this = this;

        // Card clicks via delegation
        this.root.addEventListener('click', function(e) {
            var cardEl = e.target.closest('.mulligan-card');
            if (cardEl) {
                var index = parseInt(cardEl.dataset.handIndex);
                if (!isNaN(index)) {
                    _this._handleCardClick(index, cardEl);
                }
            }
        });

        // Confirm button
        var btn = this.root.querySelector('#confirm-mulligan');
        if (btn) {
            btn.addEventListener('click', function() {
                _this._confirm();
            });
        }
    }

    _handleCardClick(index, cardEl) {
        if (this.selectedIndices.has(index)) {
            this.selectedIndices.delete(index);
            cardEl.classList.remove('mulligan-selected');
        } else {
            this.selectedIndices.add(index);
            cardEl.classList.add('mulligan-selected');
        }
    }

    _confirm() {
        if (this.selectedIndices.size === 0) {
            this._end();
            if (this.onComplete) {
                this.onComplete(this.hand.slice());
            }
            return;
        }

        var indices = Array.from(this.selectedIndices).sort(function(a, b) { return b - a; });
        var replacedCards = [];
        var newHand = this.hand.slice();

        indices.forEach(function(idx) {
            replacedCards.push(newHand[idx]);
        });

        indices.forEach(function(idx) {
            newHand.splice(idx, 1);
        });

        // Return replaced cards to deck
        if (this.deckAccessor.returnCards) {
            this.deckAccessor.returnCards(replacedCards);
        }

        // Draw new cards
        var newCards = [];
        if (this.deckAccessor.drawCards) {
            newCards = this.deckAccessor.drawCards(replacedCards.length);
        }

        newCards.forEach(function(card) {
            newHand.push(card);
        });

        if (this.onComplete) {
            this.onComplete(newHand);
        }

        this._end();
    }

    _end() {
        var overlay = this.root.querySelector('#mulligan-overlay');
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }
}

window.MulliganComponent = MulliganComponent;
