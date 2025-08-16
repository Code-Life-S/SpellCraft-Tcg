/**
 * ArenaBuilderScreen - Arena deck building interface
 * Allows players to draft cards for arena mode
 */
class ArenaBuilderScreen extends BaseScreen {
    constructor(screenManager) {
        super(screenManager);
        this.cardManager = null;
        this.arenaCards = [];
        this.currentChoices = [];
        this.isArenaComplete = false;
        
        // Arena configuration
        this.ARENA_DECK_SIZE = 10;
        this.CARDS_PER_CHOICE = 3;
        
        // Arena state key for localStorage
        this.ARENA_STATE_KEY = 'arenaBuilderState';
    }

    async setupContent() {
        try {
            // Load HTML template from external file
            const html = await window.templateLoader.loadScreenTemplate('screens/arena', 'arenaBuilderScreen');
            this.element.innerHTML = html;
        } catch (error) {
            console.error('Failed to load arena builder template:', error);
            // Fallback to basic HTML if template loading fails
            this.element.innerHTML = `
                <div class="arena-builder">
                    <div class="arena-builder-header">
                        <button class="header-btn back-btn">Back</button>
                        <h1>Arena Builder</h1>
                        <button class="header-btn new-arena-btn">New Arena</button>
                    </div>
                    <div class="arena-builder-content">
                        <div class="card-selection-area">
                            <div id="card-selection-panel">
                                <h2>Choose Your Card</h2>
                                <div id="card-choices"></div>
                            </div>
                            <div id="arena-complete-panel" style="display: none;">
                                <h2>Arena Complete!</h2>
                                <button id="start-arena-btn">START ARENA</button>
                            </div>
                        </div>
                        <div class="arena-deck-panel">
                            <div class="arena-progress">
                                <h3>Arena Progress</h3>
                                <span id="arena-card-count">0/10</span>
                                <div class="progress-bar">
                                    <div id="progress-fill"></div>
                                </div>
                            </div>
                            <div class="arena-cards-section">
                                <h3>Current Cards</h3>
                                <div id="arena-cards-list"></div>
                            </div>
                            <div class="mana-curve-section">
                                <h3>Mana Curve</h3>
                                <div id="mana-chart"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Initialize card manager
        await this.initializeCardManager();
        
        // Load arena state or start new arena
        this.loadArenaState();
        
        // Update UI
        this.updateUI();
    }

    async initializeCardManager() {
        if (!this.cardManager) {
            this.cardManager = new CardManager();
            await this.cardManager.loadCards();
        }
    }

    bindEvents() {
        // Header buttons
        this.addEventListenerSafe(
            this.element.querySelector('.back-btn'),
            'click',
            () => this.goBack()
        );

        this.addEventListenerSafe(
            this.element.querySelector('.new-arena-btn'),
            'click',
            () => this.startNewArena()
        );

        this.addEventListenerSafe(
            this.element.querySelector('.resume-arena-btn'),
            'click',
            () => this.resumeArena()
        );

        // Start Arena button
        this.addEventListenerSafe(
            this.element.querySelector('#start-arena-btn'),
            'click',
            () => this.startArena()
        );
    }

    loadArenaState() {
        const savedState = localStorage.getItem(this.ARENA_STATE_KEY);
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.arenaCards = state.arenaCards || [];
                this.isArenaComplete = this.arenaCards.length >= this.ARENA_DECK_SIZE;
                
                // Show resume button if there's a saved arena
                const resumeBtn = this.element.querySelector('.resume-arena-btn');
                if (resumeBtn && this.arenaCards.length > 0) {
                    resumeBtn.style.display = 'flex';
                }
            } catch (error) {
                console.error('Failed to load arena state:', error);
                this.startNewArena();
            }
        } else {
            this.startNewArena();
        }
    }

    saveArenaState() {
        const state = {
            arenaCards: this.arenaCards,
            timestamp: Date.now()
        };
        localStorage.setItem(this.ARENA_STATE_KEY, JSON.stringify(state));
    }

    startNewArena() {
        this.arenaCards = [];
        this.isArenaComplete = false;
        this.saveArenaState();
        
        // Hide resume button
        const resumeBtn = this.element.querySelector('.resume-arena-btn');
        if (resumeBtn) {
            resumeBtn.style.display = 'none';
        }
        
        this.generateNewChoices();
        this.updateUI();
        this.showMessage('New arena started! Choose your cards wisely.', 'info');
    }

    resumeArena() {
        if (this.isArenaComplete) {
            this.updateUI();
        } else {
            this.generateNewChoices();
            this.updateUI();
        }
        this.showMessage('Arena resumed!', 'info');
    }

    generateNewChoices() {
        if (this.isArenaComplete) return;
        
        const allSpells = this.cardManager.getAllSpells();
        this.currentChoices = [];
        
        // Get 3 random unique spells
        const availableSpells = [...allSpells];
        for (let i = 0; i < this.CARDS_PER_CHOICE && availableSpells.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableSpells.length);
            const selectedSpell = availableSpells.splice(randomIndex, 1)[0];
            this.currentChoices.push(selectedSpell);
        }
    }

    selectCard(cardId) {
        const selectedCard = this.currentChoices.find(card => card.id === cardId);
        if (!selectedCard) return;
        
        // Add card to arena deck
        this.arenaCards.push(selectedCard);
        
        // Check if arena is complete
        if (this.arenaCards.length >= this.ARENA_DECK_SIZE) {
            this.isArenaComplete = true;
        }
        
        // Save state
        this.saveArenaState();
        
        // Update UI
        this.updateUI();
        
        // Generate new choices if not complete
        if (!this.isArenaComplete) {
            this.generateNewChoices();
            this.renderCardChoices();
        }
        
        this.showMessage(`Added ${selectedCard.name} to your arena deck!`, 'success');
    }

    updateUI() {
        this.updateProgress();
        this.updateArenaCardsList();
        this.updateManaCurve();
        
        if (this.isArenaComplete) {
            this.showArenaComplete();
        } else {
            this.showCardSelection();
            this.renderCardChoices();
        }
    }

    updateProgress() {
        const countElement = this.element.querySelector('#arena-card-count');
        const fillElement = this.element.querySelector('#progress-fill');
        
        if (countElement) {
            countElement.textContent = `${this.arenaCards.length}/${this.ARENA_DECK_SIZE}`;
        }
        
        if (fillElement) {
            const percentage = (this.arenaCards.length / this.ARENA_DECK_SIZE) * 100;
            fillElement.style.width = `${percentage}%`;
        }
    }

    updateArenaCardsList() {
        const listElement = this.element.querySelector('#arena-cards-list');
        if (!listElement) return;
        
        listElement.innerHTML = '';
        
        this.arenaCards.forEach(card => {
            const cardItem = document.createElement('div');
            cardItem.className = 'arena-card-item';
            cardItem.innerHTML = `
                <span class="arena-card-icon">${card.art}</span>
                <span class="arena-card-name">${card.name}</span>
                <span class="arena-card-mana">${card.mana}M</span>
            `;
            listElement.appendChild(cardItem);
        });
    }

    updateManaCurve() {
        const chartElement = this.element.querySelector('#mana-chart');
        if (!chartElement) return;
        
        // Calculate mana distribution
        const manaCounts = [0, 0, 0, 0, 0, 0, 0]; // 0-6+ mana
        this.arenaCards.forEach(card => {
            const mana = Math.min(card.mana, 6);
            manaCounts[mana]++;
        });
        
        // Create mana bars
        chartElement.innerHTML = '';
        manaCounts.forEach((count, mana) => {
            const bar = document.createElement('div');
            bar.className = 'mana-bar';
            
            const maxHeight = 60;
            const height = this.arenaCards.length > 0 ? (count / Math.max(...manaCounts)) * maxHeight : 4;
            bar.style.height = `${Math.max(height, 4)}px`;
            
            bar.innerHTML = `
                <span class="mana-bar-count">${count}</span>
                <span class="mana-bar-label">${mana === 6 ? '6+' : mana}</span>
            `;
            
            chartElement.appendChild(bar);
        });
    }

    showCardSelection() {
        const selectionPanel = this.element.querySelector('#card-selection-panel');
        const completePanel = this.element.querySelector('#arena-complete-panel');
        
        if (selectionPanel) selectionPanel.style.display = 'flex';
        if (completePanel) completePanel.style.display = 'none';
    }

    showArenaComplete() {
        const selectionPanel = this.element.querySelector('#card-selection-panel');
        const completePanel = this.element.querySelector('#arena-complete-panel');
        
        if (selectionPanel) selectionPanel.style.display = 'none';
        if (completePanel) completePanel.style.display = 'flex';
    }

    renderCardChoices() {
        const choicesElement = this.element.querySelector('#card-choices');
        if (!choicesElement) return;
        
        choicesElement.innerHTML = '';
        
        this.currentChoices.forEach(card => {
            const cardChoice = document.createElement('div');
            cardChoice.className = 'card-choice';
            cardChoice.innerHTML = `
                <div class="card-choice-icon">${card.art}</div>
                <div class="card-choice-name">${card.name}</div>
                <div class="card-choice-mana">${card.mana} Mana</div>
                <div class="card-choice-effect">${card.text}</div>
            `;
            
            cardChoice.addEventListener('click', () => this.selectCard(card.id));
            choicesElement.appendChild(cardChoice);
        });
    }

    async goBack() {
        await this.navigateTo('main-menu');
    }

    startArena() {
        this.showMessage('Arena adventure coming soon!', 'info');
        // TODO: Navigate to arena adventure when implemented
        // await this.navigateTo('arena-adventure', { deck: this.arenaCards });
    }

    getScreenClass() {
        return 'arena-builder';
    }

    getScreenId() {
        return 'arena-builder';
    }
}

// Export to global scope
window.ArenaBuilderScreen = ArenaBuilderScreen;