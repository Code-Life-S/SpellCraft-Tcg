class SidebarManagerComponent {
    constructor(screenElement, options) {
        this.element = screenElement;
        this.options = options || {};
        this.sidebarStates = { history: false, deck: false };
    }

    init() {
        var isMobile = window.innerWidth <= 768;
        this.sidebarStates = {
            history: localStorage.getItem('historyVisible') !== null
                ? localStorage.getItem('historyVisible') === 'true' : !isMobile,
            deck: localStorage.getItem('deckVisible') !== null
                ? localStorage.getItem('deckVisible') === 'true' : !isMobile
        };
        this.updateVisibility();
    }

    toggle(type) {
        this.sidebarStates[type] = !this.sidebarStates[type];
        localStorage.setItem(type === 'history' ? 'historyVisible' : 'deckVisible',
            this.sidebarStates[type]);
        this.updateVisibility();
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    updateVisibility() {
        var leftSidebar = this.element.querySelector('#left-sidebar');
        var rightSidebar = this.element.querySelector('#right-sidebar');
        var mainGameArea = this.element.querySelector('.main-game-area');
        var historyBtn = typeof this.options.getHistoryButton === 'function' ? this.options.getHistoryButton() : null;
        var deckBtn = typeof this.options.getDeckButton === 'function' ? this.options.getDeckButton() : null;

        if (leftSidebar) {
            leftSidebar.classList.toggle('hidden', !this.sidebarStates.history);
            leftSidebar.classList.toggle('visible', this.sidebarStates.history);
        }
        if (historyBtn) {
            historyBtn.classList.toggle('active', this.sidebarStates.history);
        }

        if (rightSidebar) {
            rightSidebar.classList.toggle('hidden', !this.sidebarStates.deck);
            rightSidebar.classList.toggle('visible', this.sidebarStates.deck);
        }
        if (deckBtn) {
            deckBtn.classList.toggle('active', this.sidebarStates.deck);
        }

        if (mainGameArea) {
            mainGameArea.classList.toggle('left-hidden', !this.sidebarStates.history);
            mainGameArea.classList.toggle('right-hidden', !this.sidebarStates.deck);
            mainGameArea.classList.toggle('sidebars-hidden',
                !this.sidebarStates.history && !this.sidebarStates.deck);
        }
    }

    handleResize() {
        var isMobile = window.innerWidth <= 768;
        if (isMobile) {
            if (localStorage.getItem('historyVisible') === null) this.sidebarStates.history = false;
            if (localStorage.getItem('deckVisible') === null) this.sidebarStates.deck = false;
        } else {
            if (localStorage.getItem('historyVisible') === null) this.sidebarStates.history = true;
            if (localStorage.getItem('deckVisible') === null) this.sidebarStates.deck = true;
        }
        this.updateVisibility();
    }

    getState() {
        return this.sidebarStates;
    }
}

window.SidebarManagerComponent = SidebarManagerComponent;
