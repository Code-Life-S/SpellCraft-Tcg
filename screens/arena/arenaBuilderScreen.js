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
        this.chosenClassId = null;
    }

    async setupContent() {
        try {
            // Load HTML template from external file
            const html = await window.templateLoader.loadScreenTemplate('screens/arena', 'arenaBuilderScreen');
            this.element.innerHTML = html;

            // Load shared component CSS
            const componentCSS = [
                'screens/components/spell-card/spellCardComponent.css'
            ];
            for (const cssPath of componentCSS) {
                try {
                    if (window.templateLoader && typeof window.templateLoader.loadCSS === 'function') {
                        await window.templateLoader.loadCSS(cssPath, cssPath.replace(/[\/\.]/g, '-'));
                    }
                } catch (error) {
                    console.warn('Failed to load component CSS:', error);
                }
            }
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
        try {
            this.loadArenaState();
        } catch (e) {
            // Redirect happens inside loadArenaState
            return;
        }
        
        // Update UI
        this.updateUI();
    }

    async initializeCardManager() {
        if (!this.cardManager) {
            this.cardManager = new CardManager();
            await this.cardManager.loadCards();
        }
    }

    async onBeforeShow(data) {
        if (data && data.classId) {
            this.chosenClassId = data.classId;
        } else if (!this.chosenClassId) {
            this.chosenClassId = ClassManager.getActiveClassId() || 'pyromancer';
        }
        if (this.chosenClassId) {
            ClassManager.setActiveClass(this.chosenClassId);
        }
        // Regenerate choices on fresh arena with correct class
        if (this.arenaCards.length === 0) {
            this.currentChoices = [];
            this.generateNewChoices();
            this.updateUI();
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
                
                // If in adventure phase, redirect to adventure screen
                if (state.phase === 'adventure') {
                    this.navigateTo('arena-adventure');
                    throw new Error('Redirecting to adventure screen');
                }

                // If completed, start fresh
                if (state.phase === 'completed') {
                    this.startNewArena();
                    return;
                }
                
                this.arenaCards = state.arenaCards || [];
                this.chosenClassId = state.chosenClass || null;
                this.isArenaComplete = this.arenaCards.length >= this.ARENA_DECK_SIZE;
                
                // Show resume button if there's a saved arena
                const resumeBtn = this.element.querySelector('.resume-arena-btn');
                if (resumeBtn && this.arenaCards.length > 0) {
                    resumeBtn.style.display = 'flex';
                }
                
                // Generate new choices if arena is not complete
                if (!this.isArenaComplete) {
                    this.generateNewChoices();
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
            phase: 'builder',
            chosenClass: this.chosenClassId,
            timestamp: Date.now()
        };
        localStorage.setItem(this.ARENA_STATE_KEY, JSON.stringify(state));
    }

    startNewArena(classId) {
        this.arenaCards = [];
        this.isArenaComplete = false;
        this.chosenClassId = classId || this.chosenClassId || ClassManager.getActiveClassId() || 'pyromancer';
        this.saveArenaState();
        
        // Hide resume button
        const resumeBtn = this.element.querySelector('.resume-arena-btn');
        if (resumeBtn) {
            resumeBtn.style.display = 'none';
        }
        
        this.generateNewChoices();
        this.updateUI();
    }

    resumeArena() {
        if (this.isArenaComplete) {
            this.updateUI();
        } else {
            this.generateNewChoices();
            this.updateUI();
        }
    }

    generateNewChoices() {
        if (this.isArenaComplete) return;
        
        // Get spells from CardManager
        let allSpells = [];
        if (this.cardManager && this.cardManager.allSpells) {
            allSpells = this.cardManager.allSpells;
        } else if (this.cardManager && typeof this.cardManager.getAllSpells === 'function') {
            allSpells = this.cardManager.getAllSpells();
        } else if (this.cardManager && this.cardManager.spells) {
            allSpells = this.cardManager.spells;
        } else {
            console.error('No spells available from card manager');
            return;
        }
        
        // Filter: neutral (no 'class' field) OR matches chosen class
        const classId = this.chosenClassId || ClassManager.getActiveClassId() || 'pyromancer';
        const filteredSpells = allSpells.filter(function(card) {
            return !card.class || card.class === classId;
        });
        
        this.currentChoices = [];
        
        // Get 3 random unique spells from filtered pool
        const availableSpells = [...filteredSpells];
        for (let i = 0; i < this.CARDS_PER_CHOICE && availableSpells.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableSpells.length);
            const selectedSpell = availableSpells.splice(randomIndex, 1)[0];
            this.currentChoices.push(selectedSpell);
        }
    }

    selectCard(cardId) {
        const selectedCard = this.currentChoices.find(card => card.id === cardId);
        if (!selectedCard) return;
        
        // Add card to arena deck with unique instanceId for upgrade tracking
        const cardWithId = {
            ...selectedCard,
            instanceId: selectedCard.id + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
        };
        this.arenaCards.push(cardWithId);
        
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
        
        // Group cards by ID and count
        const cardCounts = {};
        this.arenaCards.forEach(card => {
            cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
        });
        
        // Unique cards sorted by mana then name
        const uniqueCards = Object.keys(cardCounts).map(cardId => {
            const card = this.arenaCards.find(c => c.id === cardId);
            return { ...card, count: cardCounts[cardId] };
        }).sort((a, b) => {
            if (a.mana !== b.mana) return a.mana - b.mana;
            return a.name.localeCompare(b.name);
        });
        
        listElement.innerHTML = uniqueCards.map(card => `
            <div class="arena-card-item">
                <span class="arena-card-icon">${card.art}</span>
                <span class="arena-card-name">${card.name}</span>
                <span class="arena-card-count">x${card.count}</span>
                <span class="arena-card-mana">${card.mana} Mana</span>
            </div>
        `).join('');
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
            const cardEl = SpellCardComponent.createCardElement(card);
            cardEl.addEventListener('click', () => this.selectCard(card.id));
            choicesElement.appendChild(cardEl);
        });
    }

    async goBack() {
        await this.navigateTo('mainmenu');
    }

    startArena() {
        // Mark state as adventure phase
        const arenaState = {
            arenaCards: this.arenaCards,
            chosenClass: this.chosenClassId || ClassManager.getActiveClassId() || 'pyromancer',
            phase: 'adventure',
            currentRound: 1,
            playerHealth: 30,
            maxHealth: 30,
            deckUpgrades: {},
            minHealBonus: 0,
            runResult: null,
            timestamp: Date.now()
        };
        localStorage.setItem(this.ARENA_STATE_KEY, JSON.stringify(arenaState));
        this.navigateTo('arena-adventure');
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